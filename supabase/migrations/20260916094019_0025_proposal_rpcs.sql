-- Create a new proposal version. proposal_number is shared across all
-- versions of the same lead's proposal; version is assigned server-side.
create or replace function public.create_proposal_version(
  p_lead_id uuid,
  p_engineering_revision_id uuid,
  p_bom_header_id uuid,
  p_equipment_cost numeric,
  p_installation_cost numeric,
  p_other_cost numeric,
  p_discount numeric,
  p_tax_rate_percent numeric,
  p_is_interstate boolean,
  p_payment_terms text,
  p_warranty_equipment_years int,
  p_warranty_workmanship_years int,
  p_scope text,
  p_exclusions text,
  p_assumptions text,
  p_change_summary text default null
)
returns public.proposal_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_customer_id uuid;
  v_proposal_number text;
  v_next_version int;
  v_version public.proposal_versions;
begin
  if v_org_id is null then
    raise exception 'Not authenticated';
  end if;
  if not public.has_permission('proposals.manage') then
    raise exception 'Not authorized to manage proposals';
  end if;

  select customer_id into v_customer_id from public.leads where id = p_lead_id and organization_id = v_org_id;
  if v_customer_id is null then
    raise exception 'Lead not found or has no linked customer';
  end if;

  select proposal_number into v_proposal_number
  from public.proposal_versions where lead_id = p_lead_id order by version desc limit 1;

  if v_proposal_number is null then
    v_proposal_number := public.next_number('proposal');
  end if;

  select coalesce(max(version), 0) + 1 into v_next_version
  from public.proposal_versions where lead_id = p_lead_id;

  insert into public.proposal_versions (
    organization_id, lead_id, customer_id, proposal_number, version,
    engineering_revision_id, bom_header_id,
    equipment_cost, installation_cost, other_cost, discount, tax_rate_percent, is_interstate,
    payment_terms, warranty_equipment_years, warranty_workmanship_years,
    scope, exclusions, assumptions, change_summary, created_by
  ) values (
    v_org_id, p_lead_id, v_customer_id, v_proposal_number, v_next_version,
    p_engineering_revision_id, p_bom_header_id,
    p_equipment_cost, p_installation_cost, p_other_cost, p_discount, p_tax_rate_percent, p_is_interstate,
    p_payment_terms, p_warranty_equipment_years, p_warranty_workmanship_years,
    p_scope, p_exclusions, p_assumptions, p_change_summary, auth.uid()
  )
  returning * into v_version;

  return v_version;
end;
$$;

revoke all on function public.create_proposal_version(uuid, uuid, uuid, numeric, numeric, numeric, numeric, numeric, boolean, text, int, int, text, text, text, text) from public, anon;
grant execute on function public.create_proposal_version(uuid, uuid, uuid, numeric, numeric, numeric, numeric, numeric, boolean, text, int, int, text, text, text, text) to authenticated;

-- Send: draft -> sent, nudges the lead's pipeline stage forward.
create or replace function public.send_proposal(p_version_id uuid)
returns public.proposal_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_version public.proposal_versions;
begin
  if v_org_id is null then raise exception 'Not authenticated'; end if;
  if not public.has_permission('proposals.manage') then raise exception 'Not authorized to manage proposals'; end if;

  select * into v_version from public.proposal_versions where id = p_version_id and organization_id = v_org_id;
  if v_version.id is null then raise exception 'Proposal not found'; end if;
  if v_version.status not in ('draft') then raise exception 'Only a draft proposal can be sent'; end if;

  update public.proposal_versions set status = 'sent', sent_at = now() where id = p_version_id
  returning * into v_version;

  update public.leads set stage = 'proposal_sent'
  where id = v_version.lead_id
    and stage not in ('negotiation', 'proposal_sent', 'won', 'lost');

  insert into public.lead_activities (lead_id, activity_type, description)
  values (v_version.lead_id, 'note', 'Proposal ' || v_version.proposal_number || ' v' || v_version.version || ' sent');

  return v_version;
end;
$$;

revoke all on function public.send_proposal(uuid) from public, anon;
grant execute on function public.send_proposal(uuid) to authenticated;

-- Accept: creates the project (idempotent — returns the existing project if
-- one already exists for this lead) and seeds the standard 11 installation
-- milestones.
create or replace function public.accept_proposal(p_version_id uuid)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_version public.proposal_versions;
  v_lead public.leads;
  v_project public.projects;
  v_actual_kwp numeric;
  v_milestone text;
  v_i int := 1;
begin
  if v_org_id is null then raise exception 'Not authenticated'; end if;
  if not public.has_permission('proposals.manage') then raise exception 'Not authorized to manage proposals'; end if;

  select * into v_version from public.proposal_versions where id = p_version_id and organization_id = v_org_id;
  if v_version.id is null then raise exception 'Proposal not found'; end if;
  if v_version.status not in ('draft', 'sent') then raise exception 'Proposal is already %', v_version.status; end if;

  select * into v_project from public.projects where lead_id = v_version.lead_id and organization_id = v_org_id;
  if v_project.id is not null then
    update public.proposal_versions set status = 'accepted', accepted_at = now() where id = p_version_id;
    return v_project;
  end if;

  select * into v_lead from public.leads where id = v_version.lead_id;

  if v_version.engineering_revision_id is not null then
    select (outputs->>'actualKwp')::numeric into v_actual_kwp
    from public.engineering_revisions where id = v_version.engineering_revision_id;
  end if;

  update public.proposal_versions set status = 'accepted', accepted_at = now() where id = p_version_id;
  update public.leads set stage = 'won' where id = v_lead.id;

  insert into public.projects (
    organization_id, lead_id, customer_id, site_id, proposal_version_id,
    status, capacity_kwp, contract_value, created_by
  ) values (
    v_org_id, v_lead.id, v_version.customer_id, v_lead.site_id, p_version_id,
    'planning', v_actual_kwp, v_version.total_amount, auth.uid()
  )
  returning * into v_project;

  for v_milestone in select unnest(array[
    'Site Preparation', 'Structure Installation', 'Module Installation', 'DC Cabling',
    'Inverter Installation', 'AC Cabling', 'Earthing', 'Protection Systems',
    'Meter Integration', 'Testing', 'Commissioning'
  ])
  loop
    insert into public.project_milestones (organization_id, project_id, name, sort_order)
    values (v_org_id, v_project.id, v_milestone, v_i);
    v_i := v_i + 1;
  end loop;

  insert into public.project_events (organization_id, project_id, event, actor_id)
  values (v_org_id, v_project.id, 'Project created from accepted proposal ' || v_version.proposal_number || ' v' || v_version.version, auth.uid());

  insert into public.audit_logs (organization_id, actor_id, action, entity_type, entity_id, after)
  values (v_org_id, auth.uid(), 'created', 'project', v_project.id, jsonb_build_object('proposal_version_id', p_version_id));

  return v_project;
end;
$$;

revoke all on function public.accept_proposal(uuid) from public, anon;
grant execute on function public.accept_proposal(uuid) to authenticated;

create or replace function public.reject_proposal(p_version_id uuid, p_reason text)
returns public.proposal_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_version public.proposal_versions;
begin
  if v_org_id is null then raise exception 'Not authenticated'; end if;
  if not public.has_permission('proposals.manage') then raise exception 'Not authorized to manage proposals'; end if;

  update public.proposal_versions
  set status = 'rejected', rejected_at = now(), rejection_reason = p_reason
  where id = p_version_id and organization_id = v_org_id and status in ('draft', 'sent')
  returning * into v_version;

  if v_version.id is null then raise exception 'Proposal not found or not in a rejectable state'; end if;

  insert into public.lead_activities (lead_id, activity_type, description)
  values (v_version.lead_id, 'note', 'Proposal ' || v_version.proposal_number || ' v' || v_version.version || ' rejected: ' || coalesce(p_reason, 'no reason given'));

  return v_version;
end;
$$;

revoke all on function public.reject_proposal(uuid, text) from public, anon;
grant execute on function public.reject_proposal(uuid, text) to authenticated;

create or replace function public.archive_proposal(p_version_id uuid)
returns public.proposal_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_version public.proposal_versions;
begin
  if v_org_id is null then raise exception 'Not authenticated'; end if;
  if not public.has_permission('proposals.manage') then raise exception 'Not authorized to manage proposals'; end if;

  update public.proposal_versions set status = 'archived'
  where id = p_version_id and organization_id = v_org_id
  returning * into v_version;

  if v_version.id is null then raise exception 'Proposal not found'; end if;
  return v_version;
end;
$$;

revoke all on function public.archive_proposal(uuid) from public, anon;
grant execute on function public.archive_proposal(uuid) to authenticated;

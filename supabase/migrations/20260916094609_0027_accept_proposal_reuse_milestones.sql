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

  perform public.seed_default_project_milestones(v_org_id, v_project.id);

  insert into public.project_events (organization_id, project_id, event, actor_id)
  values (v_org_id, v_project.id, 'Project created from accepted proposal ' || v_version.proposal_number || ' v' || v_version.version, auth.uid());

  insert into public.audit_logs (organization_id, actor_id, action, entity_type, entity_id, after)
  values (v_org_id, auth.uid(), 'created', 'project', v_project.id, jsonb_build_object('proposal_version_id', p_version_id));

  return v_project;
end;
$$;

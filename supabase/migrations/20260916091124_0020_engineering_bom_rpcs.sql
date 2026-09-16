-- Get-or-create the engineering study for a lead (one study per lead).
create or replace function public.get_or_create_engineering_study(p_lead_id uuid)
returns public.engineering_studies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_study public.engineering_studies;
begin
  if v_org_id is null then
    raise exception 'Not authenticated';
  end if;
  if not public.has_permission('engineering.manage') then
    raise exception 'Not authorized to manage engineering studies';
  end if;

  select * into v_study from public.engineering_studies
  where organization_id = v_org_id and lead_id = p_lead_id;

  if v_study.id is not null then
    return v_study;
  end if;

  insert into public.engineering_studies (organization_id, lead_id, customer_id, created_by)
  select v_org_id, p_lead_id, l.customer_id, auth.uid()
  from public.leads l
  where l.id = p_lead_id and l.organization_id = v_org_id
  returning * into v_study;

  if v_study.id is null then
    raise exception 'Lead not found';
  end if;

  return v_study;
end;
$$;

revoke all on function public.get_or_create_engineering_study(uuid) from public, anon;
grant execute on function public.get_or_create_engineering_study(uuid) to authenticated;

-- Append a new versioned engineering revision (deterministic inputs/outputs computed client-side).
create or replace function public.create_engineering_revision(p_study_id uuid, p_inputs jsonb, p_outputs jsonb)
returns public.engineering_revisions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_next_rev int;
  v_revision public.engineering_revisions;
begin
  if v_org_id is null then
    raise exception 'Not authenticated';
  end if;
  if not public.has_permission('engineering.manage') then
    raise exception 'Not authorized to manage engineering studies';
  end if;
  if not exists (select 1 from public.engineering_studies where id = p_study_id and organization_id = v_org_id) then
    raise exception 'Study not found';
  end if;

  select coalesce(max(revision_number), 0) + 1 into v_next_rev
  from public.engineering_revisions where study_id = p_study_id;

  insert into public.engineering_revisions (organization_id, study_id, revision_number, inputs, outputs, created_by)
  values (v_org_id, p_study_id, v_next_rev, p_inputs, p_outputs, auth.uid())
  returning * into v_revision;

  return v_revision;
end;
$$;

revoke all on function public.create_engineering_revision(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.create_engineering_revision(uuid, jsonb, jsonb) to authenticated;

-- Generate a versioned BOM from an engineering revision + a client-computed item list.
create or replace function public.create_bom_from_revision(p_revision_id uuid, p_items jsonb)
returns public.bom_headers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_study_id uuid;
  v_next_version int;
  v_header public.bom_headers;
  v_item jsonb;
begin
  if v_org_id is null then
    raise exception 'Not authenticated';
  end if;
  if not public.has_permission('engineering.manage') then
    raise exception 'Not authorized to manage BOMs';
  end if;

  select study_id into v_study_id from public.engineering_revisions
  where id = p_revision_id and organization_id = v_org_id;

  if v_study_id is null then
    raise exception 'Engineering revision not found';
  end if;

  select coalesce(max(version), 0) + 1 into v_next_version
  from public.bom_headers where study_id = v_study_id;

  insert into public.bom_headers (organization_id, study_id, revision_id, version, created_by)
  values (v_org_id, v_study_id, p_revision_id, v_next_version, auth.uid())
  returning * into v_header;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.bom_items (
      organization_id, bom_header_id, category, item, specification, unit,
      quantity, wastage_percent, estimated_rate, sort_order
    ) values (
      v_org_id,
      v_header.id,
      v_item->>'category',
      v_item->>'item',
      v_item->>'specification',
      coalesce(v_item->>'unit', 'nos'),
      coalesce((v_item->>'quantity')::numeric, 0),
      coalesce((v_item->>'wastage_percent')::numeric, 0),
      coalesce((v_item->>'estimated_rate')::numeric, 0),
      coalesce((v_item->>'sort_order')::int, 0)
    );
  end loop;

  return v_header;
end;
$$;

revoke all on function public.create_bom_from_revision(uuid, jsonb) from public, anon;
grant execute on function public.create_bom_from_revision(uuid, jsonb) to authenticated;

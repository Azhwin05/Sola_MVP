-- Internal helper shared by accept_proposal and create_project.
create or replace function public.seed_default_project_milestones(p_org_id uuid, p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_milestone text;
  v_i int := 1;
begin
  for v_milestone in select unnest(array[
    'Site Preparation', 'Structure Installation', 'Module Installation', 'DC Cabling',
    'Inverter Installation', 'AC Cabling', 'Earthing', 'Protection Systems',
    'Meter Integration', 'Testing', 'Commissioning'
  ])
  loop
    insert into public.project_milestones (organization_id, project_id, name, sort_order)
    values (p_org_id, p_project_id, v_milestone, v_i);
    v_i := v_i + 1;
  end loop;
end;
$$;

revoke all on function public.seed_default_project_milestones(uuid, uuid) from public, anon, authenticated;

-- Manual project creation (outside the proposal-accepted automation).
create or replace function public.create_project(
  p_customer_id uuid,
  p_lead_id uuid,
  p_site_id uuid,
  p_pm_id uuid,
  p_capacity_kwp numeric,
  p_contract_value numeric,
  p_target_cod date
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_project public.projects;
begin
  if v_org_id is null then raise exception 'Not authenticated'; end if;
  if not public.has_permission('projects.manage') then raise exception 'Not authorized to manage projects'; end if;

  insert into public.projects (
    organization_id, lead_id, customer_id, site_id, pm_id,
    capacity_kwp, contract_value, target_cod, created_by
  ) values (
    v_org_id, p_lead_id, p_customer_id, p_site_id, p_pm_id,
    p_capacity_kwp, p_contract_value, p_target_cod, auth.uid()
  )
  returning * into v_project;

  perform public.seed_default_project_milestones(v_org_id, v_project.id);

  insert into public.project_events (organization_id, project_id, event, actor_id)
  values (v_org_id, v_project.id, 'Project created', auth.uid());

  return v_project;
end;
$$;

revoke all on function public.create_project(uuid, uuid, uuid, uuid, numeric, numeric, date) from public, anon;
grant execute on function public.create_project(uuid, uuid, uuid, uuid, numeric, numeric, date) to authenticated;

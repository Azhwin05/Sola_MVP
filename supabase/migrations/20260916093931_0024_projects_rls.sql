alter table public.projects enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_risks enable row level security;
alter table public.project_events enable row level security;

create policy projects_select on public.projects
  for select using (organization_id = public.current_org_id() and public.has_permission('projects.view'));
create policy projects_manage on public.projects
  for all using (organization_id = public.current_org_id() and public.has_permission('projects.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('projects.manage'));

create policy project_milestones_select on public.project_milestones
  for select using (organization_id = public.current_org_id() and public.has_permission('projects.view'));
create policy project_milestones_manage on public.project_milestones
  for all using (organization_id = public.current_org_id() and public.has_permission('projects.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('projects.manage'));

create policy project_tasks_select on public.project_tasks
  for select using (organization_id = public.current_org_id() and public.has_permission('projects.view'));
create policy project_tasks_manage on public.project_tasks
  for all using (organization_id = public.current_org_id() and public.has_permission('projects.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('projects.manage'));

create policy project_risks_select on public.project_risks
  for select using (organization_id = public.current_org_id() and public.has_permission('projects.view'));
create policy project_risks_manage on public.project_risks
  for all using (organization_id = public.current_org_id() and public.has_permission('projects.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('projects.manage'));

create policy project_events_select on public.project_events
  for select using (organization_id = public.current_org_id() and public.has_permission('projects.view'));
create policy project_events_insert on public.project_events
  for insert with check (organization_id = public.current_org_id() and public.has_permission('projects.manage'));

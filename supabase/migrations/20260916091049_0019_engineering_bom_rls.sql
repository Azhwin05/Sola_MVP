alter table public.engineering_studies enable row level security;
alter table public.engineering_revisions enable row level security;
alter table public.bom_headers enable row level security;
alter table public.bom_items enable row level security;

create policy engineering_studies_select on public.engineering_studies
  for select using (organization_id = public.current_org_id() and public.has_permission('engineering.view'));

create policy engineering_studies_manage on public.engineering_studies
  for all using (organization_id = public.current_org_id() and public.has_permission('engineering.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('engineering.manage'));

create policy engineering_revisions_select on public.engineering_revisions
  for select using (organization_id = public.current_org_id() and public.has_permission('engineering.view'));

create policy engineering_revisions_manage on public.engineering_revisions
  for all using (organization_id = public.current_org_id() and public.has_permission('engineering.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('engineering.manage'));

create policy bom_headers_select on public.bom_headers
  for select using (organization_id = public.current_org_id() and public.has_permission('engineering.view'));

create policy bom_headers_manage on public.bom_headers
  for all using (organization_id = public.current_org_id() and public.has_permission('engineering.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('engineering.manage'));

create policy bom_items_select on public.bom_items
  for select using (organization_id = public.current_org_id() and public.has_permission('engineering.view'));

create policy bom_items_manage on public.bom_items
  for all using (organization_id = public.current_org_id() and public.has_permission('engineering.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('engineering.manage'));

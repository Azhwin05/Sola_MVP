alter table public.vendors enable row level security;
alter table public.vendor_contacts enable row level security;

create policy vendors_select on public.vendors
  for select using (organization_id = public.current_org_id() and public.has_permission('vendors.view'));
create policy vendors_manage on public.vendors
  for all using (organization_id = public.current_org_id() and public.has_permission('vendors.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('vendors.manage'));

create policy vendor_contacts_select on public.vendor_contacts
  for select using (organization_id = public.current_org_id() and public.has_permission('vendors.view'));
create policy vendor_contacts_manage on public.vendor_contacts
  for all using (organization_id = public.current_org_id() and public.has_permission('vendors.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('vendors.manage'));

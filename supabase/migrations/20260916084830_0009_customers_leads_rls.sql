alter table public.lead_sources enable row level security;
alter table public.customers enable row level security;
alter table public.customer_contacts enable row level security;
alter table public.customer_sites enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;

-- LEAD_SOURCES: readable by anyone with leads.view; manageable by leads.manage
create policy lead_sources_select on public.lead_sources
  for select using (organization_id = public.current_org_id() and public.has_permission('leads.view'));

create policy lead_sources_manage on public.lead_sources
  for all using (organization_id = public.current_org_id() and public.has_permission('leads.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('leads.manage'));

-- CUSTOMERS
create policy customers_select on public.customers
  for select using (organization_id = public.current_org_id() and public.has_permission('customers.view'));

create policy customers_manage on public.customers
  for all using (organization_id = public.current_org_id() and public.has_permission('customers.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('customers.manage'));

-- CUSTOMER_CONTACTS
create policy customer_contacts_select on public.customer_contacts
  for select using (organization_id = public.current_org_id() and public.has_permission('customers.view'));

create policy customer_contacts_manage on public.customer_contacts
  for all using (organization_id = public.current_org_id() and public.has_permission('customers.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('customers.manage'));

-- CUSTOMER_SITES
create policy customer_sites_select on public.customer_sites
  for select using (organization_id = public.current_org_id() and public.has_permission('customers.view'));

create policy customer_sites_manage on public.customer_sites
  for all using (organization_id = public.current_org_id() and public.has_permission('customers.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('customers.manage'));

-- LEADS
create policy leads_select on public.leads
  for select using (organization_id = public.current_org_id() and public.has_permission('leads.view'));

create policy leads_manage on public.leads
  for all using (organization_id = public.current_org_id() and public.has_permission('leads.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('leads.manage'));

-- LEAD_ACTIVITIES
create policy lead_activities_select on public.lead_activities
  for select using (organization_id = public.current_org_id() and public.has_permission('leads.view'));

create policy lead_activities_insert on public.lead_activities
  for insert with check (organization_id = public.current_org_id() and public.has_permission('leads.manage'));

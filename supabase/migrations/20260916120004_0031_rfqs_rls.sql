alter table public.rfqs enable row level security;
alter table public.rfq_items enable row level security;
alter table public.rfq_vendors enable row level security;
alter table public.rfq_vendor_quotes enable row level security;
alter table public.rfq_vendor_quote_items enable row level security;

create policy rfqs_select on public.rfqs
  for select using (organization_id = public.current_org_id() and public.has_permission('procurement.view'));
create policy rfqs_manage on public.rfqs
  for all using (organization_id = public.current_org_id() and public.has_permission('procurement.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('procurement.manage'));

create policy rfq_items_select on public.rfq_items
  for select using (organization_id = public.current_org_id() and public.has_permission('procurement.view'));
create policy rfq_items_manage on public.rfq_items
  for all using (organization_id = public.current_org_id() and public.has_permission('procurement.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('procurement.manage'));

create policy rfq_vendors_select on public.rfq_vendors
  for select using (organization_id = public.current_org_id() and public.has_permission('procurement.view'));
create policy rfq_vendors_manage on public.rfq_vendors
  for all using (organization_id = public.current_org_id() and public.has_permission('procurement.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('procurement.manage'));

create policy rfq_vendor_quotes_select on public.rfq_vendor_quotes
  for select using (organization_id = public.current_org_id() and public.has_permission('procurement.view'));

-- Quotes can be inserted/updated/deleted directly only while the parent RFQ
-- hasn't been awarded or cancelled yet — same "immutable once decided" rule
-- Phase 4 established for proposal_versions.
create policy rfq_vendor_quotes_insert on public.rfq_vendor_quotes
  for insert with check (
    organization_id = public.current_org_id() and public.has_permission('procurement.manage')
    and exists (select 1 from public.rfqs r where r.id = rfq_id and r.status in ('sent','quotes_received'))
  );
create policy rfq_vendor_quotes_update on public.rfq_vendor_quotes
  for update using (
    organization_id = public.current_org_id() and public.has_permission('procurement.manage')
    and exists (select 1 from public.rfqs r where r.id = rfq_id and r.status in ('sent','quotes_received'))
  )
  with check (
    organization_id = public.current_org_id() and public.has_permission('procurement.manage')
    and exists (select 1 from public.rfqs r where r.id = rfq_id and r.status in ('sent','quotes_received'))
  );
create policy rfq_vendor_quotes_delete on public.rfq_vendor_quotes
  for delete using (
    organization_id = public.current_org_id() and public.has_permission('procurement.manage')
    and exists (select 1 from public.rfqs r where r.id = rfq_id and r.status in ('sent','quotes_received'))
  );

create policy rfq_vendor_quote_items_select on public.rfq_vendor_quote_items
  for select using (organization_id = public.current_org_id() and public.has_permission('procurement.view'));
create policy rfq_vendor_quote_items_manage on public.rfq_vendor_quote_items
  for all using (
    organization_id = public.current_org_id() and public.has_permission('procurement.manage')
    and exists (
      select 1 from public.rfq_vendor_quotes q join public.rfqs r on r.id = q.rfq_id
      where q.id = quote_id and r.status in ('sent','quotes_received')
    )
  )
  with check (
    organization_id = public.current_org_id() and public.has_permission('procurement.manage')
    and exists (
      select 1 from public.rfq_vendor_quotes q join public.rfqs r on r.id = q.rfq_id
      where q.id = quote_id and r.status in ('sent','quotes_received')
    )
  );

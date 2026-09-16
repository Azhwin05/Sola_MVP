-- Create a draft RFQ, snapshotting the given BOM's items (so later BOM
-- edits can't silently change what a vendor already quoted against) and
-- inviting the given vendors.
create or replace function public.create_rfq(
  p_title text,
  p_project_id uuid,
  p_bom_header_id uuid,
  p_due_date date,
  p_notes text,
  p_vendor_ids uuid[]
)
returns public.rfqs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_rfq public.rfqs;
  v_vendor_id uuid;
begin
  if v_org_id is null then raise exception 'Not authenticated'; end if;
  if not public.has_permission('procurement.manage') then raise exception 'Not authorized to manage procurement'; end if;
  if coalesce(array_length(p_vendor_ids, 1), 0) = 0 then raise exception 'Select at least one vendor'; end if;

  insert into public.rfqs (organization_id, title, project_id, bom_header_id, due_date, notes, created_by)
  values (v_org_id, p_title, p_project_id, p_bom_header_id, p_due_date, p_notes, auth.uid())
  returning * into v_rfq;

  if p_bom_header_id is not null then
    insert into public.rfq_items (organization_id, rfq_id, bom_item_id, category, item, specification, unit, quantity, sort_order)
    select v_org_id, v_rfq.id, id, category, item, specification, unit, final_quantity, sort_order
    from public.bom_items
    where bom_header_id = p_bom_header_id and organization_id = v_org_id
    order by sort_order;
  end if;

  foreach v_vendor_id in array p_vendor_ids loop
    insert into public.rfq_vendors (organization_id, rfq_id, vendor_id)
    values (v_org_id, v_rfq.id, v_vendor_id)
    on conflict (rfq_id, vendor_id) do nothing;
  end loop;

  return v_rfq;
end;
$$;

revoke all on function public.create_rfq(text, uuid, uuid, date, text, uuid[]) from public, anon;
grant execute on function public.create_rfq(text, uuid, uuid, date, text, uuid[]) to authenticated;

-- Send: draft -> sent, stamps every invited vendor's sent_at.
create or replace function public.send_rfq(p_rfq_id uuid)
returns public.rfqs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_rfq public.rfqs;
begin
  if v_org_id is null then raise exception 'Not authenticated'; end if;
  if not public.has_permission('procurement.manage') then raise exception 'Not authorized to manage procurement'; end if;

  select * into v_rfq from public.rfqs where id = p_rfq_id and organization_id = v_org_id;
  if v_rfq.id is null then raise exception 'RFQ not found'; end if;
  if v_rfq.status <> 'draft' then raise exception 'Only a draft RFQ can be sent'; end if;
  if not exists (select 1 from public.rfq_vendors where rfq_id = p_rfq_id) then
    raise exception 'Add at least one vendor before sending';
  end if;

  update public.rfqs set status = 'sent' where id = p_rfq_id returning * into v_rfq;
  update public.rfq_vendors set sent_at = now() where rfq_id = p_rfq_id;

  if v_rfq.project_id is not null then
    insert into public.project_events (organization_id, project_id, event, actor_id)
    values (v_org_id, v_rfq.project_id, 'RFQ ' || v_rfq.rfq_number || ' sent to vendors', auth.uid());
  end if;

  return v_rfq;
end;
$$;

revoke all on function public.send_rfq(uuid) from public, anon;
grant execute on function public.send_rfq(uuid) to authenticated;

-- Manual quote entry (no vendor portal yet — an internal user records what a
-- vendor quoted by phone/email/PDF, same "honest manual entry" pattern as
-- eb_bills). Re-submitting for the same vendor replaces their prior quote
-- items rather than accumulating duplicates.
create or replace function public.submit_vendor_quote(
  p_rfq_id uuid,
  p_vendor_id uuid,
  p_valid_until date,
  p_payment_terms text,
  p_delivery_lead_days int,
  p_notes text,
  p_items jsonb
)
returns public.rfq_vendor_quotes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_rfq public.rfqs;
  v_quote public.rfq_vendor_quotes;
  v_item jsonb;
begin
  if v_org_id is null then raise exception 'Not authenticated'; end if;
  if not public.has_permission('procurement.manage') then raise exception 'Not authorized to manage procurement'; end if;

  select * into v_rfq from public.rfqs where id = p_rfq_id and organization_id = v_org_id;
  if v_rfq.id is null then raise exception 'RFQ not found'; end if;
  if v_rfq.status not in ('sent', 'quotes_received') then raise exception 'RFQ is not open for quotes'; end if;
  if not exists (select 1 from public.rfq_vendors where rfq_id = p_rfq_id and vendor_id = p_vendor_id) then
    raise exception 'Vendor was not invited to this RFQ';
  end if;

  insert into public.rfq_vendor_quotes (
    organization_id, rfq_id, vendor_id, valid_until, payment_terms, delivery_lead_days, notes, submitted_at, created_by
  ) values (
    v_org_id, p_rfq_id, p_vendor_id, p_valid_until, p_payment_terms, p_delivery_lead_days, p_notes, now(), auth.uid()
  )
  on conflict (rfq_id, vendor_id) do update set
    valid_until = excluded.valid_until,
    payment_terms = excluded.payment_terms,
    delivery_lead_days = excluded.delivery_lead_days,
    notes = excluded.notes,
    submitted_at = now()
  returning * into v_quote;

  delete from public.rfq_vendor_quote_items where quote_id = v_quote.id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into public.rfq_vendor_quote_items (organization_id, quote_id, rfq_item_id, quantity, quoted_rate)
    select v_org_id, v_quote.id, ri.id, ri.quantity, coalesce((v_item->>'quoted_rate')::numeric, 0)
    from public.rfq_items ri
    where ri.id = (v_item->>'rfq_item_id')::uuid and ri.rfq_id = p_rfq_id;
  end loop;

  update public.rfq_vendors set status = 'quoted', responded_at = now()
  where rfq_id = p_rfq_id and vendor_id = p_vendor_id;

  update public.rfqs set status = 'quotes_received' where id = p_rfq_id and status = 'sent';

  return v_quote;
end;
$$;

revoke all on function public.submit_vendor_quote(uuid, uuid, date, text, int, text, jsonb) from public, anon;
grant execute on function public.submit_vendor_quote(uuid, uuid, date, text, int, text, jsonb) to authenticated;

-- Award: marks one quote selected, rejects the other submitted quotes, and
-- freezes the RFQ (rfq_vendor_quotes RLS then blocks any further direct edits).
create or replace function public.award_rfq(p_rfq_id uuid, p_quote_id uuid)
returns public.rfqs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_rfq public.rfqs;
  v_quote public.rfq_vendor_quotes;
  v_vendor_name text;
begin
  if v_org_id is null then raise exception 'Not authenticated'; end if;
  if not public.has_permission('procurement.manage') then raise exception 'Not authorized to manage procurement'; end if;

  select * into v_rfq from public.rfqs where id = p_rfq_id and organization_id = v_org_id;
  if v_rfq.id is null then raise exception 'RFQ not found'; end if;
  if v_rfq.status not in ('sent', 'quotes_received') then raise exception 'RFQ is not open for award'; end if;

  select * into v_quote from public.rfq_vendor_quotes where id = p_quote_id and rfq_id = p_rfq_id;
  if v_quote.id is null then raise exception 'Quote not found for this RFQ'; end if;

  update public.rfq_vendor_quotes set status = 'selected' where id = p_quote_id;
  update public.rfq_vendor_quotes set status = 'rejected' where rfq_id = p_rfq_id and id <> p_quote_id and status = 'submitted';

  update public.rfqs
  set status = 'awarded', awarded_vendor_id = v_quote.vendor_id, awarded_quote_id = v_quote.id
  where id = p_rfq_id
  returning * into v_rfq;

  select name into v_vendor_name from public.vendors where id = v_quote.vendor_id;

  if v_rfq.project_id is not null then
    insert into public.project_events (organization_id, project_id, event, actor_id)
    values (v_org_id, v_rfq.project_id, 'RFQ ' || v_rfq.rfq_number || ' awarded to ' || coalesce(v_vendor_name, 'vendor'), auth.uid());
  end if;

  insert into public.audit_logs (organization_id, actor_id, action, entity_type, entity_id, after)
  values (v_org_id, auth.uid(), 'awarded', 'rfq', v_rfq.id, jsonb_build_object('vendor_id', v_quote.vendor_id, 'quote_id', v_quote.id));

  return v_rfq;
end;
$$;

revoke all on function public.award_rfq(uuid, uuid) from public, anon;
grant execute on function public.award_rfq(uuid, uuid) to authenticated;

create or replace function public.cancel_rfq(p_rfq_id uuid, p_reason text)
returns public.rfqs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_rfq public.rfqs;
begin
  if v_org_id is null then raise exception 'Not authenticated'; end if;
  if not public.has_permission('procurement.manage') then raise exception 'Not authorized to manage procurement'; end if;

  select * into v_rfq from public.rfqs where id = p_rfq_id and organization_id = v_org_id;
  if v_rfq.id is null then raise exception 'RFQ not found'; end if;
  if v_rfq.status in ('awarded', 'cancelled') then raise exception 'RFQ is already %', v_rfq.status; end if;

  update public.rfqs
  set status = 'cancelled', notes = coalesce(notes || E'\n', '') || 'Cancelled: ' || coalesce(p_reason, 'no reason given')
  where id = p_rfq_id
  returning * into v_rfq;

  return v_rfq;
end;
$$;

revoke all on function public.cancel_rfq(uuid, text) from public, anon;
grant execute on function public.cancel_rfq(uuid, text) to authenticated;

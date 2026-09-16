-- A vendor quote's total can't be a Postgres generated column (those can't
-- aggregate across child rows), so instead of a stored/synced total that
-- could drift, this view always computes it fresh from the line items.
-- security_invoker ensures it's subject to the querying user's own RLS,
-- not the view owner's.
create view public.rfq_vendor_quote_totals
  with (security_invoker = true) as
select quote_id, sum(quoted_amount) as total_amount
from public.rfq_vendor_quote_items
group by quote_id;

grant select on public.rfq_vendor_quote_totals to authenticated;
revoke all on public.rfq_vendor_quote_totals from anon;

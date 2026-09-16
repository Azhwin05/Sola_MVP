-- Phase 3: EB Bill Intelligence

create table public.eb_bills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  survey_id uuid references public.site_surveys(id) on delete set null,

  billing_month date not null,
  bill_number text,
  opening_reading numeric,
  closing_reading numeric,
  units_consumed numeric not null,
  demand_kva numeric,
  tariff_category text,
  amount numeric,
  due_date date,
  paid_status text not null default 'unpaid' check (paid_status in ('paid','unpaid','partial')),

  source_document_path text,
  extraction_confidence numeric,

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, customer_id, billing_month)
);

create index eb_bills_organization_id_idx on public.eb_bills(organization_id);
create index eb_bills_customer_id_idx on public.eb_bills(customer_id, billing_month desc);

create trigger eb_bills_set_updated_at
  before update on public.eb_bills
  for each row execute function public.set_updated_at();

alter table public.eb_bills enable row level security;

create policy eb_bills_select on public.eb_bills
  for select using (organization_id = public.current_org_id() and public.has_permission('engineering.view'));

create policy eb_bills_manage on public.eb_bills
  for all using (organization_id = public.current_org_id() and public.has_permission('engineering.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('engineering.manage'));

-- Phase 5: RFQs — request quotes from vendors against a specific BOM,
-- compare them, and award one. Purchase orders/GRN come in a later slice.

create table public.rfqs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  rfq_number text not null default public.next_number('rfq'),
  project_id uuid references public.projects(id) on delete set null,
  bom_header_id uuid references public.bom_headers(id) on delete set null,
  title text not null,

  status text not null default 'draft' check (status in ('draft','sent','quotes_received','awarded','cancelled')),
  due_date date,
  notes text,
  awarded_vendor_id uuid references public.vendors(id) on delete set null,
  awarded_quote_id uuid,

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, rfq_number)
);

create index rfqs_organization_id_idx on public.rfqs(organization_id);
create index rfqs_project_id_idx on public.rfqs(project_id);
create index rfqs_status_idx on public.rfqs(organization_id, status);

create trigger rfqs_set_updated_at
  before update on public.rfqs
  for each row execute function public.set_updated_at();

create table public.rfq_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  bom_item_id uuid references public.bom_items(id) on delete set null,
  category text,
  item text not null,
  specification text,
  unit text not null,
  quantity numeric not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index rfq_items_rfq_id_idx on public.rfq_items(rfq_id, sort_order);

create table public.rfq_vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  status text not null default 'invited' check (status in ('invited','quoted','declined')),
  sent_at timestamptz,
  responded_at timestamptz,
  unique (rfq_id, vendor_id)
);

create index rfq_vendors_rfq_id_idx on public.rfq_vendors(rfq_id);
create index rfq_vendors_vendor_id_idx on public.rfq_vendors(vendor_id);

create table public.rfq_vendor_quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted','selected','rejected')),
  valid_until date,
  payment_terms text,
  delivery_lead_days int,
  notes text,
  submitted_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rfq_id, vendor_id)
);

create index rfq_vendor_quotes_rfq_id_idx on public.rfq_vendor_quotes(rfq_id);

create trigger rfq_vendor_quotes_set_updated_at
  before update on public.rfq_vendor_quotes
  for each row execute function public.set_updated_at();

create table public.rfq_vendor_quote_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  quote_id uuid not null references public.rfq_vendor_quotes(id) on delete cascade,
  rfq_item_id uuid not null references public.rfq_items(id) on delete cascade,
  quantity numeric not null,
  quoted_rate numeric not null default 0,
  quoted_amount numeric generated always as (quantity * quoted_rate) stored,
  unique (quote_id, rfq_item_id)
);

create index rfq_vendor_quote_items_quote_id_idx on public.rfq_vendor_quote_items(quote_id);

alter table public.rfqs
  add constraint rfqs_awarded_quote_id_fkey foreign key (awarded_quote_id) references public.rfq_vendor_quotes(id) on delete set null;

-- Phase 3: Engineering (capacity calculation) + BOM

create table public.engineering_studies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, lead_id)
);

create index engineering_studies_organization_id_idx on public.engineering_studies(organization_id);

create trigger engineering_studies_set_updated_at
  before update on public.engineering_studies
  for each row execute function public.set_updated_at();

create table public.engineering_revisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  study_id uuid not null references public.engineering_studies(id) on delete cascade,
  revision_number int not null,
  inputs jsonb not null,
  outputs jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (study_id, revision_number)
);

create index engineering_revisions_study_id_idx on public.engineering_revisions(study_id, revision_number desc);

create table public.bom_headers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  study_id uuid not null references public.engineering_studies(id) on delete cascade,
  revision_id uuid not null references public.engineering_revisions(id) on delete cascade,
  version int not null,
  status text not null default 'draft' check (status in ('draft','final')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (study_id, version)
);

create index bom_headers_study_id_idx on public.bom_headers(study_id, version desc);

create table public.bom_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  bom_header_id uuid not null references public.bom_headers(id) on delete cascade,
  category text not null check (category in
    ('modules','inverter','mounting_structure','dc_cable','ac_cable','connectors','earthing','protection','meters','civil','consumables','other')),
  item text not null,
  specification text,
  unit text not null default 'nos',
  quantity numeric not null default 0,
  wastage_percent numeric not null default 0,
  final_quantity numeric generated always as (quantity * (1 + wastage_percent / 100.0)) stored,
  estimated_rate numeric not null default 0,
  estimated_amount numeric generated always as (quantity * (1 + wastage_percent / 100.0) * estimated_rate) stored,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index bom_items_bom_header_id_idx on public.bom_items(bom_header_id, sort_order);

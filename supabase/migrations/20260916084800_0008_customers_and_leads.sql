-- Phase 2: Core Sales — customers, sites, leads, lead activities

-- LEAD SOURCES (org-configurable lookup) -------------------------------------
create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create index lead_sources_organization_id_idx on public.lead_sources(organization_id);

-- CUSTOMERS -------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  name text not null,
  customer_type text not null default 'residential'
    check (customer_type in ('residential','commercial','industrial','warehouse','institutional')),
  gstin text,
  billing_address jsonb not null default '{}'::jsonb,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_organization_id_idx on public.customers(organization_id);

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create table public.customer_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  name text not null,
  designation text,
  phone text,
  email text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index customer_contacts_customer_id_idx on public.customer_contacts(customer_id);

create table public.customer_sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null,
  address jsonb not null default '{}'::jsonb,
  site_type text,
  created_at timestamptz not null default now()
);

create index customer_sites_customer_id_idx on public.customer_sites(customer_id);

-- LEADS -------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  lead_number text not null default public.next_number('lead'),
  customer_id uuid references public.customers(id) on delete set null,
  contact_name text not null,
  contact_phone text,
  contact_email text,
  company_name text,
  source_id uuid references public.lead_sources(id) on delete set null,
  project_type text not null default 'residential'
    check (project_type in ('residential','commercial','industrial','warehouse','institutional')),
  site_id uuid references public.customer_sites(id) on delete set null,
  estimated_capacity_kwp numeric,
  estimated_value numeric,
  owner_id uuid references public.profiles(id) on delete set null,
  stage text not null default 'new'
    check (stage in ('new','contacted','qualified','site_survey','engineering','proposal_sent','negotiation','won','lost')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  next_action text,
  next_action_date date,
  notes text,
  expected_close_date date,
  lost_reason text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, lead_number)
);

create index leads_organization_id_idx on public.leads(organization_id);
create index leads_stage_idx on public.leads(organization_id, stage);
create index leads_owner_id_idx on public.leads(owner_id);
create index leads_customer_id_idx on public.leads(customer_id);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- LEAD ACTIVITIES (CRM communication/history log) ----------------------------
create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  activity_type text not null default 'note'
    check (activity_type in ('call','email','meeting','whatsapp','site_visit','stage_change','note')),
  description text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index lead_activities_lead_id_idx on public.lead_activities(lead_id, created_at desc);

-- Phase 4: Proposal Engine

create table public.proposal_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  proposal_number text not null,
  version int not null,
  status text not null default 'draft' check (status in ('draft','sent','accepted','rejected','archived')),

  -- Linked technical basis (reused, not re-entered)
  engineering_revision_id uuid references public.engineering_revisions(id) on delete set null,
  bom_header_id uuid references public.bom_headers(id) on delete set null,

  -- Commercial
  equipment_cost numeric not null default 0,
  installation_cost numeric not null default 0,
  other_cost numeric not null default 0,
  discount numeric not null default 0,
  tax_rate_percent numeric not null default 0,
  is_interstate boolean not null default false,
  subtotal numeric generated always as (equipment_cost + installation_cost + other_cost - discount) stored,
  tax_amount numeric generated always as ((equipment_cost + installation_cost + other_cost - discount) * tax_rate_percent / 100.0) stored,
  total_amount numeric generated always as ((equipment_cost + installation_cost + other_cost - discount) * (1 + tax_rate_percent / 100.0)) stored,

  payment_terms text,
  warranty_equipment_years int,
  warranty_workmanship_years int,
  scope text,
  exclusions text,
  assumptions text,

  change_summary text,
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, lead_id, version)
);

create index proposal_versions_organization_id_idx on public.proposal_versions(organization_id);
create index proposal_versions_lead_id_idx on public.proposal_versions(lead_id, version desc);

create trigger proposal_versions_set_updated_at
  before update on public.proposal_versions
  for each row execute function public.set_updated_at();

alter table public.proposal_versions enable row level security;

create policy proposal_versions_select on public.proposal_versions
  for select using (organization_id = public.current_org_id() and public.has_permission('proposals.view'));

create policy proposal_versions_manage on public.proposal_versions
  for all using (organization_id = public.current_org_id() and public.has_permission('proposals.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('proposals.manage'));

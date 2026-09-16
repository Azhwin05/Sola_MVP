-- Phase 5: Vendor directory

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  vendor_number text not null default public.next_number('vendor'),
  name text not null,
  category text not null default 'other' check (category in
    ('module','inverter','structure','electrical','bos','logistics','installation_contractor','other')),
  gstin text,
  billing_address jsonb not null default '{}'::jsonb,
  payment_terms text,
  notes text,
  status text not null default 'active' check (status in ('active','inactive')),

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, vendor_number)
);

create index vendors_organization_id_idx on public.vendors(organization_id);
create index vendors_category_idx on public.vendors(organization_id, category);

create trigger vendors_set_updated_at
  before update on public.vendors
  for each row execute function public.set_updated_at();

create table public.vendor_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name text not null,
  designation text,
  phone text,
  email text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index vendor_contacts_vendor_id_idx on public.vendor_contacts(vendor_id);

-- Give vendor/rfq numbers their own readable prefixes instead of falling
-- back to next_number()'s auto-derived "VEND-"/"RFQ-" default.
update public.system_settings
set numbering_formats = numbering_formats || '{"vendor": "VEN-{YYYY}-{SEQ:4}", "rfq": "RFQ-{YYYY}-{SEQ:4}"}'::jsonb;

alter table public.system_settings
  alter column numbering_formats set default '{
    "lead": "LEAD-{YYYY}-{SEQ:4}",
    "project": "SOL-{YYYY}-{SEQ:4}",
    "proposal": "PROP-{YYYY}-{SEQ:4}",
    "purchase_order": "PO-{YYYY}-{SEQ:4}",
    "invoice": "INV-{YYYY}-{SEQ:4}",
    "grn": "GRN-{YYYY}-{SEQ:4}",
    "service_ticket": "SR-{YYYY}-{SEQ:4}",
    "vendor": "VEN-{YYYY}-{SEQ:4}",
    "rfq": "RFQ-{YYYY}-{SEQ:4}"
  }'::jsonb;

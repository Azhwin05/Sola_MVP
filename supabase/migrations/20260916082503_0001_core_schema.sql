-- Core multi-tenant foundation: organizations, profiles, RBAC, audit, settings

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ORGANIZATIONS -------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  gstin text,
  billing_address jsonb not null default '{}'::jsonb,
  logo_url text,
  primary_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- PROFILES (one per auth.users, scoped to an organization) ------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  status text not null default 'active' check (status in ('active','invited','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_organization_id_idx on public.profiles(organization_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- RBAC: roles, permissions, role_permissions, user_roles --------------------
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  description text not null
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, key)
);

create index roles_organization_id_idx on public.roles(organization_id);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create index user_roles_organization_id_idx on public.user_roles(organization_id);
create index user_roles_user_id_idx on public.user_roles(user_id);

-- AUDIT LOG (append-only from normal app users) ------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_organization_id_idx on public.audit_logs(organization_id);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);

-- SYSTEM SETTINGS (one row per organization) --------------------------------
create table public.system_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  numbering_formats jsonb not null default '{
    "lead": "LEAD-{YYYY}-{SEQ:4}",
    "project": "SOL-{YYYY}-{SEQ:4}",
    "proposal": "PROP-{YYYY}-{SEQ:4}",
    "purchase_order": "PO-{YYYY}-{SEQ:4}",
    "invoice": "INV-{YYYY}-{SEQ:4}",
    "grn": "GRN-{YYYY}-{SEQ:4}",
    "service_ticket": "SR-{YYYY}-{SEQ:4}"
  }'::jsonb,
  tax_config jsonb not null default '{"default_regime": "GST", "cgst_sgst_split": true}'::jsonb,
  workflow_config jsonb not null default '{}'::jsonb,
  notification_config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger system_settings_set_updated_at
  before update on public.system_settings
  for each row execute function public.set_updated_at();

-- NUMBERING SEQUENCES (concurrency-safe per org/entity/year) ----------------
create table public.numbering_sequences (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text not null,
  year int not null,
  last_value int not null default 0,
  primary key (organization_id, entity_type, year)
);

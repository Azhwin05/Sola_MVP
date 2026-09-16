-- Phase 3: Site Surveys

create table public.survey_photo_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  is_mandatory boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create or replace function public.seed_default_survey_photo_categories(p_org_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.survey_photo_categories (organization_id, name, is_mandatory, sort_order)
  values
    (p_org_id, 'Roof Overview', true, 1),
    (p_org_id, 'Roof Close-up', true, 2),
    (p_org_id, 'Meter & Electrical Panel', true, 3),
    (p_org_id, 'Shadow / Obstructions', false, 4),
    (p_org_id, 'Site Access', false, 5),
    (p_org_id, 'Other', false, 6)
  on conflict (organization_id, name) do nothing
$$;

revoke all on function public.seed_default_survey_photo_categories(uuid) from public, anon, authenticated;

create table public.site_surveys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  survey_number text not null default public.next_number('survey'),
  lead_id uuid not null references public.leads(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  site_id uuid references public.customer_sites(id) on delete set null,
  engineer_id uuid references public.profiles(id) on delete set null,
  survey_date date not null default current_date,
  status text not null default 'draft'
    check (status in ('draft','scheduled','assigned','in_progress','submitted','reviewed','approved','rework')),

  -- Section 1: Site
  roof_type text,
  access_notes text,
  working_hours text,
  gps_lat numeric,
  gps_lng numeric,

  -- Section 2: Measurements
  roof_length numeric,
  roof_width numeric,
  usable_area numeric,
  obstructions jsonb not null default '[]'::jsonb,
  tilt numeric,
  orientation text,

  -- Section 3: Electrical
  meter_type text,
  sanctioned_load numeric,
  transformer_details text,
  electrical_panel text,
  cable_route text,
  inverter_location text,

  -- Section 4: Shadow
  shadow_observations text,
  obstruction_notes text,

  -- Section 6: Notes
  observations text,
  risks text,
  recommendations text,

  submitted_at timestamptz,
  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_status text check (review_status in ('approved','rework')),
  review_comment text,

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, survey_number)
);

create index site_surveys_organization_id_idx on public.site_surveys(organization_id);
create index site_surveys_lead_id_idx on public.site_surveys(lead_id);
create index site_surveys_status_idx on public.site_surveys(organization_id, status);

create trigger site_surveys_set_updated_at
  before update on public.site_surveys
  for each row execute function public.set_updated_at();

create table public.survey_photos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  survey_id uuid not null references public.site_surveys(id) on delete cascade,
  category_id uuid references public.survey_photo_categories(id) on delete set null,
  storage_path text not null,
  caption text,
  gps_lat numeric,
  gps_lng numeric,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create index survey_photos_survey_id_idx on public.survey_photos(survey_id);

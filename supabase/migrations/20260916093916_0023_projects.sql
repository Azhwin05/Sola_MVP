-- Phase 4: Project Passport

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  project_number text not null default public.next_number('project'),
  lead_id uuid references public.leads(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  site_id uuid references public.customer_sites(id) on delete set null,
  proposal_version_id uuid references public.proposal_versions(id) on delete set null,

  status text not null default 'planning' check (status in
    ('planning','engineering','procurement','material_ready','installation','qa','commissioning','handover','operational','on_hold','cancelled')),
  pm_id uuid references public.profiles(id) on delete set null,
  capacity_kwp numeric,
  contract_value numeric,
  target_cod date,

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, project_number)
);

create index projects_organization_id_idx on public.projects(organization_id);
create index projects_status_idx on public.projects(organization_id, status);
create index projects_customer_id_idx on public.projects(customer_id);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','skipped')),
  planned_start date,
  planned_end date,
  actual_start date,
  actual_end date,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_milestones_project_id_idx on public.project_milestones(project_id, sort_order);

create trigger project_milestones_set_updated_at
  before update on public.project_milestones
  for each row execute function public.set_updated_at();

create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  owner_id uuid references public.profiles(id) on delete set null,
  team text,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  status text not null default 'todo' check (status in ('todo','in_progress','blocked','done','cancelled')),
  due_date date,
  checklist jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_tasks_project_id_idx on public.project_tasks(project_id);
create index project_tasks_status_idx on public.project_tasks(organization_id, status);

create trigger project_tasks_set_updated_at
  before update on public.project_tasks
  for each row execute function public.set_updated_at();

create table public.project_risks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  risk text not null,
  impact text not null default 'medium' check (impact in ('low','medium','high')),
  probability text not null default 'medium' check (probability in ('low','medium','high')),
  mitigation text,
  owner_id uuid references public.profiles(id) on delete set null,
  due_date date,
  status text not null default 'open' check (status in ('open','mitigated','closed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index project_risks_project_id_idx on public.project_risks(project_id);

create table public.project_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  event text not null,
  comment text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index project_events_project_id_idx on public.project_events(project_id, created_at desc);

-- Security helper functions -------------------------------------------------

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

create or replace function public.has_permission(perm_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid()
      and p.key = perm_key
  )
$$;

create or replace function public.is_org_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.key = 'owner'
  )
$$;

-- Enable RLS on every tenant table -------------------------------------------
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;
alter table public.numbering_sequences enable row level security;

-- ORGANIZATIONS: members can read their own org; only owner can update
create policy organizations_select on public.organizations
  for select using (id = public.current_org_id());

create policy organizations_update on public.organizations
  for update using (id = public.current_org_id() and public.is_org_owner());

-- PROFILES: members can read profiles in their org; users can update own profile
create policy profiles_select on public.profiles
  for select using (organization_id = public.current_org_id());

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid());

create policy profiles_update_owner on public.profiles
  for update using (organization_id = public.current_org_id() and public.is_org_owner());

-- ROLES: readable within org; only owner manages
create policy roles_select on public.roles
  for select using (organization_id = public.current_org_id());

create policy roles_manage on public.roles
  for all using (organization_id = public.current_org_id() and public.is_org_owner())
  with check (organization_id = public.current_org_id() and public.is_org_owner());

-- PERMISSIONS: global reference data, readable by any authenticated user
create policy permissions_select on public.permissions
  for select using (auth.role() = 'authenticated');

-- ROLE_PERMISSIONS: readable within org via role; only owner manages
create policy role_permissions_select on public.role_permissions
  for select using (
    exists (select 1 from public.roles r where r.id = role_id and r.organization_id = public.current_org_id())
  );

create policy role_permissions_manage on public.role_permissions
  for all using (
    exists (select 1 from public.roles r where r.id = role_id and r.organization_id = public.current_org_id() and public.is_org_owner())
  )
  with check (
    exists (select 1 from public.roles r where r.id = role_id and r.organization_id = public.current_org_id() and public.is_org_owner())
  );

-- USER_ROLES: readable within org; only owner assigns
create policy user_roles_select on public.user_roles
  for select using (organization_id = public.current_org_id());

create policy user_roles_manage on public.user_roles
  for all using (organization_id = public.current_org_id() and public.is_org_owner())
  with check (organization_id = public.current_org_id() and public.is_org_owner());

-- AUDIT_LOGS: readable within org; append-only (insert via authenticated, no update/delete policies)
create policy audit_logs_select on public.audit_logs
  for select using (organization_id = public.current_org_id());

create policy audit_logs_insert on public.audit_logs
  for insert with check (organization_id = public.current_org_id());

-- SYSTEM_SETTINGS: readable within org; only owner updates
create policy system_settings_select on public.system_settings
  for select using (organization_id = public.current_org_id());

create policy system_settings_update on public.system_settings
  for update using (organization_id = public.current_org_id() and public.is_org_owner());

-- NUMBERING_SEQUENCES: readable within org; writes only via security-definer RPC
create policy numbering_sequences_select on public.numbering_sequences
  for select using (organization_id = public.current_org_id());

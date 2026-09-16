-- Invite-link based team onboarding (no email provider required yet — the
-- link itself is the credential; a transactional email adapter can send it
-- automatically once one is configured in Settings).
create table public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  email text,
  token text not null unique default encode(gen_random_bytes(24), 'base64url'),
  created_by uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index organization_invites_organization_id_idx on public.organization_invites(organization_id);

alter table public.organization_invites enable row level security;

create policy organization_invites_select on public.organization_invites
  for select using (organization_id = public.current_org_id());

create policy organization_invites_manage on public.organization_invites
  for all using (organization_id = public.current_org_id() and public.has_permission('team.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('team.manage'));

-- Create an invite link for a role in the caller's organization.
create or replace function public.create_invite(p_role_key text, p_email text default null)
returns public.organization_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_role_id uuid;
  v_invite public.organization_invites;
begin
  if v_org_id is null then
    raise exception 'Not authenticated';
  end if;
  if not public.has_permission('team.manage') then
    raise exception 'Not authorized to invite members';
  end if;

  select id into v_role_id from public.roles where organization_id = v_org_id and key = p_role_key;
  if v_role_id is null then
    raise exception 'Unknown role %', p_role_key;
  end if;

  insert into public.organization_invites (organization_id, role_id, email, created_by)
  values (v_org_id, v_role_id, p_email, auth.uid())
  returning * into v_invite;

  insert into public.audit_logs (organization_id, actor_id, action, entity_type, entity_id, after)
  values (v_org_id, auth.uid(), 'created', 'organization_invite', v_invite.id, jsonb_build_object('role', p_role_key, 'email', p_email));

  return v_invite;
end;
$$;

revoke all on function public.create_invite(text, text) from public;
grant execute on function public.create_invite(text, text) to authenticated;

-- Look up an invite by token (public-safe: exposes only role/org name, not IDs of other members).
create or replace function public.get_invite_preview(p_token text)
returns table (organization_name text, role_name text, valid boolean)
language sql
stable
security definer
set search_path = public
as $$
  select o.name, r.name, (i.accepted_at is null and i.expires_at > now())
  from public.organization_invites i
  join public.organizations o on o.id = i.organization_id
  join public.roles r on r.id = i.role_id
  where i.token = p_token
$$;

revoke all on function public.get_invite_preview(text) from public;
grant execute on function public.get_invite_preview(text) to anon, authenticated;

-- Accept an invite: attaches the calling (already-authenticated) user to the
-- invite's organization and role. Fails if the user already has a profile.
create or replace function public.accept_invite(p_token text, p_full_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_invite public.organization_invites;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'User already belongs to an organization';
  end if;

  select * into v_invite from public.organization_invites where token = p_token for update;
  if v_invite.id is null then
    raise exception 'Invalid invite';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'Invite already used';
  end if;
  if v_invite.expires_at < now() then
    raise exception 'Invite expired';
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.profiles (id, organization_id, full_name, email)
  values (v_uid, v_invite.organization_id, p_full_name, coalesce(v_email, ''));

  insert into public.user_roles (user_id, role_id, organization_id)
  values (v_uid, v_invite.role_id, v_invite.organization_id);

  update public.organization_invites
  set accepted_at = now(), accepted_by = v_uid
  where id = v_invite.id;

  insert into public.audit_logs (organization_id, actor_id, action, entity_type, entity_id)
  values (v_invite.organization_id, v_uid, 'accepted', 'organization_invite', v_invite.id);

  return v_invite.organization_id;
end;
$$;

revoke all on function public.accept_invite(text, text) from public;
grant execute on function public.accept_invite(text, text) to authenticated;

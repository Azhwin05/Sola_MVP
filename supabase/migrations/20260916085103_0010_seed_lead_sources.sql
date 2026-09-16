create or replace function public.seed_default_lead_sources(p_org_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.lead_sources (organization_id, name, is_system)
  select p_org_id, name, true
  from (values
    ('Referral'), ('Website'), ('Cold Call'), ('Exhibition'), ('Social Media'), ('Partner'), ('Walk-in'), ('Other')
  ) as t(name)
  on conflict (organization_id, name) do nothing
$$;

revoke all on function public.seed_default_lead_sources(uuid) from public, anon, authenticated;

create or replace function public.bootstrap_organization(p_org_name text, p_org_slug text, p_full_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_owner_role_id uuid;
  v_uid uuid := auth.uid();
  v_email text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'User already belongs to an organization';
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.organizations (name, slug)
  values (p_org_name, p_org_slug)
  returning id into v_org_id;

  insert into public.profiles (id, organization_id, full_name, email)
  values (v_uid, v_org_id, p_full_name, coalesce(v_email, ''));

  insert into public.system_settings (organization_id) values (v_org_id);

  perform public.seed_default_roles(v_org_id);
  perform public.seed_default_lead_sources(v_org_id);

  select id into v_owner_role_id from public.roles where organization_id = v_org_id and key = 'owner';

  insert into public.user_roles (user_id, role_id, organization_id)
  values (v_uid, v_owner_role_id, v_org_id);

  insert into public.audit_logs (organization_id, actor_id, action, entity_type, entity_id, after)
  values (v_org_id, v_uid, 'created', 'organization', v_org_id, jsonb_build_object('name', p_org_name));

  return v_org_id;
end;
$$;

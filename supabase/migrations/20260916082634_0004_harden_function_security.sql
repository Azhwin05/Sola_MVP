-- Fix mutable search_path on trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- seed_default_roles is an internal helper only ever called from
-- bootstrap_organization (which runs SECURITY DEFINER as owner) — it should
-- never be invoked directly over the API by anon or authenticated clients.
revoke all on function public.seed_default_roles(uuid) from public, anon, authenticated;

-- anon (unauthenticated) must never call any of these
revoke all on function public.current_org_id() from anon;
revoke all on function public.has_permission(text) from anon;
revoke all on function public.is_org_owner() from anon;
revoke all on function public.next_number(text, text) from anon;
revoke all on function public.bootstrap_organization(text, text, text) from anon;

-- authenticated users call these directly (bootstrap_organization guards
-- against re-running via its own "already belongs to an organization" check)
grant execute on function public.current_org_id() to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.is_org_owner() to authenticated;
grant execute on function public.next_number(text, text) to authenticated;
grant execute on function public.bootstrap_organization(text, text, text) to authenticated;

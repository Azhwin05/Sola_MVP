-- The previous migration revoked from `anon` specifically, but Postgres grants
-- EXECUTE to the PUBLIC pseudo-role by default at function creation time, and
-- anon inherits PUBLIC grants regardless of a per-role revoke. Revoke from
-- PUBLIC explicitly so only `authenticated` retains access.
revoke all on function public.current_org_id() from public;
revoke all on function public.has_permission(text) from public;
revoke all on function public.is_org_owner() from public;
revoke all on function public.next_number(text, text) from public;
revoke all on function public.bootstrap_organization(text, text, text) from public;

grant execute on function public.current_org_id() to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.is_org_owner() to authenticated;
grant execute on function public.next_number(text, text) to authenticated;
grant execute on function public.bootstrap_organization(text, text, text) to authenticated;

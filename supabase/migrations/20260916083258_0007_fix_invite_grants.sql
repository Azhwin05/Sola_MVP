-- create_invite and accept_invite both require auth.uid() internally and
-- must never be callable by anon; get_invite_preview is intentionally public
-- (an unauthenticated visitor needs to preview an invite before signing up).
revoke all on function public.create_invite(text, text) from anon;
revoke all on function public.accept_invite(text, text) from anon;

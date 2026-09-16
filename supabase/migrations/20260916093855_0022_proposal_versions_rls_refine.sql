drop policy proposal_versions_manage on public.proposal_versions;

create policy proposal_versions_insert on public.proposal_versions
  for insert with check (organization_id = public.current_org_id() and public.has_permission('proposals.manage'));

-- Only draft versions can be edited directly; sent/accepted/rejected/archived
-- versions are immutable from the client and only change via the
-- send/accept/reject/archive RPCs (SECURITY DEFINER, bypass this check).
create policy proposal_versions_update_draft on public.proposal_versions
  for update using (
    organization_id = public.current_org_id() and public.has_permission('proposals.manage') and status = 'draft'
  )
  with check (
    organization_id = public.current_org_id() and public.has_permission('proposals.manage') and status = 'draft'
  );

create policy proposal_versions_delete_draft on public.proposal_versions
  for delete using (
    organization_id = public.current_org_id() and public.has_permission('proposals.manage') and status = 'draft'
  );

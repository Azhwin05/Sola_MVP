alter table public.survey_photo_categories enable row level security;
alter table public.site_surveys enable row level security;
alter table public.survey_photos enable row level security;

create policy survey_photo_categories_select on public.survey_photo_categories
  for select using (organization_id = public.current_org_id() and public.has_permission('surveys.view'));

create policy survey_photo_categories_manage on public.survey_photo_categories
  for all using (organization_id = public.current_org_id() and public.has_permission('surveys.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('surveys.manage'));

create policy site_surveys_select on public.site_surveys
  for select using (organization_id = public.current_org_id() and public.has_permission('surveys.view'));

create policy site_surveys_manage on public.site_surveys
  for all using (organization_id = public.current_org_id() and public.has_permission('surveys.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('surveys.manage'));

create policy survey_photos_select on public.survey_photos
  for select using (organization_id = public.current_org_id() and public.has_permission('surveys.view'));

create policy survey_photos_manage on public.survey_photos
  for all using (organization_id = public.current_org_id() and public.has_permission('surveys.manage'))
  with check (organization_id = public.current_org_id() and public.has_permission('surveys.manage'));

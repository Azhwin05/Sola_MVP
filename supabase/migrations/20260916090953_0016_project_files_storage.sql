-- Private bucket for survey photos, EB bill scans, and future document uploads.
-- Path convention: {organization_id}/{...category-specific path}
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-files', 'project-files', false, 26214400, array['image/jpeg','image/png','image/webp','image/heic','application/pdf'])
on conflict (id) do nothing;

create policy project_files_select on storage.objects
  for select using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and public.has_permission('surveys.view')
  );

create policy project_files_insert on storage.objects
  for insert with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and public.has_permission('surveys.manage')
  );

create policy project_files_delete on storage.objects
  for delete using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = public.current_org_id()::text
    and public.has_permission('surveys.manage')
  );

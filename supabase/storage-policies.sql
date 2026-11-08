-- Private worksheet storage policies.
-- Run in Supabase Dashboard > SQL Editor.

drop policy if exists "Admins can upload worksheets" on storage.objects;
create policy "Admins can upload worksheets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'worksheets'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'ADMIN'
  )
);

drop policy if exists "Authenticated users can read worksheets" on storage.objects;
create policy "Authenticated users can read worksheets"
on storage.objects
for select
to authenticated
using (bucket_id = 'worksheets');

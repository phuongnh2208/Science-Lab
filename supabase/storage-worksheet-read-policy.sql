-- Cho phép mọi tài khoản đã đăng nhập (teacher) đọc phiếu bài tập
-- được gắn trong bài học ĐÃ XUẤT BẢN (lessons.status = 'PUBLISHED').
-- Run in Supabase Dashboard > SQL Editor.

drop policy if exists "storage_teacher_read_published_worksheets" on storage.objects;
create policy "storage_teacher_read_published_worksheets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'worksheets'
  and exists (
    select 1
    from public.lesson_contents lc
    join public.lessons l on l.id = lc.lesson_id
    cross join lateral jsonb_array_elements(lc.blocks) as b(block)
    where l.status = 'PUBLISHED'
      and b.block ->> 'type' = 'WORKSHEET'
      and ltrim(b.block ->> 'content', '/') = objects.name
  )
);


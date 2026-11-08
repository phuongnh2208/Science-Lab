-- ScienceLab catalog seed
-- Run in Supabase Dashboard > SQL Editor.
-- Additive and idempotent: existing rows are reused and not overwritten.

do $seed$
declare
  v_education_level_id uuid;
  v_subject_id uuid;
  v_textbook_series_id uuid;
  v_grade_id uuid;
  v_chapter_id uuid;
  grade_row record;
  chapter_row record;
  lesson_row record;
begin
  insert into public.education_levels (code, name, description)
  values
    ('THCS', 'Trung học cơ sở', 'Khoa học tự nhiên lớp 6 đến lớp 9'),
    ('THPT', 'Trung học phổ thông', 'Vật lí lớp 10 đến lớp 12')
  on conflict (code) do nothing;

  insert into public.subjects (code, name, description)
  values
    ('KHTN', 'Khoa học tự nhiên', 'Môn Khoa học tự nhiên cấp THCS'),
    ('VAT_LI', 'Vật lí', 'Môn Vật lí cấp THPT')
  on conflict (code) do nothing;

  insert into public.textbook_series (code, name, publisher, is_active)
  values (
    'KNTT',
    'Kết nối tri thức với cuộc sống',
    'Nhà xuất bản Giáo dục Việt Nam',
    true
  )
  on conflict (code) do nothing;

  select id into v_textbook_series_id
  from public.textbook_series
  where code = 'KNTT'
  limit 1;

  for grade_row in
    select *
    from (values
      ('THCS', 'KHTN', 6, 'Lớp 6'),
      ('THCS', 'KHTN', 7, 'Lớp 7'),
      ('THCS', 'KHTN', 8, 'Lớp 8'),
      ('THCS', 'KHTN', 9, 'Lớp 9'),
      ('THPT', 'VAT_LI', 10, 'Lớp 10'),
      ('THPT', 'VAT_LI', 11, 'Lớp 11'),
      ('THPT', 'VAT_LI', 12, 'Lớp 12')
    ) as item(level_code, subject_code, number, grade_name)
  loop
    select id into v_education_level_id
    from public.education_levels
    where code = grade_row.level_code
    limit 1;

    insert into public.grades (education_level_id, grade_number, name)
    select v_education_level_id, grade_row.number, grade_row.grade_name
    where not exists (
      select 1
      from public.grades
      where grades.education_level_id = v_education_level_id
        and grades.grade_number = grade_row.number
    );
  end loop;

  for chapter_row in
    select *
    from (values
      ('THCS', 'KHTN', 6, 'Mở đầu về khoa học tự nhiên', 'Các hoạt động làm quen với phương pháp học tập và thực hành khoa học.'),
      ('THCS', 'KHTN', 7, 'Nguyên tử và nguyên tố hóa học', 'Các khái niệm nền tảng về nguyên tử và nguyên tố.'),
      ('THCS', 'KHTN', 8, 'Khối lượng riêng và áp suất', 'Tìm hiểu khối lượng riêng, áp suất và ứng dụng trong đời sống.'),
      ('THCS', 'KHTN', 9, 'Năng lượng và sự biến đổi', 'Khảo sát các dạng năng lượng và sự chuyển hóa năng lượng.'),
      ('THPT', 'VAT_LI', 10, 'Động học', 'Mô tả chuyển động và các đại lượng đặc trưng của chuyển động.'),
      ('THPT', 'VAT_LI', 11, 'Điện trường', 'Các khái niệm và hiện tượng cơ bản về điện trường.'),
      ('THPT', 'VAT_LI', 12, 'Vật lí hiện đại', 'Một số nội dung nhập môn của vật lí hiện đại.')
    ) as item(level_code, subject_code, number, title, chapter_description)
  loop
    select g.id into v_grade_id
    from public.grades g
    join public.education_levels e on e.id = g.education_level_id
    where e.code = chapter_row.level_code
      and g.grade_number = chapter_row.number
    limit 1;

    select id into v_subject_id
    from public.subjects
    where code = chapter_row.subject_code
    limit 1;

    insert into public.chapters (
      grade_id,
      subject_id,
      textbook_series_id,
      title,
      chapter_number,
      description
    )
    select
      v_grade_id,
      v_subject_id,
      v_textbook_series_id,
      chapter_row.title,
      1,
      chapter_row.chapter_description
    where not exists (
      select 1
      from public.chapters c
      where c.grade_id = v_grade_id
        and c.subject_id = v_subject_id
        and c.textbook_series_id = v_textbook_series_id
        and c.title = chapter_row.title
    );
  end loop;

  for lesson_row in
    select *
    from (values
      ('THCS', 'KHTN', 6, 'Mở đầu về khoa học tự nhiên', 'Giới thiệu về khoa học tự nhiên', 'gioi-thieu-ve-khoa-hoc-tu-nhien', 'Bài học mở đầu giúp học sinh nhận diện các lĩnh vực và phương pháp học tập khoa học tự nhiên.', '["Nêu được các lĩnh vực chính của khoa học tự nhiên", "Mô tả được một số phương pháp học tập và thực hành khoa học"]'::jsonb),
      ('THCS', 'KHTN', 7, 'Nguyên tử và nguyên tố hóa học', 'Nguyên tử', 'nguyen-tu', 'Tìm hiểu mô hình nguyên tử và các hạt cấu tạo nên nguyên tử.', '["Mô tả được cấu tạo sơ lược của nguyên tử", "Phân biệt được proton, neutron và electron"]'::jsonb),
      ('THCS', 'KHTN', 8, 'Khối lượng riêng và áp suất', 'Khối lượng riêng', 'khoi-luong-rieng', 'Xác định khối lượng riêng của một số vật thể bằng thí nghiệm.', '["Nêu được công thức tính khối lượng riêng", "Thực hiện được phép đo khối lượng riêng trong tình huống đơn giản"]'::jsonb),
      ('THCS', 'KHTN', 9, 'Năng lượng và sự biến đổi', 'Năng lượng và sự biến đổi', 'nang-luong-va-su-bien-doi', 'Nhận biết một số dạng năng lượng và sự chuyển hóa giữa chúng.', '["Nhận biết được một số dạng năng lượng", "Nêu được ví dụ về sự chuyển hóa năng lượng"]'::jsonb),
      ('THPT', 'VAT_LI', 10, 'Động học', 'Chuyển động thẳng', 'chuyen-dong-thang', 'Mô tả chuyển động thẳng và đọc các đại lượng trên đồ thị chuyển động.', '["Nhận biết được các đại lượng cơ bản của chuyển động", "Đọc được thông tin đơn giản từ đồ thị tọa độ - thời gian"]'::jsonb),
      ('THPT', 'VAT_LI', 11, 'Điện trường', 'Điện trường', 'dien-truong', 'Khảo sát khái niệm điện trường và tác dụng của điện trường lên điện tích.', '["Nêu được khái niệm điện trường", "Mô tả được tác dụng lực điện trong trường hợp đơn giản"]'::jsonb),
      ('THPT', 'VAT_LI', 12, 'Vật lí hiện đại', 'Lượng tử hóa năng lượng', 'luong-tu-hoa-nang-luong', 'Làm quen với ý tưởng lượng tử hóa năng lượng trong vật lí hiện đại.', '["Nêu được ý tưởng định tính về lượng tử hóa năng lượng", "Liên hệ được một ứng dụng của vật lí hiện đại"]'::jsonb)
    ) as item(level_code, subject_code, grade_number, chapter_title, lesson_title, lesson_slug, lesson_description, objectives)
  loop
    select c.id into v_chapter_id
    from public.chapters c
    join public.grades g on g.id = c.grade_id
    join public.education_levels e on e.id = g.education_level_id
    join public.subjects s on s.id = c.subject_id
    where e.code = lesson_row.level_code
      and s.code = lesson_row.subject_code
      and g.grade_number = lesson_row.grade_number
      and c.title = lesson_row.chapter_title
    limit 1;

    insert into public.lessons (
      chapter_id,
      title,
      slug,
      lesson_number,
      description,
      learning_objectives,
      status,
      published_at
    )
    select
      v_chapter_id,
      lesson_row.lesson_title,
      lesson_row.lesson_slug,
      1,
      lesson_row.lesson_description,
      lesson_row.objectives,
      'PUBLISHED',
      now()
    where not exists (
      select 1
      from public.lessons l
      where l.chapter_id = v_chapter_id
        and l.title = lesson_row.lesson_title
    );
  end loop;

  insert into public.lesson_contents (lesson_id, blocks, version)
  select l.id, '[]'::jsonb, 1
  from public.lessons l
  where not exists (
    select 1
    from public.lesson_contents lc
    where lc.lesson_id = l.id
  );
end
$seed$;

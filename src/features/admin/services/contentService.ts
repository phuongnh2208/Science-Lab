import { supabase } from '../../../lib/supabase'
import type { ContentBlock, ContentBlockType, Grade } from '../../../types/domain'

export type AdminLesson = {
  id: string
  title: string
  description: string | null
  lesson_number: number | null
  chapter_id: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string
  chapters: { title: string; grade_id: string } | null
}

type AdminLessonRow = Omit<AdminLesson, 'chapters'> & {
  chapters: { title: string; grade_id: string } | Array<{ title: string; grade_id: string }> | null
}

function firstChapter(
  chapter: AdminLessonRow['chapters'],
): AdminLesson['chapters'] {
  return Array.isArray(chapter) ? chapter[0] ?? null : chapter
}

export async function listAdminGrades() {
  if (!supabase) return { data: [] as Grade[], error: 'Chưa cấu hình kết nối Supabase.' }
  const { data, error } = await supabase.from('grades').select('id,grade_number,name').order('grade_number')
  return {
    data: (data ?? []) as Grade[],
    error: error ? `Không thể tải khối lớp: ${error.message}` : null,
  }
}

export async function listAdminLessons(gradeId?: string) {
  if (!supabase) return { data: [], error: 'Chưa cấu hình kết nối Supabase.' }
  let query = supabase
    .from('lessons')
    .select('id,title,description,lesson_number,chapter_id,status,chapters!inner(title,grade_id)')
    .order('title')
  if (gradeId) query = query.eq('chapters.grade_id', gradeId)
  const { data, error } = await query
  const rows = (data ?? []) as AdminLessonRow[]
  return {
    data: rows.map((row) => ({
      ...row,
      chapters: firstChapter(row.chapters),
    })),
    error: error ? `Không thể tải bài học: ${error.message}` : null,
  }
}

export async function listAdminChapters(gradeId: string) {
  if (!supabase) return { data: [], error: 'Chưa cấu hình kết nối Supabase.' }
  const { data, error } = await supabase
    .from('chapters')
    .select('id,title,chapter_number')
    .eq('grade_id', gradeId)
    .order('chapter_number')
    .order('title')
  return {
    data: (data ?? []) as Array<{ id: string; title: string; chapter_number: number | null }>,
    error: error ? `Không thể tải chương: ${error.message}` : null,
  }
}

export async function createAdminChapter(input: {
  gradeId: string
  title: string
  chapterNumber: string
}) {
  if (!supabase) return { id: null, error: 'Chưa cấu hình kết nối Supabase.' }
  const { data: grade, error: gradeError } = await supabase
    .from('grades')
    .select('education_levels(code)')
    .eq('id', input.gradeId)
    .single()
  if (gradeError) return { id: null, error: `Không thể xác định khối lớp: ${gradeError.message}` }

  const educationLevel = Array.isArray(grade.education_levels)
    ? grade.education_levels[0]
    : grade.education_levels
  const subjectCode = educationLevel?.code === 'THPT' ? 'VAT_LI' : 'KHTN'
  const [{ data: subject, error: subjectError }, { data: textbook, error: textbookError }] = await Promise.all([
    supabase.from('subjects').select('id').eq('code', subjectCode).single(),
    supabase.from('textbook_series').select('id').eq('code', 'KNTT').single(),
  ])
  if (subjectError) return { id: null, error: `Không thể xác định môn học: ${subjectError.message}` }
  if (textbookError) return { id: null, error: `Không thể xác định bộ sách: ${textbookError.message}` }

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      grade_id: input.gradeId,
      subject_id: subject.id,
      textbook_series_id: textbook.id,
      title: input.title.trim(),
      chapter_number: input.chapterNumber ? Number(input.chapterNumber) : null,
    })
    .select('id,title,chapter_number')
    .single()
  return {
    id: data?.id ?? null,
    error: error ? `Không thể tạo chương: ${error.message}` : null,
  }
}

export async function createAdminLesson(input: {
  chapterId: string
  title: string
  description: string
  lessonNumber: string
  userId: string
}) {
  if (!supabase) return { id: null, error: 'Chưa cấu hình kết nối Supabase.' }
  const slug = input.title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      chapter_id: input.chapterId,
      title: input.title.trim(),
      slug: slug || null,
      lesson_number: input.lessonNumber ? Number(input.lessonNumber) : null,
      description: input.description.trim() || null,
      learning_objectives: [],
      status: 'DRAFT',
      created_by: input.userId,
      updated_by: input.userId,
    })
    .select('id')
    .single()
  return { id: data?.id ?? null, error: error ? `Không thể tạo bài học: ${error.message}` : null }
}

export async function updateAdminLesson(input: {
  lessonId: string
  chapterId: string
  title: string
  description: string
  lessonNumber: string
  userId: string
}) {
  if (!supabase) return 'Chưa cấu hình kết nối Supabase.'
  const { error } = await supabase
    .from('lessons')
    .update({
      chapter_id: input.chapterId,
      title: input.title.trim(),
      description: input.description.trim() || null,
      lesson_number: input.lessonNumber ? Number(input.lessonNumber) : null,
      updated_by: input.userId,
    })
    .eq('id', input.lessonId)
  return error ? `Không thể cập nhật bài học: ${error.message}` : null
}

export async function getLessonBlocks(lessonId: string) {
  if (!supabase) return { data: [] as ContentBlock[], error: 'Chưa cấu hình kết nối Supabase.' }
  const { data, error } = await supabase.from('lesson_contents').select('blocks').eq('lesson_id', lessonId).maybeSingle()
  return { data: (data?.blocks ?? []) as ContentBlock[], error: error ? `Không thể tải nội dung: ${error.message}` : null }
}

export async function updateLessonStatus(
  lessonId: string,
  userId: string,
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
) {
  if (!supabase) return 'Chưa cấu hình kết nối Supabase.'
  const { error } = await supabase
    .from('lessons')
    .update({
      status,
      updated_by: userId,
      published_at: status === 'PUBLISHED' ? new Date().toISOString() : null,
    })
    .eq('id', lessonId)
  return error ? `Không thể cập nhật trạng thái bài học: ${error.message}` : null
}

export async function saveLessonBlocks(lessonId: string, userId: string, blocks: ContentBlock[]) {
  if (!supabase) return 'Chưa cấu hình kết nối Supabase.'
  const { error } = await supabase.from('lesson_contents').upsert({
    lesson_id: lessonId,
    blocks,
    version: 1,
    updated_by: userId,
    created_by: userId,
  }, { onConflict: 'lesson_id' })
  return error ? `Không thể lưu nội dung: ${error.message}` : null
}

export async function uploadWorksheet(userId: string, file: File) {
  if (!supabase) return { path: null, error: 'Chưa cấu hình kết nối Supabase.' }
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !['docx', 'pdf'].includes(extension)) {
    return { path: null, error: 'Phiếu bài tập chỉ hỗ trợ file .docx hoặc .pdf.' }
  }
  if (file.size > 10 * 1024 * 1024) {
    return { path: null, error: 'File phiếu bài tập không được vượt quá 10 MB.' }
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage.from('worksheets').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) {
    return { path: null, error: `Không thể tải phiếu bài tập lên: ${error.message}` }
  }

  const { data: verification, error: verificationError } = await supabase.storage
    .from('worksheets')
    .createSignedUrl(path, 60)
  if (verificationError || !verification?.signedUrl) {
    await supabase.storage.from('worksheets').remove([path])
    return {
      path: null,
      error: `File đã được gửi nhưng không thể xác nhận trong bucket worksheets: ${verificationError?.message ?? 'không tìm thấy object'}. Kiểm tra bucket và Storage Policies trong Supabase.`,
    }
  }

  return { path, error: null }
}

export function createContentBlock(type: ContentBlockType): ContentBlock {
  return { id: crypto.randomUUID(), type, title: '', description: '', content: '' }
}

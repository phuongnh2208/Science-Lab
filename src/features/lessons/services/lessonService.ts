import { supabase } from '../../../lib/supabase'
import type { ContentBlock, Lesson } from '../../../types/domain'

type Relation<T> = T | T[] | null

type LessonRow = Omit<Lesson, 'chapters'> & {
  chapters: Relation<{
    title: string
    grades: Relation<{ grade_number: number; name: string }>
    subjects: Relation<{ name: string; code: string }>
  }>
}

function firstRelation<T>(relation: Relation<T>): T | null {
  return Array.isArray(relation) ? relation[0] ?? null : relation
}

function normalizeLesson(row: LessonRow): Lesson {
  const chapter = firstRelation(row.chapters)
  const grade = chapter ? firstRelation(chapter.grades) : null
  const subject = chapter ? firstRelation(chapter.subjects) : null

  return {
    ...row,
    chapters: chapter && grade && subject
      ? { ...chapter, grades: grade, subjects: subject }
      : null,
  }
}

export async function listPublishedLessons(): Promise<{ data: Lesson[]; error: string | null }> {
  if (!supabase) return { data: [], error: 'Chưa cấu hình kết nối Supabase.' }
  const { data, error } = await supabase
    .from('lessons')
    .select('id,title,description,learning_objectives,chapters(title,grades(grade_number,name),subjects(name,code))')
    .eq('status', 'PUBLISHED')
    .order('lesson_number', { ascending: true })

  if (error) return { data: [], error: `Không thể tải bài học: ${error.message}` }
  const rows = (data ?? []) as LessonRow[]
  return {
    data: rows.map(normalizeLesson),
    error: null,
  }
}

export async function getPublishedLessonDetail(lessonId: string): Promise<{
    data: { lesson: Lesson; blocks: ContentBlock[] } | null
    error: string | null
  }> {
    if (!supabase) return { data: null, error: 'Chưa cấu hình kết nối Supabase.' }

    const [lessonResult, contentResult] = await Promise.all([
      supabase
        .from('lessons')
        .select('id,title,description,learning_objectives,chapters(title,grades(grade_number,name),subjects(name,code))')
        .eq('id', lessonId)
        .eq('status', 'PUBLISHED')
        .maybeSingle(),
      supabase
        .from('lesson_contents')
        .select('blocks')
        .eq('lesson_id', lessonId)
        .maybeSingle(),
    ])

    if (lessonResult.error) return { data: null, error: `Không thể tải bài học: ${lessonResult.error.message}` }
    if (!lessonResult.data) return { data: null, error: 'Không tìm thấy bài học hoặc bài học chưa được xuất bản.' }
    if (contentResult.error) return { data: null, error: `Không thể tải học liệu: ${contentResult.error.message}` }

    const row = lessonResult.data as LessonRow
    return {
      data: {
        lesson: normalizeLesson(row),
        blocks: (contentResult.data?.blocks ?? []) as ContentBlock[],
      },
      error: null,
    }
  }

export async function createWorksheetSignedUrl(path: string) {
  if (!supabase) return { url: null, error: 'Chưa cấu hình kết nối Supabase.' }
  const normalizedPath = path.trim().replace(/^\/+/, '')
  if (!normalizedPath) return { url: null, error: 'Phiếu bài tập chưa có đường dẫn file.' }
  const { data, error } = await supabase.storage.from('worksheets').createSignedUrl(normalizedPath, 3600)
  return {
    url: data?.signedUrl ?? null,
    error: error
      ? `Không thể mở phiếu bài tập: ${error.message}. Hãy kiểm tra file còn tồn tại trong bucket worksheets và lưu lại bài học nếu file vừa được tải lên.`
      : null,
  }
}

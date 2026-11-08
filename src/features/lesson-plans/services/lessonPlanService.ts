import { supabase } from '../../../lib/supabase'
import type { ContentBlock, Lesson } from '../../../types/domain'
import type { ClassProfile } from '../../classes/services/classService'

export type LessonPlanType = 'STANDARD' | 'STEM'

export type LessonPlan = {
  id: string
  title: string
  lesson_id: string | null
  class_id: string | null
  plan_type: LessonPlanType
  plan_content: PlanContent
  worksheet_content: Record<string, unknown>
  class_snapshot: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type LessonPlanActivity = {
  id: string
  title: string
  objective: string
  content: string
  product: string
  organization: string
  blockIds: string[]
}

export type PlanContent = {
  objectives: string
  equipment: string
  activities: LessonPlanActivity[]
  assessment: string
}

const emptyPlanContent: PlanContent = {
  objectives: '',
  equipment: '',
  activities: [
    { id: crypto.randomUUID(), title: 'Hoạt động 1. Khởi động', objective: '', content: '', product: '', organization: '', blockIds: [] },
    { id: crypto.randomUUID(), title: 'Hoạt động 2. Hình thành kiến thức', objective: '', content: '', product: '', organization: '', blockIds: [] },
    { id: crypto.randomUUID(), title: 'Hoạt động 3. Luyện tập', objective: '', content: '', product: '', organization: '', blockIds: [] },
    { id: crypto.randomUUID(), title: 'Hoạt động 4. Vận dụng', objective: '', content: '', product: '', organization: '', blockIds: [] },
  ],
  assessment: '',
}

function normalizePlanContent(value: unknown): PlanContent {
  if (!value || typeof value !== 'object') return { ...emptyPlanContent }
  const content = value as Partial<PlanContent>
  return {
    objectives: typeof content.objectives === 'string' ? content.objectives : '',
    equipment: typeof content.equipment === 'string' ? content.equipment : '',
    activities: Array.isArray(content.activities)
      ? content.activities.map((activity, index) => ({
        id: typeof activity?.id === 'string' ? activity.id : crypto.randomUUID(),
        title: typeof activity?.title === 'string' ? activity.title : `Hoạt động ${index + 1}`,
        objective: typeof activity?.objective === 'string' ? activity.objective : '',
        content: typeof activity?.content === 'string' ? activity.content : '',
        product: typeof activity?.product === 'string' ? activity.product : '',
        organization: typeof activity?.organization === 'string' ? activity.organization : '',
        blockIds: Array.isArray(activity?.blockIds) ? activity.blockIds.filter((id): id is string => typeof id === 'string') : [],
      }))
      : [...emptyPlanContent.activities],
    assessment: typeof content.assessment === 'string' ? content.assessment : '',
  }
}

export async function listLessonPlans(teacherId: string) {
  if (!supabase) return { data: [] as LessonPlan[], error: 'Chưa cấu hình kết nối Supabase.' }
  const { data, error } = await supabase
    .from('lesson_plans')
    .select('id,title,lesson_id,class_id,plan_type,plan_content,worksheet_content,class_snapshot,created_at,updated_at')
    .eq('teacher_id', teacherId)
    .order('updated_at', { ascending: false })

  return {
    data: ((data ?? []) as Array<Partial<LessonPlan>>).map((plan) => ({
      ...plan,
      id: plan.id ?? '',
      title: plan.title ?? 'KHBD chưa đặt tên',
      lesson_id: plan.lesson_id ?? null,
      class_id: plan.class_id ?? null,
      plan_type: plan.plan_type === 'STEM' ? 'STEM' : 'STANDARD',
      plan_content: normalizePlanContent(plan.plan_content),
      worksheet_content: plan.worksheet_content ?? {},
      class_snapshot: plan.class_snapshot ?? {},
      created_at: plan.created_at ?? '',
      updated_at: plan.updated_at ?? '',
    })) as LessonPlan[],
    error: error ? `Không thể tải kho KHBD: ${error.message}` : null,
  }
}

export async function createLessonPlan(input: {
  teacherId: string
  title: string
  lessonId: string
  classProfileId: string
  planType: LessonPlanType
  content: PlanContent
  classSnapshot: Record<string, unknown>
}) {
  if (!supabase) return { id: null, error: 'Chưa cấu hình kết nối Supabase.' }
  const { data, error } = await supabase
    .from('lesson_plans')
    .insert({
      teacher_id: input.teacherId,
      title: input.title.trim(),
      lesson_id: input.lessonId || null,
      class_id: input.classProfileId || null,
      plan_type: input.planType,
      plan_content: input.content,
      worksheet_content: {},
      class_snapshot: input.classSnapshot,
      resources_snapshot: {},
    })
    .select('id')
    .single()

  return { id: data?.id ?? null, error: error ? `Không thể tạo KHBD: ${error.message}` : null }
}

export async function updateLessonPlan(id: string, teacherId: string, title: string, content: PlanContent) {
  if (!supabase) return 'Chưa cấu hình kết nối Supabase.'
  const { error } = await supabase
    .from('lesson_plans')
    .update({ title: title.trim(), plan_content: content, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('teacher_id', teacherId)
  return error ? `Không thể lưu KHBD: ${error.message}` : null
}

export async function deleteLessonPlan(id: string, teacherId: string) {
  if (!supabase) return 'Chưa cấu hình kết nối Supabase.'
  const { error } = await supabase.from('lesson_plans').delete().eq('id', id).eq('teacher_id', teacherId)
  return error ? `Không thể xóa KHBD: ${error.message}` : null
}

export async function generateAiLessonPlan(input: {
  lesson: Lesson
  blocks: ContentBlock[]
  classProfile: ClassProfile | null
  planType: LessonPlanType
}) {
  if (!supabase) return { content: null, error: 'Chưa cấu hình kết nối Supabase.' }
  const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
    body: {
      lesson: {
        title: input.lesson.title,
        description: input.lesson.description,
        learningObjectives: input.lesson.learning_objectives ?? [],
      },
      blocks: input.blocks,
      classProfile: input.classProfile
        ? {
          name: input.classProfile.name,
          studentCount: input.classProfile.student_count,
          equipment: input.classProfile.equipment,
          notes: input.classProfile.notes,
        }
        : null,
      planType: input.planType,
    },
  })
  if (error) return { content: null, error: `Không thể gọi AI: ${error.message}` }
  if (!data?.content || !Array.isArray(data.content.activities)) {
    return { content: null, error: 'AI trả về cấu trúc KHBD không hợp lệ.' }
  }
  return { content: normalizePlanContent(data.content), error: null }
}

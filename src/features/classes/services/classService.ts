import { supabase } from '../../../lib/supabase'
import type { Grade } from '../../../types/domain'

export type ClassProfile = {
  id: string
  grade_id: string | null
  name: string
  school_name: string | null
  student_count: number | null
  internet_available: boolean
  projector_available: boolean
  equipment: string[]
  notes: string | null
  grades: { name: string } | null
}

export async function listClassProfiles(teacherId: string) {
  if (!supabase) return { classes: [] as ClassProfile[], grades: [] as Grade[], error: 'Chưa cấu hình kết nối Supabase.' }
  const [classResult, gradeResult] = await Promise.all([
    supabase.from('class_profiles').select('id,grade_id,name,school_name,student_count,internet_available,projector_available,equipment,notes,grades(name)').eq('teacher_id', teacherId).order('created_at', { ascending: false }),
    supabase.from('grades').select('id,grade_number,name').order('grade_number'),
  ])
  let classes: unknown[] = classResult.data ?? []
  let classError = classResult.error

  if (classError) {
    const legacyResult = await supabase
      .from('class_profiles')
      .select('id,grade_id,name,school_name,student_count,internet_available,projector_available,grades(name)')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    classes = legacyResult.data ?? []
    classError = legacyResult.error
  }

  const rows = classes as Array<Partial<Omit<ClassProfile, 'grades'>> & { grades: Array<{ name: string }> | { name: string } | null }>
  return {
    classes: rows.map((row) => ({
      ...row,
      equipment: Array.isArray(row.equipment) ? row.equipment : [],
      notes: row.notes ?? null,
      grades: Array.isArray(row.grades) ? row.grades[0] ?? null : row.grades ?? null,
    })) as ClassProfile[],
    grades: (gradeResult.data ?? []) as Grade[],
    error: gradeResult.error
      ? `Không thể tải khối lớp: ${gradeResult.error.message}`
      : classError
        ? `Không thể tải hồ sơ lớp: ${classError.message}`
        : null,
  }
}

export async function createClassProfile(teacherId: string, input: {
  name: string
  gradeId: string
  schoolName: string
  studentCount: string
  internetAvailable: boolean
  projectorAvailable: boolean
  equipment: string[]
  notes: string
}) {
  if (!supabase) return 'Chưa cấu hình kết nối Supabase.'
  const { error } = await supabase.from('class_profiles').insert({
    teacher_id: teacherId,
    name: input.name.trim(),
    grade_id: input.gradeId || null,
    school_name: input.schoolName.trim() || null,
    student_count: input.studentCount ? Number(input.studentCount) : null,
    internet_available: input.internetAvailable,
    projector_available: input.projectorAvailable,
    equipment: input.equipment,
    notes: input.notes.trim() || null,
  })
  if (!error) return null
  if (!error.message.includes("Could not find the 'equipment' column")) {
    return `Không thể tạo hồ sơ lớp: ${error.message}`
  }
  const legacyResult = await supabase.from('class_profiles').insert({
    teacher_id: teacherId,
    name: input.name.trim(),
    grade_id: input.gradeId || null,
    school_name: input.schoolName.trim() || null,
    student_count: input.studentCount ? Number(input.studentCount) : null,
    internet_available: input.internetAvailable,
    projector_available: input.projectorAvailable,
    notes: input.notes.trim() || null,
  })
  return legacyResult.error
    ? `Không thể tạo hồ sơ lớp: ${legacyResult.error.message}`
    : null
}

export async function deleteClassProfile(id: string) {
  if (!supabase) return 'Chưa cấu hình kết nối Supabase.'
  const { error } = await supabase.from('class_profiles').delete().eq('id', id)
  return error ? `Không thể xóa hồ sơ lớp: ${error.message}` : null
}

export async function updateClassProfile(id: string, input: {
  name: string
  gradeId: string
  schoolName: string
  studentCount: string
  internetAvailable: boolean
  projectorAvailable: boolean
  equipment: string[]
  notes: string
}) {
  if (!supabase) return 'Chưa cấu hình kết nối Supabase.'
  const baseFields = {
    name: input.name.trim(),
    grade_id: input.gradeId || null,
    school_name: input.schoolName.trim() || null,
    student_count: input.studentCount ? Number(input.studentCount) : null,
    internet_available: input.internetAvailable,
    projector_available: input.projectorAvailable,
  }
  const { error } = await supabase.from('class_profiles').update({
    ...baseFields,
    equipment: input.equipment,
    notes: input.notes.trim() || null,
  }).eq('id', id)

  if (!error) return null
  if (!error.message.includes("Could not find the 'equipment' column")) {
    return `Không thể cập nhật hồ sơ lớp: ${error.message}`
  }

  const legacyResult = await supabase.from('class_profiles').update(baseFields).eq('id', id)
  return legacyResult.error
    ? `Không thể cập nhật hồ sơ lớp: ${legacyResult.error.message}`
    : null
}

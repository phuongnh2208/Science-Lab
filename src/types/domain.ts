export type UserRole = 'ADMIN' | 'TEACHER'

export type Profile = {
  id: string
  role: UserRole
  full_name: string | null
}

export type Lesson = {
  id: string
  title: string
  description: string | null
  learning_objectives?: string[]
  chapters: {
    title: string
    grades: { grade_number: number; name: string }
    subjects: { name: string; code: string }
  } | null
}

export type Grade = {
  id: string
  grade_number: number
  name: string
}

export type ContentBlockType =
  | 'TEXT'
  | 'YOUTUBE'
  | 'PHET'
  | 'WORKSHEET'
  | 'IMAGE'
  | 'EXPERIMENT'

export type ContentBlock = {
  id: string
  type: ContentBlockType
  title: string
  description: string
  content: string
}

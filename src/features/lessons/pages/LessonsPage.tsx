import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChevronRight, Search } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { Link } from 'react-router-dom'
import { listPublishedLessons } from '../services/lessonService'
import type { Lesson } from '../../../types/domain'

export function LessonsPage({ session }: { session: Session | null }) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(session))
  const [error, setError] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!session) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    void listPublishedLessons().then((result) => {
      setLessons(result.data)
      setError(result.error ?? '')
      setIsLoading(false)
    })
  }, [session])

  const filteredLessons = useMemo(() => lessons.filter((lesson) => {
    const matchesGrade = selectedGrade === 'all' || String(lesson.chapters?.grades.grade_number) === selectedGrade
    const text = `${lesson.title} ${lesson.description ?? ''} ${lesson.chapters?.title ?? ''}`.toLowerCase()
    return matchesGrade && text.includes(search.trim().toLowerCase())
  }), [lessons, search, selectedGrade])

  const availableGrades = useMemo(() => [...new Map(
    lessons
      .map((lesson) => lesson.chapters?.grades)
      .filter((grade): grade is NonNullable<typeof grade> => Boolean(grade))
      .map((grade) => [grade.grade_number, grade]),
  ).values()].sort((first, second) => first.grade_number - second.grade_number), [lessons])

  const lessonsByGrade = useMemo(() => {
    const groups = new Map<number, Lesson[]>()
    filteredLessons.forEach((lesson) => {
      const gradeNumber = lesson.chapters?.grades.grade_number
      if (gradeNumber === undefined) return
      groups.set(gradeNumber, [...(groups.get(gradeNumber) ?? []), lesson])
    })
    return [...groups.entries()].sort(([first], [second]) => first - second)
  }, [filteredLessons])

  return (
    <section className="page-section">
      <div className="page-heading">
        <div><p className="eyebrow">Thư viện bài giảng</p><h1>Khám phá bài học</h1><p className="hero-description">Chọn khối lớp để tìm các bài học Vật lí.</p></div>
      </div>
      {!session ? <div className="login-notice"><BookOpen size={18} /><span>Đăng nhập để truy cập thư viện bài giảng đã xuất bản.</span></div> : (
        <>
          <div className="section-heading"><h2>Danh mục Vật lí</h2><div className="filters">
            <label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm bài học..." /></label>
            <select value={selectedGrade} onChange={(event) => setSelectedGrade(event.target.value)}><option value="all">Tất cả khối</option>{availableGrades.map((grade) => <option key={grade.grade_number} value={grade.grade_number}>Lớp {grade.grade_number}</option>)}</select>
          </div></div>
          {error && <p className="error-message">{error}</p>}
          {isLoading ? <p className="empty-message">Đang tải dữ liệu bài học...</p> : filteredLessons.length === 0 ? <p className="empty-message">Chưa có bài học phù hợp.</p> : (
            <div className="lesson-grade-groups">{lessonsByGrade.map(([gradeNumber, gradeLessons]) => <section className="lesson-grade-group" key={gradeNumber}>
              <div className="section-heading"><h2>Lớp {gradeNumber}</h2><span>{gradeLessons.length} bài học</span></div>
              <div className="lesson-grid">{gradeLessons.map((lesson) => <article className="lesson-card" key={lesson.id}>
                <div className="lesson-card-top"><span>{lesson.chapters?.subjects.name ?? 'Khoa học'}</span><span>Lớp {gradeNumber}</span></div>
                <h3>{lesson.title}</h3><p>{lesson.description ?? 'Nội dung đang được cập nhật.'}</p>
                <div className="lesson-card-footer"><small>{lesson.chapters?.title}</small><Link className="icon-button" to={`/lessons/${lesson.id}`} aria-label={`Mở ${lesson.title}`}><ChevronRight size={18} /></Link></div>
              </article>)}</div>
            </section>)}</div>
          )}
        </>
      )}
    </section>
  )
}

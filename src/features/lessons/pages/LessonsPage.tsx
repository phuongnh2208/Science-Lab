import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Search } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { listPublishedLessons } from '../services/lessonService'
import type { Lesson } from '../../../types/domain'

export function LessonsPage({ session }: { session: Session | null }) {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(session))
  const [error, setError] = useState('')
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

  const lessonsByGrade = useMemo(() => {
    const groups = new Map<number, Lesson[]>()
    lessons.forEach((lesson) => {
      const gradeNumber = lesson.chapters?.grades.grade_number
      if (gradeNumber === undefined) return
      groups.set(gradeNumber, [...(groups.get(gradeNumber) ?? []), lesson])
    })
    return [...groups.entries()].sort(([first], [second]) => first - second)
  }, [lessons])

  const filteredGradeGroups = useMemo(() => {
    const term = search.trim().toLowerCase()
    return lessonsByGrade.filter(([_, gradeLessons]) => {
      return gradeLessons.some((lesson) => {
        const text = `${lesson.title} ${lesson.description ?? ''} ${lesson.chapters?.title ?? ''}`.toLowerCase()
        return text.includes(term)
      })
    })
  }, [lessonsByGrade, search])

  return (
    <section className="page-section">
      <div className="page-heading">
        <div><p className="eyebrow">Thư viện bài giảng</p><h1>Khám phá bài học</h1><p className="hero-description">Chọn khối lớp để xem các bài học Vật lí đã được sắp xếp theo chương.</p></div>
      </div>
      {!session ? <div className="login-notice"><BookOpen size={18} /><span>Đăng nhập để truy cập thư viện bài giảng đã xuất bản.</span></div> : (
        <>
          <div className="section-heading"><h2>Danh mục Vật lí</h2><div className="filters">
            <label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm bài học..." /></label>
          </div></div>
          {error && <p className="error-message">{error}</p>}
          {isLoading ? <p className="empty-message">Đang tải dữ liệu bài học...</p> : filteredGradeGroups.length === 0 ? <p className="empty-message">Chưa có bài học phù hợp.</p> : (
            <div className="grade-grid">{filteredGradeGroups.map(([gradeNumber, gradeLessons]) => <article className="grade-card" key={gradeNumber} onClick={() => navigate(`/lessons/grade/${gradeNumber}`)}>
              <div className="grade-card-header"><span>Lớp {gradeNumber}</span><span>{gradeLessons.length} bài học</span></div>
            </article>)}</div>
          )}
        </>
      )}
    </section>
  )
}

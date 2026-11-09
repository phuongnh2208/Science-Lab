import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { Link, useParams } from 'react-router-dom'
import { listPublishedLessons } from '../services/lessonService'
import type { Lesson } from '../../../types/domain'

export function GradeDetailPage({ session }: { session: Session | null }) {
  const { gradeNumber } = useParams<{ gradeNumber: string }>()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(session))
  const [error, setError] = useState('')

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

  const gradeNum = Number(gradeNumber)
  const gradeLessons = useMemo(() => lessons.filter((lesson) => {
    const matchesGrade = lesson.chapters?.grades.grade_number === gradeNum
    return matchesGrade
  }), [lessons, gradeNum])

  const lessonsByChapter = useMemo(() => {
    const groups = new Map<string, Lesson[]>()
    gradeLessons.forEach((lesson) => {
      const chapterTitle = lesson.chapters?.title ?? 'Không phân chương'
      groups.set(chapterTitle, [...(groups.get(chapterTitle) ?? []), lesson])
    })
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [gradeLessons])

  return (
    <section className="page-section">
      <Link className="back-link" to="/lessons"><ArrowLeft size={16} /> Thư viện bài học</Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Vật lí · Lớp {gradeNumber}</p>
          <h1>Bài học theo chương</h1>
          <p className="hero-description">{gradeLessons.length} bài học đã được sắp xếp theo chương.</p>
        </div>
      </div>
      {!session ? <div className="login-notice"><BookOpen size={18} /><span>Đăng nhập để xem chi tiết bài học.</span></div> : (
        <>
          {error && <p className="error-message">{error}</p>}
          {isLoading ? <p className="empty-message">Đang tải dữ liệu...</p> : lessonsByChapter.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">Chưa có bài học nào</p>
              <p className="empty-message">Không tìm thấy bài học Vật lí lớp {gradeNumber} phù hợp.</p>
            </div>
          ) : (
            <div className="chapter-groups">{lessonsByChapter.map(([chapterTitle, chapterLessons]) => <section className="chapter-group" key={chapterTitle}>
              <div className="chapter-group-header"><h2>{chapterTitle}</h2><span>{chapterLessons.length} bài học</span></div>
              <div className="lesson-grid">{chapterLessons.map((lesson) => <article className="lesson-card" key={lesson.id}>
                <div className="lesson-card-top"><span>{lesson.chapters?.subjects.name ?? 'Khoa học'}</span><span>Lớp {gradeNumber}</span></div>
                <h3>{lesson.title}</h3><p>{lesson.description ?? 'Nội dung đang được cập nhật.'}</p>
                <div className="lesson-card-footer"><small>{chapterTitle}</small><Link className="icon-button" to={`/lessons/${lesson.id}`} aria-label={`Mở ${lesson.title}`}><ChevronRight size={18} /></Link></div>
              </article>)}</div>
            </section>)}</div>
          )}
        </>
      )}
    </section>
  )
}
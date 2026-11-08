import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ExternalLink, FileText, FlaskConical, Image, Play, Sparkles } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { Link, useParams } from 'react-router-dom'
import { getPublishedLessonDetail } from '../services/lessonService'
import { createWorksheetSignedUrl } from '../services/lessonService'
import type { ContentBlock, Lesson } from '../../../types/domain'
import { renderAsync } from 'docx-preview'

export function LessonDetailPage({ session }: { session: Session | null }) {
  const { lessonId } = useParams<{ lessonId: string }>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(session))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session || !lessonId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    void getPublishedLessonDetail(lessonId).then((result) => {
      setLesson(result.data?.lesson ?? null)
      setBlocks(result.data?.blocks ?? [])
      setError(result.error ?? '')
      setIsLoading(false)
    })
  }, [lessonId, session])

  if (!session) return <section className="page-section"><div className="login-notice">Đăng nhập để xem chi tiết bài học.</div></section>
  if (isLoading) return <section className="page-section"><p className="empty-message">Đang tải bài học...</p></section>
  if (error || !lesson) return <section className="page-section"><p className="error-message">{error || 'Không tìm thấy bài học.'}</p><Link className="back-link" to="/lessons"><ArrowLeft size={16} /> Quay lại thư viện</Link></section>

  return <section className="page-section lesson-detail-page">
    <Link className="back-link" to="/lessons"><ArrowLeft size={16} /> Thư viện bài học</Link>
    <header className="lesson-detail-header">
      <div>
        <p className="eyebrow">{lesson.chapters?.subjects.name} · Lớp {lesson.chapters?.grades.grade_number}</p>
        <h1>{lesson.title}</h1>
        <p className="hero-description">{lesson.description ?? 'Nội dung bài học đang được cập nhật.'}</p>
      </div>
      <div className="lesson-meta-card"><strong>{lesson.chapters?.title}</strong><span>{blocks.length} học liệu</span></div>
    </header>
    <div className="lesson-content">
      {blocks.length === 0 ? <p className="empty-message">Bài học chưa có học liệu được xuất bản.</p> : blocks.map((block) => <LessonBlock key={block.id} block={block} />)}
    </div>
  </section>
}

function LessonBlock({ block }: { block: ContentBlock }) {
  const youtubeId = block.type === 'YOUTUBE' ? getYouTubeId(block.content) : null
  const isPhet = block.type === 'PHET'

  return <article className="lesson-content-block">
    <div className="lesson-content-heading"><BlockIcon type={block.type} /><div><span>{block.type}</span><h2>{block.title || 'Học liệu'}</h2></div></div>
    {block.description && <p className="lesson-block-description">{block.description}</p>}
    {block.type === 'TEXT' && <div className="lesson-text-content">{block.content}</div>}
    {youtubeId && <div className="video-frame"><iframe src={`https://www.youtube.com/embed/${youtubeId}`} title={block.title || 'Video hướng dẫn'} allowFullScreen /></div>}
    {block.type === 'YOUTUBE' && !youtubeId && <ExternalResource href={block.content} label="Mở video trên YouTube" />}
    {isPhet && <PhetPreview url={block.content} title={block.title || 'Mô phỏng PhET'} />}
    {block.type === 'WORKSHEET' && <WorksheetPreview path={block.content} />}
    {['IMAGE', 'EXPERIMENT'].includes(block.type) && <ExternalResource href={block.content} label={block.type === 'IMAGE' ? 'Mở hình ảnh' : 'Mở hướng dẫn thí nghiệm'} />}
  </article>
}

function PhetPreview({ url, title }: { url: string; title: string }) {
  if (!url.trim()) return <p className="empty-message">Mô phỏng PhET chưa có liên kết.</p>
  return <div className="phet-preview">
    <div className="phet-frame">
      <iframe src={url} title={title} allow="fullscreen; autoplay" allowFullScreen />
    </div>
    <ExternalResource href={url} label="Mở mô phỏng PhET trong tab mới" />
  </div>
}

function WorksheetPreview({ path }: { path: string }) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!path) return
    void createWorksheetSignedUrl(path).then(async (result) => {
      try {
        if (result.error || !result.url) {
          setError(result.error ?? 'Không thể tạo liên kết phiếu bài tập.')
          return
        }
        setUrl(result.url)
        if (path.toLowerCase().endsWith('.docx') && previewRef.current) {
          const response = await fetch(result.url)
          if (!response.ok) {
            setError('Không thể tải nội dung DOCX để xem trước.')
            return
          }
          await renderAsync(await response.arrayBuffer(), previewRef.current)
        }
      } catch {
        setError('Không thể hiển thị phiếu bài tập. Vui lòng thử lại sau.')
      }
    })
  }, [path])

  if (error) return <p className="error-message">{error}</p>
  if (!path) return <p className="empty-message">Phiếu bài tập chưa có file.</p>
  if (path.toLowerCase().endsWith('.pdf')) return <div className="worksheet-preview"><iframe src={url} title="Xem trước phiếu bài tập PDF" /><ExternalResource href={url} label="Tải phiếu bài tập PDF" /></div>
  return <div className="worksheet-preview"><div ref={previewRef} className="docx-preview" /><ExternalResource href={url} label="Tải phiếu bài tập DOCX" /></div>
}

function BlockIcon({ type }: { type: ContentBlock['type'] }) {
  if (type === 'YOUTUBE') return <Play size={18} />
  if (type === 'PHET') return <Sparkles size={18} />
  if (type === 'WORKSHEET') return <FileText size={18} />
  if (type === 'IMAGE') return <Image size={18} />
  if (type === 'EXPERIMENT') return <FlaskConical size={18} />
  return <FileText size={18} />
}

function ExternalResource({ href, label }: { href: string; label: string }) {
  if (!href.trim()) return <p className="empty-message">Học liệu chưa có liên kết.</p>
  return <a className="resource-link" href={href} target="_blank" rel="noreferrer"><ExternalLink size={16} /> {label}</a>
}

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.slice(1) || null
    if (parsed.hostname.includes('youtube.com')) return parsed.searchParams.get('v') || parsed.pathname.split('/').pop() || null
  } catch {
    return null
  }
  return null
}

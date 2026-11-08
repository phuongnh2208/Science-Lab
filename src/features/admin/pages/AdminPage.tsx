import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { BookOpen, ChevronDown, Eye, Plus, Save, Trash2 } from 'lucide-react'
import {
  createAdminLesson,
  createContentBlock,
  getLessonBlocks,
  listAdminChapters,
  listAdminGrades,
  listAdminLessons,
  saveLessonBlocks,
  uploadWorksheet,
  updateLessonStatus,
  updateAdminLesson,
  type AdminLesson,
} from '../services/contentService'
import type { ContentBlock, ContentBlockType, Grade, Profile } from '../../../types/domain'

const blockTypes: ContentBlockType[] = ['TEXT', 'YOUTUBE', 'PHET', 'WORKSHEET', 'IMAGE', 'EXPERIMENT']

export function AdminPage({ profile, session }: { profile: Profile | null; session: Session | null }) {
  const [grades, setGrades] = useState<Grade[]>([])
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [selectedGradeId, setSelectedGradeId] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    if (profile?.role !== 'ADMIN') return
    void listAdminGrades().then((result) => {
      setGrades(result.data)
      setError(result.error ?? '')
    })
  }, [profile])

  useEffect(() => {
    if (!selectedGradeId || profile?.role !== 'ADMIN') {
      setLessons([])
      setSelectedLessonId('')
      setBlocks([])
      return
    }
    setIsLoading(true)
    setError('')
    setIsEditOpen(false)
    void listAdminLessons(selectedGradeId).then((result) => {
      setLessons(result.data)
      setSelectedLessonId('')
      setBlocks([])
      setError(result.error ?? '')
      setIsLoading(false)
    })
  }, [selectedGradeId, profile])

  useEffect(() => {
    if (!selectedLessonId || profile?.role !== 'ADMIN') return
    setIsLoading(true)
    setError('')
    void getLessonBlocks(selectedLessonId).then((result) => {
      setBlocks(result.data)
      setError(result.error ?? '')
      setIsLoading(false)
    })
  }, [selectedLessonId, profile])

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= blocks.length) return
    const next = [...blocks]
    ;[next[index], next[target]] = [next[target], next[index]]
    setBlocks(next)
  }

  async function handleSave() {
    if (!session || !selectedLessonId) return
    setIsSaving(true)
    setError('')
    setMessage('')
    const result = await saveLessonBlocks(selectedLessonId, session.user.id, blocks)
    if (result) {
      setIsSaving(false)
      setError(result)
      return
    }
    const publishResult = await updateLessonStatus(selectedLessonId, session.user.id, 'PUBLISHED')
    setIsSaving(false)
    if (publishResult) setError(publishResult)
    else {
      setLessons((current) => current.map((lesson) => lesson.id === selectedLessonId ? { ...lesson, status: 'PUBLISHED' } : lesson))
      setMessage('Đã lưu và xuất bản bài học.')
    }
  }

  async function handleWorksheetUpload(blockId: string, file: File | undefined) {
    if (!file || !session) return
    setError('')
    const result = await uploadWorksheet(session.user.id, file)
    if (result.error || !result.path) {
      setError(result.error ?? 'Không thể tải phiếu bài tập lên.')
      return
    }
    setBlocks((current) => current.map((block) => block.id === blockId
      ? { ...block, content: result.path ?? '', title: block.title || file.name }
      : block))
    setMessage(`Đã tải lên ${file.name}. Hãy lưu nội dung bài học.`)
  }

  if (!session) return <section className="page-section"><div className="login-notice">Đăng nhập bằng tài khoản Admin để truy cập khu vực quản trị.</div></section>
  if (profile?.role !== 'ADMIN') return <section className="page-section"><div className="error-message">Bạn không có quyền truy cập khu vực quản trị.</div></section>

  const selectedGrade = grades.find((grade) => grade.id === selectedGradeId)
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId)

  return <section className="page-section admin-page">
    <div className="page-heading">
      <div><p className="eyebrow">Admin · Content Builder</p><h1>Trình tạo bài giảng</h1><p className="hero-description">Chọn khối lớp trước, sau đó chọn bài học hoặc tạo bài mới.</p></div>
      <div className="editor-actions">
        <button className="secondary-button" type="button" disabled={!selectedLessonId} onClick={() => window.open(`/lessons/${selectedLessonId}`, '_blank', 'noopener,noreferrer')}><Eye size={16} /> Xem trước</button>
        <button className="primary-button" type="button" disabled={!selectedLessonId || isSaving} onClick={() => void handleSave()}><Save size={16} />{isSaving ? 'Đang lưu...' : 'Lưu và xuất bản'}</button>
      </div>
    </div>
    {error && <p className="error-message">{error}</p>}
    {message && <p className="success-message editor-message">{message}</p>}

    <section className="admin-selection-flow" aria-label="Chọn bài học">
      <div className={`selection-step ${selectedGradeId ? 'is-complete' : 'is-active'}`}>
        <div className="step-number">1</div>
        <div className="step-content">
          <span className="step-label">Bước 1</span>
          <h2>Chọn khối lớp</h2>
          <select value={selectedGradeId} onChange={(event) => {
            setSelectedGradeId(event.target.value)
            setIsCreateOpen(false)
            setIsEditOpen(false)
            setMessage('')
          }}>
            <option value="">-- Chọn khối lớp --</option>
            {grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}
          </select>
        </div>
        <ChevronDown className="step-arrow" size={20} />
      </div>
      <div className={`selection-step ${selectedGradeId ? 'is-active' : 'is-disabled'}`}>
        <div className="step-number">2</div>
        <div className="step-content">
          <span className="step-label">Bước 2</span>
          <h2>Chọn hoặc tạo bài học</h2>
          {!selectedGradeId ? <p className="step-hint">Chọn khối lớp để xem danh sách bài học.</p> : (
            <div className="lesson-picker">
              <select value={selectedLessonId} onChange={(event) => {
                setSelectedLessonId(event.target.value)
                setIsCreateOpen(false)
                setMessage('')
              }}>
                <option value="">-- Chọn bài học của {selectedGrade?.name} --</option>
                {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
              </select>
              <button className="secondary-button" type="button" onClick={() => setIsCreateOpen(true)}><Plus size={16} /> Tạo bài mới</button>
              {selectedLessonId && <button className="secondary-button" type="button" onClick={() => { setIsCreateOpen(false); setIsEditOpen(true); setMessage('') }}>Chỉnh sửa bài học</button>}
            </div>
          )}
        </div>
      </div>
    </section>

    {isCreateOpen && selectedGradeId && <CreateLessonForm gradeId={selectedGradeId} gradeName={selectedGrade?.name ?? ''} userId={session.user.id} onCreated={(lessonId) => {
      setIsCreateOpen(false)
      setSelectedLessonId(lessonId)
      void listAdminLessons(selectedGradeId).then((result) => setLessons(result.data))
    }} onCancel={() => setIsCreateOpen(false)} onError={setError} />}
    {isEditOpen && selectedLesson && <EditLessonForm lesson={selectedLesson} gradeId={selectedGradeId} userId={session.user.id} onSaved={(updated) => {
      setLessons((current) => current.map((lesson) => lesson.id === updated.id ? { ...lesson, ...updated } : lesson))
      setIsEditOpen(false)
      setMessage('Đã cập nhật thông tin bài học.')
    }} onCancel={() => setIsEditOpen(false)} onError={setError} />}

    {selectedLessonId && <div className="admin-editor">
      <aside className="block-sidebar">
        <div className="editor-context"><BookOpen size={16} /><div><span>Đang chỉnh sửa</span><strong>{selectedLesson?.title}</strong><small className={`status-label status-${selectedLesson?.status?.toLowerCase()}`}>{selectedLesson?.status}</small></div></div>
        <h3>Thêm nội dung</h3>
        {blockTypes.map((type) => <button className="block-add-button" key={type} type="button" onClick={() => setBlocks((current) => [...current, createContentBlock(type)])}><Plus size={15} />{type}</button>)}
      </aside>
      <div className="block-canvas">
        {isLoading ? <p className="empty-message">Đang tải các block...</p> : blocks.length === 0 ? <p className="empty-message">Bài học chưa có block. Chọn loại nội dung ở cột trái.</p> : blocks.map((block, index) => <ContentBlockEditor key={block.id} block={block} index={index} total={blocks.length} onChange={(field, value) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, [field]: value } : item))} onUpload={handleWorksheetUpload} onMove={moveBlock} onDelete={() => setBlocks((current) => current.filter((item) => item.id !== block.id))} />)}
      </div>
    </div>}
  </section>
}

function CreateLessonForm({ gradeId, gradeName, userId, onCreated, onCancel, onError }: {
  gradeId: string
  gradeName: string
  userId: string
  onCreated: (lessonId: string) => void
  onCancel: () => void
  onError: (message: string) => void
}) {
  const [chapters, setChapters] = useState<Array<{ id: string; title: string; chapter_number: number | null }>>([])
  const [chapterId, setChapterId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lessonNumber, setLessonNumber] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void listAdminChapters(gradeId).then((result) => {
      setChapters(result.data)
      setChapterId(result.data[0]?.id ?? '')
      if (result.error) onError(result.error)
      setIsLoading(false)
    })
  }, [gradeId, onError])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!chapterId) return
    setIsSaving(true)
    const result = await createAdminLesson({ chapterId, title, description, lessonNumber, userId })
    setIsSaving(false)
    if (result.error || !result.id) onError(result.error ?? 'Không thể tạo bài học.')
    else onCreated(result.id)
  }

  return <form className="create-lesson-form" onSubmit={(event) => void handleSubmit(event)}>
    <div className="form-section-heading"><div><span className="step-label">Tạo bài mới</span><h2>Bài học cho {gradeName}</h2></div><button className="text-button" type="button" onClick={onCancel}>Hủy</button></div>
    {isLoading ? <p className="empty-message">Đang tải chương...</p> : chapters.length === 0 ? <p className="error-message">Khối này chưa có chương để gắn bài học.</p> : <div className="create-lesson-fields">
      <label>Chương/chủ đề *<select required value={chapterId} onChange={(event) => setChapterId(event.target.value)}>{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.chapter_number ? `Chương ${chapter.chapter_number}: ` : ''}{chapter.title}</option>)}</select></label>
      <label>Tên bài học *<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Định luật Ôm" /></label>
      <label>Số bài<input type="number" min="1" value={lessonNumber} onChange={(event) => setLessonNumber(event.target.value)} /></label>
      <label>Mô tả<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Mục tiêu hoặc mô tả ngắn về bài học..." /></label>
      <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Đang tạo...' : 'Tạo bài học'}</button>
    </div>}
  </form>
}

function EditLessonForm({ lesson, gradeId, userId, onSaved, onCancel, onError }: {
  lesson: AdminLesson
  gradeId: string
  userId: string
  onSaved: (lesson: Pick<AdminLesson, 'id' | 'title' | 'description' | 'lesson_number' | 'chapter_id'>) => void
  onCancel: () => void
  onError: (message: string) => void
}) {
  const [chapters, setChapters] = useState<Array<{ id: string; title: string; chapter_number: number | null }>>([])
  const [chapterId, setChapterId] = useState(lesson.chapter_id)
  const [title, setTitle] = useState(lesson.title)
  const [description, setDescription] = useState(lesson.description ?? '')
  const [lessonNumber, setLessonNumber] = useState(lesson.lesson_number?.toString() ?? '')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void listAdminChapters(gradeId).then((result) => {
      setChapters(result.data)
      setChapterId(lesson.chapter_id)
      if (result.error) onError(result.error)
      setIsLoading(false)
    })
  }, [gradeId, lesson.chapter_id, onError])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!chapterId || !title.trim()) return
    setIsSaving(true)
    const error = await updateAdminLesson({ lessonId: lesson.id, chapterId, title, description, lessonNumber, userId })
    setIsSaving(false)
    if (error) {
      onError(error)
      return
    }
    onSaved({ id: lesson.id, title: title.trim(), description: description.trim() || null, lesson_number: lessonNumber ? Number(lessonNumber) : null, chapter_id: chapterId })
  }

  return <form className="create-lesson-form" onSubmit={(event) => void handleSubmit(event)}>
    <div className="form-section-heading"><div><span className="step-label">Chỉnh sửa bài học</span><h2>Cập nhật thông tin bài học</h2></div><button className="text-button" type="button" onClick={onCancel}>Hủy</button></div>
    {isLoading ? <p className="empty-message">Đang tải chương...</p> : <div className="create-lesson-fields">
      <label>Chương/chủ đề *<select required value={chapterId} onChange={(event) => setChapterId(event.target.value)}>{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.chapter_number ? `Chương ${chapter.chapter_number}: ` : ''}{chapter.title}</option>)}</select></label>
      <label>Tên bài học *<input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label>Số bài<input type="number" min="1" value={lessonNumber} onChange={(event) => setLessonNumber(event.target.value)} /></label>
      <label>Mô tả<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></label>
      <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu thông tin bài học'}</button>
    </div>}
  </form>
}

function ContentBlockEditor({ block, index, total, onChange, onUpload, onMove, onDelete }: {
  block: ContentBlock
  index: number
  total: number
  onChange: (field: keyof Omit<ContentBlock, 'id'>, value: string) => void
  onUpload: (blockId: string, file: File | undefined) => void
  onMove: (index: number, direction: -1 | 1) => void
  onDelete: () => void
}) {
  return <article className="content-block"><div className="content-block-header"><span>{index + 1}. {block.type}</span><div><button type="button" onClick={() => onMove(index, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1}>↓</button><button type="button" className="delete-button" onClick={onDelete}><Trash2 size={15} /></button></div></div><label>Tiêu đề<input value={block.title} onChange={(event) => onChange('title', event.target.value)} placeholder="Tiêu đề block" /></label><label>Mô tả<textarea value={block.description} onChange={(event) => onChange('description', event.target.value)} placeholder="Mô tả ngắn..." rows={2} /></label>{block.type === 'WORKSHEET' && <label>File phiếu bài tập (.docx hoặc .pdf)<input type="file" accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => onUpload(block.id, event.target.files?.[0])} /><small className="upload-hint">{block.content ? `Đã chọn: ${block.content.split('/').pop()}` : 'File tối đa 10 MB'}</small></label>}<label>{block.type === 'TEXT' ? 'Nội dung HTML/text' : block.type === 'WORKSHEET' ? 'Đường dẫn storage (tự động)' : 'URL hoặc dữ liệu nội dung'}<textarea value={block.content} onChange={(event) => onChange('content', event.target.value)} placeholder={block.type === 'YOUTUBE' ? 'https://youtube.com/watch?v=...' : block.type === 'PHET' ? 'https://phet.colorado.edu/...' : block.type === 'WORKSHEET' ? 'Chọn file ở trên' : 'Nhập nội dung...'} rows={3} readOnly={block.type === 'WORKSHEET'} /></label></article>
}

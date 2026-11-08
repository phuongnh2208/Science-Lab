import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import { createClassProfile, deleteClassProfile, listClassProfiles, updateClassProfile, type ClassProfile } from '../services/classService'
import type { Grade } from '../../../types/domain'

const equipmentOptions = [
  ['teacher-kit', 'Bộ thí nghiệm biểu diễn của Giáo viên'],
  ['group-kit', 'Bộ thí nghiệm thực hành nhóm HS (6-8 nhóm)'],
  ['sensors', 'Thiết bị cảm biến / Smartphone (PhET, Coach 7, phyphox)'],
  ['worksheet', 'Bảng phụ / Phiếu học tập nhóm'],
] as const

export function ClassesPage({ session }: { session: Session | null }) {
  if (!session) return <section className="page-section"><div className="login-notice">Đăng nhập để quản lý hồ sơ lớp.</div></section>
  return <ClassProfiles session={session} />
}

function ClassProfiles({ session }: { session: Session }) {
  const [classes, setClasses] = useState<ClassProfile[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [gradeId, setGradeId] = useState('')
  const [studentCount, setStudentCount] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [internetAvailable, setInternetAvailable] = useState(false)
  const [projectorAvailable, setProjectorAvailable] = useState(false)
  const [equipment, setEquipment] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const result = await listClassProfiles(session.user.id)
    setClasses(result.classes)
    setGrades(result.grades)
    setError(result.error ?? '')
    setIsLoading(false)
  }, [session.user.id])

  useEffect(() => { void loadData() }, [loadData])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true); setError(''); setMessage('')
    const input = { name, gradeId, schoolName, studentCount, internetAvailable, projectorAvailable, equipment, notes }
    const result = editingClassId
      ? await updateClassProfile(editingClassId, input)
      : await createClassProfile(session.user.id, input)
    setIsSaving(false)
    if (result) { setError(result); return }
    setName(''); setGradeId(''); setStudentCount(''); setSchoolName(''); setInternetAvailable(false); setProjectorAvailable(false); setEquipment([]); setNotes(''); setEditingClassId(null); setIsCreateOpen(false); setMessage(editingClassId ? 'Đã cập nhật hồ sơ lớp.' : 'Đã tạo hồ sơ lớp.')
    await loadData()
  }

  function handleEdit(item: ClassProfile) {
    setSelectedClassId(item.id)
    setEditingClassId(item.id)
    setName(item.name)
    setGradeId(item.grade_id ?? '')
    setStudentCount(item.student_count?.toString() ?? '')
    setSchoolName(item.school_name ?? '')
    setInternetAvailable(item.internet_available)
    setProjectorAvailable(item.projector_available)
    setEquipment(item.equipment)
    setNotes(item.notes ?? '')
    setIsCreateOpen(true)
    setError('')
    setMessage('')
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Xóa hồ sơ lớp này?')) return
    const result = await deleteClassProfile(id)
    if (result) setError(result)
    else { setMessage('Đã xóa hồ sơ lớp.'); await loadData() }
  }

  return <section className="page-section"><div className="section-heading"><div><p className="eyebrow">Cá nhân hóa bài dạy</p><h1>Hồ sơ lớp của bạn</h1></div><button className="primary-button" type="button" onClick={() => { setIsCreateOpen(true); setEditingClassId(null); setSelectedClassId(null); setError(''); setMessage('') }}><Plus size={16} /> Tạo hồ sơ lớp mới</button></div><div className={`class-layout ${isCreateOpen ? 'has-form' : 'list-only'}`}>
    {isCreateOpen && <div className="class-form-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setIsCreateOpen(false); setEditingClassId(null) } }}><form className="class-form" onSubmit={(event) => void handleSubmit(event)}><div className="form-section-heading"><h3>{editingClassId ? 'Chỉnh sửa hồ sơ lớp' : 'Tạo hồ sơ lớp'}</h3><button className="text-button" type="button" onClick={() => { setIsCreateOpen(false); setEditingClassId(null) }}>Đóng</button></div>
      <label>Tên lớp *<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: 8A1" /></label>
      <label>Khối lớp *<select required value={gradeId} onChange={(event) => setGradeId(event.target.value)}><option value="">-- Chọn khối lớp --</option>{grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}</select></label>
      <label>Trường<input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} placeholder="Tên trường" /></label>
      <label>Sĩ số<input type="number" min="1" value={studentCount} onChange={(event) => setStudentCount(event.target.value)} /></label>
      <fieldset className="equipment-fieldset"><legend>Thiết bị có sẵn tại lớp</legend><div className="equipment-grid">{equipmentOptions.map(([value, label]) => <label className="equipment-option" key={value}><input type="checkbox" checked={equipment.includes(value)} onChange={(event) => setEquipment((current) => event.target.checked ? [...current, value] : current.filter((item) => item !== value))} />{label}</label>)}</div></fieldset>
      <label>Ghi chú điều kiện lớp<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Nhu cầu đặc biệt, năng lực học sinh, lưu ý tổ chức..." /></label>
      {message && <p className="form-message success-message">{message}</p>}{error && <p className="form-message error-text">{error}</p>}<button className="primary-button" disabled={isSaving} type="submit">{editingClassId ? <Edit3 size={16} /> : <Plus size={16} />}{isSaving ? 'Đang lưu...' : editingClassId ? 'Lưu thay đổi' : 'Thêm hồ sơ lớp'}</button>
    </form></div>}
    <div className="class-list">{isLoading ? <p className="empty-message">Đang tải hồ sơ lớp...</p> : classes.length === 0 ? <p className="empty-message">Bạn chưa có hồ sơ lớp nào.</p> : classes.map((item) => {
      const isSelected = selectedClassId === item.id
      return <article className={`class-card ${isSelected ? 'is-selected' : ''}`} key={item.id} onClick={() => setSelectedClassId(isSelected ? null : item.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedClassId(isSelected ? null : item.id) } }} role="button" tabIndex={0}>
        <div className="class-card-summary"><div><h3>{item.name}</h3><p>{item.grades?.name ?? 'Chưa gắn khối'}{item.school_name ? ` · ${item.school_name}` : ''}</p><small>{item.student_count ? `${item.student_count} học sinh` : 'Chưa nhập sĩ số'} · {item.equipment.length} thiết bị đã chọn</small></div><div className="class-card-actions"><button className="edit-button" type="button" onClick={(event) => { event.stopPropagation(); handleEdit(item) }} aria-label={`Chỉnh sửa ${item.name}`}><Edit3 size={16} /></button><button className="delete-button" type="button" onClick={(event) => { event.stopPropagation(); void handleDelete(item.id) }} aria-label={`Xóa ${item.name}`}><Trash2 size={16} /></button></div></div>
        {isSelected && <div className="class-card-details"><div><strong>Trường</strong><span>{item.school_name || 'Chưa cập nhật'}</span></div><div><strong>Sĩ số</strong><span>{item.student_count ? `${item.student_count} học sinh` : 'Chưa cập nhật'}</span></div><div><strong>Internet</strong><span>{item.internet_available ? 'Có' : 'Chưa có'}</span></div><div><strong>Máy chiếu</strong><span>{item.projector_available ? 'Có' : 'Chưa có'}</span></div><div className="class-card-detail-wide"><strong>Thiết bị</strong><span>{item.equipment.length ? item.equipment.map((value) => equipmentOptions.find(([option]) => option === value)?.[1] ?? value).join(', ') : 'Chưa chọn thiết bị'}</span></div>{item.notes && <div className="class-card-detail-wide"><strong>Ghi chú</strong><span>{item.notes}</span></div>}</div>}
      </article>
    })}</div>
  </div></section>
}

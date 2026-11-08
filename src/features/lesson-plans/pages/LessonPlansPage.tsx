import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Bot, Copy, Edit3, ExternalLink, FileText, Plus, Save, Trash2 } from 'lucide-react'
import { createWorksheetSignedUrl, getPublishedLessonDetail, listPublishedLessons } from '../../lessons/services/lessonService'
import { listClassProfiles, type ClassProfile } from '../../classes/services/classService'
import {
  createLessonPlan,
  deleteLessonPlan,
  generateAiLessonPlan,
  listLessonPlans,
  updateLessonPlan,
  type LessonPlan,
  type LessonPlanActivity,
  type LessonPlanType,
  type PlanContent,
} from '../services/lessonPlanService'
import type { ContentBlock, Lesson } from '../../../types/domain'
import { renderAsync } from 'docx-preview'

const sections: Array<{ key: 'objectives' | 'equipment' | 'assessment'; label: string; placeholder: string }> = [
  { key: 'objectives', label: 'I. Mục tiêu', placeholder: 'Nêu kiến thức, năng lực và phẩm chất học sinh cần đạt...' },
  { key: 'equipment', label: 'II. Thiết bị dạy học và học liệu', placeholder: 'Liệt kê thiết bị, học liệu và phiếu học tập...' },
  { key: 'assessment', label: 'IV. Đánh giá', placeholder: 'Nêu cách đánh giá sản phẩm, quá trình và mức độ hoàn thành...' },
]

const defaultActivities: LessonPlanActivity[] = [
  { id: crypto.randomUUID(), title: 'Hoạt động 1. Khởi động', objective: '', content: '', product: '', organization: '', blockIds: [] },
  { id: crypto.randomUUID(), title: 'Hoạt động 2. Hình thành kiến thức', objective: '', content: '', product: '', organization: '', blockIds: [] },
  { id: crypto.randomUUID(), title: 'Hoạt động 3. Luyện tập', objective: '', content: '', product: '', organization: '', blockIds: [] },
  { id: crypto.randomUUID(), title: 'Hoạt động 4. Vận dụng', objective: '', content: '', product: '', organization: '', blockIds: [] },
]

const equipmentLabels: Record<string, string> = {
  projector: 'Máy chiếu / Tivi thông minh',
  internet: 'Mạng Internet / Wifi lớp học',
  'teacher-kit': 'Bộ thí nghiệm biểu diễn của giáo viên',
  'group-kit': 'Bộ thí nghiệm thực hành nhóm học sinh',
  sensors: 'Thiết bị cảm biến / Smartphone',
  worksheet: 'Bảng phụ / Phiếu học tập nhóm',
}

function downloadWord(plan: LessonPlan, lesson: Lesson | null, classProfile: ClassProfile | null, blocks: ContentBlock[]) {
  const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const lines = (value: string) => value.split('\n').filter(Boolean).map((line) => `<li>${escapeHtml(line.replace(/^- /, ''))}</li>`).join('')
  const activities = plan.plan_content.activities.map((activity) => {
    const linkedBlocks = activity.blockIds.map((id) => blocks.find((block) => block.id === id)).filter((block): block is ContentBlock => Boolean(block))
    const linkedHtml = linkedBlocks.length > 0
      ? `<p><strong>Học liệu từ bài giảng:</strong></p><ul>${linkedBlocks.map((block) => `<li><strong>${escapeHtml(block.title || block.type)}</strong>${block.description ? `: ${escapeHtml(block.description)}` : ''}${block.content ? `<br>${escapeHtml(block.content)}` : ''}</li>`).join('')}</ul>`
      : ''
    return `<h3>${escapeHtml(activity.title)}</h3><p><strong>Mục tiêu:</strong> ${escapeHtml(activity.objective)}</p><p><strong>Nội dung:</strong> ${escapeHtml(activity.content)}</p>${linkedHtml}<p><strong>Sản phẩm:</strong> ${escapeHtml(activity.product)}</p><p><strong>Tổ chức thực hiện:</strong> ${escapeHtml(activity.organization)}</p>`
  }).join('')
  const worksheets = blocks.filter((block) => block.type === 'WORKSHEET').map((block) => `<h3>${escapeHtml(block.title || 'Phiếu học tập')}</h3><p>${escapeHtml(block.description || 'Phiếu học tập gắn với bài giảng.')}</p><p><strong>File:</strong> ${escapeHtml(block.content)}</p>`).join('')
  const html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;line-height:1.55}h1{text-align:center;color:#0756a6}h2{color:#073f78;border-bottom:1px solid #999;padding-bottom:5px}h3{color:#0756a6}p{margin:6px 0}</style></head><body><p style="text-align:center"><strong>KẾ HOẠCH BÀI DẠY (${plan.plan_type === 'STEM' ? 'STEM' : 'CÔNG VĂN 5512'})</strong></p><h1>${escapeHtml(plan.title)}</h1><p style="text-align:center">${escapeHtml(lesson?.chapters?.grades.name ?? '')} · ${escapeHtml(lesson?.chapters?.subjects.name ?? '')} · Kết nối tri thức với cuộc sống</p>${classProfile ? `<h2>THÔNG TIN HỒ SƠ LỚP</h2><p>${escapeHtml(classProfile.name)}${classProfile.school_name ? ` · ${escapeHtml(classProfile.school_name)}` : ''}</p>` : ''}<h2>I. MỤC TIÊU</h2><ul>${lines(plan.plan_content.objectives)}</ul><h2>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h2><ul>${lines(plan.plan_content.equipment)}</ul><h2>III. TIẾN TRÌNH DẠY HỌC</h2>${activities}<h2>IV. ĐÁNH GIÁ</h2><ul>${lines(plan.plan_content.assessment)}</ul>${worksheets ? `<h2>V. PHIẾU HỌC TẬP</h2>${worksheets}` : ''}</body></html>`
  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${plan.title.replace(/[^\w\u00C0-\u1EF9-]+/g, '-').replace(/^-|-$/g, '') || 'ke-hoach-bai-day'}.doc`
  link.click()
  URL.revokeObjectURL(url)
}

function getPlanText(plan: LessonPlan, lesson: Lesson | null, classProfile: ClassProfile | null, blocks: ContentBlock[]) {
  const linkedBlockText = (activity: LessonPlanActivity) => activity.blockIds
    .map((id) => blocks.find((block) => block.id === id))
    .filter((block): block is ContentBlock => Boolean(block))
    .map((block) => [
      block.title || block.type,
      block.description,
      block.content,
    ].filter(Boolean).join(': '))
    .join('\n')
  const activities = plan.plan_content.activities.map((activity, index) => [
    `${index + 1}. ${activity.title}`,
    `Mục tiêu: ${activity.objective}`,
    `Nội dung: ${activity.content}`,
    linkedBlockText(activity) ? `Học liệu từ bài giảng:\n${linkedBlockText(activity)}` : '',
    `Sản phẩm: ${activity.product}`,
    `Tổ chức thực hiện: ${activity.organization}`,
  ].filter(Boolean).join('\n')).join('\n\n')
  return [
    `KẾ HOẠCH BÀI DẠY (${plan.plan_type === 'STEM' ? 'STEM' : 'CÔNG VĂN 5512'})`,
    plan.title,
    lesson ? `Lớp: ${lesson.chapters?.grades.name ?? ''} · Môn: ${lesson.chapters?.subjects.name ?? ''}` : '',
    classProfile ? `Hồ sơ lớp: ${classProfile.name}${classProfile.school_name ? ` · ${classProfile.school_name}` : ''}` : '',
    'I. MỤC TIÊU',
    plan.plan_content.objectives,
    'II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU',
    plan.plan_content.equipment,
    'III. TIẾN TRÌNH DẠY HỌC',
    activities,
    'IV. ĐÁNH GIÁ',
    plan.plan_content.assessment,
  ].filter(Boolean).join('\n\n')
}

function createLessonDrivenContent(lesson: Lesson, blocks: ContentBlock[], classProfile?: ClassProfile): PlanContent {
  const blockLabel = (block: ContentBlock) => block.title || ({
    TEXT: 'Nội dung kiến thức',
    YOUTUBE: 'Video bài giảng',
    PHET: 'Mô phỏng tương tác',
    WORKSHEET: 'Phiếu bài tập',
    IMAGE: 'Hình ảnh minh họa',
    EXPERIMENT: 'Thí nghiệm thực hành',
  }[block.type] ?? 'Học liệu')
  const preferredOrder: Record<ContentBlock['type'], number> = {
    YOUTUBE: 1,
    IMAGE: 2,
    TEXT: 3,
    PHET: 4,
    EXPERIMENT: 5,
    WORKSHEET: 6,
  }
  const orderedBlocks = [...blocks].sort((first, second) => preferredOrder[first.type] - preferredOrder[second.type])
  const blockNames = orderedBlocks.map(blockLabel)
  const objectiveText = (lesson.learning_objectives ?? []).join('\n')
  const resourceText = blockNames.length > 0 ? blockNames.map((name) => `- ${name}`).join('\n') : '- Học liệu được cập nhật trong bài giảng'
  const activityObjective: Record<ContentBlock['type'], string> = {
    TEXT: 'Học sinh khai thác và trình bày kiến thức trọng tâm từ nội dung bài giảng.',
    YOUTUBE: 'Học sinh quan sát video, nhận diện hiện tượng và rút ra thông tin chính.',
    PHET: 'Học sinh thao tác với mô phỏng, quan sát sự thay đổi và giải thích kết quả.',
    WORKSHEET: 'Học sinh hoàn thành phiếu bài tập để củng cố và vận dụng kiến thức.',
    IMAGE: 'Học sinh quan sát hình ảnh, phân tích dữ liệu và nêu nhận xét.',
    EXPERIMENT: 'Học sinh thực hiện hoặc phân tích thí nghiệm, ghi nhận và giải thích kết quả.',
  }
  const hasGroupKit = classProfile?.equipment.includes('group-kit') ?? false
  const hasTeacherKit = classProfile?.equipment.includes('teacher-kit') ?? false
  const hasSensors = classProfile?.equipment.includes('sensors') ?? false
  const groupDescription = classProfile?.student_count
    ? `Lớp ${classProfile.name} có ${classProfile.student_count} học sinh.`
    : `Tổ chức theo điều kiện thực tế của lớp ${classProfile?.name ?? ''}.`
  const organizationByType: Record<ContentBlock['type'], string> = {
    TEXT: 'Giáo viên giao nhiệm vụ đọc và phân tích nội dung; học sinh làm việc cá nhân, sau đó trao đổi và báo cáo.',
    YOUTUBE: 'Giáo viên nêu câu hỏi định hướng trước khi xem; học sinh quan sát, ghi nhận hiện tượng và chia sẻ nhận xét.',
    PHET: hasSensors
      ? 'Học sinh làm việc theo nhóm với thiết bị có sẵn, thay đổi tham số mô phỏng, ghi nhận và giải thích kết quả.'
      : 'Giáo viên chiếu hoặc gửi link mô phỏng; học sinh dự đoán, quan sát và thảo luận kết quả.',
    WORKSHEET: 'Giáo viên phát phiếu; học sinh hoàn thành cá nhân hoặc theo cặp, đối chiếu đáp án và sửa sai.',
    IMAGE: 'Học sinh quan sát hình ảnh, trả lời câu hỏi gợi mở và trình bày bằng chứng từ hình ảnh.',
    EXPERIMENT: hasGroupKit
      ? 'Học sinh làm việc theo nhóm, phân công người thực hiện, ghi chép và báo cáo kết quả thí nghiệm.'
      : hasTeacherKit
        ? 'Giáo viên biểu diễn thí nghiệm; học sinh quan sát, dự đoán, ghi số liệu và giải thích kết quả.'
        : 'Giáo viên hướng dẫn phân tích quy trình hoặc video thí nghiệm; học sinh dự đoán và rút ra kết luận an toàn.',
  }
  const phaseByType: Record<ContentBlock['type'], string> = {
    YOUTUBE: 'Khởi động',
    IMAGE: 'Khởi động',
    TEXT: 'Hình thành kiến thức',
    PHET: 'Hình thành kiến thức',
    EXPERIMENT: 'Luyện tập và thực hành',
    WORKSHEET: 'Luyện tập và vận dụng',
  }
  const activities = orderedBlocks.map((block, index) => ({
    id: crypto.randomUUID(),
    title: `Hoạt động ${index + 1}. ${phaseByType[block.type]} – ${blockLabel(block)}`,
    objective: activityObjective[block.type],
    content: block.description
      ? `${block.description}${block.content ? `\n\nHọc liệu: ${block.content}` : ''}`
      : block.content || `Khai thác ${blockLabel(block)} trong bài “${lesson.title}”.`,
    product: block.type === 'WORKSHEET'
      ? 'Phiếu bài tập đã hoàn thành.'
      : block.type === 'EXPERIMENT'
        ? 'Bảng số liệu, kết quả quan sát hoặc báo cáo thí nghiệm.'
        : 'Câu trả lời, nhận xét hoặc sản phẩm học tập từ học liệu.',
    organization: `${organizationByType[block.type]} ${groupDescription}`,
    blockIds: [block.id],
  }))

  return {
    objectives: objectiveText || `Học sinh đạt được mục tiêu của bài học “${lesson.title}”.`,
    equipment: resourceText,
    activities: activities.length > 0 ? activities : [{
      id: crypto.randomUUID(),
      title: 'Hoạt động 1. Khai thác bài giảng',
      objective: 'Học sinh đạt được mục tiêu của bài học.',
      content: `Khai thác nội dung bài “${lesson.title}”. Bài giảng chưa có block học liệu cụ thể.`,
      product: 'Câu trả lời và ghi chép của học sinh.',
      organization: `Giáo viên bổ sung nhiệm vụ phù hợp trước khi lưu KHBD. ${groupDescription}`,
      blockIds: [],
    }],
    assessment: 'Đánh giá qua mức độ tham gia, câu trả lời, sản phẩm học tập và kết quả phiếu bài tập.',
  }
}

function PlanTextField({ section, content, setContent }: {
  section: (typeof sections)[number]
  content: PlanContent
  setContent: Dispatch<SetStateAction<PlanContent>>
}) {
  return <label className="plan-section-field">{section.label}<textarea value={content[section.key]} onChange={(event) => setContent((current) => ({ ...current, [section.key]: event.target.value }))} placeholder={section.placeholder} rows={7} /></label>
}

function ActivitiesEditor({ activities, blocks, onChange }: {
  activities: LessonPlanActivity[]
  blocks: ContentBlock[]
  onChange: (activities: LessonPlanActivity[]) => void
}) {
  function updateActivity(index: number, field: keyof LessonPlanActivity, value: string) {
    onChange(activities.map((activity, activityIndex) => activityIndex === index ? { ...activity, [field]: value } : activity))
  }

  function updateBlockIds(index: number, blockId: string, checked: boolean) {
    onChange(activities.map((activity, activityIndex) => {
      if (activityIndex !== index) return activity
      const blockIds = checked ? [...activity.blockIds, blockId] : activity.blockIds.filter((id) => id !== blockId)
      const linkedBlocks = blocks.filter((block) => blockIds.includes(block.id))
      const linkedContent = linkedBlocks.map((block) => `${block.title || block.type}${block.description ? `: ${block.description}` : ''}${block.content ? `\n${block.content}` : ''}`).join('\n\n')
      return { ...activity, blockIds, content: linkedContent || activity.content }
    }))
  }

  function addActivity() {
    onChange([...activities, { id: crypto.randomUUID(), title: `Hoạt động ${activities.length + 1}`, objective: '', content: '', product: '', organization: '', blockIds: [] }])
  }

  function removeActivity(index: number) {
    onChange(activities.filter((_, activityIndex) => activityIndex !== index))
  }

  function moveActivity(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= activities.length) return
    const next = [...activities]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return <section className="activities-editor">
    <div className="plan-section-heading"><h2>III. Tiến trình dạy học</h2><p>Mỗi hoạt động gồm mục tiêu, nội dung, sản phẩm và cách tổ chức theo CV 5512.</p></div>
    {activities.map((activity, index) => <fieldset className="activity-card" key={activity.id}>
      <legend><input className="activity-title-input" value={activity.title} onChange={(event) => updateActivity(index, 'title', event.target.value)} /><button type="button" onClick={() => moveActivity(index, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => moveActivity(index, 1)} disabled={index === activities.length - 1}>↓</button><button className="delete-button" type="button" onClick={() => removeActivity(index)} aria-label="Xóa hoạt động"><Trash2 size={15} /></button></legend>
      <label>Mục tiêu<textarea value={activity.objective} onChange={(event) => updateActivity(index, 'objective', event.target.value)} rows={3} placeholder="Học sinh đạt được gì sau hoạt động này?" /></label>
      <label>Nội dung<textarea value={activity.content} onChange={(event) => updateActivity(index, 'content', event.target.value)} rows={4} placeholder="Nhiệm vụ, câu hỏi hoặc kiến thức trọng tâm..." /></label>
      <label>Sản phẩm<textarea value={activity.product} onChange={(event) => updateActivity(index, 'product', event.target.value)} rows={3} placeholder="Câu trả lời, bảng số liệu, báo cáo hoặc sản phẩm học tập..." /></label>
      <label>Tổ chức thực hiện<textarea value={activity.organization} onChange={(event) => updateActivity(index, 'organization', event.target.value)} rows={4} placeholder="Giao nhiệm vụ, thực hiện, báo cáo, thảo luận và kết luận..." /></label>
      <div className="activity-block-picker"><strong>Block học liệu sử dụng</strong>{blocks.length === 0 ? <span>Chưa có block trong bài giảng.</span> : blocks.map((block) => <label key={block.id}><input type="checkbox" checked={activity.blockIds.includes(block.id)} onChange={(event) => updateBlockIds(index, block.id, event.target.checked)} />{block.title || block.type}</label>)}</div>
    </fieldset>)}
    <button className="secondary-button" type="button" onClick={addActivity}><Plus size={16} /> Thêm hoạt động</button>
  </section>
}

function PlanPreview({ plan, lesson, classProfile, blocks, onEdit, onCopy }: {
  plan: LessonPlan
  lesson: Lesson | null
  classProfile: ClassProfile | null
  blocks: ContentBlock[]
  onEdit: () => void
  onCopy: () => void
}) {
  return <article className="plan-preview">
    <header className="plan-preview-header">
      <div>
        <p className="plan-preview-kicker">KẾ HOẠCH BÀI DẠY ({plan.plan_type === 'STEM' ? 'STEM' : 'CÔNG VĂN 5512'})</p>
        <h2>{plan.title}</h2>
        <p>{lesson ? `Lớp: ${lesson.chapters?.grades.name ?? ''} · Môn: ${lesson.chapters?.subjects.name ?? ''}` : 'Thông tin bài học đang được cập nhật'}</p>
      </div>
      <div className="plan-preview-actions"><button className="secondary-button" type="button" onClick={onEdit}><Edit3 size={16} /> Chỉnh sửa</button><button className="secondary-button" type="button" onClick={onCopy}><Copy size={16} /> Sao chép</button><button className="primary-button" type="button" onClick={() => downloadWord(plan, lesson, classProfile, blocks)}><FileText size={16} /> Xuất Word</button></div>
    </header>
    {classProfile && <section className="plan-context-box">
      <h3>THÔNG TIN HỒ SƠ LỚP VÀ ĐIỀU KIỆN THỰC TẾ</h3>
      <p><strong>Lớp:</strong> {classProfile.name}{classProfile.school_name ? ` · ${classProfile.school_name}` : ''}{classProfile.student_count ? ` · Sĩ số ${classProfile.student_count} học sinh` : ''}</p>
      {classProfile.equipment.length > 0 && <p><strong>Thiết bị:</strong> {classProfile.equipment.map((item) => equipmentLabels[item] ?? item).join(' · ')}</p>}
    </section>}
    <PlanPreviewSection title="I. MỤC TIÊU" value={plan.plan_content.objectives} />
    <PlanPreviewSection title="II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU" value={plan.plan_content.equipment} />
    <section className="plan-preview-section">
      <h3>III. TIẾN TRÌNH DẠY HỌC ({plan.plan_content.activities.length} HOẠT ĐỘNG)</h3>
      <div className="plan-preview-activities">{plan.plan_content.activities.map((activity, index) => <article className="plan-preview-activity" key={`${activity.title}-${index}`}>
        <h4>{activity.title}</h4>
        <PreviewField label="Mục tiêu" value={activity.objective} />
        <PreviewField label="Nội dung" value={activity.content} />
        {activity.blockIds.length > 0 && <div className="linked-blocks"><strong>Học liệu từ bài giảng:</strong>{activity.blockIds.map((blockId) => blocks.find((block) => block.id === blockId)).filter((block): block is ContentBlock => Boolean(block)).map((block) => <div className="linked-block" key={block.id}><b>{block.title || block.type}</b>{block.description && <span>{block.description}</span>}{block.content && <span>{block.content}</span>}<PlanResourcePreview block={block} /></div>)}</div>}
        <PreviewField label="Sản phẩm" value={activity.product} />
        <PreviewField label="Tổ chức thực hiện" value={activity.organization} />
      </article>)}</div>
    </section>
    <PlanPreviewSection title="IV. ĐÁNH GIÁ" value={plan.plan_content.assessment} />
    <LearningMaterialsPreview blocks={blocks} />
  </article>
}

function LearningMaterialsPreview({ blocks }: { blocks: ContentBlock[] }) {
  const resources = blocks.filter((block) => ['WORKSHEET', 'YOUTUBE', 'PHET', 'IMAGE', 'EXPERIMENT'].includes(block.type))
  if (resources.length === 0) return null
  return <section className="plan-learning-materials">
    <div className="plan-preview-section"><h3>V. HỌC LIỆU ĐÍNH KÈM</h3>{resources.map((block) => <article className="learning-material-card" key={block.id}><strong>{block.title || 'Học liệu'}</strong>{block.description && <p>{block.description}</p>}<PlanResourcePreview block={block} /></article>)}</div>
  </section>
}

function PlanResourcePreview({ block }: { block: ContentBlock }) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const source = block.content.trim()
  const youtubeId = block.type === 'YOUTUBE' ? getYouTubeId(source) : null
  const isDocument = /\.(pdf|doc|docx)(?:$|[?#])/i.test(source) || source.includes('docs.google.com')

  useEffect(() => {
    if (block.type !== 'WORKSHEET' || !source) return
    void createWorksheetSignedUrl(source).then(async (result) => {
      if (result.error || !result.url) {
        setError(result.error ?? 'Không thể tạo liên kết học liệu.')
        return
      }
      setUrl(result.url)
      if (/\.(docx)(?:$|[?#])/i.test(source) && previewRef.current) {
        const response = await fetch(result.url)
        if (!response.ok) throw new Error('Không thể tải DOCX.')
        await renderAsync(await response.arrayBuffer(), previewRef.current)
      }
    }).catch(() => setError('Không thể hiển thị học liệu.'))
  }, [block.type, source])

  if (!source) return <p className="preview-empty">Chưa có liên kết hoặc file đính kèm.</p>
  if (error) return <p className="error-message">{error}</p>
  if (youtubeId) return <div className="resource-preview"><div className="video-frame"><iframe src={`https://www.youtube.com/embed/${youtubeId}`} title={block.title || 'Video học liệu'} allowFullScreen /></div><ResourceLink href={source} label="Mở video trên YouTube" /></div>
  if (block.type === 'PHET') return <div className="resource-preview"><div className="phet-frame"><iframe src={source} title={block.title || 'Mô phỏng PhET'} allowFullScreen /></div><ResourceLink href={source} label="Mở mô phỏng PhET" /></div>
  if (block.type === 'WORKSHEET' && /\.pdf(?:$|[?#])/i.test(source)) return <div className="resource-preview"><iframe className="document-frame" src={url} title={block.title || 'Xem trước PDF'} /><ResourceLink href={url} label="Mở PDF" /></div>
  if (block.type === 'WORKSHEET' && /\.docx(?:$|[?#])/i.test(source)) return <div className="resource-preview"><div ref={previewRef} className="docx-preview" /><ResourceLink href={url} label="Mở DOCX" /></div>
  if (isDocument) return <div className="resource-preview"><iframe className="document-frame" src={source} title={block.title || 'Xem trước tài liệu'} /><ResourceLink href={source} label="Mở tài liệu" /></div>
  if (block.type === 'IMAGE') return <div className="resource-preview"><img className="image-resource-preview" src={source} alt={block.title || 'Hình ảnh học liệu'} /><ResourceLink href={source} label="Mở hình ảnh" /></div>
  return <ResourceLink href={source} label={block.type === 'EXPERIMENT' ? 'Mở hướng dẫn thí nghiệm' : 'Mở học liệu'} />
}

function ResourceLink({ href, label }: { href: string; label: string }) {
  if (!href) return null
  return <a className="resource-link" href={href} target="_blank" rel="noreferrer"><ExternalLink size={15} /> {label}</a>
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

function PlanPreviewSection({ title, value }: { title: string; value: string }) {
  return <section className="plan-preview-section"><h3>{title}</h3>{value ? <ul>{value.split('\n').map((line, index) => <li key={`${line}-${index}`}>{line.replace(/^- /, '')}</li>)}</ul> : <p className="preview-empty">Chưa có nội dung.</p>}</section>
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return <div className="preview-field"><strong>{label}:</strong>{value ? <p>{value}</p> : <span>Chưa có nội dung.</span>}</div>
}

export function LessonPlansPage({ session }: { session: Session | null }) {
  if (!session) return <section className="page-section"><div className="login-notice">Đăng nhập để sử dụng Kho KHBD.</div></section>
  return <LessonPlanWorkspace session={session} />
}

function LessonPlanWorkspace({ session }: { session: Session }) {
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [classes, setClasses] = useState<ClassProfile[]>([])
  const [lessonBlocks, setLessonBlocks] = useState<ContentBlock[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [isEditing, setIsEditing] = useState(true)
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [title, setTitle] = useState('')
  const [lessonId, setLessonId] = useState('')
  const [classProfileId, setClassProfileId] = useState('')
  const [planType, setPlanType] = useState<LessonPlanType>('STANDARD')
  const [content, setContent] = useState<PlanContent>({ objectives: '', equipment: '', activities: defaultActivities.map((activity) => ({ ...activity })), assessment: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoadingLessonContent, setIsLoadingLessonContent] = useState(false)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const availableGrades = [...new Map(
    lessons
      .map((lesson) => lesson.chapters?.grades)
      .filter((grade): grade is NonNullable<typeof grade> => Boolean(grade))
      .map((grade) => [grade.grade_number, grade]),
  ).values()].sort((first, second) => first.grade_number - second.grade_number)
  const filteredLessons = selectedGrade === 'all'
    ? lessons
    : lessons.filter((lesson) => String(lesson.chapters?.grades.grade_number) === selectedGrade)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const [planResult, lessonResult, classResult] = await Promise.all([
      listLessonPlans(session.user.id),
      listPublishedLessons(),
      listClassProfiles(session.user.id),
    ])
    setPlans(planResult.data)
    setLessons(lessonResult.data)
    setClasses(classResult.classes)
    setError(planResult.error ?? lessonResult.error ?? classResult.error ?? '')
    setIsLoading(false)
  }, [session.user.id])

  useEffect(() => { void loadData() }, [loadData])

  useEffect(() => {
    if (!lessonId) {
      setLessonBlocks([])
      return
    }
    void getPublishedLessonDetail(lessonId).then((result) => {
      if (result.data) setLessonBlocks(result.data.blocks)
    })
  }, [lessonId])

  function openPlan(plan: LessonPlan) {
    setSelectedPlanId(plan.id)
    setTitle(plan.title)
    setLessonId(plan.lesson_id ?? '')
    setClassProfileId(plan.class_id ?? '')
    setPlanType(plan.plan_type)
    setContent(plan.plan_content)
    setIsEditing(false)
    setMessage('')
  }

  function resetEditor() {
    setSelectedPlanId('')
    setIsEditing(true)
    setTitle('')
    setLessonId('')
    setSelectedGrade('all')
    setClassProfileId('')
    setPlanType('STANDARD')
    setContent({ objectives: '', equipment: '', activities: defaultActivities.map((activity) => ({ ...activity })), assessment: '' })
    setMessage('')
  }

  function handleGradeChange(nextGrade: string) {
    setSelectedGrade(nextGrade)
    setLessonId('')
    setContent({ objectives: '', equipment: '', activities: defaultActivities.map((activity) => ({ ...activity })), assessment: '' })
    setMessage('')
  }

  async function handleLessonChange(nextLessonId: string) {
    setLessonId(nextLessonId)
    if (!nextLessonId) return
    setIsLoadingLessonContent(true)
    setError('')
    const result = await getPublishedLessonDetail(nextLessonId)
    setIsLoadingLessonContent(false)
    if (result.error || !result.data) {
      setError(result.error ?? 'Không thể tải nội dung bài giảng.')
      return
    }
    const selectedClass = classes.find((item) => item.id === classProfileId)
    const nextContent = createLessonDrivenContent(result.data.lesson, result.data.blocks, selectedClass)
    setLessonBlocks(result.data.blocks)
    setContent((current) => ({
      ...nextContent,
      objectives: current.objectives || nextContent.objectives,
      equipment: current.equipment || nextContent.equipment,
    }))
    setMessage(`Đã tạo gợi ý KHBD từ ${result.data.blocks.length} block và hồ sơ lớp.`)
  }

  async function regenerateActivities() {
    if (!lessonId) return
    const result = await getPublishedLessonDetail(lessonId)
    if (result.error || !result.data) {
      setError(result.error ?? 'Không thể tải nội dung bài giảng.')
      return
    }
    const lessonData = result.data
    const selectedClass = classes.find((item) => item.id === classProfileId)
    setContent((current) => ({ ...current, ...createLessonDrivenContent(lessonData.lesson, lessonData.blocks, selectedClass) }))
    setMessage('Đã cập nhật gợi ý hoạt động theo bài giảng và hồ sơ lớp.')
  }

  function handleClassChange(nextClassId: string) {
    setClassProfileId(nextClassId)
    if (!lessonId) return
    const selectedLesson = lessons.find((item) => item.id === lessonId)
    if (!selectedLesson) return
    const selectedClass = classes.find((item) => item.id === nextClassId)
    setContent((current) => ({
      ...createLessonDrivenContent(selectedLesson, lessonBlocks, selectedClass),
      objectives: current.objectives,
    }))
    setMessage('Đã cập nhật gợi ý hoạt động theo hồ sơ lớp.')
  }

  async function generateWithAi() {
    if (!lessonId) {
      setError('Hãy chọn bài học trước khi dùng AI.')
      return
    }
    const lesson = lessons.find((item) => item.id === lessonId)
    if (!lesson) {
      setError('Không tìm thấy dữ liệu bài học đã chọn.')
      return
    }
    setIsGeneratingAi(true)
    setError('')
    setMessage('')
    const result = await generateAiLessonPlan({
      lesson,
      blocks: lessonBlocks,
      classProfile: classes.find((item) => item.id === classProfileId) ?? null,
      planType,
    })
    setIsGeneratingAi(false)
    if (result.error || !result.content) {
      setError(result.error ?? 'Không thể tạo gợi ý bằng AI.')
      return
    }
    setContent(result.content)
    setMessage('AI đã tạo gợi ý KHBD. Hãy kiểm tra và chỉnh sửa trước khi lưu.')
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!lessonId || !title.trim()) return
    setIsSaving(true); setError(''); setMessage('')
    const selectedClass = classes.find((item) => item.id === classProfileId)
    const equipmentText = selectedClass && selectedClass.equipment.length > 0
      ? selectedClass.equipment.map((item) => `- ${equipmentLabels[item] ?? item}`).join('\n')
      : content.equipment
    const result = await createLessonPlan({
      teacherId: session.user.id,
      title,
      lessonId,
      classProfileId,
      planType,
      content: { ...content, equipment: equipmentText },
      classSnapshot: selectedClass ? { ...selectedClass } : {},
    })
    setIsSaving(false)
    if (result.error || !result.id) { setError(result.error ?? 'Không thể tạo KHBD.'); return }
    await loadData()
    setSelectedPlanId(result.id)
    setIsEditing(false)
    setMessage('Đã tạo KHBD.')
  }

  async function handleSave() {
    if (!selectedPlanId) return
    setIsSaving(true); setError(''); setMessage('')
    const result = await updateLessonPlan(selectedPlanId, session.user.id, title, content)
    setIsSaving(false)
    if (result) setError(result)
    else { setMessage('Đã lưu KHBD.'); await loadData() }
  }

  async function handleCopy() {
    if (!selectedPlanId) return
    const plan: LessonPlan = {
      id: selectedPlanId,
      title,
      lesson_id: lessonId,
      class_id: classProfileId,
      plan_type: planType,
      plan_content: content,
      worksheet_content: {},
      class_snapshot: {},
      created_at: '',
      updated_at: '',
    }
    try {
      await navigator.clipboard.writeText(getPlanText(
        plan,
        lessons.find((lesson) => lesson.id === lessonId) ?? null,
        classes.find((item) => item.id === classProfileId) ?? null,
        lessonBlocks,
      ))
      setError('')
      setMessage('Đã sao chép nội dung KHBD.')
    } catch {
      setError('Không thể sao chép KHBD. Hãy cho phép quyền truy cập clipboard của trình duyệt.')
    }
  }

  async function handleDelete() {
    if (!selectedPlanId || !window.confirm('Xóa KHBD này?')) return
    const result = await deleteLessonPlan(selectedPlanId, session.user.id)
    if (result) setError(result)
    else { resetEditor(); await loadData() }
  }

  return <section className="page-section lesson-plans-page">
    <div className="page-heading"><div><p className="eyebrow">Kho cá nhân</p><h1>Kế hoạch bài dạy</h1><p className="hero-description">Soạn KHBD theo cấu trúc Công văn 5512 và lưu lại để sử dụng.</p></div><button className="primary-button" type="button" onClick={resetEditor}><Plus size={16} /> Tạo KHBD mới</button></div>
    {error && <p className="error-message">{error}</p>}{message && <p className="success-message">{message}</p>}
    <div className="lesson-plan-layout">
      <aside className="lesson-plan-list"><div className="section-heading"><h2>KHBD của tôi</h2><span>{plans.length}</span></div>{isLoading ? <p className="empty-message">Đang tải...</p> : plans.length === 0 ? <p className="empty-message">Chưa có KHBD nào.</p> : plans.map((plan) => <button className={`plan-list-item ${selectedPlanId === plan.id ? 'is-selected' : ''}`} key={plan.id} type="button" onClick={() => openPlan(plan)}><FileText size={17} /><span><strong>{plan.title}</strong><small>{plan.plan_type === 'STEM' ? 'STEM' : 'CV 5512'}</small></span></button>)}</aside>
      <div className="lesson-plan-editor">
        {selectedPlanId && !isEditing ? <PlanPreview
          plan={{
            id: selectedPlanId,
            title,
            lesson_id: lessonId,
            class_id: classProfileId,
            plan_type: planType,
            plan_content: content,
            worksheet_content: {},
            class_snapshot: {},
            created_at: '',
            updated_at: '',
          }}
          lesson={lessons.find((lesson) => lesson.id === lessonId) ?? null}
          classProfile={classes.find((item) => item.id === classProfileId) ?? null}
          blocks={lessonBlocks}
          onEdit={() => setIsEditing(true)}
          onCopy={() => void handleCopy()}
        /> : null}
        {(!selectedPlanId || isEditing) && (<>
        <div className="ai-plan-banner"><div><strong><Bot size={18} /> Trợ lý AI tạo KHBD</strong><span>Chọn bài học để AI sắp xếp hoạt động theo nội dung bài giảng và hồ sơ lớp.</span></div><button className="primary-button ai-suggestion-button" type="button" onClick={() => void generateWithAi()} disabled={!lessonId || isLoadingLessonContent || isGeneratingAi}><Bot size={16} />{isGeneratingAi ? 'AI đang soạn...' : 'Gợi ý KHBD bằng AI'}</button></div>
        {!selectedPlanId ? <form onSubmit={(event) => void handleCreate(event)}><div className="editor-form-grid"><label>Tên KHBD *<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Khối lượng riêng" /></label><label>Loại KHBD<select value={planType} onChange={(event) => setPlanType(event.target.value as LessonPlanType)}><option value="STANDARD">Công văn 5512</option><option value="STEM">STEM</option></select></label><label>Khối lớp<select value={selectedGrade} onChange={(event) => handleGradeChange(event.target.value)}><option value="all">-- Tất cả khối --</option>{availableGrades.map((grade) => <option key={grade.grade_number} value={grade.grade_number}>Lớp {grade.grade_number}</option>)}</select></label><label>Bài học *<select required value={lessonId} onChange={(event) => void handleLessonChange(event.target.value)}><option value="">-- Chọn bài học --</option>{filteredLessons.map((lesson) => <option key={lesson.id} value={lesson.id}>Lớp {lesson.chapters?.grades.grade_number} · {lesson.title}</option>)}</select></label><label>Hồ sơ lớp<select value={classProfileId} onChange={(event) => handleClassChange(event.target.value)}><option value="">Không gắn lớp cụ thể</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>{lessonId && <div className="lesson-source-note">{isLoadingLessonContent ? 'Đang đọc học liệu bài giảng...' : `Đã đọc ${lessonBlocks.length} block và hồ sơ lớp để tạo gợi ý theo Công văn 5512.`}<div className="lesson-source-actions"><button className="text-button" type="button" onClick={() => void regenerateActivities()} disabled={isLoadingLessonContent || isGeneratingAi}>Tạo lại nội bộ</button><button className="secondary-button" type="button" onClick={() => void generateWithAi()} disabled={isLoadingLessonContent || isGeneratingAi}><Bot size={15} />{isGeneratingAi ? 'AI đang soạn...' : 'Gợi ý bằng AI'}</button></div></div>}{sections.map((section) => <PlanTextField key={section.key} section={section} content={content} setContent={setContent} />)}<ActivitiesEditor activities={content.activities} blocks={lessonBlocks} onChange={(activities) => setContent((current) => ({ ...current, activities }))} /><button className="primary-button" disabled={isSaving || isLoadingLessonContent || isGeneratingAi} type="submit"><Save size={16} />{isSaving ? 'Đang tạo...' : 'Lưu KHBD'}</button></form> : <><div className="editor-toolbar"><input value={title} onChange={(event) => setTitle(event.target.value)} /><div><button className="secondary-button" type="button" onClick={() => void handleSave()} disabled={isSaving}><Save size={16} /> Lưu</button><button className="delete-button" type="button" onClick={() => void handleDelete()} aria-label="Xóa KHBD"><Trash2 size={16} /></button></div></div>{sections.map((section) => <PlanTextField key={section.key} section={section} content={content} setContent={setContent} />)}<ActivitiesEditor activities={content.activities} blocks={lessonBlocks} onChange={(activities) => setContent((current) => ({ ...current, activities }))} /></>}</>)}
      </div>
    </div>
  </section>
}

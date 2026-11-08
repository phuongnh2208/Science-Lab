import { useCallback, useEffect, useRef, useState } from 'react'
import { renderAsync } from 'docx-preview'
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

const sections: Array<{ key: 'objectives' | 'equipment' | 'assessment'; label: string; placeholder: string }> = [
  { key: 'objectives', label: 'I. Mục tiêu', placeholder: '1. Kiến thức\n- ...\n2. Phát triển năng lực\n- Năng lực chung: ...\n- Năng lực vật lí / KHTN: ...\n3. Phát triển phẩm chất\n- Chăm chỉ, trung thực, trách nhiệm...' },
  { key: 'equipment', label: 'II. Thiết bị dạy học và học liệu', placeholder: '1. Đối với giáo viên:\n- SGK, SGV, Giáo án...\n2. Đối với học sinh:\n- SGK, dụng cụ học tập...' },
  { key: 'assessment', label: 'IV. Đánh giá (Tùy chọn)', placeholder: 'Nêu cách đánh giá sản phẩm, quá trình và mức độ hoàn thành...' },
]

const defaultActivities: LessonPlanActivity[] = [
  { id: crypto.randomUUID(), title: 'A. HOẠT ĐỘNG KHỞI ĐỘNG', objective: '', content: '', product: '', organization: '', expectedProduct: '', blockIds: [] },
  { id: crypto.randomUUID(), title: 'B. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC - Hoạt động 1', objective: '', content: '', product: '', organization: '', expectedProduct: '', blockIds: [] },
  { id: crypto.randomUUID(), title: 'C. HOẠT ĐỘNG LUYỆN TẬP', objective: '', content: '', product: '', organization: '', expectedProduct: '', blockIds: [] },
  { id: crypto.randomUUID(), title: 'D. HOẠT ĐỘNG VẬN DỤNG', objective: '', content: '', product: '', organization: '', expectedProduct: '', blockIds: [] },
]

const equipmentLabels: Record<string, string> = {
  projector: 'Máy chiếu / Tivi thông minh',
  internet: 'Mạng Internet / Wifi lớp học',
  'teacher-kit': 'Bộ thí nghiệm biểu diễn của giáo viên',
  'group-kit': 'Bộ thí nghiệm thực hành nhóm học sinh',
  sensors: 'Thiết bị cảm biến / Smartphone',
  worksheet: 'Bảng phụ / Phiếu học tập nhóm',
}

function formatEquipmentSection(rawEquipment: string, blocks: ContentBlock[], classProfile?: ClassProfile | null): string {
  const trimmed = rawEquipment.trim()
  // If user or AI already formatted with "1. Đối với giáo viên", just replace any raw equipment keys if present
  if (/Đối với giáo viên/i.test(trimmed)) {
    let result = trimmed
    for (const [key, label] of Object.entries(equipmentLabels)) {
      result = result.replace(new RegExp(`\\b${key}\\b`, 'g'), label)
    }
    return result
  }

  const teacherItems: string[] = ['SGK, SGV, Giáo án.']
  const experimentBlocks = blocks.filter((b) => b.type === 'EXPERIMENT')
  const videoImageBlocks = blocks.filter((b) => b.type === 'YOUTUBE' || b.type === 'IMAGE' || b.type === 'PHET')
  const worksheetBlocks = blocks.filter((b) => b.type === 'WORKSHEET')

  if (experimentBlocks.length > 0) {
    teacherItems.push(`Các dụng cụ thí nghiệm cần tiến hành trong bài (${experimentBlocks.map((b) => b.title || 'Thí nghiệm').join(', ')}).`)
  }
  if (videoImageBlocks.length > 0) {
    teacherItems.push(`Video / hình ảnh / mô phỏng: ${videoImageBlocks.map((b) => b.title || b.type).join(', ')}.`)
  }
  if (worksheetBlocks.length > 0) {
    teacherItems.push(`Phiếu học tập: ${worksheetBlocks.map((b) => b.title || 'Phiếu học tập').join(', ')}.`)
  }

  const classEquip = classProfile?.equipment ?? []
  for (const key of classEquip) {
    teacherItems.push(equipmentLabels[key] ?? key)
  }

  // Also parse any custom lines in rawEquipment that aren't already covered
  if (trimmed) {
    const rawLines = trimmed
      .split(/[\n,]/)
      .map((s) => s.replace(/^- /, '').trim())
      .filter(Boolean)
    for (const item of rawLines) {
      const mapped = equipmentLabels[item] ?? item
      if (!teacherItems.some((existing) => existing.toLowerCase().includes(mapped.toLowerCase()))) {
        teacherItems.push(mapped)
      }
    }
  } else if (!classEquip.includes('projector')) {
    teacherItems.push('Máy chiếu (nếu có)')
  }

  return [
    '1. Đối với giáo viên:',
    ...teacherItems.map((item) => `- ${item}`),
    '2. Đối với học sinh: SGK, tranh ảnh, tư liệu sưu tầm liên quan đến bài học và dụng cụ học tập (nếu cần) theo yêu cầu của GV.',
  ].join('\n')
}

function formatObjectivesSection(rawObjectives: string, lessonTitle?: string, subjectName?: string): string {
  const trimmed = rawObjectives.trim()
  if (/1\.\s*Kiến thức/i.test(trimmed) || /Phát triển năng lực/i.test(trimmed)) {
    return trimmed
  }
  const knowledgeLines = trimmed
    ? trimmed.split('\n').map((l) => l.replace(/^- /, '').trim()).filter(Boolean).map((l) => `- ${l}`).join('\n')
    : `- Nêu và trình bày được kiến thức trọng tâm của bài ${lessonTitle || 'học'}.`
  const isPhysics = (subjectName ?? '').toLowerCase().includes('vật lí')
  const specificCompetencyLabel = isPhysics ? 'Năng lực vật lí' : 'Năng lực khoa học tự nhiên'

  return [
    '1. Kiến thức',
    knowledgeLines,
    '2. Phát triển năng lực',
    '- Năng lực chung:',
    '  + Năng lực tự học: biết lựa chọn các nguồn thông tin trong tài liệu, quan sát thí nghiệm/mô phỏng.',
    '  + Năng lực giải quyết vấn đề: Xác định được và biết tìm hiểu các thông tin liên quan đến vấn đề, đề xuất giải pháp giải quyết vấn đề.',
    `- ${specificCompetencyLabel}:`,
    '  + Vận dụng được kiến thức để làm bài tập và giải quyết một số vấn đề trong thực tế.',
    '3. Phát triển phẩm chất',
    '- Chăm chỉ, trung thực, trách nhiệm trong học tập và thực hành.',
  ].join('\n')
}

function isKnowledgeFormationActivity(title: string, index: number, total: number): boolean {
  const upper = title.toUpperCase()
  if (upper.includes('KHỞI ĐỘNG') || upper.includes('MỞ ĐẦU') || upper.startsWith('A.')) return false
  if (upper.includes('LUYỆN TẬP') || upper.startsWith('C.')) return false
  if (upper.includes('VẬN DỤNG') || upper.startsWith('D.')) return false
  if (upper.includes('HÌNH THÀNH KIẾN THỨC') || upper.startsWith('B.') || /^HOẠT ĐỘNG\s+\d/i.test(title.trim())) {
    // When default 4 activities exist: index 1 is knowledge formation
    if (total === 4 && (index === 0 || index === 2 || index === 3)) return false
    return true
  }
  return index > 0 && index < total - 2
}

function formatStepOrganization(organization: string, content: string, product: string, linkedBlocks: ContentBlock[]): string {
  const trimmed = organization.trim()
  if (/Bước\s*1/i.test(trimmed)) return trimmed

  const blockNotes = linkedBlocks.map((block) => {
    if (block.type === 'YOUTUBE') return `- GV chiếu video "${block.title || 'thí nghiệm'}": ${block.content}`
    if (block.type === 'PHET') return `- GV hướng dẫn HS tương tác mô phỏng PhET "${block.title || 'mô phỏng'}": ${block.content}`
    if (block.type === 'IMAGE') return `- GV chiếu hình ảnh "${block.title || 'minh họa'}" và đặt câu hỏi định hướng.`
    if (block.type === 'WORKSHEET') return `- GV phát phiếu học tập "${block.title || 'Phiếu học tập'}" và yêu cầu HS hoàn thành.`
    if (block.type === 'EXPERIMENT') return `- GV hướng dẫn các nhóm tiến hành thí nghiệm "${block.title || 'thí nghiệm'}": ${block.description || block.content}`
    return `- GV yêu cầu HS tìm hiểu nội dung "${block.title || 'bài học'}".`
  })

  return [
    'Bước 1: GV chuyển giao nhiệm vụ học tập',
    content ? `- ${content.replace(/\n+/g, '\n- ')}` : '- GV nêu vấn đề và giao nhiệm vụ học tập cho HS.',
    ...blockNotes,
    'Bước 2: HS thực hiện nhiệm vụ học tập',
    `- ${trimmed || 'HS quan sát, đọc thông tin SGK, thảo luận nhóm và thực hiện nhiệm vụ.'}`,
    'Bước 3: Báo cáo kết quả hoạt động và thảo luận',
    '- GV mời đại diện HS / nhóm trình bày kết quả, các HS khác nhận xét, bổ sung.',
    'Bước 4: Đánh giá kết quả, thực hiện nhiệm vụ học tập',
    `- GV nhận xét, đánh giá kết quả thực hiện nhiệm vụ và chốt kiến thức${product ? `: ${product}` : '.'}`,
  ].join('\n')
}

async function fetchWorksheetHtml(block: ContentBlock): Promise<string> {
  const source = block.content.trim()
  if (!source) return '<p><em>(Phiếu học tập chưa có file đính kèm.)</em></p>'
  try {
    const isExternal = /^https?:\/\//i.test(source)
    let url = source
    if (!isExternal) {
      const signed = await createWorksheetSignedUrl(source)
      if (!signed.url) return `<p><em>(${signed.error ?? 'Không thể tải phiếu học tập.'})</em></p>`
      url = signed.url
    }
    if (!/\.docx(?:$|[?#])/i.test(source)) {
      return `<p>Xem phiếu học tập tại: <a href="${url}">${url}</a></p>`
    }
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const arrayBuffer = await response.arrayBuffer()
    const mammoth = await import('mammoth')
    const result = await mammoth.convertToHtml({ arrayBuffer })
    return result.value
      .replace(/<table>/g, '<table style="width:100%;border-collapse:collapse;border:1px solid #000;margin:6pt 0;">')
      .replace(/<td>/g, '<td style="border:1px solid #000;padding:4pt 6pt;vertical-align:top;">')
      .replace(/<th>/g, '<th style="border:1px solid #000;padding:4pt 6pt;">')
  } catch (error) {
    return `<p><em>(Không thể chèn nội dung phiếu học tập: ${error instanceof Error ? error.message : 'lỗi không xác định'}.)</em></p>`
  }
}

async function downloadWord(plan: LessonPlan, lesson: Lesson | null, classProfile: ClassProfile | null, blocks: ContentBlock[]) {
  const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const nl2br = (value: string) =>
    value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        if (/^(?:\d+\.|Bước\s*\d+\s*:|Nhiệm vụ\s*\d+[.:]|Kết luận\s*:|Phiếu đáp án)/i.test(line)) {
          const match = line.match(/^((?:Bước\s*\d+\s*:|Nhiệm vụ\s*\d+[.:]|Kết luận\s*:))(.*)$/i)
          if (match) {
            return `<p style="margin:3pt 0;"><strong>${escapeHtml(match[1])}</strong>${escapeHtml(match[2])}</p>`
          }
          return `<p style="margin:4pt 0 2pt;font-weight:bold;">${escapeHtml(line)}</p>`
        }
        return `<p style="margin:3pt 0;">${escapeHtml(line)}</p>`
      })
      .join('')

  const lessonHeading = /^bài\s+\d+/i.test(plan.title.trim())
    ? plan.title.trim().toUpperCase()
    : `BÀI HỌC: ${plan.title.trim().toUpperCase()}`

  const formattedObjectives = formatObjectivesSection(
    plan.plan_content.objectives,
    plan.title,
    lesson?.chapters?.subjects.name,
  )
  const formattedEquipment = formatEquipmentSection(plan.plan_content.equipment, blocks, classProfile)

  let hasRenderedSectionBHeader = false
  let knowledgeSubIndex = 1

  const activitiesHtml = plan.plan_content.activities
    .map((activity, index, all) => {
      const linkedBlocks = activity.blockIds
        .map((id) => blocks.find((block) => block.id === id))
        .filter((block): block is ContentBlock => Boolean(block))

      const isKnowledge = isKnowledgeFormationActivity(activity.title, index, all.length)
      const stepOrg = formatStepOrganization(activity.organization, activity.content, activity.product, linkedBlocks)

      // Determine standard section heading (A, B, C, D)
      let sectionHeadingHtml = ''
      const rawTitle = activity.title.trim()

      if (index === 0 && !/^[A-D]\./i.test(rawTitle)) {
        sectionHeadingHtml = `<p style="font-weight:bold;margin:8pt 0 4pt;">A. HOẠT ĐỘNG KHỞI ĐỘNG</p>`
      } else if (isKnowledge) {
        if (!hasRenderedSectionBHeader) {
          hasRenderedSectionBHeader = true
          sectionHeadingHtml += `<p style="font-weight:bold;margin:8pt 0 4pt;">B. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC</p>`
        }
        const cleanedSubTitle = rawTitle
          .replace(/^B\.\s*HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC\s*[-–—:\n]?\s*/i, '')
          .replace(/^Hoạt động\s+\d+[.:–-]?\s*/i, '')
          .trim()
        const subTitle = cleanedSubTitle || `Tìm hiểu nội dung ${knowledgeSubIndex}`
        sectionHeadingHtml += `<p style="font-weight:bold;margin:6pt 0 4pt;">Hoạt động ${knowledgeSubIndex}. ${escapeHtml(subTitle)}</p>`
        knowledgeSubIndex++
      } else if (!isKnowledge && index === all.length - 2 && !/^[A-D]\./i.test(rawTitle)) {
        sectionHeadingHtml = `<p style="font-weight:bold;margin:8pt 0 4pt;">C. HOẠT ĐỘNG LUYỆN TẬP</p>`
      } else if (!isKnowledge && index === all.length - 1 && !/^[A-D]\./i.test(rawTitle)) {
        sectionHeadingHtml = `<p style="font-weight:bold;margin:8pt 0 4pt;">D. HOẠT ĐỘNG VẬN DỤNG</p>`
      } else {
        sectionHeadingHtml = `<p style="font-weight:bold;margin:8pt 0 4pt;">${escapeHtml(rawTitle)}</p>`
      }

      const metaHtml = [
        `<p style="margin:3pt 0;"><strong>a. Mục tiêu:</strong> ${escapeHtml(activity.objective || 'Hoàn thành mục tiêu hoạt động.')}</p>`,
        `<p style="margin:3pt 0;"><strong>b. Nội dung:</strong> ${escapeHtml(activity.content || 'GV tổ chức cho HS tìm hiểu nội dung và thực hiện nhiệm vụ.')}</p>`,
        `<p style="margin:3pt 0;"><strong>c. Sản phẩm học tập:</strong> ${escapeHtml(activity.product || 'Câu trả lời và kết quả thảo luận của HS.')}</p>`,
      ].join('')

      if (isKnowledge) {
        const expectedProductText = (activity.expectedProduct || '').trim() || [
          activity.product ? `Kết quả trọng tâm:\n${activity.product}` : '',
          ...linkedBlocks
            .filter((b) => b.type !== 'WORKSHEET')
            .map((b) => `${b.title}: ${b.description || b.content}`),
        ].filter(Boolean).join('\n\n') || 'Ghi chép kiến thức trọng tâm và kết luận vào vở.'

        return `
          ${sectionHeadingHtml}
          ${metaHtml}
          <p style="margin:3pt 0;"><strong>d. Tổ chức hoạt động:</strong></p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #000;margin:6pt 0;">
            <thead>
              <tr>
                <th style="width:55%;border:1px solid #000;padding:6pt 8pt;text-align:center;font-weight:bold;background:#f2f2f2;">HOẠT ĐỘNG CỦA GV - HS</th>
                <th style="width:45%;border:1px solid #000;padding:6pt 8pt;text-align:center;font-weight:bold;background:#f2f2f2;">DỰ KIẾN SẢN PHẨM</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width:55%;border:1px solid #000;padding:6pt 8pt;vertical-align:top;">${nl2br(stepOrg)}</td>
                <td style="width:45%;border:1px solid #000;padding:6pt 8pt;vertical-align:top;">${nl2br(expectedProductText)}</td>
              </tr>
            </tbody>
          </table>
        `
      }

      return `
        ${sectionHeadingHtml}
        ${metaHtml}
        <p style="margin:3pt 0;"><strong>d. Tổ chức thực hiện:</strong></p>
        <div style="margin-left:6pt;">${nl2br(stepOrg)}</div>
      `
    })
    .join('')

  const assessmentHtml = plan.plan_content.assessment?.trim()
    ? `<h2>IV. ĐÁNH GIÁ</h2>${nl2br(plan.plan_content.assessment)}`
    : ''

  const worksheetBlocks = blocks.filter((block) => block.type === 'WORKSHEET')
  const worksheetBodies = await Promise.all(worksheetBlocks.map(fetchWorksheetHtml))
  const worksheetsHtml = worksheetBlocks.length > 0
    ? `<br style="page-break-before:always" clear="all">
  <h2>${assessmentHtml ? 'V' : 'IV'}. PHỤ LỤC: PHIẾU HỌC TẬP</h2>
  ${worksheetBlocks.map((block, i) => `
    <p style="text-align:center;font-weight:bold;margin:10pt 0 6pt;">${escapeHtml((block.title || `Phiếu học tập số ${i + 1}`).toUpperCase())}</p>
    ${worksheetBodies[i]}
    ${i < worksheetBlocks.length - 1 ? '<br style="page-break-before:always" clear="all">' : ''}
  `).join('')}`
    : ''

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
  @page {
    size: A4;
    margin: 2cm 2cm 2cm 2.5cm;
  }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 13pt;
    line-height: 1.35;
    color: #000;
  }
  h1 {
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    margin: 0 0 10pt 0;
    text-transform: uppercase;
  }
  h2 {
    font-size: 13pt;
    font-weight: bold;
    margin: 10pt 0 4pt 0;
    text-transform: uppercase;
  }
  p {
    margin: 3pt 0;
    text-align: justify;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    font-family: "Times New Roman", Times, serif;
    font-size: 13pt;
  }
</style>
</head>
<body>
  <h1>${escapeHtml(lessonHeading)}</h1>
  <h2>I. MỤC TIÊU</h2>
  ${nl2br(formattedObjectives)}
  <h2>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h2>
  ${nl2br(formattedEquipment)}
  <h2>III. TIẾN TRÌNH DẠY HỌC</h2>
  ${activitiesHtml}
  ${assessmentHtml}
  ${worksheetsHtml}
</body>
</html>`

  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${plan.title.replace(/[^\w\u00C0-\u1EF9-]+/g, '-').replace(/^-|-$/g, '') || 'ke-hoach-bai-day'}.doc`
  link.click()
  URL.revokeObjectURL(url)
}

function getPlanText(plan: LessonPlan, lesson: Lesson | null, classProfile: ClassProfile | null, blocks: ContentBlock[]) {
  const lessonHeading = /^bài\s+\d+/i.test(plan.title.trim())
    ? plan.title.trim().toUpperCase()
    : `BÀI HỌC: ${plan.title.trim().toUpperCase()}`
  const formattedObjectives = formatObjectivesSection(
    plan.plan_content.objectives,
    plan.title,
    lesson?.chapters?.subjects.name,
  )
  const formattedEquipment = formatEquipmentSection(plan.plan_content.equipment, blocks, classProfile)

  let hasRenderedSectionB = false
  let knowledgeSubIdx = 1

  const activities = plan.plan_content.activities.map((activity, index, all) => {
    const linkedBlocks = activity.blockIds
      .map((id) => blocks.find((block) => block.id === id))
      .filter((block): block is ContentBlock => Boolean(block))
    const isKnowledge = isKnowledgeFormationActivity(activity.title, index, all.length)
    const stepOrg = formatStepOrganization(activity.organization, activity.content, activity.product, linkedBlocks)

    const lines: string[] = []
    const rawTitle = activity.title.trim()
    if (index === 0 && !/^[A-D]\./i.test(rawTitle)) {
      lines.push('A. HOẠT ĐỘNG KHỞI ĐỘNG')
    } else if (isKnowledge) {
      if (!hasRenderedSectionB) {
        hasRenderedSectionB = true
        lines.push('B. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC')
      }
      const cleanedSub = rawTitle
        .replace(/^B\.\s*HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC\s*[-–—:\n]?\s*/i, '')
        .replace(/^Hoạt động\s+\d+[.:–-]?\s*/i, '')
        .trim()
      lines.push(`Hoạt động ${knowledgeSubIdx}. ${cleanedSub || `Tìm hiểu nội dung ${knowledgeSubIdx}`}`)
      knowledgeSubIdx++
    } else if (!isKnowledge && index === all.length - 2 && !/^[A-D]\./i.test(rawTitle)) {
      lines.push('C. HOẠT ĐỘNG LUYỆN TẬP')
    } else if (!isKnowledge && index === all.length - 1 && !/^[A-D]\./i.test(rawTitle)) {
      lines.push('D. HOẠT ĐỘNG VẬN DỤNG')
    } else {
      lines.push(rawTitle)
    }

    lines.push(`a. Mục tiêu: ${activity.objective}`)
    lines.push(`b. Nội dung: ${activity.content}`)
    lines.push(`c. Sản phẩm học tập: ${activity.product}`)

    if (isKnowledge) {
      lines.push('d. Tổ chức hoạt động:')
      lines.push('[HOẠT ĐỘNG CỦA GV - HS]')
      lines.push(stepOrg)
      lines.push('[DỰ KIẾN SẢN PHẨM]')
      lines.push(activity.expectedProduct || activity.product)
    } else {
      lines.push('d. Tổ chức thực hiện:')
      lines.push(stepOrg)
    }
    return lines.join('\n')
  }).join('\n\n')

  return [
    lessonHeading,
    'I. MỤC TIÊU',
    formattedObjectives,
    'II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU',
    formattedEquipment,
    'III. TIẾN TRÌNH DẠY HỌC',
    activities,
  ].filter(Boolean).join('\n\n')
}

function createLessonDrivenContent(lesson: Lesson, blocks: ContentBlock[], classProfile?: ClassProfile): PlanContent {
  const blockLabel = (block: ContentBlock) => block.title || ({
    TEXT: 'Nội dung kiến thức',
    YOUTUBE: 'Video thí nghiệm / bài giảng',
    PHET: 'Mô phỏng tương tác PhET',
    WORKSHEET: 'Phiếu học tập',
    IMAGE: 'Hình ảnh minh họa',
    EXPERIMENT: 'Thí nghiệm thực hành',
  }[block.type] ?? 'Học liệu')

  const rawObjectives = (lesson.learning_objectives ?? []).join('\n')
  const objectives = formatObjectivesSection(rawObjectives, lesson.title, lesson.chapters?.subjects.name)
  const equipment = formatEquipmentSection('', blocks, classProfile)

  const hasGroupKit = classProfile?.equipment.includes('group-kit') ?? false
  const hasTeacherKit = classProfile?.equipment.includes('teacher-kit') ?? false

  const introBlocks = blocks.filter((b) => b.type === 'YOUTUBE' || b.type === 'IMAGE')
  const knowledgeBlocks = blocks.filter((b) => b.type === 'TEXT' || b.type === 'PHET' || b.type === 'EXPERIMENT')
  const practiceBlocks = blocks.filter((b) => b.type === 'WORKSHEET')

  const introActivity: LessonPlanActivity = {
    id: crypto.randomUUID(),
    title: 'A. HOẠT ĐỘNG KHỞI ĐỘNG',
    objective: `Tạo tình huống có vấn đề và sự hứng thú cho HS trước khi tìm hiểu bài “${lesson.title}”.`,
    content: introBlocks.length > 0
      ? `GV trình bày vấn đề, cho HS quan sát ${introBlocks.map(blockLabel).join(', ')}.`
      : `GV nêu tình huống thực tế gắn với bài “${lesson.title}” và đặt câu hỏi mở đầu.`,
    product: 'Bước đầu HS nêu được dự đoán và câu trả lời cá nhân cho câu hỏi mở đầu.',
    organization: [
      'Bước 1: GV chuyển giao nhiệm vụ học tập',
      ...(introBlocks.length > 0
        ? introBlocks.map((b) => b.type === 'YOUTUBE'
          ? `- GV chiếu video “${blockLabel(b)}”: ${b.content}`
          : `- GV chiếu hình ảnh “${blockLabel(b)}” và đặt câu hỏi gợi mở.`)
        : [`- GV đặt câu hỏi tình huống mở đầu liên quan đến ${lesson.title}.`]),
      'Bước 2: HS thực hiện nhiệm vụ học tập',
      '- HS quan sát hiện tượng / hình ảnh và suy nghĩ tìm câu trả lời.',
      'Bước 3: Báo cáo kết quả hoạt động và thảo luận',
      '- GV mời 1 – 2 HS trình bày suy nghĩ của mình.',
      'Bước 4: Đánh giá kết quả, thực hiện nhiệm vụ học tập',
      `- GV tiếp nhận câu trả lời và dẫn dắt HS vào bài học: ${lesson.title}.`,
    ].join('\n'),
    expectedProduct: '',
    blockIds: introBlocks.map((b) => b.id),
  }

  const knowledgeActivities: LessonPlanActivity[] = (knowledgeBlocks.length > 0 ? knowledgeBlocks : [null]).map((block, idx) => {
    const subTitle = block ? blockLabel(block) : `Tìm hiểu kiến thức trọng tâm bài ${lesson.title}`
    const experimentGuide = hasGroupKit
      ? 'GV chia lớp thành các nhóm 4-6 HS thực hiện thí nghiệm, quan sát và thảo luận.'
      : hasTeacherKit
        ? 'GV tiến hành thí nghiệm biểu diễn cho HS quan sát và ghi nhận kết quả.'
        : 'GV hướng dẫn HS tìm hiểu thông tin SGK và phân tích dữ liệu / mô phỏng.'

    return {
      id: crypto.randomUUID(),
      title: `B. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC - Hoạt động ${idx + 1}. ${subTitle}`,
      objective: block
        ? `HS khai thác ${blockLabel(block)} để nắm được khái niệm, đặc điểm và kiến thức trọng tâm.`
        : `HS nắm được khái niệm, đặc điểm và công thức trọng tâm của bài “${lesson.title}”.`,
      content: block?.description || `GV tổ chức cho HS tìm hiểu nội dung “${subTitle}”, thảo luận và trả lời câu hỏi.`,
      product: `HS ghi vào vở kiến thức trọng tâm và kết luận về ${subTitle}.`,
      organization: [
        'Bước 1: GV chuyển giao nhiệm vụ học tập',
        `- GV yêu cầu HS tìm hiểu nội dung “${subTitle}”.`,
        `- ${experimentGuide}`,
        ...(block && block.content && block.type !== 'WORKSHEET' ? [`- Học liệu tham khảo: ${block.content}`] : []),
        'Bước 2: HS thực hiện nhiệm vụ học tập',
        '- HS đọc thông tin SGK, quan sát thí nghiệm / mô phỏng và thảo luận nhóm.',
        '- GV hướng dẫn, hỗ trợ HS trong quá trình thực hiện.',
        'Bước 3: Báo cáo kết quả hoạt động và thảo luận',
        '- GV mời đại diện 2-3 nhóm trình bày kết quả, các nhóm còn lại nhận xét, bổ sung.',
        'Bước 4: Đánh giá kết quả, thực hiện nhiệm vụ học tập',
        '- GV đánh giá, nhận xét, chốt kiến thức và chuyển sang nội dung tiếp theo.',
      ].join('\n'),
      expectedProduct: [
        `${idx + 1}. ${subTitle.toUpperCase()}`,
        block?.description ? `- ${block.description}` : `- Kiến thức trọng tâm và nhận xét rút ra từ hoạt động.`,
        'Kết luận:',
        ...(lesson.learning_objectives && lesson.learning_objectives.length > 0
          ? lesson.learning_objectives.map((obj) => `- ${obj}`)
          : [`- Nắm vững khái niệm và đặc điểm của ${lesson.title}.`]),
      ].join('\n'),
      blockIds: block ? [block.id] : [],
    }
  })

  const practiceActivity: LessonPlanActivity = {
    id: crypto.randomUUID(),
    title: 'C. HOẠT ĐỘNG LUYỆN TẬP',
    objective: 'Củng cố lại kiến thức đã học thông qua câu hỏi trắc nghiệm và phiếu bài tập.',
    content: practiceBlocks.length > 0
      ? `GV tổ chức cho HS hoàn thành ${practiceBlocks.map(blockLabel).join(', ')} và trả lời câu hỏi củng cố.`
      : 'GV trình chiếu hệ thống câu hỏi trắc nghiệm / bài tập luyện tập, HS suy nghĩ trả lời.',
    product: 'HS đưa ra được các đáp án đúng và hoàn thành phiếu học tập.',
    organization: [
      'Bước 1: GV chuyển giao nhiệm vụ học tập',
      ...(practiceBlocks.length > 0
        ? practiceBlocks.map((b) => `- GV phát và hướng dẫn HS hoàn thành “${blockLabel(b)}”${b.description ? ` (${b.description})` : ''}.`)
        : ['- GV trình chiếu lần lượt các câu hỏi trắc nghiệm và bài tập củng cố.']),
      'Bước 2: HS thực hiện nhiệm vụ học tập',
      '- HS tiếp nhận câu hỏi / phiếu học tập, vận dụng kiến thức đã học để hoàn thành.',
      'Bước 3: HS báo cáo kết quả hoạt động và thảo luận',
      '- HS lần lượt đưa ra đáp án, các HS khác nhận xét và đối chiếu.',
      'Bước 4: GV đánh giá kết quả, thực hiện nhiệm vụ học tập',
      '- GV nhận xét, chữa bài và chốt đáp án đúng.',
    ].join('\n'),
    expectedProduct: '',
    blockIds: practiceBlocks.map((b) => b.id),
  }

  const applicationActivity: LessonPlanActivity = {
    id: crypto.randomUUID(),
    title: 'D. HOẠT ĐỘNG VẬN DỤNG',
    objective: 'Vận dụng kiến thức đã học vào giải quyết những tình huống thực tế.',
    content: 'GV giao nhiệm vụ liên hệ thực tế hoặc bài tập vận dụng về nhà cho HS.',
    product: `HS vận dụng kiến thức bài “${lesson.title}” để giải thích hiện tượng thực tế.`,
    organization: [
      'Bước 1: GV chuyển giao nhiệm vụ học tập',
      '- GV yêu cầu 1 – 2 HS xác nhận lại câu trả lời ở phần mở đầu.',
      `- GV yêu cầu HS vận dụng kiến thức bài “${lesson.title}” vào một số tình huống thực tế đơn giản.`,
      'Bước 2: HS tiếp nhận nhiệm vụ, thực hiện tại lớp hoặc về nhà hoàn thành.',
      'Bước 3: HS báo cáo kết quả hoạt động vào tiết học sau.',
      'Bước 4: GV tổng kết lại bài học, nhận xét, kết thúc bài học.',
    ].join('\n'),
    expectedProduct: '',
    blockIds: [],
  }

  return {
    objectives,
    equipment,
    activities: [introActivity, ...knowledgeActivities, practiceActivity, applicationActivity],
    assessment: 'Đánh giá qua phiếu học tập, câu trả lời và sự tham gia của học sinh trong giờ học.',
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
      const linkedContent = linkedBlocks.map((block) => `${block.title || block.type}${block.description ? `: ${block.description}` : ''}${block.content && block.type !== 'WORKSHEET' ? `\n${block.content}` : ''}`).join('\n\n')
      return { ...activity, blockIds, content: linkedContent || activity.content }
    }))
  }

  function addActivity() {
    onChange([...activities, { id: crypto.randomUUID(), title: `B. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC - Hoạt động ${activities.length}`, objective: '', content: '', product: '', organization: '', expectedProduct: '', blockIds: [] }])
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
    <div className="plan-section-heading"><h2>III. Tiến trình dạy học</h2><p>Mỗi hoạt động gồm a. Mục tiêu, b. Nội dung, c. Sản phẩm học tập và d. Tổ chức thực hiện (Bảng 2 cột cho Hình thành kiến thức).</p></div>
    {activities.map((activity, index) => <fieldset className="activity-card" key={activity.id}>
      <legend><input className="activity-title-input" value={activity.title} onChange={(event) => updateActivity(index, 'title', event.target.value)} /><button type="button" onClick={() => moveActivity(index, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => moveActivity(index, 1)} disabled={index === activities.length - 1}>↓</button><button className="delete-button" type="button" onClick={() => removeActivity(index)} aria-label="Xóa hoạt động"><Trash2 size={15} /></button></legend>
      <label>a. Mục tiêu<textarea value={activity.objective} onChange={(event) => updateActivity(index, 'objective', event.target.value)} rows={3} placeholder="Học sinh đạt được gì sau hoạt động này?" /></label>
      <label>b. Nội dung<textarea value={activity.content} onChange={(event) => updateActivity(index, 'content', event.target.value)} rows={3} placeholder="GV tổ chức cho HS tìm hiểu nội dung, thực hiện thí nghiệm..." /></label>
      <label>c. Sản phẩm học tập<textarea value={activity.product} onChange={(event) => updateActivity(index, 'product', event.target.value)} rows={3} placeholder="Câu trả lời, bảng số liệu, báo cáo hoặc sản phẩm học tập..." /></label>
      <label>d. Tổ chức thực hiện (HOẠT ĐỘNG CỦA GV - HS)<textarea value={activity.organization} onChange={(event) => updateActivity(index, 'organization', event.target.value)} rows={6} placeholder="Bước 1: GV chuyển giao nhiệm vụ học tập&#10;Bước 2: HS thực hiện nhiệm vụ học tập&#10;Bước 3: Báo cáo kết quả hoạt động và thảo luận&#10;Bước 4: Đánh giá kết quả, thực hiện nhiệm vụ học tập" /></label>
      {isKnowledgeFormationActivity(activity.title, index, activities.length) && (
        <label>Dự kiến sản phẩm / Kiến thức ghi vở (Cột 2 bảng Hình thành kiến thức)<textarea value={activity.expectedProduct ?? ''} onChange={(event) => updateActivity(index, 'expectedProduct', event.target.value)} rows={5} placeholder="Phiếu đáp án, kết luận kiến thức trọng tâm, công thức HS ghi vào vở..." /></label>
      )}
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
  const formattedObjectives = formatObjectivesSection(plan.plan_content.objectives, plan.title, lesson?.chapters?.subjects.name)
  const formattedEquipment = formatEquipmentSection(plan.plan_content.equipment, blocks, classProfile)

  return <article className="plan-preview">
    <header className="plan-preview-header">
      <div>
        <p className="plan-preview-kicker">KẾ HOẠCH BÀI DẠY ({plan.plan_type === 'STEM' ? 'STEM' : 'CÔNG VĂN 5512'})</p>
        <h2>{/^bài\s+\d+/i.test(plan.title.trim()) ? plan.title : `BÀI HỌC: ${plan.title}`}</h2>
        <p>{lesson ? `Lớp: ${lesson.chapters?.grades.name ?? ''} · Môn: ${lesson.chapters?.subjects.name ?? ''}` : 'Thông tin bài học đang được cập nhật'}</p>
      </div>
      <div className="plan-preview-actions"><button className="secondary-button" type="button" onClick={onEdit}><Edit3 size={16} /> Chỉnh sửa</button><button className="secondary-button" type="button" onClick={onCopy}><Copy size={16} /> Sao chép</button><button className="primary-button" type="button" onClick={() => { void downloadWord(plan, lesson, classProfile, blocks) }}><FileText size={16} /> Xuất Word</button></div>
    </header>
    {classProfile && <section className="plan-context-box">
      <h3>THÔNG TIN HỒ SƠ LỚP VÀ ĐIỀU KIỆN THỰC TẾ</h3>
      <p><strong>Lớp:</strong> {classProfile.name}{classProfile.school_name ? ` · ${classProfile.school_name}` : ''}{classProfile.student_count ? ` · Sĩ số ${classProfile.student_count} học sinh` : ''}</p>
      {classProfile.equipment.length > 0 && <p><strong>Thiết bị:</strong> {classProfile.equipment.map((item) => equipmentLabels[item] ?? item).join(' · ')}</p>}
    </section>}
    <PlanPreviewSection title="I. MỤC TIÊU" value={formattedObjectives} />
    <PlanPreviewSection title="II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU" value={formattedEquipment} />
    <section className="plan-preview-section">
      <h3>III. TIẾN TRÌNH DẠY HỌC ({plan.plan_content.activities.length} HOẠT ĐỘNG)</h3>
      <div className="plan-preview-activities">{plan.plan_content.activities.map((activity, index, all) => {
        const linkedBlocks = activity.blockIds.map((blockId) => blocks.find((block) => block.id === blockId)).filter((block): block is ContentBlock => Boolean(block))
        const isKnowledge = isKnowledgeFormationActivity(activity.title, index, all.length)
        const stepOrg = formatStepOrganization(activity.organization, activity.content, activity.product, linkedBlocks)
        const expectedProductText = (activity.expectedProduct || '').trim() || [
          activity.product ? `Kết quả trọng tâm:\n${activity.product}` : '',
          ...linkedBlocks.filter((b) => b.type !== 'WORKSHEET').map((b) => `${b.title}: ${b.description || b.content}`),
        ].filter(Boolean).join('\n\n') || 'Ghi chép kiến thức trọng tâm và kết luận vào vở.'

        return <article className="plan-preview-activity" key={`${activity.title}-${index}`}>
          <h4>{activity.title}</h4>
          <PreviewField label="a. Mục tiêu" value={activity.objective} />
          <PreviewField label="b. Nội dung" value={activity.content} />
          <PreviewField label="c. Sản phẩm học tập" value={activity.product} />
          {isKnowledge ? (
            <div className="preview-field">
              <strong>d. Tổ chức hoạt động:</strong>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', marginTop: '8px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '55%', border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center' }}>HOẠT ĐỘNG CỦA GV - HS</th>
                    <th style={{ width: '45%', border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center' }}>DỰ KIẾN SẢN PHẨM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{stepOrg}</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{expectedProductText}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="preview-field">
              <strong>d. Tổ chức thực hiện:</strong>
              <p style={{ whiteSpace: 'pre-wrap', marginTop: '4px' }}>{stepOrg}</p>
            </div>
          )}
          {linkedBlocks.length > 0 && <div className="linked-blocks"><strong>Học liệu đính kèm trong hoạt động:</strong>{linkedBlocks.map((block) => <div className="linked-block" key={block.id}><b>{block.title || block.type}</b>{block.description && <span>{block.description}</span>}<PlanResourcePreview block={block} inlineDocx /></div>)}</div>}
        </article>
      })}</div>
    </section>
    {plan.plan_content.assessment && <PlanPreviewSection title="IV. ĐÁNH GIÁ" value={plan.plan_content.assessment} />}
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

function DocxInlinePreview({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!url || !containerRef.current) return
    let cancelled = false
    const container = containerRef.current
    setStatus('loading')
    void (async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const buffer = await response.arrayBuffer()
        if (cancelled) return
        container.innerHTML = ''
        await renderAsync(buffer, container, undefined, { inWrapper: true, ignoreWidth: false, breakPages: true })
        if (!cancelled) setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [url])

  return <div className="worksheet-preview">
    {status === 'loading' && <p className="preview-empty">Đang tải nội dung phiếu học tập...</p>}
    {status === 'error' && <p className="error-message">Không thể hiển thị nội dung DOCX. Vui lòng dùng liên kết tải bên dưới.</p>}
    <div ref={containerRef} className="docx-preview" style={{ maxHeight: 720, overflow: 'auto' }} />
  </div>
}

function PlanResourcePreview({ block, inlineDocx = false }: { block: ContentBlock; inlineDocx?: boolean }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const source = block.content.trim()
  const youtubeId = block.type === 'YOUTUBE' ? getYouTubeId(source) : null
  const isDocument = /\.(pdf|doc|docx)(?:$|[?#])/i.test(source) || source.includes('docs.google.com')

  useEffect(() => {
    if (block.type !== 'WORKSHEET' || !source) return
    void createWorksheetSignedUrl(source).then((result) => {
      if (result.error || !result.url) {
        setError(result.error ?? 'Không thể tạo liên kết học liệu.')
        return
      }
      setUrl(result.url)
    }).catch(() => setError('Không thể hiển thị học liệu.'))
  }, [block.type, source])

  if (!source) return <p className="preview-empty">Chưa có liên kết hoặc file đính kèm.</p>
  if (error) return <p className="error-message">{error}</p>
  if (youtubeId) return <div className="resource-preview"><div className="video-frame"><iframe src={`https://www.youtube.com/embed/${youtubeId}`} title={block.title || 'Video học liệu'} allowFullScreen /></div><ResourceLink href={source} label="Mở video trên YouTube" /></div>
  if (block.type === 'PHET') return <div className="resource-preview"><div className="phet-frame"><iframe src={source} title={block.title || 'Mô phỏng PhET'} allowFullScreen /></div><ResourceLink href={source} label="Mở mô phỏng PhET" /></div>
  if (block.type === 'WORKSHEET' && /\.pdf(?:$|[?#])/i.test(source)) return <div className="resource-preview"><iframe className="document-frame" src={url} title={block.title || 'Xem trước PDF'} /><ResourceLink href={url} label="Mở PDF" /></div>
  if (block.type === 'WORKSHEET' && /\.docx(?:$|[?#])/i.test(source)) {
    if (!inlineDocx) return <div className="resource-preview"><ResourceLink href={url} label="Mở hoặc tải DOCX" /></div>
    return <div className="resource-preview"><DocxInlinePreview url={url} />{url && <ResourceLink href={url} label="Tải DOCX" />}</div>
  }
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
    if (!lessons.some((item) => item.id === lessonId)) {
      setError('Không tìm thấy dữ liệu bài học đã chọn.')
      return
    }
    setIsGeneratingAi(true)
    setError('')
    setMessage('')
    const lessonContentResult = await getPublishedLessonDetail(lessonId)
    if (lessonContentResult.error || !lessonContentResult.data) {
      setIsGeneratingAi(false)
      setError(lessonContentResult.error ?? 'Không thể tải nội dung bài giảng đã chọn.')
      return
    }
    const selectedBlocks = lessonContentResult.data.blocks
    setLessonBlocks(selectedBlocks)
    const result = await generateAiLessonPlan({
      lesson: lessonContentResult.data.lesson,
      blocks: selectedBlocks,
      classProfile: classes.find((item) => item.id === classProfileId) ?? null,
      planType,
    })
    setIsGeneratingAi(false)
    if (result.error || !result.content) {
      setError(result.error ?? 'Không thể tạo gợi ý bằng AI.')
      return
    }
    setContent(result.content)
    setMessage(`AI đã đọc ${selectedBlocks.length} block của bài “${lessonContentResult.data.lesson.title}” và tạo gợi ý KHBD. Hãy kiểm tra trước khi lưu.`)
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!lessonId || !title.trim()) return
    setIsSaving(true); setError(''); setMessage('')
    const selectedClass = classes.find((item) => item.id === classProfileId)
    const equipmentText = formatEquipmentSection(content.equipment, lessonBlocks, selectedClass)
    const objectivesText = formatObjectivesSection(
      content.objectives,
      title,
      lessons.find((l) => l.id === lessonId)?.chapters?.subjects.name,
    )
    const result = await createLessonPlan({
      teacherId: session.user.id,
      title,
      lessonId,
      classProfileId,
      planType,
      content: { ...content, objectives: objectivesText, equipment: equipmentText },
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
        {!selectedPlanId ? <form onSubmit={(event) => void handleCreate(event)}><div className="editor-form-grid"><label>Tên KHBD *<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Khối lượng riêng" /></label><label>Loại KHBD<select value={planType} onChange={(event) => setPlanType(event.target.value as LessonPlanType)}><option value="STANDARD">Công văn 5512</option><option value="STEM">STEM</option></select></label><label>Khối lớp<select value={selectedGrade} onChange={(event) => handleGradeChange(event.target.value)}><option value="all">-- Tất cả khối --</option>{availableGrades.map((grade) => <option key={grade.grade_number} value={grade.grade_number}>Lớp {grade.grade_number}</option>)}</select></label><label>Bài học *<select required value={lessonId} onChange={(event) => void handleLessonChange(event.target.value)}><option value="">-- Chọn bài học --</option>{filteredLessons.map((lesson) => <option key={lesson.id} value={lesson.id}>Lớp {lesson.chapters?.grades.grade_number} · {lesson.title}</option>)}</select></label><label>Hồ sơ lớp<select value={classProfileId} onChange={(event) => handleClassChange(event.target.value)}><option value="">Không gắn lớp cụ thể</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>{lessonId && <div className="lesson-source-note">{isLoadingLessonContent ? 'Đang đọc học liệu bài giảng...' : `Bài đang chọn: ${lessons.find((item) => item.id === lessonId)?.title ?? 'Không xác định'} · đã đọc ${lessonBlocks.length} block.`}<div className="lesson-source-actions"><button className="text-button" type="button" onClick={() => void regenerateActivities()} disabled={isLoadingLessonContent || isGeneratingAi}>Tạo lại nội bộ</button><button className="secondary-button" type="button" onClick={() => void generateWithAi()} disabled={isLoadingLessonContent || isGeneratingAi}><Bot size={15} />{isGeneratingAi ? 'AI đang soạn...' : 'Gợi ý bằng AI'}</button></div></div>}{sections.map((section) => <PlanTextField key={section.key} section={section} content={content} setContent={setContent} />)}<ActivitiesEditor activities={content.activities} blocks={lessonBlocks} onChange={(activities) => setContent((current) => ({ ...current, activities }))} /><button className="primary-button" disabled={isSaving || isLoadingLessonContent || isGeneratingAi} type="submit"><Save size={16} />{isSaving ? 'Đang tạo...' : 'Lưu KHBD'}</button></form> : <><div className="editor-toolbar"><input value={title} onChange={(event) => setTitle(event.target.value)} /><div><button className="secondary-button" type="button" onClick={() => void handleSave()} disabled={isSaving}><Save size={16} /> Lưu</button><button className="delete-button" type="button" onClick={() => void handleDelete()} aria-label="Xóa KHBD"><Trash2 size={16} /></button></div></div>{sections.map((section) => <PlanTextField key={section.key} section={section} content={content} setContent={setContent} />)}<ActivitiesEditor activities={content.activities} blocks={lessonBlocks} onChange={(activities) => setContent((current) => ({ ...current, activities }))} /></>}</>)}
      </div>
    </div>
  </section>
}

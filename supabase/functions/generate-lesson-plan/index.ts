import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type RequestPayload = {
  lesson: {
    title: string
    description: string | null
    learningObjectives: string[]
  }
  blocks: Array<{
    id: string
    type: string
    title: string
    description: string
    content: string
  }>
  classProfile: {
    name: string
    studentCount: number | null
    equipment: string[]
    notes: string | null
  } | null
  planType: 'STANDARD' | 'STEM'
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function extractJson(text: string) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('AI không trả về JSON hợp lệ.')
  return JSON.parse(cleaned.slice(start, end + 1))
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Chỉ hỗ trợ POST.' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
  const model = Deno.env.get('OPENROUTER_MODEL') || 'openai/gpt-4o-mini'
  if (!supabaseUrl || !supabaseAnonKey || !openRouterKey) {
    return jsonResponse({ error: 'Edge Function chưa được cấu hình đầy đủ secret.' }, 500)
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return jsonResponse({ error: 'Bạn cần đăng nhập để dùng AI.' }, 401)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } })
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return jsonResponse({ error: 'Phiên đăng nhập không hợp lệ.' }, 401)

  let payload: RequestPayload
  try {
    payload = await request.json() as RequestPayload
  } catch {
    return jsonResponse({ error: 'Dữ liệu yêu cầu không hợp lệ.' }, 400)
  }
  if (!payload.lesson?.title || !Array.isArray(payload.blocks) || !payload.planType) {
    return jsonResponse({ error: 'Thiếu dữ liệu bài học, block hoặc loại KHBD.' }, 400)
  }

  const prompt = `Bạn là chuyên gia thiết kế KHBD môn Khoa học tự nhiên/Vật lí tại Việt Nam.
Hãy xây dựng gợi ý kế hoạch bài dạy theo ${payload.planType === 'STEM' ? 'định hướng STEM' : 'Công văn 5512'}.
Chỉ sử dụng thông tin có trong bài học, block và hồ sơ lớp. Không bịa URL, số liệu hoặc thiết bị.
Sắp xếp block thành các hoạt động có mục tiêu, nội dung, sản phẩm và tổ chức thực hiện.
Trả về duy nhất JSON theo đúng cấu trúc:
{"objectives":"...","equipment":"...","assessment":"...","activities":[{"title":"...","objective":"...","content":"...","product":"...","organization":"...","blockIds":["id"]}]}
Mỗi hoạt động phải có blockIds là ID block được dùng. Có thể gộp nhiều block vào một hoạt động. Không bỏ qua block hữu ích.

Dữ liệu bài học:
${JSON.stringify(payload.lesson)}

Dữ liệu block:
${JSON.stringify(payload.blocks)}

Hồ sơ lớp:
${JSON.stringify(payload.classProfile)}`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
        'X-Title': 'ScienceLab',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 5000,
        messages: [
          { role: 'system', content: 'Bạn trả lời bằng JSON hợp lệ, không markdown.' },
          { role: 'user', content: prompt },
        ],
      }),
    })
    if (!response.ok) {
      const detail = await response.text()
      return jsonResponse({ error: `OpenRouter trả lỗi (${response.status}): ${detail.slice(0, 300)}` }, 502)
    }
    const result = await response.json()
    const text = result.choices?.[0]?.message?.content
    if (typeof text !== 'string') return jsonResponse({ error: 'OpenRouter không trả về nội dung.' }, 502)
    const content = extractJson(text)
    if (!Array.isArray(content.activities)) throw new Error('Kết quả AI thiếu danh sách hoạt động.')
    return jsonResponse({ content })
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Không thể tạo gợi ý AI.' }, 502)
  }
})

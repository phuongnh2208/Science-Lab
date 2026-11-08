import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const supabaseConfig = {
  url: supabaseUrl ?? '',
  hasAnonKey: Boolean(supabaseAnonKey),
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export type SupabaseConnectionResult = {
  ok: boolean
  message: string
}

export async function checkSupabaseConnection(): Promise<SupabaseConnectionResult> {
  if (!supabase) {
    return {
      ok: false,
      message:
        'Chưa cấu hình Supabase. Hãy tạo .env.local từ .env.example và điền URL cùng publishable/anon key.',
    }
  }

  const { error } = await supabase
    .from('education_levels')
    .select('id')
    .limit(1)

  if (error) {
    return {
      ok: false,
      message: `Không thể truy vấn database: ${error.message}`,
    }
  }

  return {
    ok: true,
    message: 'Đã kết nối Supabase và truy vấn database thành công.',
  }
}

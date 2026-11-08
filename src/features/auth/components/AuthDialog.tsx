import { useState } from 'react'
import type { FormEvent } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

type AuthMode = 'login' | 'register'

export function AuthDialog({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) {
      setMessage('Chưa cấu hình kết nối Supabase.')
      return
    }

    setIsSubmitting(true)
    setMessage('')
    const result =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    setIsSubmitting(false)
    setMessage(
      result.error?.message ??
        (mode === 'login'
          ? 'Đăng nhập thành công.'
          : 'Đăng ký thành công. Kiểm tra email nếu cần xác nhận.'),
    )
  }

  return (
    <details className={`auth-menu ${compact ? 'auth-menu-compact' : ''}`}>
      <summary><LogIn size={16} /> Đăng nhập</summary>
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản giáo viên'}</h2>
        <label>
          Email
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Mật khẩu
          <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {message && <p className="form-message">{message}</p>}
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
          {isSubmitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </button>
        <button className="switch-button" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </form>
    </details>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { LogIn, Mail, UserPlus } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

type AuthMode = 'login' | 'register'

export function AuthDialog({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canResendVerification, setCanResendVerification] = useState(false)
  const [isResending, setIsResending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) {
      setMessage('Chưa cấu hình kết nối Supabase.')
      return
    }

    setIsSubmitting(true)
    setMessage('')
    setCanResendVerification(false)
    const result =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
            },
          })
    setIsSubmitting(false)
    if (result.error) {
      setMessage(result.error.message)
      setCanResendVerification(result.error.message.toLowerCase().includes('email not confirmed'))
      return
    }
    setMessage(mode === 'login' ? 'Đăng nhập thành công.' : 'Đăng ký thành công. Kiểm tra email nếu cần xác nhận.')
    setCanResendVerification(mode === 'register' && !result.data.session)
  }

  async function resendVerificationEmail() {
    if (!supabase || !email) return
    setIsResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    setIsResending(false)
    setMessage(error ? `Không thể gửi lại email: ${error.message}` : 'Đã gửi lại email xác thực. Hãy kiểm tra cả thư mục Spam.')
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
        {canResendVerification && <button className="login-resend" disabled={isResending} type="button" onClick={() => void resendVerificationEmail()}><Mail size={16} />{isResending ? 'Đang gửi lại...' : 'Gửi lại email xác thực'}</button>}
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

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, LogIn, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

type AuthMode = 'login' | 'register'

export function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/', { replace: true })
    })
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) {
      setMessage('Chưa cấu hình kết nối Supabase.')
      return
    }

    setIsSubmitting(true)
    setMessage('')
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      })
    setIsSubmitting(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }
    if (mode === 'register' && !result.data.session) {
      setMessage('Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản.')
      return
    }
    navigate('/', { replace: true })
  }

  const isRegister = mode === 'register'

  return <main className="login-page">
    <section className="login-card">
      <div className="login-brand"><span className="brand-mark">SL</span><div><strong>ScienceLab</strong><small>Biến bài học thành trải nghiệm khám phá.</small></div></div>
      <div className="login-intro"><p className="eyebrow">{isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</p><h1>{isRegister ? 'Bắt đầu xây dựng bài học.' : 'Đăng nhập vào ScienceLab.'}</h1><p>{isRegister ? 'Lưu hồ sơ lớp, học liệu và kế hoạch bài dạy của bạn.' : 'Tiếp tục khai thác thư viện bài học và kho KHBD.'}</p></div>
      <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
        {isRegister && <label>Họ và tên<input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ví dụ: Nguyễn Văn An" autoComplete="name" /></label>}
        <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
        <label>Mật khẩu<input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tối thiểu 6 ký tự" autoComplete={isRegister ? 'new-password' : 'current-password'} /></label>
        {message && <p className="form-message">{message}</p>}
        <button className="primary-button" disabled={isSubmitting} type="submit">{isRegister ? <UserPlus size={17} /> : <LogIn size={17} />}{isSubmitting ? 'Đang xử lý...' : isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}<ArrowRight size={16} /></button>
      </form>
      <button className="login-switch" type="button" onClick={() => { setMode(isRegister ? 'login' : 'register'); setMessage('') }}>{isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}</button>
      <Link className="login-home-link" to="/">Quay lại trang chủ</Link>
    </section>
  </main>
}

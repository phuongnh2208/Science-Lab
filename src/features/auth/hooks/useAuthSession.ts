import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../../lib/supabase'
import type { Profile } from '../../../types/domain'

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) setProfileError(`Không thể khôi phục phiên đăng nhập: ${error.message}`)
      setSession(data.session)
      setIsLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        setProfile(null)
        setProfileError('')
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !session) return
    setProfileError('')
    void supabase
      .from('profiles')
      .select('id,role,full_name')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        setProfile(data as Profile | null)
        if (error) setProfileError(`Không thể tải hồ sơ tài khoản: ${error.message}`)
      })
  }, [session])

  return { session, profile, isLoading, profileError }
}

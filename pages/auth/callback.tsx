import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Completing sign-in…')

  useEffect(() => {
    let cancelled = false

    const finish = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) throw error
        if (!cancelled) router.replace('/')
      } catch (e: any) {
        if (!cancelled) setMessage(e?.message || 'Unable to complete sign-in.')
      }
    }

    finish()
    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0b0e', color: '#f0f2f7', fontFamily: 'Inter, sans-serif' }}>
      <div>{message}</div>
    </div>
  )
}

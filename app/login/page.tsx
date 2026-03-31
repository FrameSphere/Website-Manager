'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'E-Mail oder Passwort falsch.' : error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
    background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text1)', outline: 'none', transition: 'border-color .15s',
    fontFamily: 'inherit',
  } as React.CSSProperties

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #5b6af6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>S</div>
        <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text1)' }}>SiteControl</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 36 }}>
        <h1 style={{ fontWeight: 900, fontSize: 24, marginBottom: 6 }}>Willkommen zurück</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>
          Noch kein Konto?{' '}
          <Link href="/signup" style={{ color: '#7e93fb', textDecoration: 'none', fontWeight: 600 }}>Jetzt registrieren</Link>
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, color: 'var(--text2)' }}>E-Mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="du@beispiel.de"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(91,106,246,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Passwort</label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}>Vergessen?</Link>
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(91,106,246,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 13, borderRadius: 10, fontWeight: 700, fontSize: 15,
            background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(91,106,246,0.35)', fontFamily: 'inherit',
          }}>
            {loading ? 'Anmelden…' : 'Anmelden →'}
          </button>
        </form>
      </div>
    </div>
  )
}

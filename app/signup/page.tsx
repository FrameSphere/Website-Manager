'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPro = searchParams.get('plan') === 'pro'
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Passwort muss mindestens 8 Zeichen haben.'); return }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })


    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
    background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text1)', outline: 'none', transition: 'border-color .15s',
    fontFamily: 'inherit',
  } as React.CSSProperties

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 24 }}>✓</div>
        <h1 style={{ fontWeight: 900, fontSize: 26, marginBottom: 12 }}>Fast fertig!</h1>
        <p style={{ color: 'var(--text2)', fontSize: 16, textAlign: 'center', maxWidth: 380, lineHeight: 1.6 }}>
          Wir haben dir eine Bestätigungs-E-Mail an <strong style={{ color: 'var(--text1)' }}>{email}</strong> geschickt. Klicke auf den Link darin, um deinen Account zu aktivieren.
        </p>
        <Link href="/login" style={{ marginTop: 32, padding: '12px 28px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text1)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          Zur Anmeldung
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #5b6af6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>S</div>
        <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text1)' }}>SiteControl</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {isPro && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(91,106,246,0.08)', border: '1px solid rgba(91,106,246,0.25)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⭐</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#a4bbfd' }}>14 Tage Pro – kostenlos</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Danach €19/Monat oder jederzeit kündigen.</div>
            </div>
          </div>
        )}

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 36 }}>
          <h1 style={{ fontWeight: 900, fontSize: 24, marginBottom: 6 }}>Konto erstellen</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>
            Bereits registriert?{' '}
            <Link href="/login" style={{ color: '#7e93fb', textDecoration: 'none', fontWeight: 600 }}>Anmelden</Link>
          </p>

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, color: 'var(--text2)' }}>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Dein Name"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(91,106,246,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, color: 'var(--text2)' }}>E-Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="du@beispiel.de"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(91,106,246,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, color: 'var(--text2)' }}>Passwort <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(mind. 8 Zeichen)</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={8}
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
              {loading ? 'Account erstellen…' : 'Kostenlos starten →'}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.6 }}>
            Mit der Registrierung stimmst du unseren <Link href="/terms" style={{ color: 'var(--text3)', textDecoration: 'underline' }}>AGB</Link> und der <Link href="/privacy" style={{ color: 'var(--text3)', textDecoration: 'underline' }}>Datenschutzerklärung</Link> zu.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}

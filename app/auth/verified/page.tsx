'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerifiedPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<'circle' | 'check' | 'text' | 'done'>('circle')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('check'), 400)
    const t2 = setTimeout(() => setPhase('text'), 900)
    const t3 = setTimeout(() => setPhase('done'), 1800)
    const t4 = setTimeout(() => router.push('/dashboard'), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--text1)',
      padding: 24, fontFamily: 'inherit',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 56 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'linear-gradient(135deg, #5b6af6, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: '#fff',
        }}>S</div>
        <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text1)' }}>SiteControl</span>
      </Link>

      {/* Animated circle + check */}
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 36 }}>

        {/* Glow behind circle */}
        <div style={{
          position: 'absolute', inset: -20,
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.2), transparent 70%)',
          borderRadius: '50%',
          opacity: phase === 'circle' ? 0 : 1,
          transition: 'opacity 0.6s ease',
        }} />

        {/* SVG Circle + Checkmark */}
        <svg viewBox="0 0 120 120" width="120" height="120" style={{ overflow: 'visible' }}>
          {/* Track */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="rgba(34,197,94,0.15)"
            strokeWidth="5"
          />
          {/* Animated ring */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="#22c55e"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="339.3"
            strokeDashoffset={phase === 'circle' ? 339.3 : 0}
            style={{
              transition: 'stroke-dashoffset 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: '60px 60px',
              transform: 'rotate(-90deg)',
            }}
          />
          {/* Checkmark */}
          <polyline
            points="36,62 52,78 84,44"
            fill="none"
            stroke="#22c55e"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="70"
            strokeDashoffset={phase === 'circle' || phase === 'check' && false ? 70 : phase === 'check' || phase === 'text' || phase === 'done' ? 0 : 70}
            style={{
              strokeDashoffset: phase === 'circle' ? 70 : 0,
              transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.55s',
            }}
          />
        </svg>
      </div>

      {/* Text content */}
      <div style={{
        textAlign: 'center',
        opacity: phase === 'circle' || phase === 'check' ? 0 : 1,
        transform: phase === 'circle' || phase === 'check' ? 'translateY(10px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10, letterSpacing: '-0.02em' }}>
          E-Mail bestätigt!
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.6, maxWidth: 360 }}>
          Dein Account ist jetzt aktiv. Du wirst in Kürze automatisch weitergeleitet…
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        marginTop: 40, width: 200, height: 3,
        background: 'var(--border)', borderRadius: 99,
        overflow: 'hidden',
        opacity: phase === 'done' ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #5b6af6, #22c55e)',
          borderRadius: 99,
          width: phase === 'done' ? '100%' : '0%',
          transition: 'width 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>

      {/* Manual link fallback */}
      <p style={{
        marginTop: 24, fontSize: 13, color: 'var(--text3)',
        opacity: phase === 'done' ? 1 : 0,
        transition: 'opacity 0.4s ease 0.3s',
      }}>
        Nicht weitergeleitet?{' '}
        <Link href="/dashboard" style={{ color: '#7e93fb', textDecoration: 'none', fontWeight: 600 }}>
          Manuell zum Dashboard →
        </Link>
      </p>
    </div>
  )
}

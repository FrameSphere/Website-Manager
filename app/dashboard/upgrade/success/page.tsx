'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Star, Check, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react'

const PRO_FEATURES = [
  'Unbegrenzte Websites',
  'Blog, Changelog & Support-Tickets',
  'Vollständige Analytics',
  'AdSense & GSC Widgets',
  'Team bis zu 5 Personen',
  'Prioritäts-Support',
]

type Phase = 'waiting' | 'confirmed' | 'timeout'

export default function UpgradeSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [phase, setPhase] = useState<Phase>('waiting')
  const [attempt, setAttempt] = useState(0)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    let tries = 0
    let stopped = false

    async function activate() {
      tries++
      setAttempt(tries)

      try {
        // Step 1: Try direct activation via session_id (fast, no webhook needed)
        if (sessionId && tries === 1) {
          const r = await fetch(`/api/stripe/activate?session_id=${sessionId}`, { cache: 'no-store' })
          const d = await r.json()
          if (d.activated) {
            if (!stopped) setPhase('confirmed')
            return
          }
        }

        // Step 2: Poll /api/stripe/sync to check if webhook already updated plan
        const r = await fetch('/api/stripe/sync', { cache: 'no-store' })
        const d = await r.json()
        if (d.confirmed) {
          if (!stopped) setPhase('confirmed')
          return
        }
      } catch {}

      if (tries >= 15) {
        if (!stopped) setPhase('timeout')
        return
      }

      setTimeout(activate, 2000)
    }

    activate()
    return () => { stopped = true }
  }, [sessionId])

  // Auto-redirect after confirmation
  useEffect(() => {
    if (phase !== 'confirmed') return
    const interval = setInterval(() => setCountdown(c => {
      if (c <= 1) { clearInterval(interval); window.location.href = '/dashboard'; return 0 }
      return c - 1
    }), 1000)
    return () => clearInterval(interval)
  }, [phase])

  function goToDashboard() {
    window.location.href = '/dashboard'
  }

  // ── WAITING ──────────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(91,106,246,0.2)', borderTopColor: '#5b6af6', animation: 'spin 1s linear infinite', marginBottom: 28 }} />
        <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Plan wird aktiviert…</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, textAlign: 'center', maxWidth: 340, lineHeight: 1.6, marginBottom: 10 }}>
          Wir bestätigen deine Zahlung bei Stripe. Das dauert normalerweise nur 2–3 Sekunden.
        </p>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
          Prüfung {attempt}…
        </div>
      </div>
    )
  }

  // ── TIMEOUT ──────────────────────────────────────────────────────
  if (phase === 'timeout') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <AlertTriangle size={28} color="#f59e0b" />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Fast fertig…</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, textAlign: 'center', maxWidth: 420, lineHeight: 1.7, marginBottom: 28 }}>
          Deine Zahlung war erfolgreich, aber die Aktivierung braucht etwas länger als üblich.
          Bitte lade das Dashboard neu.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
          <button onClick={goToDashboard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 24px', borderRadius: 11, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(91,106,246,0.35)' }}>
            <RefreshCw size={15} /> Dashboard neu laden
          </button>
          <a href="mailto:support@sitecontrol.app?subject=Pro-Aktivierung%20ausstehend" style={{ display: 'block', textAlign: 'center', padding: '11px 24px', borderRadius: 11, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Support kontaktieren
          </a>
        </div>
        <div style={{ marginTop: 24, padding: '12px 20px', borderRadius: 10, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 13, color: '#22c55e', maxWidth: 420, textAlign: 'center' }}>
          ✓ Deine Zahlung bei Stripe war erfolgreich. Du wirst nicht doppelt belastet.
        </div>
      </div>
    )
  }

  // ── CONFIRMED ────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ position: 'relative', width: 110, height: 110, marginBottom: 36 }}>
        <div style={{ position: 'absolute', inset: -16, background: 'radial-gradient(ellipse, rgba(91,106,246,0.2), transparent 70%)', borderRadius: '50%' }} />
        <svg viewBox="0 0 110 110" width="110" height="110">
          <circle cx="55" cy="55" r="50" fill="none" stroke="rgba(91,106,246,0.15)" strokeWidth="5" />
          <circle cx="55" cy="55" r="50" fill="none" stroke="url(#g)" strokeWidth="5" strokeLinecap="round" strokeDasharray="314.16" strokeDashoffset="0" style={{ transformOrigin: '55px 55px', transform: 'rotate(-90deg)' }} />
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5b6af6" /><stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <polyline points="33,57 49,73 77,41" fill="none" stroke="#a4bbfd" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 16px', borderRadius: 100, background: 'rgba(91,106,246,0.1)', border: '1px solid rgba(91,106,246,0.3)', fontSize: 13, fontWeight: 700, color: '#a4bbfd', marginBottom: 20 }}>
          <Star size={13} fill="#a4bbfd" color="#a4bbfd" /> Willkommen bei Pro!
        </div>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(26px, 5vw, 38px)', letterSpacing: '-0.02em', marginBottom: 12 }}>Upgrade erfolgreich!</h1>
        <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
          Dein Account wurde auf <strong style={{ color: '#a4bbfd' }}>SiteControl Pro</strong> upgradet. Alle Features sind sofort freigeschaltet.
        </p>

        <div style={{ background: 'var(--surface)', border: '1px solid rgba(91,106,246,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'Space Mono, monospace', marginBottom: 14 }}>Jetzt freigeschaltet</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PRO_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={10} color="#22c55e" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <button onClick={goToDashboard} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 11, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(91,106,246,0.4)' }}>
          Zum Dashboard <ArrowRight size={16} />
        </button>
        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
          Automatische Weiterleitung in {countdown} Sekunden…
        </p>
      </div>
    </div>
  )
}

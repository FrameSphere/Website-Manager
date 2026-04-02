'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, Check, ArrowRight } from 'lucide-react'

const PRO_FEATURES = [
  'Unbegrenzte Websites',
  'Blog, Changelog & Support-Tickets',
  'Vollständige Analytics mit Live-Counter',
  'AdSense & Google Search Console Widgets',
  'Team bis zu 5 Personen',
  'Prioritäts-Support',
]

export default function UpgradeSuccessPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<'ring' | 'check' | 'content'>('ring')
  const [countdown, setCountdown] = useState(8)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('check'), 300)
    const t2 = setTimeout(() => setPhase('content'), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (phase !== 'content') return
    const interval = setInterval(() => setCountdown(c => {
      if (c <= 1) { clearInterval(interval); router.push('/dashboard'); return 0 }
      return c - 1
    }), 1000)
    return () => clearInterval(interval)
  }, [phase, router])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'var(--bg)' }}>

      {/* Animated check */}
      <div style={{ position: 'relative', width: 110, height: 110, marginBottom: 36 }}>
        <div style={{
          position: 'absolute', inset: -16,
          background: 'radial-gradient(ellipse, rgba(91,106,246,0.2), transparent 70%)',
          borderRadius: '50%',
          opacity: phase === 'ring' ? 0 : 1, transition: 'opacity .6s ease',
        }} />
        <svg viewBox="0 0 110 110" width="110" height="110">
          <circle cx="55" cy="55" r="50" fill="none" stroke="rgba(91,106,246,0.15)" strokeWidth="5" />
          <circle cx="55" cy="55" r="50" fill="none" stroke="url(#proGrad)" strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="314.16"
            strokeDashoffset={phase === 'ring' ? 314.16 : 0}
            style={{ transition: 'stroke-dashoffset 0.55s cubic-bezier(0.4,0,0.2,1)', transformOrigin: '55px 55px', transform: 'rotate(-90deg)' }}
          />
          <defs>
            <linearGradient id="proGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5b6af6" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <polyline points="33,57 49,73 77,41" fill="none" stroke="#a4bbfd" strokeWidth="5.5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="65"
            strokeDashoffset={phase === 'ring' ? 65 : 0}
            style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4,0,0.2,1) 0.55s' }}
          />
        </svg>
      </div>

      {/* Content */}
      <div style={{
        textAlign: 'center', maxWidth: 560,
        opacity: phase === 'content' ? 1 : 0,
        transform: phase === 'content' ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity .5s ease, transform .5s ease',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 16px', borderRadius: 100, background: 'rgba(91,106,246,0.1)', border: '1px solid rgba(91,106,246,0.3)', fontSize: 13, fontWeight: 700, color: '#a4bbfd', marginBottom: 20 }}>
          <Star size={13} fill="#a4bbfd" color="#a4bbfd" /> Willkommen bei Pro!
        </div>

        <h1 style={{ fontWeight: 900, fontSize: 'clamp(26px, 5vw, 38px)', letterSpacing: '-0.02em', marginBottom: 12 }}>
          Upgrade erfolgreich!
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
          Dein Account wurde auf <strong style={{ color: '#a4bbfd' }}>SiteControl Pro</strong> upgradet. Alle Features sind sofort freigeschaltet.
        </p>

        {/* Features list */}
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(91,106,246,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'Space Mono, monospace', marginBottom: 14 }}>Jetzt freigeschaltet</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PRO_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text1)' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={10} color="#22c55e" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '13px 32px', borderRadius: 11,
          background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff',
          textDecoration: 'none', fontWeight: 700, fontSize: 16,
          boxShadow: '0 8px 24px rgba(91,106,246,0.4)',
        }}>
          Zum Dashboard <ArrowRight size={16} />
        </Link>

        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
          Automatische Weiterleitung in {countdown} Sekunden…
        </p>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const ease = 'cubic-bezier(0.16, 1, 0.3, 1)'

type Phase = 'idle' | 'logos' | 'connecting' | 'connected' | 'features' | 'cta'

const FEATURES = [
  {
    color: '#7e93fb', bg: 'rgba(126,147,251,0.08)', border: 'rgba(126,147,251,0.2)',
    title: 'Website-Management',
    desc:  'Verwalte alle deine Websites zentral — Status, Blog, Changelog und mehr auf einen Blick.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  },
  {
    color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)',
    title: 'Analytics & Tracking',
    desc:  'Seitenaufrufe, Herkunft, Geräte — alle Daten ohne Cookies und DSGVO-konform.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)',
    title: 'Blog & Changelog',
    desc:  'Veröffentliche Beiträge und Release-Notes direkt aus SiteControl heraus.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  },
  {
    color: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.2)',
    title: 'FrameSphere Connected',
    desc:  'Dein FrameSphere-Konto ist verknüpft — ein Account, alle Tools, ein Login.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  },
]

function SiteControlLogo({ visible }: { visible: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(-60px) scale(0.8)',
      transition: `opacity .7s ${ease}, transform .7s ${ease}`,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #5b6af6, #a78bfa)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(91,106,246,.55), 0 8px 32px rgba(0,0,0,.4)',
        position: 'relative', fontSize: 32, fontWeight: 900, color: '#fff',
      }}>
        S
        <div style={{ position: 'absolute', inset: -1, borderRadius: 21, background: 'linear-gradient(135deg, rgba(255,255,255,.2), transparent)', pointerEvents: 'none' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>SiteControl</div>
        <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>Website-Manager</div>
      </div>
    </div>
  )
}

function FrameSphereLogo({ visible }: { visible: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(60px) scale(0.8)',
      transition: `opacity .7s ${ease} .15s, transform .7s ${ease} .15s`,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #6d28d9, #c026d3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(192,38,211,.5), 0 8px 32px rgba(0,0,0,.4)',
        position: 'relative',
      }}>
        <span style={{ color: 'white', fontWeight: 900, fontSize: 26, letterSpacing: '-1px' }}>FS</span>
        <div style={{ position: 'absolute', inset: -1, borderRadius: 21, background: 'linear-gradient(135deg, rgba(255,255,255,.2), transparent)', pointerEvents: 'none' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>FrameSphere</div>
        <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>Dein Account-Hub</div>
      </div>
    </div>
  )
}

function ConnectionLine({ phase }: { phase: Phase }) {
  const drawing = ['connecting', 'connected', 'features', 'cta'].includes(phase)
  const done    = ['connected',  'features',  'cta'].includes(phase)
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 120 }}>
      <div style={{ position: 'relative', width: '100%', height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 2,
          background: 'linear-gradient(90deg, #5b6af6, #a78bfa)',
          transformOrigin: 'left center',
          transform: drawing ? 'scaleX(1)' : 'scaleX(0)',
          transition: drawing ? `transform .6s ${ease}` : 'none',
          boxShadow: drawing ? '0 0 10px rgba(167,139,250,.8)' : 'none',
        }} />
        {drawing && !done && (
          <div style={{
            position: 'absolute', top: '50%', width: 8, height: 8, borderRadius: '50%',
            background: 'white', boxShadow: '0 0 12px rgba(255,255,255,.9)',
            transform: 'translateY(-50%)', animation: 'travelDot .6s ease-out forwards',
          }} />
        )}
      </div>
      <div style={{
        position: 'absolute', left: '50%', top: '50%', width: 28, height: 28, borderRadius: '50%',
        background: done ? 'linear-gradient(135deg, #5b6af6, #a78bfa)' : 'transparent',
        border: done ? 'none' : '2px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: done ? 1 : 0,
        transform: done ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) scale(0)',
        transition: `opacity .4s ${ease}, transform .5s ${ease}`,
        boxShadow: done ? '0 0 20px rgba(167,139,250,.6)' : 'none',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color, bg, border, delay, visible }: {
  icon: React.ReactNode; title: string; desc: string
  color: string; bg: string; border: string; delay: number; visible: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '18px 20px', borderRadius: 16,
        background: hovered ? `linear-gradient(135deg, ${bg}, rgba(255,255,255,0.03))` : bg,
        border: `1px solid ${hovered ? color + '55' : border}`,
        backdropFilter: 'blur(12px)', cursor: 'default',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
        transition: `opacity .5s ${ease} ${delay}ms, transform .5s ${ease} ${delay}ms, background .2s, border-color .2s, box-shadow .2s`,
        boxShadow: hovered ? `0 8px 32px ${color}22` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
          transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
          transition: 'transform .25s ease',
        }}>
          {icon}
        </div>
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
          <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
        </div>
      </div>
    </div>
  )
}

export default function SSOWelcomePage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [btnHovered, setBtnHovered] = useState(false)

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = []
    t.push(setTimeout(() => setPhase('logos'),      150))
    t.push(setTimeout(() => setPhase('connecting'), 950))
    t.push(setTimeout(() => setPhase('connected'),  1650))
    t.push(setTimeout(() => setPhase('features'),   2250))
    t.push(setTimeout(() => setPhase('cta'),        2950))
    return () => t.forEach(clearTimeout)
  }, [])

  const showLogos    = phase !== 'idle'
  const showBadge    = ['connected', 'features', 'cta'].includes(phase)
  const showHeadline = ['features',  'cta'].includes(phase)
  const showFeatures = ['features',  'cta'].includes(phase)
  const showCta      = phase === 'cta'

  return (
    <>
      <style>{`
        @keyframes travelDot  { from{left:0%} to{left:100%} }
        @keyframes orbPulse   { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.6;transform:scale(1.07)} }
        @keyframes shimmerBtn { 0%{background-position:-200% center} 100%{background-position:200% center} }
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      {/* Background */}
      <div style={{ position:'fixed', inset:0, background:'#030712', zIndex:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', width:700, height:600, borderRadius:'50%', top:-200, left:'50%', transform:'translateX(-50%)', background:'radial-gradient(circle, rgba(91,106,246,.2) 0%, transparent 70%)', animation:'orbPulse 9s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:480, height:480, borderRadius:'50%', bottom:-100, right:'10%', background:'radial-gradient(circle, rgba(167,139,250,.13) 0%, transparent 70%)', animation:'orbPulse 12s ease-in-out infinite 1.5s' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
      </div>

      <main style={{
        position:'relative', zIndex:1,
        minHeight:'100vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'40px 16px', fontFamily:'Inter, system-ui, sans-serif',
      }}>
        <div style={{ width:'100%', maxWidth:640, display:'flex', flexDirection:'column', gap:48 }}>

          {/* Animation Block */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:32 }}>
            <div style={{ display:'flex', alignItems:'center', gap:24, justifyContent:'center' }}>
              <SiteControlLogo visible={showLogos} />
              <ConnectionLine phase={phase} />
              <FrameSphereLogo visible={showLogos} />
            </div>

            {/* Badge */}
            <div style={{
              opacity: showBadge ? 1 : 0,
              transform: showBadge ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)',
              transition: `opacity .5s ${ease}, transform .5s ${ease}`,
              display:'flex', alignItems:'center', gap:8,
              padding:'8px 20px', borderRadius:100,
              background:'rgba(91,106,246,.12)', border:'1px solid rgba(167,139,250,.4)',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a4bbfd" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span style={{ color:'#a4bbfd', fontSize:13, fontWeight:600 }}>Erfolgreich verbunden</span>
            </div>

            {/* Headline */}
            <div style={{
              textAlign:'center',
              opacity: showHeadline ? 1 : 0,
              transform: showHeadline ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity .5s ${ease} .1s, transform .5s ${ease} .1s`,
            }}>
              <h1 style={{ fontSize:'clamp(24px,5vw,36px)', fontWeight:800, color:'#f1f5f9', lineHeight:1.2, letterSpacing:'-.5px', marginBottom:12 }}>
                Dein FrameSphere-Konto<br />
                <span style={{ background:'linear-gradient(90deg,#7e93fb,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  ist jetzt verknüpft.
                </span>
              </h1>
              <p style={{ color:'#64748b', fontSize:15, lineHeight:1.6, maxWidth:440, margin:'0 auto' }}>
                Melde dich ab sofort mit einem Klick über FrameSphere bei SiteControl an —
                kein separates Passwort nötig. Dein Account ist eingerichtet und bereit.
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:12 }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 80} visible={showFeatures} />
            ))}
          </div>

          {/* CTA */}
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:12,
            opacity: showCta ? 1 : 0,
            transform: showCta ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity .5s ${ease}, transform .5s ${ease}`,
          }}>
            <button
              onClick={() => router.push('/dashboard')}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                padding:'16px 48px', borderRadius:14, border:'none', cursor:'pointer',
                fontSize:16, fontWeight:700, fontFamily:'inherit', color:'white',
                background:'linear-gradient(135deg, #5b6af6, #a78bfa, #c026d3, #a78bfa, #5b6af6)',
                backgroundSize:'300% 100%',
                animation:'shimmerBtn 2.5s linear infinite',
                transform: btnHovered ? 'scale(1.04) translateY(-2px)' : 'scale(1) translateY(0)',
                transition:'transform .2s ease, box-shadow .2s ease',
                boxShadow: btnHovered ? '0 20px 50px rgba(167,139,250,.45)' : '0 8px 30px rgba(91,106,246,.3)',
                display:'flex', alignItems:'center', gap:10, letterSpacing:'-.3px',
              }}
            >
              Zum Dashboard
              <span style={{ transform: btnHovered ? 'translateX(3px)' : 'translateX(0)', transition:'transform .2s ease', display:'inline-flex' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </button>
            <p style={{ color:'#1e293b', fontSize:13 }}>Deine Websites und Einstellungen findest du im Dashboard.</p>
          </div>

        </div>
      </main>
    </>
  )
}

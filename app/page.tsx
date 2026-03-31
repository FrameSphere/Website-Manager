import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SiteControl – Alle deine Websites. Ein Dashboard.',
  description: 'Verwalte Blog-Posts, Changelogs, Support-Tickets, Todos und Analytics für alle deine Websites in einem zentralen Dashboard. Kostenlos starten.',
  alternates: { canonical: 'https://sitecontrol.app' },
}

const FEATURES = [
  {
    icon: '🌐',
    title: 'Sites im Blick',
    desc: 'Alle deine Websites auf einen Blick. Status, Fehler, offene Tickets – sofort sichtbar.',
    free: true,
  },
  {
    icon: '✅',
    title: 'Todo-Management',
    desc: 'Priorisierte Aufgaben pro Website. Fälligkeiten, Wichtigkeits-Flags und Prioritätsstufen.',
    free: true,
  },
  {
    icon: '🔔',
    title: 'Benachrichtigungen',
    desc: 'Aktivitäts-Feed aller Websites. Fehler, neue Tickets und Updates auf einen Blick.',
    free: true,
  },
  {
    icon: '📝',
    title: 'Blog-Verwaltung',
    desc: 'Schreibe, plane und veröffentliche Blog-Posts für alle deine Seiten. Mehrsprachig.',
    free: false,
  },
  {
    icon: '🗂️',
    title: 'Changelog-System',
    desc: 'Versionierte Einträge mit Feature, Fix und Breaking-Change-Tags. Automatisch publizierbar.',
    free: false,
  },
  {
    icon: '🎫',
    title: 'Support-Tickets',
    desc: 'Kundennachrichten empfangen, beantworten und verwalten – direkt im Dashboard.',
    free: false,
  },
  {
    icon: '📊',
    title: 'Analytics',
    desc: 'Pageviews, Geräte-Split, Referrer und Fehler-Logs. Kein externes Tool nötig.',
    free: false,
  },
  {
    icon: '💰',
    title: 'AdSense-Widget',
    desc: 'Deine Einnahmen der letzten 30 Tage direkt im Dashboard. Mit Sparkline-Chart.',
    free: false,
  },
  {
    icon: '🔍',
    title: 'Search Console',
    desc: 'Klicks, Impressionen, Top-Keywords und Ø-Position aus Google Search Console.',
    free: false,
  },
]

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: 'für immer',
    desc: 'Perfekt zum Ausprobieren. Keine Kreditkarte nötig.',
    highlight: false,
    cta: 'Kostenlos starten',
    ctaHref: '/signup',
    features: [
      'Bis zu 3 Websites',
      'Dashboard & KPI-Überblick',
      'Todo-Management',
      'Benachrichtigungen',
      'Basic Analytics',
      '1 Benutzer',
    ],
    missing: [
      'Blog-Verwaltung',
      'Changelog-System',
      'Support-Tickets',
      'AdSense & GSC-Widgets',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '19',
    period: 'pro Monat',
    desc: 'Alles was du für ein professionelles Website-Portfolio brauchst.',
    highlight: true,
    cta: '14 Tage kostenlos testen',
    ctaHref: '/signup?plan=pro',
    features: [
      'Unbegrenzte Websites',
      'Alles aus Free',
      'Blog-Verwaltung (mehrsprachig)',
      'Changelog-System',
      'Support-Ticket-System',
      'Vollständige Analytics',
      'AdSense & GSC-Widgets',
      'Bis zu 5 Teammitglieder',
      'Prioritäts-Support',
    ],
    missing: [],
  },
]

const TESTIMONIALS = [
  {
    name: 'Markus B.',
    role: 'Indie Developer',
    avatar: 'M',
    color: '#5b6af6',
    text: 'Ich verwalte 8 Websites. Früher hatte ich 8 Tabs mit verschiedenen Tools offen – jetzt alles in SiteControl.',
  },
  {
    name: 'Julia K.',
    role: 'Freelance Webdesignerin',
    avatar: 'J',
    color: '#22c55e',
    text: 'Das Blog-System spart mir täglich 30 Minuten. Alle Posts für alle Kunden-Seiten an einem Ort.',
  },
  {
    name: 'Thomas R.',
    role: 'SaaS Gründer',
    avatar: 'T',
    color: '#a78bfa',
    text: 'Support-Tickets und Changelog in einer App – endlich kein Hin-und-her zwischen verschiedenen Tools.',
  },
]

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text1)' }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(12,14,20,0.85)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, #5b6af6, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#fff',
            }}>S</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text1)' }}>SiteControl</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="#features" style={{ padding: '8px 14px', color: 'var(--text2)', textDecoration: 'none', fontSize: 14, fontWeight: 500, borderRadius: 8, transition: 'color .15s' }}>
              Features
            </Link>
            <Link href="#pricing" style={{ padding: '8px 14px', color: 'var(--text2)', textDecoration: 'none', fontSize: 14, fontWeight: 500, borderRadius: 8 }}>
              Preise
            </Link>
            <Link href="/login" style={{ padding: '8px 14px', color: 'var(--text2)', textDecoration: 'none', fontSize: 14, fontWeight: 500, borderRadius: 8 }}>
              Anmelden
            </Link>
            <Link href="/signup" style={{
              padding: '9px 18px', borderRadius: 9,
              background: 'linear-gradient(135deg, #5b6af6, #4346eb)',
              color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700,
              boxShadow: '0 4px 14px rgba(91,106,246,0.35)',
              transition: 'box-shadow .2s, transform .1s',
            }}>
              Kostenlos starten
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '100px 24px 80px', textAlign: 'center',
      }}>
        {/* Glow bg */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 600,
          background: 'radial-gradient(ellipse, rgba(91,106,246,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            border: '1px solid rgba(91,106,246,0.3)',
            background: 'rgba(91,106,246,0.08)',
            fontSize: 13, fontWeight: 600, color: '#a4bbfd',
            marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5b6af6', display: 'inline-block', boxShadow: '0 0 8px #5b6af6' }} />
            Jetzt verfügbar – 14 Tage Pro kostenlos testen
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900, lineHeight: 1.1,
            marginBottom: 24, letterSpacing: '-0.03em',
          }}>
            Alle deine Websites.<br />
            <span style={{
              background: 'linear-gradient(135deg, #7e93fb, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Ein Dashboard.</span>
          </h1>

          <p style={{
            fontSize: 20, color: 'var(--text2)', lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 40px',
          }}>
            Blog-Posts, Changelogs, Support-Tickets, Todos und Analytics für alle deine Websites — in einer zentralen App verwaltet.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              padding: '14px 32px', borderRadius: 12,
              background: 'linear-gradient(135deg, #5b6af6, #4346eb)',
              color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700,
              boxShadow: '0 8px 24px rgba(91,106,246,0.4)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Kostenlos starten
              <span style={{ fontSize: 18 }}>→</span>
            </Link>
            <Link href="#features" style={{
              padding: '14px 32px', borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text1)', textDecoration: 'none', fontSize: 16, fontWeight: 600,
            }}>
              Features ansehen
            </Link>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
            Keine Kreditkarte nötig · Free Plan für immer kostenlos
          </p>
        </div>
      </section>

      {/* ── Dashboard Preview ────────────────────────────────── */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            borderRadius: 20, overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,106,246,0.1)',
            background: 'var(--surface)',
          }}>
            {/* Fake browser bar */}
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface2)',
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ef4444','#f59e0b','#22c55e'].map(c => (
                  <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1, maxWidth: 300, margin: '0 auto',
                background: 'var(--bg)', borderRadius: 6, padding: '4px 12px',
                fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace',
                textAlign: 'center',
              }}>
                app.sitecontrol.app/dashboard
              </div>
            </div>

            {/* Dashboard Preview Content */}
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, minHeight: 480 }}>
              {/* Sidebar */}
              <div style={{ borderRight: '1px solid var(--border)', paddingRight: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'Space Mono, monospace', marginBottom: 12 }}>Navigation</div>
                {[
                  { icon: '⊞', label: 'Dashboard', active: true },
                  { icon: '🌐', label: 'Websites' },
                  { icon: '✅', label: 'Todos' },
                  { icon: '📝', label: 'Blog', pro: true },
                  { icon: '🗂️', label: 'Changelog', pro: true },
                  { icon: '🎫', label: 'Support', pro: true },
                  { icon: '📊', label: 'Analytics' },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    borderRadius: 8, marginBottom: 2, cursor: 'default',
                    background: item.active ? 'rgba(91,106,246,0.12)' : 'transparent',
                    border: item.active ? '1px solid rgba(91,106,246,0.2)' : '1px solid transparent',
                  }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: item.active ? 700 : 500, color: item.active ? '#7e93fb' : 'var(--text2)', flex: 1 }}>{item.label}</span>
                    {item.pro && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}>PRO</span>}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div>
                {/* KPI row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'Websites', val: '8', color: '#22c55e' },
                    { label: 'Offene Todos', val: '12', color: '#f59e0b' },
                    { label: 'Tickets', val: '3', color: '#60a5fa' },
                    { label: 'Revenue (30T)', val: '€142', color: '#22c55e' },
                  ].map(k => (
                    <div key={k.label} style={{
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '12px 14px',
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{k.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.val}</div>
                    </div>
                  ))}
                </div>

                {/* Sites grid */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 8, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '.08em' }}>Websites Status</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { name: 'Blog.de', url: 'blog.de', ok: true, color: '#5b6af6' },
                      { name: 'Shop GmbH', url: 'shop.de', ok: true, color: '#22c55e' },
                      { name: 'Portfolio', url: 'max.dev', ok: false, color: '#f59e0b' },
                    ].map(s => (
                      <div key={s.name} style={{
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '8px 10px',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, background: s.color + '22', border: `1px solid ${s.color}44`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🌐</div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>{s.url}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: s.ok ? '#22c55e' : '#f59e0b', flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 16 }}>Features</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Alles was du brauchst
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: 18, maxWidth: 520, margin: '0 auto' }}>
              Von der einfachen Todo-Liste bis zum vollständigen Blog-CMS — SiteControl wächst mit deinen Anforderungen.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '24px',
                transition: 'border-color .2s',
                position: 'relative', overflow: 'hidden',
              }}>
                {!f.free && (
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)',
                    color: '#a78bfa', fontFamily: 'Space Mono, monospace',
                  }}>PRO</div>
                )}
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Was unsere Nutzer sagen
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: 24,
              }}>
                <p style={{ color: 'var(--text1)', fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: t.color + '22', border: `2px solid ${t.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 16, color: t.color,
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 24px 100px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 16 }}>Preise</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Einfach und transparent
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: 18 }}>
              Starte kostenlos. Upgrade wenn du bereit bist.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {PLANS.map(plan => (
              <div key={plan.id} style={{
                background: plan.highlight ? 'rgba(91,106,246,0.06)' : 'var(--surface)',
                border: plan.highlight ? '2px solid rgba(91,106,246,0.4)' : '1px solid var(--border)',
                borderRadius: 20, padding: 32,
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #5b6af6, #a78bfa)',
                    color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 16px',
                    borderRadius: 100, whiteSpace: 'nowrap',
                  }}>
                    ⭐ Empfohlen
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>{plan.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.04em' }}>€{plan.price}</span>
                    <span style={{ color: 'var(--text3)', fontSize: 14 }}>{plan.period}</span>
                  </div>
                </div>

                <Link href={plan.ctaHref} style={{
                  display: 'block', textAlign: 'center', padding: '13px 24px',
                  borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none',
                  marginBottom: 28,
                  background: plan.highlight ? 'linear-gradient(135deg, #5b6af6, #4346eb)' : 'var(--surface2)',
                  color: plan.highlight ? '#fff' : 'var(--text1)',
                  border: plan.highlight ? 'none' : '1px solid var(--border)',
                  boxShadow: plan.highlight ? '0 6px 20px rgba(91,106,246,0.35)' : 'none',
                }}>
                  {plan.cta}
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                      <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ color: 'var(--text1)' }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                      <span style={{ color: 'var(--text3)', flexShrink: 0 }}>✗</span>
                      <span style={{ color: 'var(--text3)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{
          maxWidth: 800, margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(91,106,246,0.15), rgba(167,139,250,0.1))',
          border: '1px solid rgba(91,106,246,0.25)', borderRadius: 24, padding: '64px 40px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 400,
            background: 'radial-gradient(ellipse, rgba(91,106,246,0.2), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16, position: 'relative' }}>
            Bereit loszulegen?
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 18, marginBottom: 36, position: 'relative' }}>
            Erstelle deinen Account in 30 Sekunden. Keine Kreditkarte, kein Risiko.
          </p>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '15px 36px', borderRadius: 12,
            background: 'linear-gradient(135deg, #5b6af6, #4346eb)',
            color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 700,
            boxShadow: '0 10px 30px rgba(91,106,246,0.45)',
            position: 'relative',
          }}>
            Jetzt kostenlos starten →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #5b6af6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>S</div>
            <span style={{ fontWeight: 700, color: 'var(--text2)', fontSize: 14 }}>SiteControl</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Datenschutz', '/privacy'], ['Impressum', '/imprint'], ['AGB', '/terms']].map(([label, href]) => (
              <Link key={label} href={href} style={{ color: 'var(--text3)', textDecoration: 'none', fontSize: 13 }}>{label}</Link>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>© 2025 SiteControl</div>
        </div>
      </footer>

    </div>
  )
}

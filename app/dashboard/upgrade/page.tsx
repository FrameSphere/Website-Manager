import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Upgrade auf Pro' }

const FEATURES = [
  { icon: '📝', label: 'Blog-Verwaltung', desc: 'Posts für alle Websites – mehrsprachig & mit SEO-Feldern' },
  { icon: '🗂️', label: 'Changelog-System', desc: 'Versionierte Einträge mit Feature/Fix/Breaking-Tags' },
  { icon: '🎫', label: 'Support-Tickets', desc: 'Kundennachrichten empfangen & beantworten' },
  { icon: '📊', label: 'Vollständige Analytics', desc: 'Pageviews, Geräte, Referrer, Fehler-Logs' },
  { icon: '💰', label: 'AdSense-Widget', desc: 'Einnahmen der letzten 30 Tage im Dashboard' },
  { icon: '🔍', label: 'GSC-Widget', desc: 'Klicks & Keywords aus Google Search Console' },
  { icon: '🌐', label: 'Unbegrenzte Websites', desc: 'Statt 3 im Free-Plan' },
  { icon: '👥', label: 'Team (bis 5)', desc: 'Teamkollegen einladen' },
]

export default function UpgradePage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 680 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, border: '1px solid rgba(91,106,246,0.3)', background: 'rgba(91,106,246,0.08)', fontSize: 13, fontWeight: 600, color: '#a4bbfd', marginBottom: 20 }}>
            ⭐ SiteControl Pro
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(28px, 5vw, 42px)', letterSpacing: '-0.02em', marginBottom: 14 }}>
            Schalte alle Features frei
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 17, lineHeight: 1.6 }}>
            14 Tage kostenlos testen. Danach €19/Monat – jederzeit kündbar.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 40 }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{ display: 'flex', gap: 14, padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Card */}
        <div style={{ background: 'rgba(91,106,246,0.06)', border: '2px solid rgba(91,106,246,0.3)', borderRadius: 20, padding: '36px 40px', textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#a4bbfd', marginBottom: 8 }}>SiteControl Pro</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em' }}>€19</span>
            <span style={{ color: 'var(--text3)', fontSize: 15 }}>pro Monat</span>
          </div>
          <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 28 }}>oder €190/Jahr — 2 Monate kostenlos</div>

          {/* CTA – in Produktion: Stripe Checkout */}
          <a href="mailto:hello@sitecontrol.app?subject=Pro%20Upgrade" style={{
            display: 'block', padding: '14px 32px', borderRadius: 12,
            background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff',
            textDecoration: 'none', fontWeight: 700, fontSize: 17,
            boxShadow: '0 8px 24px rgba(91,106,246,0.4)', marginBottom: 14,
          }}>
            14 Tage kostenlos starten →
          </a>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Keine Kreditkarte für Testzeitraum nötig</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/dashboard" style={{ color: 'var(--text3)', textDecoration: 'none', fontSize: 14 }}>← Zurück zum Dashboard</Link>
        </div>
      </div>
    </div>
  )
}

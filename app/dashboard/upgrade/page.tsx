'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  FileText, Layers, LifeBuoy, BarChart2, DollarSign,
  Search, Globe, Users, Check, Star, Zap, Shield, ArrowRight, Loader
} from 'lucide-react'

const FEATURES = [
  { Icon: Globe,      label: 'Unbegrenzte Websites',    desc: 'Statt 3 im Free-Plan – verwalte so viele Sites du willst.' },
  { Icon: FileText,   label: 'Blog-Verwaltung',          desc: 'Posts für alle Websites – mehrsprachig & mit SEO-Feldern.' },
  { Icon: Layers,     label: 'Changelog-System',         desc: 'Versionierte Einträge mit Feature/Fix/Breaking-Tags.' },
  { Icon: LifeBuoy,   label: 'Support-Tickets',          desc: 'Kundennachrichten direkt im Dashboard empfangen & beantworten.' },
  { Icon: BarChart2,  label: 'Vollständige Analytics',   desc: 'Pageviews, Geräte, Referrer, Fehler-Logs, Live-Counter.' },
  { Icon: DollarSign, label: 'AdSense-Widget',           desc: 'Einnahmen der letzten 30 Tage direkt im Dashboard.' },
  { Icon: Search,     label: 'GSC-Widget',               desc: 'Klicks & Keywords aus Google Search Console.' },
  { Icon: Users,      label: 'Team (bis 5 Personen)',    desc: 'Teamkollegen einladen mit verschiedenen Rollen.' },
  { Icon: Shield,     label: 'Prioritäts-Support',       desc: 'Direkte Hilfe bei Problemen – schnelle Antwortzeiten.' },
  { Icon: Zap,        label: 'Früher Zugang',            desc: 'Neue Features zuerst testen und mitgestalten.' },
]

const FREE_FEATURES = ['Bis zu 3 Websites', 'Todos & Pinboard', 'Basic Analytics', 'Notifications']
const PRO_FEATURES  = ['Alles aus Free', 'Unbegrenzte Websites', 'Blog, Changelog, Support', 'Vollständige Analytics', 'AdSense & GSC Widgets', 'Team bis 5 Personen', 'Prioritäts-Support']

export default function UpgradePage() {
  const [loading, setLoading] = useState<'month' | 'year' | null>(null)
  const [error, setError] = useState('')

  async function startCheckout(interval: 'month' | 'year') {
    setLoading(interval)
    setError('')
    try {
      const r = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Fehler beim Erstellen der Checkout-Session')
      window.location.href = d.url
    } catch (err: any) {
      setError(err.message)
      setLoading(null)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 28px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 100, border: '1px solid rgba(91,106,246,0.35)', background: 'rgba(91,106,246,0.08)', fontSize: 13, fontWeight: 700, color: '#a4bbfd', marginBottom: 22 }}>
            <Star size={13} fill="#a4bbfd" color="#a4bbfd" /> SiteControl Pro
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(30px, 5vw, 46px)', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1 }}>
            Schalte alle Features frei
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 18, lineHeight: 1.65, maxWidth: 540, margin: '0 auto' }}>
            14 Tage kostenlos testen — keine Kreditkarte nötig. Danach monatlich oder jährlich.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 52 }}>

          {/* Free */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, color: 'var(--text2)' }}>Free</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em' }}>€0</span>
              <span style={{ color: 'var(--text3)', fontSize: 14 }}>/ Monat</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 24 }}>Für immer kostenlos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {FREE_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                  <Check size={13} color="#6b7280" />
                  {f}
                </div>
              ))}
            </div>
            <div style={{ padding: '10px', borderRadius: 9, border: '1px solid var(--border)', textAlign: 'center', fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>
              Aktueller Plan
            </div>
          </div>

          {/* Monthly */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 28, position: 'relative' }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Pro Monatlich</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em' }}>€19</span>
              <span style={{ color: 'var(--text3)', fontSize: 14 }}>/ Monat</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 24 }}>Monatlich kündbar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {PRO_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text1)' }}>
                  <Check size={13} color="#22c55e" />
                  {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => startCheckout('month')}
              disabled={!!loading}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer',
                background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                opacity: loading === 'year' ? 0.5 : 1,
              }}
            >
              {loading === 'month' ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Weiterleitung…</> : <>14 Tage gratis testen <ArrowRight size={14} /></>}
            </button>
          </div>

          {/* Yearly — highlighted */}
          <div style={{ background: 'rgba(91,106,246,0.07)', border: '2px solid rgba(91,106,246,0.4)', borderRadius: 18, padding: 28, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #5b6af6, #a78bfa)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap' }}>
              ⭐ Empfohlen – 2 Monate gratis
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4, color: '#a4bbfd' }}>Pro Jährlich</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em' }}>€15,83</span>
              <span style={{ color: 'var(--text3)', fontSize: 14 }}>/ Monat</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>€190 / Jahr — statt €228</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 5, background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: 11, fontWeight: 700, marginBottom: 20 }}>
              Du sparst €38
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {PRO_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text1)' }}>
                  <Check size={13} color="#22c55e" />
                  {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => startCheckout('year')}
              disabled={!!loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer',
                background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                boxShadow: '0 8px 24px rgba(91,106,246,0.4)',
                opacity: loading === 'month' ? 0.5 : 1,
              }}
            >
              {loading === 'year' ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Weiterleitung…</> : <>14 Tage gratis testen <ArrowRight size={15} /></>}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Features Grid */}
        <div style={{ marginBottom: 52 }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 24, textAlign: 'center' }}>Was du mit Pro bekommst</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {FEATURES.map(({ Icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', gap: 14, padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(91,106,246,0.1)', border: '1px solid rgba(91,106,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color="#7e93fb" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, marginBottom: 32 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 24 }}>Häufige Fragen</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { q: 'Brauche ich eine Kreditkarte für den Testzeitraum?', a: 'Nein. Du kannst 14 Tage lang komplett kostenlos testen. Eine Zahlungsmethode wird erst am Ende der Testphase benötigt.' },
              { q: 'Kann ich jederzeit kündigen?', a: 'Ja. Du kannst dein Abo jederzeit über das Kundenportal kündigen. Bis zum Ende des bezahlten Zeitraums behältst du alle Pro-Features.' },
              { q: 'Was passiert nach dem Testzeitraum?', a: 'Du wirst per E-Mail erinnert. Falls du nicht kündigst, startet das Abo automatisch zum gewählten Preis. Keine Überraschungen.' },
              { q: 'Kann ich von monatlich auf jährlich wechseln?', a: 'Ja, jederzeit im Kundenportal. Der Wechsel wird anteilig verrechnet.' },
              { q: 'Welche Zahlungsmethoden werden akzeptiert?', a: 'Kreditkarte (Visa, Mastercard, Amex), SEPA-Lastschrift und weitere über Stripe.' },
            ].map(({ q, a }) => (
              <div key={q} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{q}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
            Sicheres Bezahlen über Stripe · DSGVO-konform · Jederzeit kündbar
          </p>
          <Link href="/dashboard" style={{ color: 'var(--text3)', textDecoration: 'none', fontSize: 14 }}>← Zurück zum Dashboard</Link>
        </div>

      </div>
    </div>
  )
}

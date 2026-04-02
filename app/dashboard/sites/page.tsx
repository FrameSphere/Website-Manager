'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Globe, BarChart2, FileText, Plus, X, Check, Copy, RefreshCw,
  ExternalLink, Trash2, Edit2, Shield, ShieldCheck, Code, Settings,
  AlertTriangle, ChevronRight, Zap, StickyNote, Clock,
} from 'lucide-react'

const COLORS = ['#5b6af6','#22c55e','#f59e0b','#ef4444','#a78bfa','#60a5fa','#f97316','#34d399']
const STATUS_OPTS = [
  { val: 'active',  label: 'Aktiv',    color: '#22c55e' },
  { val: 'paused',  label: 'Pausiert', color: '#f59e0b' },
  { val: 'error',   label: 'Fehler',   color: '#ef4444' },
]

type Tab = 'overview' | 'verify' | 'script' | 'notes' | 'history' | 'edit' | 'danger'

interface StatusHistory {
  id: string; old_status: string; new_status: string; created_at: string
}

interface Site {
  id: string; name: string; url: string; slug: string
  color: string; status: string; description: string
  notes: string; verified: boolean; verified_at: string | null
  created_at: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://site-control-nine.vercel.app'

function CopyBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 6 }}>{label}</div>
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
        padding: '10px 12px', fontFamily: 'Space Mono, monospace', fontSize: 12,
        color: 'var(--text2)', wordBreak: 'break-all', position: 'relative',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <span style={{ flex: 1, lineHeight: 1.6 }}>{value}</span>
        <button onClick={copy} style={{
          flexShrink: 0, padding: '4px 8px', borderRadius: 6,
          border: '1px solid var(--border)', background: copied ? 'rgba(34,197,94,0.1)' : 'var(--surface)',
          color: copied ? '#22c55e' : 'var(--text3)', cursor: 'pointer', fontSize: 11,
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
          transition: 'all .15s',
        }}>
          {copied ? <><Check size={11} /> Kopiert</> : <><Copy size={11} /> Kopieren</>}
        </button>
      </div>
    </div>
  )
}

function SiteDetail({ site, onUpdate, onDelete, onClose }: {
  site: Site
  onUpdate: (s: Site) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>('overview')
  const [edit, setEdit] = useState({ name: site.name, url: site.url, color: site.color, description: site.description || '', status: site.status })
  const [notes, setNotes] = useState(site.notes || '')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [history, setHistory] = useState<StatusHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [stats, setStats] = useState<{ views: number; errors: number } | null>(null)

  useEffect(() => {
    setEdit({ name: site.name, url: site.url, color: site.color, description: site.description || '', status: site.status })
    setNotes(site.notes || '')
    setTab('overview')
    setVerifyMsg(null)
    setHistory([])
    fetch(`/api/analytics?days=7&site_id=${site.id}`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setStats({
            views: d.filter((e: any) => e.event_type === 'pageview').reduce((s: number, e: any) => s + e.value, 0),
            errors: d.filter((e: any) => e.event_type === 'error').length,
          })
        }
      }).catch(() => {})
  }, [site.id])

  async function loadHistory() {
    setHistoryLoading(true)
    const r = await fetch(`/api/sites/history?site_id=${site.id}`)
    const d = await r.json()
    setHistory(Array.isArray(d) ? d : [])
    setHistoryLoading(false)
  }

  async function saveNotes() {
    setNotesSaving(true)
    const r = await fetch('/api/sites', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: site.id, notes }) })
    const d = await r.json()
    if (r.ok) { onUpdate(d); setNotesSaved(true); setTimeout(() => setNotesSaved(false), 2000) }
    setNotesSaving(false)
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const r = await fetch('/api/sites', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: site.id, ...edit }),
    })
    const d = await r.json()
    if (r.ok) { onUpdate(d) }
    setSaving(false)
  }

  async function verify() {
    setVerifying(true)
    setVerifyMsg(null)
    const r = await fetch('/api/sites/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: site.id }),
    })
    const d = await r.json()
    setVerifyMsg({ ok: d.verified, text: d.message })
    setVerifying(false)
  }

  async function deleteSite() {
    const r = await fetch(`/api/sites?id=${site.id}`, { method: 'DELETE' })
    if (r.ok) onDelete(site.id)
  }

  const statusColor = STATUS_OPTS.find(o => o.val === site.status)?.color || '#22c55e'
  const metaTag = `<meta name="sitecontrol-site-id" content="${site.id}">`
  const scriptTag = `<script src="${APP_URL}/api/tracker.js?id=${site.id}" defer></script>`

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
    background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)',
    outline: 'none', fontFamily: 'inherit',
  }

  const TABS: { id: Tab; label: string; Icon: any }[] = [
    { id: 'overview', label: 'Übersicht',  Icon: Globe },
    { id: 'verify',   label: site.verified ? 'Verifiziert ✓' : 'Verifizieren', Icon: site.verified ? ShieldCheck : Shield },
    { id: 'script',   label: 'Tracking',   Icon: Code },
    { id: 'notes',    label: 'Notizen',    Icon: StickyNote },
    { id: 'history',  label: 'Verlauf',    Icon: Clock },
    { id: 'edit',     label: 'Bearbeiten', Icon: Edit2 },
    { id: 'danger',   label: 'Löschen',    Icon: Trash2 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: (site.color || '#5b6af6') + '22',
              border: `1.5px solid ${site.color || '#5b6af6'}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Globe size={18} color={site.color || '#5b6af6'} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{site.name}</div>
              <a href={site.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none', fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                {site.url.replace(/^https?:\/\//, '')} <ExternalLink size={10} />
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: statusColor + '15', border: `1px solid ${statusColor}30`, color: statusColor,
            }}>{STATUS_OPTS.find(o => o.val === site.status)?.label || 'Aktiv'}</span>
            <button onClick={onClose} style={{ padding: 6, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', display: 'flex' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px',
              borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
              background: tab === id ? 'var(--bg)' : 'transparent',
              color: tab === id ? (id === 'danger' ? '#ef4444' : '#7e93fb') : 'var(--text3)',
              fontWeight: tab === id ? 700 : 500, fontSize: 12, fontFamily: 'inherit',
              borderBottom: tab === id ? '2px solid ' + (id === 'danger' ? '#ef4444' : '#5b6af6') : '2px solid transparent',
            }}>
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Pageviews (7T)', val: stats?.views ?? '—', color: '#5b6af6' },
                { label: 'Fehler (7T)',    val: stats?.errors ?? '—', color: '#ef4444' },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{k.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: k.color }}>{k.val}</div>
                </div>
              ))}
            </div>

            {site.description && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                {site.description}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Schnell-Links</div>
              {[
                { href: `/dashboard/analytics?site=${site.id}`, Icon: BarChart2, label: 'Analytics öffnen', color: '#5b6af6' },
                { href: `/dashboard/blog?site=${site.id}`,      Icon: FileText,  label: 'Blog-Posts verwalten', color: '#22c55e' },
                { href: `/dashboard/todos?site=${site.id}`,     Icon: Zap,       label: 'Todos dieser Site', color: '#f59e0b' },
                { href: site.url, Icon: ExternalLink, label: 'Website öffnen', color: 'var(--text2)', target: '_blank' },
              ].map(({ href, Icon, label, color, target }) => (
                <a key={href} href={href} target={target as any} rel={target ? 'noopener noreferrer' : undefined} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)',
                  textDecoration: 'none', transition: 'border-color .12s',
                }}>
                  <Icon size={14} color={color} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', flex: 1 }}>{label}</span>
                  <ChevronRight size={12} color="var(--text3)" />
                </a>
              ))}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
              Site-ID: {site.id}
            </div>
          </div>
        )}

        {/* VERIFY */}
        {tab === 'verify' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'rgba(91,106,246,0.06)', border: '1px solid rgba(91,106,246,0.2)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ShieldCheck size={16} color="#7e93fb" />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#a4bbfd' }}>Website-Eigentümerschaft bestätigen</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                Füge den folgenden Meta-Tag in den <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 4 }}>&lt;head&gt;</code> deiner Website ein.
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#5b6af6', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Meta-Tag in &lt;head&gt; einfügen</span>
              </div>
              <CopyBlock label="Meta-Tag" value={metaTag} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#5b6af6', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Verifizierung prüfen</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
                Nachdem du den Tag gespeichert und deployed hast, klicke auf "Jetzt prüfen".
              </p>
              <button onClick={verify} disabled={verifying} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 9,
                background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff',
                border: 'none', cursor: verifying ? 'wait' : 'pointer', fontWeight: 700, fontSize: 14,
                fontFamily: 'inherit', opacity: verifying ? 0.7 : 1,
              }}>
                <RefreshCw size={14} style={{ animation: verifying ? 'spin 1s linear infinite' : 'none' }} />
                {verifying ? 'Wird geprüft…' : 'Jetzt prüfen'}
              </button>

              {verifyMsg && (
                <div style={{
                  marginTop: 14, padding: '12px 16px', borderRadius: 9,
                  background: verifyMsg.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${verifyMsg.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  color: verifyMsg.ok ? '#22c55e' : '#ef4444',
                  fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                  {verifyMsg.ok ? <Check size={14} style={{ marginTop: 1, flexShrink: 0 }} /> : <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />}
                  {verifyMsg.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCRIPT / TRACKING */}
        {tab === 'script' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Code size={15} color="#22c55e" />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#22c55e' }}>Tracking-Script</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                Kein Cookie, DSGVO-freundlich. Trackt Pageviews, SPA-Navigation, Outbound-Links und JS-Fehler automatisch.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Script-Tag einbinden</div>
              <CopyBlock label="Tracking Script" value={scriptTag} />
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Was wird getrackt?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Pageviews', 'Jeder Seitenaufruf inkl. SPA-Routen'],
                  ['Gerät', 'Mobile, Tablet oder Desktop'],
                  ['Referrer', 'Woher kommen deine Besucher'],
                  ['Outbound Links', 'Klicks auf externe Links'],
                  ['JS Fehler', 'Frontend-Fehler werden automatisch geloggt'],
                  ['Land', 'Via Vercel Geo-IP (anonym)'],
                ].map(([label, desc]) => (
                  <div key={label} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                    <Check size={13} color="#22c55e" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 600 }}>{label}</span>
                      <span style={{ color: 'var(--text3)' }}> — {desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Direkt-Endpunkt</div>
              <CopyBlock label="POST Endpoint" value={`${APP_URL}/api/track`} />
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', lineHeight: 1.7 }}>
                {`{ "site_id": "${site.id}", "event_type": "pageview", "path": "/", "referrer": null, "device": "desktop" }`}
              </div>
            </div>
          </div>
        )}

        {/* NOTES */}
        {tab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
              Private Notizen zu dieser Website – nur du siehst das.
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Zugangsdaten, Todos, Ideen, Deployment-Infos…"
              style={{
                flex: 1, minHeight: 280, padding: '12px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)',
                outline: 'none', fontFamily: 'Space Mono, monospace', resize: 'vertical', lineHeight: 1.7,
              }}
            />
            <button onClick={saveNotes} disabled={notesSaving} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px',
              borderRadius: 9, border: 'none', cursor: notesSaving ? 'wait' : 'pointer',
              fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
              background: notesSaved ? '#22c55e' : 'linear-gradient(135deg, #5b6af6, #4346eb)',
              color: '#fff', transition: 'background .3s', opacity: notesSaving ? 0.7 : 1,
            }}>
              {notesSaved ? <><Check size={14} /> Gespeichert</> : notesSaving ? 'Speichern…' : <><Check size={14} /> Notizen speichern</>}
            </button>
          </div>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Status-Änderungen dieser Website</div>
              <button onClick={loadHistory} disabled={historyLoading} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text2)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                <RefreshCw size={12} style={{ animation: historyLoading ? 'spin 1s linear infinite' : 'none' }} /> Laden
              </button>
            </div>

            {history.length === 0 && !historyLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                <Clock size={28} style={{ display: 'block', margin: '0 auto 10px' }} />
                <div style={{ fontSize: 13 }}>Noch keine Status-Änderungen aufgezeichnet.</div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                {history.map((h, i) => {
                  const oldColor = STATUS_OPTS.find(o => o.val === h.old_status)?.color || '#6b7280'
                  const newColor = STATUS_OPTS.find(o => o.val === h.new_status)?.color || '#22c55e'
                  const oldLabel = STATUS_OPTS.find(o => o.val === h.old_status)?.label || h.old_status
                  const newLabel = STATUS_OPTS.find(o => o.val === h.new_status)?.label || h.new_status
                  return (
                    <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <Clock size={12} color="var(--text3)" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: oldColor + '18', color: oldColor, fontWeight: 700 }}>{oldLabel}</span>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>→</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: newColor + '18', color: newColor, fontWeight: 700 }}>{newLabel}</span>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>
                        {new Date(h.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {site.verified && site.verified_at && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10 }}>
                <ShieldCheck size={14} color="#22c55e" />
                <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>Verifiziert am {new Date(site.verified_at).toLocaleDateString('de-DE')}</span>
              </div>
            )}
          </div>
        )}

        {/* EDIT */}
        {tab === 'edit' && (
          <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Name *</label>
              <input style={inp} value={edit.name} onChange={e => setEdit(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>URL *</label>
              <input style={inp} type="url" value={edit.url} onChange={e => setEdit(f => ({ ...f, url: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Beschreibung</label>
              <textarea style={{ ...inp, height: 80, resize: 'none' } as any} value={edit.description} onChange={e => setEdit(f => ({ ...f, description: e.target.value }))} placeholder="Kurze Beschreibung…" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Status</label>
              <select style={inp} value={edit.status} onChange={e => setEdit(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Farbe</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setEdit(f => ({ ...f, color: c }))}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: edit.color === c ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer', outline: 'none', transform: edit.color === c ? 'scale(1.2)' : 'scale(1)', transition: 'transform .1s' }} />
                ))}
              </div>
            </div>
            <button type="submit" disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px',
              borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)',
              color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
              opacity: saving ? 0.7 : 1,
            }}>
              <Check size={14} />
              {saving ? 'Speichern…' : 'Änderungen speichern'}
            </button>
          </form>
        )}

        {/* DANGER */}
        {tab === 'danger' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <AlertTriangle size={15} color="#ef4444" />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#ef4444' }}>Gefahrenzone</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                Das Löschen dieser Website entfernt alle zugehörigen Daten. Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>

            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
                borderRadius: 9, border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.06)', color: '#ef4444',
                cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
              }}>
                <Trash2 size={14} /> Website löschen
              </button>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Bist du sicher?</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
                  <strong>{site.name}</strong> wird permanent gelöscht.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                    Abbrechen
                  </button>
                  <button onClick={deleteSite} style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
                    Endgültig löschen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Site | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addStep, setAddStep] = useState<1 | 2>(1)
  const [newSite, setNewSite] = useState<Site | null>(null)
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [verified, setVerified] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', color: '#5b6af6', description: '' })
  const [search, setSearch] = useState('')

  useEffect(() => { loadSites() }, [])

  async function loadSites() {
    setLoading(true)
    const r = await fetch('/api/sites')
    const d = await r.json()
    setSites(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  function openAdd() {
    setAddStep(1); setNewSite(null); setVerifyMsg(null)
    setVerified(false); setAddError('')
    setForm({ name: '', url: '', color: '#5b6af6', description: '' })
    setShowAdd(true)
  }

  function closeAdd() {
    setShowAdd(false)
    if (newSite && !verified) {
      setSites(s => s.some(x => x.id === newSite.id) ? s : [...s, newSite])
    }
  }

  async function addSite(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setAddError('')
    const r = await fetch('/api/sites', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    if (!r.ok) { setAddError(d.error); setSaving(false); return }
    setSites(s => [...s, d])
    setNewSite(d); setAddStep(2); setSaving(false)
  }

  async function verifyNewSite() {
    if (!newSite) return
    setVerifying(true); setVerifyMsg(null)
    const r = await fetch('/api/sites/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: newSite.id }),
    })
    const d = await r.json()
    setVerifyMsg({ ok: d.verified, text: d.message })
    if (d.verified) setVerified(true)
    setVerifying(false)
  }

  function finishAdd() {
    if (newSite) setSelected(newSite)
    setShowAdd(false)
  }

  function handleUpdate(updated: Site) {
    setSites(s => s.map(x => x.id === updated.id ? updated : x))
    setSelected(updated)
  }

  function handleDelete(id: string) {
    setSites(s => s.filter(x => x.id !== id))
    setSelected(null)
  }

  const filtered = sites.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.url.toLowerCase().includes(search.toLowerCase())
  )

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
    background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)',
    outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* LEFT: Site List */}
      <div style={{ width: selected ? 300 : '100%', flexShrink: 0, borderRight: selected ? '1px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width .2s ease' }}>

        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} color="var(--text2)" />
              <h1 style={{ fontWeight: 900, fontSize: 18 }}>Websites</h1>
            </div>
            <button onClick={openAdd} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
              background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff',
              border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
            }}>
              <Plus size={14} /> Hinzufügen
            </button>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Website suchen…" style={{ ...inp, padding: '8px 12px' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {loading ? (
            [1,2,3].map(i => <div key={i} style={{ height: 72, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 8 }} />)
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
              <Globe size={36} style={{ display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>
                {search ? 'Keine Ergebnisse' : 'Noch keine Websites'}
              </div>
              {!search && (
                <button onClick={openAdd} style={{ marginTop: 12, padding: '9px 20px', borderRadius: 8, background: '#5b6af6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: 13 }}>
                  + Website hinzufügen
                </button>
              )}
            </div>
          ) : filtered.map(site => {
            const isSelected = selected?.id === site.id
            const statusColor = STATUS_OPTS.find(o => o.val === site.status)?.color || '#22c55e'
            return (
              <div key={site.id} onClick={() => setSelected(isSelected ? null : site)} style={{
                padding: '12px 14px', borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                background: isSelected ? 'rgba(91,106,246,0.08)' : 'var(--surface)',
                border: isSelected ? '1px solid rgba(91,106,246,0.3)' : '1px solid var(--border)',
                transition: 'all .12s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: (site.color || '#5b6af6') + '22',
                    border: `1px solid ${site.color || '#5b6af6'}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Globe size={14} color={site.color || '#5b6af6'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* FIX: title prop not valid on Lucide icons — wrap in span instead */}
                    <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {site.name}
                      {site.verified && (
                        <span title="Verifiziert" style={{ display: 'flex', alignItems: 'center' }}>
                          <ShieldCheck size={10} color="#22c55e" />
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {site.url.replace(/^https?:\/\//, '')}
                    </div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
            {sites.filter(s => s.status === 'active').length} aktiv · {sites.filter(s => s.status === 'error').length} Fehler · {sites.length} gesamt
          </div>
        </div>
      </div>

      {/* RIGHT: Detail Panel */}
      {selected && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <SiteDetail site={selected} onUpdate={handleUpdate} onDelete={handleDelete} onClose={() => setSelected(null)} />
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) closeAdd() }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 500, overflow: 'hidden' }}>

            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontWeight: 800, fontSize: 17 }}>{addStep === 1 ? 'Website hinzufügen' : 'Website verifizieren'}</h2>
                <button onClick={closeAdd} style={{ padding: 6, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}><X size={14} /></button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', background: addStep > s ? '#22c55e' : addStep === s ? '#5b6af6' : 'var(--bg)', border: `2px solid ${addStep > s ? '#22c55e' : addStep === s ? '#5b6af6' : 'var(--border)'}`, color: addStep >= s ? '#fff' : 'var(--text3)' }}>
                      {addStep > s ? <Check size={12} /> : s}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: addStep === s ? 'var(--text1)' : 'var(--text3)' }}>{s === 1 ? 'Details' : 'Verifizieren'}</span>
                    {s < 2 && <div style={{ width: 24, height: 2, background: addStep > s ? '#22c55e' : 'var(--border)', borderRadius: 1 }} />}
                  </div>
                ))}
              </div>
            </div>

            {addStep === 1 && (
              <form onSubmit={addSite} style={{ padding: '0 24px 24px' }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Name *</label>
                  <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Mein Blog" required />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>URL *</label>
                  <input style={inp} type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://meinblog.de" required />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Beschreibung</label>
                  <input style={inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional…" />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Farbe</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer', outline: 'none', transform: form.color === c ? 'scale(1.2)' : 'scale(1)', transition: 'transform .1s' }} />
                    ))}
                  </div>
                </div>
                {addError && <div style={{ padding: '9px 13px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{addError}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={closeAdd} style={{ flex: 1, padding: 11, borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Abbrechen</button>
                  <button type="submit" disabled={saving} style={{ flex: 1, padding: 11, borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Erstellen…' : <> Weiter <ChevronRight size={14} /></>}
                  </button>
                </div>
              </form>
            )}

            {addStep === 2 && newSite && (
              <div style={{ padding: '0 24px 24px' }}>
                {verified ? (
                  <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <ShieldCheck size={28} color="#22c55e" />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Verifiziert!</div>
                    <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>{newSite.name} wurde erfolgreich bestätigt.</p>
                    <button onClick={finishAdd} style={{ padding: '11px 28px', borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
                      Zum Dashboard →
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ background: 'rgba(91,106,246,0.06)', border: '1px solid rgba(91,106,246,0.2)', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                      <strong style={{ color: '#a4bbfd' }}>Nur einmal nötig:</strong> Meta-Tag in den <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>&lt;head&gt;</code> der Startseite, Tracking-Script einmalig ins Layout.
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#5b6af6', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Meta-Tag in &lt;head&gt;</span>
                      </div>
                      <CopyBlock label="Homepage &lt;head&gt;" value={`<meta name="sitecontrol-site-id" content="${newSite.id}">`} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#5b6af6', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Tracking-Script ins Layout</span>
                      </div>
                      <CopyBlock label="Layout / _document" value={`<script src="${APP_URL}/api/tracker.js?id=${newSite.id}" defer></script>`} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#5b6af6', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Website bestätigen</span>
                    </div>
                    <button onClick={verifyNewSite} disabled={verifying} style={{ width: '100%', padding: '12px', borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: verifying ? 'wait' : 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: verifying ? 0.7 : 1 }}>
                      <RefreshCw size={14} style={{ animation: verifying ? 'spin 1s linear infinite' : 'none' }} />
                      {verifying ? 'Wird geprüft…' : 'Jetzt bestätigen'}
                    </button>
                    {verifyMsg && !verifyMsg.ok && (
                      <div style={{ marginTop: 12, padding: '11px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 13, display: 'flex', gap: 8 }}>
                        <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                        {verifyMsg.text}
                      </div>
                    )}
                    <button onClick={finishAdd} style={{ width: '100%', marginTop: 10, padding: '10px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>
                      Jetzt überspringen – später verifizieren
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

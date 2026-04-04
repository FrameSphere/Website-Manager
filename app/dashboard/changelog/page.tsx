'use client'
import { useState, useEffect } from 'react'
import { Layers, Star, Settings } from 'lucide-react'

interface Entry { id: string; version: string; title: string; description: string; type: string; published: boolean; created_at: string; sites?: { name: string; color: string } }
interface Site { id: string; name: string; color: string }

const TYPE_COLORS: Record<string, string> = { feature: '#5b6af6', fix: '#22c55e', improvement: '#f59e0b', breaking: '#ef4444' }
const TYPE_LABELS: Record<string, string> = { feature: 'Feature', fix: 'Fix', improvement: 'Verbesserung', breaking: 'Breaking' }

export default function ChangelogPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ site_id: '', version: '', title: '', description: '', type: 'feature', published: false })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [er, sr] = await Promise.all([fetch('/api/changelog'), fetch('/api/sites')])
    if (er.status === 403) { setIsPro(false); setLoading(false); return }
    const [ed, sd] = await Promise.all([er.json(), sr.json()])
    setEntries(Array.isArray(ed) ? ed : [])
    setSites(Array.isArray(sd) ? sd : [])
    setLoading(false)
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const r = await fetch('/api/changelog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json()
    if (r.ok) { setEntries(prev => [d, ...prev]); setShowAdd(false); setForm({ site_id: '', version: '', title: '', description: '', type: 'feature', published: false }) }
    setSaving(false)
  }

  async function togglePublished(entry: Entry) {
    const r = await fetch('/api/changelog', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: entry.id, published: !entry.published }) })
    const d = await r.json()
    if (r.ok) setEntries(prev => prev.map(x => x.id === entry.id ? d : x))
  }

  async function deleteEntry(id: string) {
    if (!confirm('Eintrag löschen?')) return
    await fetch(`/api/changelog?id=${id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(x => x.id !== id))
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: 9, fontSize: 14, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)', outline: 'none', fontFamily: 'inherit' }

  if (!isPro) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <Layers size={48} color="var(--text3)" style={{ display: 'block', margin: '0 auto 16px' }} />
        <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Changelog ist Pro</h2>
        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>Versionierte Einträge, Widgets und SSR-Seiten.</p>
        <a href="/dashboard/upgrade" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
          <Star size={14} fill="#fff" color="#fff" /> Jetzt upgraden
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 22, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><Layers size={20} /> Changelog</h1>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>{entries.filter(e => e.published).length} live · {entries.filter(e => !e.published).length} Entwürfe</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/dashboard/embed?feature=changelog" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, border: '1px solid rgba(245,158,11,.3)', background: 'rgba(245,158,11,.07)', color: '#f59e0b', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
            <Settings size={13} /> Changelog einbinden
          </a>
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
            + Neuer Eintrag
          </button>
        </div>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 32, width: '100%', maxWidth: 480 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 24 }}>Neuer Changelog-Eintrag</h2>
            <form onSubmit={addEntry}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Website *</label>
                  <select style={inputStyle} value={form.site_id} onChange={e => setForm(f => ({ ...f, site_id: e.target.value }))} required>
                    <option value="">Wählen…</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Version *</label>
                  <input style={inputStyle} value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="v1.2.0" required />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Titel *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Was hat sich geändert?" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Typ</label>
                  <select style={inputStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
                    <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                    Sofort veröffentlichen
                  </label>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Beschreibung</label>
                <textarea style={{ ...inputStyle, height: 80, resize: 'none' } as React.CSSProperties} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details zu dieser Version…" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 11, borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Abbrechen</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: 11, borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Speichern…' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} />)}
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <Layers size={40} color="var(--text3)" style={{ display: 'block', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Noch keine Einträge</div>
          <button onClick={() => setShowAdd(true)} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 9, background: '#5b6af6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+ Ersten Eintrag erstellen</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(entry => (
            <div key={entry.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: (TYPE_COLORS[entry.type] || '#6b7280') + '18', border: `1px solid ${TYPE_COLORS[entry.type] || '#6b7280'}30`, color: TYPE_COLORS[entry.type] || '#6b7280', flexShrink: 0, marginTop: 2, fontFamily: 'Space Mono, monospace' }}>
                {TYPE_LABELS[entry.type] || entry.type}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{entry.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>v{entry.version}</span>
                  {entry.sites && <span style={{ fontSize: 11, color: entry.sites.color }}>{entry.sites.name}</span>}
                </div>
                {entry.description && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{entry.description}</p>}
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, fontFamily: 'Space Mono, monospace' }}>{new Date(entry.created_at).toLocaleDateString('de-DE')}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => togglePublished(entry)} style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${entry.published ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, background: entry.published ? 'rgba(34,197,94,0.07)' : 'transparent', color: entry.published ? '#22c55e' : 'var(--text3)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                  {entry.published ? '✓ Live' : '↑ Veröffentlichen'}
                </button>
                <button onClick={() => deleteEntry(entry.id)} style={{ padding: '6px 8px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

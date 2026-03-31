'use client'
import { useState, useEffect } from 'react'
import { Globe, BarChart2, FileText } from 'lucide-react'
import type { Metadata } from 'next'

const COLORS = ['#5b6af6','#22c55e','#f59e0b','#ef4444','#a78bfa','#60a5fa','#f97316','#34d399']
const STATUS_OPTS = [{ val: 'active', label: 'Aktiv', color: '#22c55e' }, { val: 'paused', label: 'Pausiert', color: '#f59e0b' }, { val: 'error', label: 'Fehler', color: '#ef4444' }]

interface Site { id: string; name: string; url: string; slug: string; color: string; status: string; description: string }

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', url: '', color: '#5b6af6', description: '' })

  useEffect(() => { loadSites() }, [])

  async function loadSites() {
    setLoading(true)
    const r = await fetch('/api/sites')
    const d = await r.json()
    setSites(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function addSite(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const r = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    if (!r.ok) { setError(d.error); setSaving(false); return }
    setSites(s => [...s, d])
    setForm({ name: '', url: '', color: '#5b6af6', description: '' })
    setShowAdd(false)
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/sites', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setSites(s => s.map(x => x.id === id ? { ...x, status } : x))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 9, fontSize: 14,
    background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)',
    outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 22, marginBottom: 4, display:'flex', alignItems:'center', gap:8 }}><Globe size={20} /> Websites</h1>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>{sites.length} Website{sites.length !== 1 ? 's' : ''} verwaltet</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          padding: '10px 20px', borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)',
          color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(91,106,246,0.3)',
        }}>+ Website hinzufügen</button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 32, width: '100%', maxWidth: 460 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 24 }}>Website hinzufügen</h2>
            <form onSubmit={addSite}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Mein Blog" required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>URL *</label>
                <input style={inputStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://meinblog.de" required type="url" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Beschreibung</label>
                <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kurze Beschreibung…" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Farbe</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer', outline: 'none', transition: 'transform .1s', transform: form.color === c ? 'scale(1.15)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
              {error && <div style={{ padding: '9px 13px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 11, borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Abbrechen</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: 11, borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Speichern…' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 160, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)' }} className="skeleton" />)}
        </div>
      ) : sites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)' }}>
          <Globe size={48} color="var(--text3)" style={{ marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text2)', marginBottom: 8 }}>Noch keine Websites</h2>
          <p style={{ fontSize: 14, marginBottom: 24 }}>Füge deine erste Website hinzu, um loszulegen.</p>
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 24px', borderRadius: 9, background: '#5b6af6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+ Website hinzufügen</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {sites.map(site => (
            <div key={site.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 4, background: site.color || '#5b6af6' }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: (site.color || '#5b6af6') + '22', border: `1px solid ${site.color || '#5b6af6'}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Globe size={16} color={site.color || '#5b6af6'} /></div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{site.name}</div>
                      <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', textDecoration: 'none' }}>
                        {site.url.replace('https://', '')} ↗
                      </a>
                    </div>
                  </div>
                  <select value={site.status} onChange={e => updateStatus(site.id, e.target.value)}
                    style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: STATUS_OPTS.find(o => o.val === site.status)?.color || 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {STATUS_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                  </select>
                </div>
                {site.description && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{site.description}</p>}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                  <a href={`/dashboard/analytics?site=${site.id}`} style={{ flex: 1, textAlign: 'center', padding: '7px', borderRadius: 7, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}><BarChart2 size={12} /> Analytics</a>
                  <a href={`/dashboard/blog?site=${site.id}`} style={{ flex: 1, textAlign: 'center', padding: '7px', borderRadius: 7, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}><FileText size={12} /> Blog</a>
                  <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 10px', borderRadius: 7, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text2)', textDecoration: 'none' }}>↗</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

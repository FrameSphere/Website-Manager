'use client'
import { useState, useEffect } from 'react'
import { FileText, Star, Settings } from 'lucide-react'

interface Post { id: string; title: string; slug: string; status: string; lang: string; published_at: string | null; created_at: string; sites?: { name: string; color: string } }
interface Site { id: string; name: string; color: string }

const LANGS = ['de', 'en', 'fr', 'es', 'it']
const STATUS_COLORS: Record<string, string> = { published: '#22c55e', draft: '#f59e0b', scheduled: '#60a5fa' }

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterSite, setFilterSite] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({ title: '', site_id: '', lang: 'de', status: 'draft', content: '', excerpt: '', tags: '', meta_description: '' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [pr, sr] = await Promise.all([fetch('/api/blog'), fetch('/api/sites')])
    if (pr.status === 403) { setIsPro(false); setLoading(false); return }
    const [pd, sd] = await Promise.all([pr.json(), sr.json()])
    setPosts(Array.isArray(pd) ? pd : [])
    setSites(Array.isArray(sd) ? sd : [])
    setLoading(false)
  }

  async function addPost(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const r = await fetch('/api/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json()
    if (r.ok) { setPosts(p => [d, ...p]); setShowAdd(false); setForm({ title: '', site_id: '', lang: 'de', status: 'draft', content: '', excerpt: '', tags: '', meta_description: '' }) }
    setSaving(false)
  }

  async function deletePost(id: string) {
    if (!confirm('Post löschen?')) return
    await fetch(`/api/blog?id=${id}`, { method: 'DELETE' })
    setPosts(p => p.filter(x => x.id !== id))
  }

  async function toggleStatus(post: Post) {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const r = await fetch('/api/blog', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: post.id, status: newStatus }) })
    const d = await r.json()
    if (r.ok) setPosts(p => p.map(x => x.id === post.id ? d : x))
  }

  const filtered = posts.filter(p =>
    (!filterSite || p.sites?.name === sites.find(s => s.id === filterSite)?.name) &&
    (!filterStatus || p.status === filterStatus)
  )

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: 9, fontSize: 14, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)', outline: 'none', fontFamily: 'inherit' }

  if (!isPro) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <FileText size={48} color="var(--text3)" style={{ display: 'block', margin: '0 auto 16px' }} />
        <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Blog-Verwaltung ist Pro</h2>
        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>Blog-Posts, SEO-Felder, mehrsprachige Einbindung.</p>
        <a href="/dashboard/upgrade" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
          <Star size={14} fill="#fff" color="#fff" /> Jetzt upgraden
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 22, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={20} /> Blog-Verwaltung</h1>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
            {posts.filter(p => p.status === 'published').length} veröffentlicht · {posts.filter(p => p.status === 'draft').length} Entwürfe
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/dashboard/embed?feature=blog" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, border: '1px solid rgba(91,106,246,.3)', background: 'rgba(91,106,246,.08)', color: '#7e93fb', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
            <Settings size={13} /> Blog einbinden
          </a>
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
            + Neuer Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }} value={filterSite} onChange={e => setFilterSite(e.target.value)}>
          <option value="">Alle Websites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Alle Status</option>
          <option value="published">Veröffentlicht</option>
          <option value="draft">Entwurf</option>
        </select>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 24 }}>Neuer Blog-Post</h2>
            <form onSubmit={addPost}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Titel *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post-Titel" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Website *</label>
                  <select style={inputStyle} value={form.site_id} onChange={e => setForm(f => ({ ...f, site_id: e.target.value }))} required>
                    <option value="">Wählen…</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Sprache</label>
                  <select style={inputStyle} value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value }))}>
                    {LANGS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="draft">Entwurf</option>
                    <option value="published">Veröffentlicht</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Zusammenfassung / Excerpt</label>
                <textarea style={{ ...inputStyle, height: 60, resize: 'none' } as React.CSSProperties} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Kurze Beschreibung für Blog-Liste und SEO…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Tags (komma-getrennt)</label>
                  <input style={inputStyle} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="guides, tipps, update" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Meta Description (SEO)</label>
                  <input style={inputStyle} value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} placeholder="SEO-Beschreibung (max. 160 Zeichen)" maxLength={160} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Inhalt (HTML)</label>
                <textarea style={{ ...inputStyle, height: 160, resize: 'vertical', fontFamily: 'Space Mono, monospace', fontSize: 12 } as React.CSSProperties} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="<h2>Überschrift</h2><p>Dein Inhalt…</p>" />
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

      {/* Posts table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 60, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }} />)}
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 0.6fr 0.7fr 0.6fr 100px', padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
            {['Titel', 'Website', 'Sprache', 'Status', 'Tags', 'Aktionen'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'Space Mono, monospace' }}>{h}</div>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
              Keine Posts gefunden —{' '}
              <button onClick={() => setShowAdd(true)} style={{ background: 'none', border: 'none', color: '#7e93fb', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, textDecoration: 'underline' }}>ersten Post erstellen</button>
            </div>
          ) : filtered.map((post, i) => (
            <div key={post.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 0.6fr 0.7fr 0.6fr 100px', padding: '12px 18px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(31,36,56,0.5)' : 'none', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{post.sites?.name || '—'}</div>
              <div style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: 'var(--text3)' }}>{post.lang?.toUpperCase()}</div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: (STATUS_COLORS[post.status] || '#6b7280') + '18', border: `1px solid ${STATUS_COLORS[post.status] || '#6b7280'}30`, color: STATUS_COLORS[post.status] || '#6b7280' }}>
                  {post.status === 'published' ? '● Live' : post.status === 'draft' ? '○ Entwurf' : '◷ Geplant'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(post as any).tags || '—'}</div>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => toggleStatus(post)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
                  {post.status === 'published' ? '↓' : '↑'}
                </button>
                <button onClick={() => deletePost(post.id)} style={{ padding: '5px 7px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

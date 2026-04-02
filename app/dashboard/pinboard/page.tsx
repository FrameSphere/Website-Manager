'use client'
import { useState, useEffect, useRef } from 'react'
import { Pin, PinOff, Plus, X, Globe, Search } from 'lucide-react'

const NOTE_COLORS = [
  { val: '#5b6af6', label: 'Indigo' },
  { val: '#22c55e', label: 'Grün' },
  { val: '#f59e0b', label: 'Gelb' },
  { val: '#ef4444', label: 'Rot' },
  { val: '#a78bfa', label: 'Lila' },
  { val: '#60a5fa', label: 'Blau' },
  { val: '#f97316', label: 'Orange' },
  { val: '#ec4899', label: 'Pink' },
  { val: '#14b8a6', label: 'Türkis' },
  { val: '#6b7280', label: 'Grau' },
]

interface Note {
  id: string
  content: string
  color: string
  pinned: boolean
  site_id: string | null
  created_at: string
  sites?: { name: string; color: string } | null
}
interface Site { id: string; name: string; color: string }

function NoteCard({ note, onTogglePin, onDelete, onEdit }: {
  note: Note
  onTogglePin: (n: Note) => void
  onDelete: (id: string) => void
  onEdit: (n: Note) => void
}) {
  const [hover, setHover] = useState(false)
  const col = note.color || '#5b6af6'

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: col + '12',
        border: `1.5px solid ${col}${note.pinned ? '60' : '30'}`,
        borderRadius: 14,
        padding: '16px 16px 12px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform .15s, box-shadow .15s',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? `0 8px 24px ${col}20` : note.pinned ? `0 4px 16px ${col}18` : 'none',
        breakInside: 'avoid',
        marginBottom: 12,
      }}
      onClick={() => onEdit(note)}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <div style={{
          position: 'absolute', top: -6, right: 14,
          width: 12, height: 12, borderRadius: '50%',
          background: col, boxShadow: `0 0 0 3px var(--surface), 0 0 0 5px ${col}40`,
        }} />
      )}

      {/* Actions */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        display: 'flex', gap: 4,
        opacity: hover ? 1 : 0, transition: 'opacity .15s',
      }}>
        <button
          onClick={e => { e.stopPropagation(); onTogglePin(note) }}
          title={note.pinned ? 'Loslösen' : 'Anheften'}
          style={{ padding: '4px', borderRadius: 6, border: 'none', background: col + '25', color: col, cursor: 'pointer', display: 'flex' }}
        >
          {note.pinned ? <PinOff size={12} /> : <Pin size={12} />}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(note.id) }}
          style={{ padding: '4px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Content */}
      <p style={{
        fontSize: 14, lineHeight: 1.65, color: 'var(--text1)',
        margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        paddingRight: hover ? 48 : 0, transition: 'padding .15s',
      }}>
        {note.content}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        {note.sites ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5,
            background: note.sites.color + '18', color: note.sites.color,
            border: `1px solid ${note.sites.color}30`,
          }}>
            <Globe size={9} /> {note.sites.name}
          </span>
        ) : <span />}
        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
          {new Date(note.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

function NoteModal({ note, sites, onSave, onClose }: {
  note: Partial<Note> | null
  sites: Site[]
  onSave: (data: Partial<Note>) => void
  onClose: () => void
}) {
  const [content, setContent] = useState(note?.content || '')
  const [color, setColor] = useState(note?.color || '#f59e0b')
  const [siteId, setSiteId] = useState(note?.site_id || '')
  const [pinned, setPinned] = useState(note?.pinned || false)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { textRef.current?.focus() }, [])

  function save() {
    if (!content.trim()) return
    onSave({ content, color, site_id: siteId || null, pinned })
  }

  const col = color

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'var(--surface)', border: `2px solid ${col}40`, borderRadius: 18, padding: 28, width: '100%', maxWidth: 480, boxShadow: `0 24px 60px ${col}20` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontWeight: 800, fontSize: 16 }}>{note?.id ? 'Notiz bearbeiten' : 'Neue Notiz'}</h2>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}>
            <X size={14} />
          </button>
        </div>

        {/* Color picker */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 16, flexWrap: 'wrap' }}>
          {NOTE_COLORS.map(c => (
            <button key={c.val} onClick={() => setColor(c.val)} title={c.label}
              style={{ width: 24, height: 24, borderRadius: '50%', background: c.val, border: color === c.val ? `3px solid #fff` : '3px solid transparent', cursor: 'pointer', outline: `2px solid ${color === c.val ? c.val : 'transparent'}`, transition: 'transform .1s', transform: color === c.val ? 'scale(1.2)' : 'scale(1)' }} />
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Notiz schreiben…"
          rows={6}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
            background: col + '0d', border: `1.5px solid ${col}30`,
            color: 'var(--text1)', outline: 'none', fontFamily: 'inherit',
            resize: 'vertical', lineHeight: 1.65,
          }}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) save() }}
        />
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, marginBottom: 14 }}>⌘+Enter zum Speichern</div>

        {/* Footer controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <select value={siteId} onChange={e => setSiteId(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text2)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="">Keine Website</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: pinned ? col : 'var(--text3)', userSelect: 'none' }}>
            <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} style={{ display: 'none' }} />
            <div style={{ width: 32, height: 18, borderRadius: 9, background: pinned ? col : 'var(--bg)', border: `1px solid ${pinned ? col : 'var(--border)'}`, position: 'relative', transition: 'background .2s' }}>
              <div style={{ position: 'absolute', top: 2, left: pinned ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </div>
            Anheften
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Abbrechen</button>
          <button onClick={save} disabled={!content.trim()} style={{ flex: 1, padding: 11, borderRadius: 9, background: col, color: '#fff', border: 'none', cursor: content.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontFamily: 'inherit', opacity: content.trim() ? 1 : 0.5 }}>
            {note?.id ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PinboardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Partial<Note> | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterSite, setFilterSite] = useState('')
  const [filterPin, setFilterPin] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [nr, sr] = await Promise.all([fetch('/api/pinboard'), fetch('/api/sites')])
    const [nd, sd] = await Promise.all([nr.json(), sr.json()])
    setNotes(Array.isArray(nd) ? nd : [])
    setSites(Array.isArray(sd) ? sd : [])
    setLoading(false)
  }

  async function saveNote(data: Partial<Note>) {
    if (modal?.id) {
      // Edit
      const r = await fetch('/api/pinboard', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: modal.id, ...data }) })
      const d = await r.json()
      if (r.ok) setNotes(n => n.map(x => x.id === modal.id ? d : x))
    } else {
      // Create
      const r = await fetch('/api/pinboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const d = await r.json()
      if (r.ok) setNotes(n => [d, ...n])
    }
    setShowModal(false)
    setModal(null)
  }

  async function togglePin(note: Note) {
    const r = await fetch('/api/pinboard', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: note.id, pinned: !note.pinned }) })
    const d = await r.json()
    if (r.ok) {
      setNotes(n => n.map(x => x.id === note.id ? d : x).sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }))
    }
  }

  async function deleteNote(id: string) {
    await fetch(`/api/pinboard?id=${id}`, { method: 'DELETE' })
    setNotes(n => n.filter(x => x.id !== id))
  }

  function openNew() { setModal({}); setShowModal(true) }
  function openEdit(note: Note) { setModal(note); setShowModal(true) }

  const filtered = notes.filter(n => {
    if (filterPin && !n.pinned) return false
    if (filterSite && n.site_id !== filterSite) return false
    if (search && !n.content.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const pinned = filtered.filter(n => n.pinned)
  const unpinned = filtered.filter(n => !n.pinned)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pin size={20} color="var(--text2)" />
          <h1 style={{ fontWeight: 900, fontSize: 22 }}>Pinboard</h1>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', marginLeft: 4 }}>
            {notes.length} Notiz{notes.length !== 1 ? 'en' : ''}
          </span>
        </div>
        <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(91,106,246,0.3)' }}>
          <Plus size={15} /> Neue Notiz
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} color="var(--text3)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Notizen durchsuchen…"
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text1)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
        </div>
        <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="">Alle Websites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={() => setFilterPin(!filterPin)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
          border: `1px solid ${filterPin ? 'rgba(91,106,246,0.4)' : 'var(--border)'}`,
          background: filterPin ? 'rgba(91,106,246,0.1)' : 'var(--surface)',
          color: filterPin ? '#7e93fb' : 'var(--text2)', fontSize: 13, fontWeight: filterPin ? 700 : 500,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <Pin size={13} /> Angeheftet
        </button>
      </div>

      {loading ? (
        <div style={{ columns: 3, gap: 12 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: [120,160,100,140,110,150][i-1], borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 12, breakInside: 'avoid' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)' }}>
          <Pin size={40} style={{ display: 'block', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>
            {search || filterSite || filterPin ? 'Keine Notizen gefunden' : 'Noch keine Notizen'}
          </div>
          {!search && !filterSite && !filterPin && (
            <button onClick={openNew} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 9, background: '#5b6af6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: 13 }}>
              Erste Notiz erstellen
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Pinned section */}
          {pinned.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Pin size={12} color="#a4bbfd" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'Space Mono, monospace' }}>Angeheftet</span>
              </div>
              <div style={{ columns: 'auto 260px', gap: 12 }}>
                {pinned.map(n => <NoteCard key={n.id} note={n} onTogglePin={togglePin} onDelete={deleteNote} onEdit={openEdit} />)}
              </div>
            </div>
          )}

          {/* Other notes */}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'Space Mono, monospace' }}>Andere</span>
                </div>
              )}
              <div style={{ columns: 'auto 260px', gap: 12 }}>
                {unpinned.map(n => <NoteCard key={n.id} note={n} onTogglePin={togglePin} onDelete={deleteNote} onEdit={openEdit} />)}
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <NoteModal
          note={modal}
          sites={sites}
          onSave={saveNote}
          onClose={() => { setShowModal(false); setModal(null) }}
        />
      )}
    </div>
  )
}

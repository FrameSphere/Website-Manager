'use client'
import { useState, useEffect } from 'react'
import { CheckSquare, Star, AlertTriangle } from 'lucide-react'

interface Todo {
  id: string; title: string; description: string; done: boolean
  important: boolean; priority: number; due_date: string | null
  site_id: string | null; sites?: { name: string; color: string }
}
interface Site { id: string; name: string; color: string }

const PRIO = [
  { val: 5, label: 'Kritisch', color: '#ef4444' },
  { val: 4, label: 'Hoch',     color: '#f97316' },
  { val: 3, label: 'Normal',   color: '#f59e0b' },
  { val: 2, label: 'Niedrig',  color: '#6b7280' },
  { val: 1, label: 'Optional', color: '#6b7280' },
]

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<'open' | 'done' | 'all'>('open')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', site_id: '', priority: 3, due_date: '', important: false })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [tr, sr] = await Promise.all([fetch('/api/todos'), fetch('/api/sites')])
    const [td, sd] = await Promise.all([tr.json(), sr.json()])
    setTodos(Array.isArray(td) ? td : [])
    setSites(Array.isArray(sd) ? sd : [])
    setLoading(false)
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const r = await fetch('/api/todos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, site_id: form.site_id || null, due_date: form.due_date || null }),
    })
    const d = await r.json()
    if (r.ok) {
      setTodos(t => [d, ...t])
      setForm({ title: '', description: '', site_id: '', priority: 3, due_date: '', important: false })
      setShowAdd(false)
    }
    setSaving(false)
  }

  async function toggleDone(todo: Todo) {
    const r = await fetch('/api/todos', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: todo.id, done: !todo.done }),
    })
    if (r.ok) setTodos(t => t.map(x => x.id === todo.id ? { ...x, done: !x.done } : x))
  }

  async function deleteTodo(id: string) {
    await fetch(`/api/todos?id=${id}`, { method: 'DELETE' })
    setTodos(t => t.filter(x => x.id !== id))
  }

  const filtered = todos.filter(t =>
    filter === 'all' ? true : filter === 'open' ? !t.done : t.done
  ).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.important !== b.important) return a.important ? -1 : 1
    return (b.priority || 3) - (a.priority || 3)
  })

  const now = new Date()
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: 9, fontSize: 14, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 22, marginBottom: 4, display:'flex', alignItems:'center', gap:8 }}><CheckSquare size={20} /> Todos</h1>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
            {todos.filter(t => !t.done).length} offen · {todos.filter(t => t.done).length} erledigt
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(91,106,246,0.3)' }}>
          + Neues Todo
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['open', 'done', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'inherit',
            background: filter === f ? 'rgba(91,106,246,0.12)' : 'var(--surface)',
            color: filter === f ? '#7e93fb' : 'var(--text2)',
            fontWeight: filter === f ? 700 : 500, fontSize: 13, cursor: 'pointer',
            borderColor: filter === f ? 'rgba(91,106,246,0.3)' : 'var(--border)',
          }}>
            {f === 'open' ? 'Offen' : f === 'done' ? 'Erledigt' : 'Alle'}
          </button>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 32, width: '100%', maxWidth: 460 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 24 }}>Neues Todo</h2>
            <form onSubmit={addTodo}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Titel *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Was muss erledigt werden?" required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Beschreibung</label>
                <textarea style={{ ...inputStyle, resize: 'none', height: 72 } as React.CSSProperties} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Priorität</label>
                  <select style={inputStyle} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: +e.target.value }))}>
                    {PRIO.map(p => <option key={p.val} value={p.val}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Website</label>
                  <select style={inputStyle} value={form.site_id} onChange={e => setForm(f => ({ ...f, site_id: e.target.value }))}>
                    <option value="">Keine</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 24, alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Fällig bis</label>
                  <input type="date" style={inputStyle} value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
                <div style={{ paddingTop: 22 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
                    <input type="checkbox" checked={form.important} onChange={e => setForm(f => ({ ...f, important: e.target.checked }))} />
                    Wichtig <Star size={12} fill="#f59e0b" color="#f59e0b" style={{marginLeft:3}}/>
                  </label>
                </div>
              </div>
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

      {/* Todo list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 64, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }} className="skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <CheckSquare size={40} color="#22c55e" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Nichts hier!</div>
          <div style={{ fontSize: 13 }}>{filter === 'open' ? 'Keine offenen Todos – gut gemacht!' : 'Noch nichts erledigt.'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(todo => {
            const prio = PRIO.find(p => p.val === todo.priority) || PRIO[2]
            const overdue = todo.due_date && !todo.done && new Date(todo.due_date) < now
            return (
              <div key={todo.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
                opacity: todo.done ? 0.55 : 1, transition: 'opacity .15s',
              }}>
                {/* Checkbox */}
                <button onClick={() => toggleDone(todo)} style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                  background: todo.done ? '#22c55e' : 'transparent',
                  border: `2px solid ${todo.done ? '#22c55e' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: '#fff', transition: 'all .15s',
                }}>
                  {todo.done ? '✓' : ''}
                </button>

                {/* Priority dot */}
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: prio.color, flexShrink: 0 }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: todo.important ? 700 : 500, textDecoration: todo.done ? 'line-through' : 'none', color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {todo.important ? <><Star size={11} fill="#f59e0b" color="#f59e0b" style={{marginRight:3}}/></> : ''}{todo.title}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                    {todo.sites && <span style={{ fontSize: 10, color: todo.sites.color, fontFamily: 'Space Mono, monospace' }}>{todo.sites.name}</span>}
                    {todo.due_date && <span style={{ fontSize: 10, color: overdue ? '#ef4444' : 'var(--text3)', fontFamily: 'Space Mono, monospace', display:'flex', alignItems:'center', gap:3 }}>{overdue ? <AlertTriangle size={9} color="#ef4444" /> : ''}Fällig {new Date(todo.due_date).toLocaleDateString('de-DE')}</span>}
                  </div>
                </div>

                {/* Priority badge */}
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: prio.color + '18', border: `1px solid ${prio.color}30`, color: prio.color, flexShrink: 0, fontFamily: 'Space Mono, monospace' }}>
                  {prio.label}
                </span>

                {/* Delete */}
                <button onClick={() => deleteTodo(todo.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

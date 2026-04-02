'use client'
import { useState, useEffect } from 'react'
import { CheckSquare, Star, AlertTriangle, Plus, X, Calendar, List, ChevronLeft, ChevronRight, Check, Trash2 } from 'lucide-react'

interface Todo {
  id: string; title: string; description: string; done: boolean
  important: boolean; priority: number; due_date: string | null
  site_id: string | null; created_at: string
  sites?: { name: string; color: string }
}
interface Site { id: string; name: string; color: string }

const PRIO = [
  { val: 5, label: 'Kritisch', color: '#ef4444' },
  { val: 4, label: 'Hoch',     color: '#f97316' },
  { val: 3, label: 'Normal',   color: '#f59e0b' },
  { val: 2, label: 'Niedrig',  color: '#6b7280' },
  { val: 1, label: 'Optional', color: '#6b7280' },
]

const DAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

function CalendarView({ todos, onSelectDate, selectedDate }: {
  todos: Todo[]
  onSelectDate: (d: string) => void
  selectedDate: string
}) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())

  const today = new Date().toISOString().slice(0, 10)
  const firstDay = new Date(year, month, 1)
  // Monday-based: 0=Mo, 6=So
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Build map: date -> todos
  const todoMap: Record<string, Todo[]> = {}
  todos.forEach(t => {
    if (t.due_date) {
      const d = t.due_date.slice(0, 10)
      if (!todoMap[d]) todoMap[d] = []
      todoMap[d].push(t)
    }
  })

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  // Pad to complete rows
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
        <button onClick={prevMonth} style={{ padding: '6px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text2)', display: 'flex' }}>
          <ChevronLeft size={15} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 15 }}>{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} style={{ padding: '6px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text2)', display: 'flex' }}>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
        {DAYS_SHORT.map(d => (
          <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} style={{ minHeight: 70, borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayTodos = todoMap[dateStr] || []
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const hasOverdue = dayTodos.some(t => !t.done)
          const isWeekend = (i % 7) >= 5

          return (
            <div key={dateStr} onClick={() => onSelectDate(dateStr)} style={{
              minHeight: 70, padding: '6px 7px',
              borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
              borderBottom: '1px solid var(--border)',
              background: isSelected ? 'rgba(91,106,246,0.08)' : isToday ? 'rgba(91,106,246,0.04)' : isWeekend ? 'rgba(255,255,255,0.01)' : 'transparent',
              cursor: 'pointer', transition: 'background .1s',
              outline: isSelected ? '2px solid rgba(91,106,246,0.4)' : isToday ? '1px solid rgba(91,106,246,0.2)' : 'none',
              outlineOffset: -1,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isToday ? '#5b6af6' : 'transparent',
                fontSize: 12, fontWeight: isToday ? 800 : 500,
                color: isToday ? '#fff' : isWeekend ? 'var(--text3)' : 'var(--text2)',
                marginBottom: 4,
              }}>
                {day}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayTodos.slice(0, 3).map(t => {
                  const prio = PRIO.find(p => p.val === t.priority) || PRIO[2]
                  return (
                    <div key={t.id} style={{
                      fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 4,
                      background: t.done ? 'rgba(107,114,128,0.15)' : prio.color + '25',
                      color: t.done ? 'var(--text3)' : prio.color,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      textDecoration: t.done ? 'line-through' : 'none',
                    }}>
                      {t.title}
                    </div>
                  )
                })}
                {dayTodos.length > 3 && (
                  <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>+{dayTodos.length - 3} mehr</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<'open' | 'done' | 'all'>('open')
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
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
    const r = await fetch('/api/todos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: todo.id, done: !todo.done }) })
    if (r.ok) setTodos(t => t.map(x => x.id === todo.id ? { ...x, done: !x.done } : x))
  }

  async function toggleImportant(todo: Todo) {
    const r = await fetch('/api/todos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: todo.id, important: !todo.important }) })
    if (r.ok) setTodos(t => t.map(x => x.id === todo.id ? { ...x, important: !x.important } : x))
  }

  async function deleteTodo(id: string) {
    await fetch(`/api/todos?id=${id}`, { method: 'DELETE' })
    setTodos(t => t.filter(x => x.id !== id))
  }

  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  const filtered = todos.filter(t => {
    if (view === 'calendar' && selectedDate) return t.due_date?.slice(0, 10) === selectedDate
    return filter === 'all' ? true : filter === 'open' ? !t.done : t.done
  }).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.important !== b.important) return a.important ? -1 : 1
    return (b.priority || 3) - (a.priority || 3)
  })

  const overdueCount = todos.filter(t => !t.done && t.due_date && t.due_date.slice(0, 10) < today).length
  const todayCount = todos.filter(t => !t.done && t.due_date?.slice(0, 10) === today).length

  const inp: React.CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: 9, fontSize: 14, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CheckSquare size={20} color="var(--text2)" />
            <h1 style={{ fontWeight: 900, fontSize: 22 }}>Todos</h1>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', display: 'flex', gap: 12 }}>
            <span>{todos.filter(t => !t.done).length} offen</span>
            {overdueCount > 0 && <span style={{ color: '#ef4444' }}>⚠ {overdueCount} überfällig</span>}
            {todayCount > 0 && <span style={{ color: '#f59e0b' }}>● {todayCount} heute fällig</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: 3 }}>
            {([['list', List, 'Liste'], ['calendar', Calendar, 'Kalender']] as const).map(([v, Icon, label]) => (
              <button key={v} onClick={() => { setView(v); setSelectedDate('') }} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                background: view === v ? '#5b6af6' : 'transparent',
                color: view === v ? '#fff' : 'var(--text3)',
              }}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(91,106,246,0.3)' }}>
            <Plus size={14} /> Neues Todo
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Offen', val: todos.filter(t => !t.done).length, color: '#5b6af6' },
          { label: 'Erledigt', val: todos.filter(t => t.done).length, color: '#22c55e' },
          { label: 'Überfällig', val: overdueCount, color: '#ef4444' },
          { label: 'Heute', val: todayCount, color: '#f59e0b' },
          { label: 'Wichtig', val: todos.filter(t => t.important && !t.done).length, color: '#a78bfa' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.color }} />
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'Space Mono, monospace', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
          <CalendarView todos={todos} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
          <div>
            {selectedDate ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                {filtered.length === 0 ? (
                  <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Keine Todos für diesen Tag</div>
                ) : filtered.map(todo => {
                  const prio = PRIO.find(p => p.val === todo.priority) || PRIO[2]
                  return (
                    <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(31,36,56,0.4)' }}>
                      <button onClick={() => toggleDone(todo)} style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, cursor: 'pointer', background: todo.done ? '#22c55e' : 'transparent', border: `2px solid ${todo.done ? '#22c55e' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        {todo.done && <Check size={11} />}
                      </button>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, textDecoration: todo.done ? 'line-through' : 'none', color: todo.done ? 'var(--text3)' : 'var(--text1)' }}>{todo.title}</span>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: prio.color, flexShrink: 0 }} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                <Calendar size={28} style={{ display: 'block', margin: '0 auto 10px' }} />
                <div style={{ fontSize: 13 }}>Tag auswählen</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {(['open', 'done', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'inherit', background: filter === f ? 'rgba(91,106,246,0.12)' : 'var(--surface)', color: filter === f ? '#7e93fb' : 'var(--text2)', fontWeight: filter === f ? 700 : 500, fontSize: 13, cursor: 'pointer', borderColor: filter === f ? 'rgba(91,106,246,0.3)' : 'var(--border)' }}>
                {f === 'open' ? `Offen (${todos.filter(t => !t.done).length})` : f === 'done' ? `Erledigt (${todos.filter(t => t.done).length})` : 'Alle'}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3,4].map(i => <div key={i} style={{ height: 64, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
              <CheckSquare size={40} color="#22c55e" style={{ display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>
                {filter === 'open' ? 'Keine offenen Todos – gut gemacht!' : 'Nichts hier.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {filtered.map(todo => {
                const prio = PRIO.find(p => p.val === todo.priority) || PRIO[2]
                const overdue = todo.due_date && !todo.done && todo.due_date.slice(0, 10) < today
                const dueToday = todo.due_date?.slice(0, 10) === today && !todo.done
                return (
                  <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, background: 'var(--surface)', border: overdue ? '1px solid rgba(239,68,68,0.25)' : dueToday ? '1px solid rgba(245,158,11,0.25)' : '1px solid var(--border)', opacity: todo.done ? 0.55 : 1, transition: 'opacity .15s' }}>
                    {/* Checkbox */}
                    <button onClick={() => toggleDone(todo)} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer', background: todo.done ? '#22c55e' : 'transparent', border: `2px solid ${todo.done ? '#22c55e' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'all .15s' }}>
                      {todo.done && <Check size={12} />}
                    </button>

                    {/* Priority dot */}
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: prio.color, flexShrink: 0 }} />

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: todo.important ? 700 : 500, textDecoration: todo.done ? 'line-through' : 'none', color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {todo.important && <Star size={11} fill="#f59e0b" color="#f59e0b" style={{ flexShrink: 0 }} />}
                        {todo.title}
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        {todo.sites && <span style={{ fontSize: 10, color: todo.sites.color, fontFamily: 'Space Mono, monospace' }}>{todo.sites.name}</span>}
                        {todo.due_date && (
                          <span style={{ fontSize: 10, color: overdue ? '#ef4444' : dueToday ? '#f59e0b' : 'var(--text3)', fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
                            {overdue && <AlertTriangle size={9} color="#ef4444" />}
                            {dueToday ? 'Heute fällig' : `Fällig ${new Date(todo.due_date + 'T12:00:00').toLocaleDateString('de-DE')}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Priority badge */}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: prio.color + '18', border: `1px solid ${prio.color}30`, color: prio.color, flexShrink: 0, fontFamily: 'Space Mono, monospace' }}>
                      {prio.label}
                    </span>

                    {/* Actions */}
                    <button onClick={() => toggleImportant(todo)} style={{ padding: '4px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: todo.important ? '#f59e0b' : 'var(--text3)', flexShrink: 0 }}>
                      <Star size={13} fill={todo.important ? '#f59e0b' : 'none'} />
                    </button>
                    <button onClick={() => deleteTodo(todo.id)} style={{ padding: '4px', borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 28, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 17 }}>Neues Todo</h2>
              <button onClick={() => setShowAdd(false)} style={{ padding: 6, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}><X size={14} /></button>
            </div>
            <form onSubmit={addTodo}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Titel *</label>
                <input style={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Was muss erledigt werden?" required autoFocus />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Beschreibung</label>
                <textarea style={{ ...inp, resize: 'none', height: 64 } as React.CSSProperties} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Priorität</label>
                  <select style={inp} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: +e.target.value }))}>
                    {PRIO.map(p => <option key={p.val} value={p.val}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Website</label>
                  <select style={inp} value={form.site_id} onChange={e => setForm(f => ({ ...f, site_id: e.target.value }))}>
                    <option value="">Keine</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Fällig bis</label>
                  <input type="date" style={inp} value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} min={today} />
                </div>
                <div style={{ paddingTop: 22 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: form.important ? '#f59e0b' : 'var(--text2)', userSelect: 'none' }}>
                    <input type="checkbox" checked={form.important} onChange={e => setForm(f => ({ ...f, important: e.target.checked }))} style={{ display: 'none' }} />
                    <Star size={15} fill={form.important ? '#f59e0b' : 'none'} color={form.important ? '#f59e0b' : 'var(--text3)'} />
                    Wichtig
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
    </div>
  )
}

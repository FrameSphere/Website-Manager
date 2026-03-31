'use client'
import { useState, useEffect } from 'react'
import { LifeBuoy, Star } from 'lucide-react'

interface Ticket { id: string; subject: string; name: string; email: string; status: string; priority: string; message: string; reply: string; created_at: string; sites?: { name: string; color: string } }

const STATUS_COLORS: Record<string, string> = { open: '#ef4444', in_progress: '#f59e0b', resolved: '#22c55e', closed: '#6b7280' }
const STATUS_LABELS: Record<string, string> = { open: 'Offen', in_progress: 'In Bearbeitung', resolved: 'Gelöst', closed: 'Geschlossen' }
const PRIO_COLORS: Record<string, string> = { urgent: '#ef4444', high: '#f97316', normal: '#f59e0b', low: '#6b7280' }

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(true)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { loadTickets() }, [])

  async function loadTickets() {
    setLoading(true)
    const r = await fetch('/api/support')
    if (r.status === 403) { setIsPro(false); setLoading(false); return }
    const d = await r.json()
    setTickets(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function updateTicket(id: string, updates: Partial<Ticket>) {
    setSaving(true)
    const r = await fetch('/api/support', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    const d = await r.json()
    if (r.ok) {
      setTickets(t => t.map(x => x.id === id ? d : x))
      setSelected(d)
    }
    setSaving(false)
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return
    await updateTicket(selected.id, { reply, status: 'resolved' })
    setReply('')
  }

  const filtered = tickets.filter(t => !filterStatus || t.status === filterStatus)

  if (!isPro) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <LifeBuoy size={48} color="var(--text3)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Support-Tickets ist Pro</h2>
        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          Empfange und beantworte Nachrichten deiner Nutzer direkt im Dashboard.
        </p>
        <a href="/dashboard/upgrade" style={{ display: 'inline-flex', alignItems:'center', gap:6, padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}><Star size={14} fill="#fff" color="#fff" /> Jetzt upgraden</a>
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Ticket list */}
      <div style={{ width: 340, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <h1 style={{ fontWeight: 900, fontSize: 18, marginBottom: 12, display:'flex', alignItems:'center', gap:8 }}><LifeBuoy size={18} /> Support-Tickets</h1>
          <select style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text2)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Alle ({tickets.length})</option>
            <option value="open">Offen ({tickets.filter(t => t.status === 'open').length})</option>
            <option value="in_progress">In Bearbeitung</option>
            <option value="resolved">Gelöst</option>
            <option value="closed">Geschlossen</option>
          </select>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 70, borderRadius: 9, background: 'var(--surface)', border: '1px solid var(--border)' }} className="skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Keine Tickets</div>
          ) : filtered.map(ticket => (
            <div key={ticket.id} onClick={() => setSelected(ticket)} style={{
              padding: '12px 18px', borderBottom: '1px solid rgba(31,36,56,0.5)', cursor: 'pointer',
              background: selected?.id === ticket.id ? 'rgba(91,106,246,0.06)' : 'transparent',
              borderLeft: selected?.id === ticket.id ? '3px solid #5b6af6' : '3px solid transparent',
              transition: 'background .1s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ticket.subject}</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: STATUS_COLORS[ticket.status] + '15', border: `1px solid ${STATUS_COLORS[ticket.status]}30`, color: STATUS_COLORS[ticket.status], flexShrink: 0, marginLeft: 6 }}>
                  {STATUS_LABELS[ticket.status]}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{ticket.name || 'Anonym'} · {ticket.sites?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{new Date(ticket.created_at).toLocaleDateString('de-DE')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket detail */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexDirection: 'column', gap: 10 }}>
            <LifeBuoy size={36} />
            <div style={{ fontSize: 14 }}>Ticket auswählen</div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{selected.subject}</h2>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
                  Von: {selected.name || 'Anonym'} {selected.email ? `<${selected.email}>` : ''} · {new Date(selected.created_at).toLocaleDateString('de-DE')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={selected.status} onChange={e => updateTicket(selected.id, { status: e.target.value })}
                  style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg)', color: STATUS_COLORS[selected.status] || 'var(--text2)', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Message */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'Space Mono, monospace' }}>Nachricht</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text1)' }}>{selected.message}</p>
            </div>

            {/* Existing reply */}
            {selected.reply && (
              <div style={{ background: 'rgba(91,106,246,0.06)', border: '1px solid rgba(91,106,246,0.2)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7e93fb', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'Space Mono, monospace' }}>Deine Antwort</div>
                <p style={{ fontSize: 14, lineHeight: 1.7 }}>{selected.reply}</p>
              </div>
            )}

            {/* Reply box */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 10 }}>Antwort senden</div>
              <textarea value={reply} onChange={e => setReply(e.target.value)}
                placeholder="Deine Antwort…" rows={4}
                style={{ width: '100%', padding: '10px 13px', borderRadius: 9, fontSize: 14, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button onClick={sendReply} disabled={saving || !reply.trim()} style={{ padding: '10px 24px', borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', opacity: saving || !reply.trim() ? 0.6 : 1 }}>
                  {saving ? 'Senden…' : 'Antwort senden ✓'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

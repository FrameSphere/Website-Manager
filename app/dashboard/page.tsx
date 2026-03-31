import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { Bell, Globe, Zap, CheckCheck, Star, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [sitesRes, todosRes, notifsRes] = await Promise.all([
    supabase.from('sites').select('*').eq('owner_id', user!.id).order('created_at'),
    supabase.from('todos').select('*').eq('owner_id', user!.id).eq('done', false).order('priority', { ascending: false }).limit(10),
    supabase.from('notifications').select('*').eq('owner_id', user!.id).order('created_at', { ascending: false }).limit(15),
  ])

  const sites = sitesRes.data || []
  const todos = todosRes.data || []
  const notifications = notifsRes.data || []
  const unreadNotifs = notifications.filter(n => !n.read).length

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Guten Morgen' : now.getHours() < 18 ? 'Guten Tag' : 'Guten Abend'
  const dateStr = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || ''

  const PRIO_LABEL: Record<number, string> = { 5: 'Kritisch', 4: 'Hoch', 3: 'Normal', 2: 'Niedrig', 1: 'Optional' }
  const PRIO_COLOR: Record<number, string> = { 5: '#ef4444', 4: '#f97316', 3: '#f59e0b', 2: '#6b7280', 1: '#6b7280' }
  const TYPE_COLOR: Record<string, string> = { error: '#ef4444', warn: '#f59e0b', info: '#60a5fa', success: '#22c55e' }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 22, marginBottom: 4 }}>
            {greeting}{firstName ? `, ${firstName}` : ''}
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>{dateStr} · SiteControl</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {unreadNotifs > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
              <Bell size={11} /> {unreadNotifs} ungelesen
            </span>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {[
          { label: 'Websites', val: sites.length, color: '#22c55e', sub: 'aktiv' },
          { label: 'Offene Todos', val: todos.length, color: '#f59e0b', sub: `${todos.filter(t => t.important).length} wichtig` },
          { label: 'Ungelesen', val: unreadNotifs, color: '#a78bfa', sub: 'Benachrichtigungen' },
          { label: 'Mit Fehlern', val: sites.filter(s => s.status === 'error').length, color: '#ef4444', sub: 'Sites' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.color }} />
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', marginTop: 5 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Sites + Todos */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        {/* Sites */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Globe size={14} color="var(--text2)" /> Websites Status
            </div>
            <a href="/dashboard/sites" style={{ fontSize: 11, color: 'var(--text3)', textDecoration: 'none', fontFamily: 'Space Mono, monospace' }}>Alle anzeigen →</a>
          </div>
          <div style={{ padding: 16 }}>
            {sites.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Globe size={28} color="var(--text3)" /></div>
                <div style={{ fontSize: 13, marginBottom: 12 }}>Noch keine Websites hinzugefügt</div>
                <a href="/dashboard/sites/new" style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--brand)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Website hinzufügen</a>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                {sites.map(site => (
                  <a key={site.id} href={`/dashboard/sites/${site.id}`} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 12px',
                    textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6, transition: 'border-color .12s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: (site.color || '#5b6af6') + '22', border: `1px solid ${site.color || '#5b6af6'}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={12} color={site.color || '#5b6af6'} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text1)' }}>{site.name}</div>
                        <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>{(site.url || '').replace('https://', '')}</div>
                      </div>
                    </div>
                    <div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: site.status === 'active' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${site.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, color: site.status === 'active' ? '#22c55e' : '#ef4444' }}>
                        {site.status === 'active' ? '✓ OK' : '⚠ Fehler'}
                      </span>
                    </div>
                  </a>
                ))}
                <a href="/dashboard/sites/new" style={{
                  background: 'transparent', border: '1px dashed var(--border)', borderRadius: 9, padding: '10px 12px',
                  textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 12, color: 'var(--text3)', fontWeight: 600, minHeight: 70,
                }}>
                  + Website hinzufügen
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Urgent Todos */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Zap size={14} color="var(--text2)" /> Dringende Todos
            </div>
            <a href="/dashboard/todos" style={{ fontSize: 11, color: 'var(--text3)', textDecoration: 'none', fontFamily: 'Space Mono, monospace' }}>Alle →</a>
          </div>
          <div style={{ padding: '8px 0' }}>
            {todos.length === 0 ? (
              <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--text3)', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <CheckCheck size={20} color="#22c55e" />
                Alle Todos erledigt!
              </div>
            ) : (
              todos.slice(0, 7).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 18px', borderBottom: '1px solid rgba(31,36,56,0.5)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: PRIO_COLOR[t.priority] || '#6b7280', flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: t.important ? 700 : 500, color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {t.important && <Star size={10} fill="#f59e0b" color="#f59e0b" />}
                      {t.title}
                    </div>
                    {t.due_date && (
                      <div style={{ fontSize: 10, color: new Date(t.due_date) < now ? '#ef4444' : 'var(--text3)', fontFamily: 'Space Mono, monospace', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {new Date(t.due_date) < now && <AlertTriangle size={9} color="#ef4444" />}
                        Fällig {new Date(t.due_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: PRIO_COLOR[t.priority] + '15', border: `1px solid ${PRIO_COLOR[t.priority]}30`, color: PRIO_COLOR[t.priority], flexShrink: 0 }}>
                    {PRIO_LABEL[t.priority]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Bell size={14} color="var(--text2)" /> Letzte Aktivitäten
          </div>
          {unreadNotifs > 0 && (
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>{unreadNotifs} ungelesen</span>
          )}
        </div>
        {notifications.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Keine Aktivitäten</div>
        ) : (
          notifications.slice(0, 8).map(n => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid rgba(31,36,56,0.4)', background: !n.read ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: TYPE_COLOR[n.type] || 'var(--text3)', flexShrink: 0 }} />
              <div style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{n.title}</div>
              {n.message && <div style={{ fontSize: 11, color: 'var(--text3)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>}
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap' }}>
                {new Date(n.created_at).toLocaleDateString('de-DE')}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

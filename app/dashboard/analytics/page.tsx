'use client'
import { useState, useEffect } from 'react'

interface Event { event_type: string; path: string; country: string; device: string; created_at: string; value: number }
interface Site { id: string; name: string; color: string }

export default function AnalyticsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSite, setFilterSite] = useState('')
  const [days, setDays] = useState(7)

  useEffect(() => { loadData() }, [filterSite, days])

  async function loadData() {
    setLoading(true)
    const [er, sr] = await Promise.all([
      fetch(`/api/analytics?days=${days}${filterSite ? `&site_id=${filterSite}` : ''}`),
      fetch('/api/sites'),
    ])
    const [ed, sd] = await Promise.all([er.json(), sr.json()])
    setEvents(Array.isArray(ed) ? ed : [])
    setSites(Array.isArray(sd) ? sd : [])
    setLoading(false)
  }

  const pageviews = events.filter(e => e.event_type === 'pageview')
  const totalViews = pageviews.reduce((s, e) => s + e.value, 0)

  // Top paths
  const pathCounts: Record<string, number> = {}
  pageviews.forEach(e => { if (e.path) pathCounts[e.path] = (pathCounts[e.path] || 0) + e.value })
  const topPaths = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Country breakdown
  const countryCounts: Record<string, number> = {}
  pageviews.forEach(e => { const c = e.country || 'Unbekannt'; countryCounts[c] = (countryCounts[c] || 0) + e.value })
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  // Device split
  const deviceCounts: Record<string, number> = {}
  pageviews.forEach(e => { const d = e.device || 'unknown'; deviceCounts[d] = (deviceCounts[d] || 0) + e.value })
  const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0)

  // Daily breakdown
  const dailyCounts: Record<string, number> = {}
  pageviews.forEach(e => { const d = e.created_at.slice(0, 10); dailyCounts[d] = (dailyCounts[d] || 0) + e.value })
  const dailyMax = Math.max(...Object.values(dailyCounts), 1)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 22, marginBottom: 4 }}>📊 Analytics</h1>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>Pageviews aus deinen Websites</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
            value={filterSite} onChange={e => setFilterSite(e.target.value)}>
            <option value="">Alle Websites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
            value={days} onChange={e => setDays(+e.target.value)}>
            <option value={7}>7 Tage</option>
            <option value={14}>14 Tage</option>
            <option value={30}>30 Tage</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 100, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} className="skeleton" />)}
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Pageviews', val: totalViews.toLocaleString(), color: '#5b6af6' },
              { label: 'Einzel-Events', val: events.length.toLocaleString(), color: '#22c55e' },
              { label: 'Fehler-Events', val: events.filter(e => e.event_type === 'error').length.toLocaleString(), color: '#ef4444' },
              { label: 'Top-Seite', val: topPaths[0]?.[0]?.slice(0, 18) || '—', color: '#f59e0b' },
            ].map(k => (
              <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>{k.label}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.val}</div>
              </div>
            ))}
          </div>

          {/* Daily chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16 }}>Pageviews pro Tag</div>
            {Object.keys(dailyCounts).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: 13 }}>Noch keine Daten für diesen Zeitraum.</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
                {Object.entries(dailyCounts).sort((a,b) => a[0].localeCompare(b[0])).map(([date, count]) => (
                  <div key={date} title={`${date}: ${count} Views`} style={{ flex: 1, background: 'rgba(91,106,246,0.6)', borderRadius: '3px 3px 0 0', height: `${(count / dailyMax) * 100}%`, minHeight: 4, cursor: 'default', transition: 'background .15s' }}
                    onMouseOver={e => ((e.target as HTMLElement).style.background = '#5b6af6')}
                    onMouseOut={e => ((e.target as HTMLElement).style.background = 'rgba(91,106,246,0.6)')} />
                ))}
              </div>
            )}
          </div>

          {/* 2 col: Top Paths + Countries */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13 }}>Top Seiten</div>
              {topPaths.length === 0 ? (
                <div style={{ padding: '24px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Keine Daten</div>
              ) : topPaths.map(([path, count], i) => (
                <div key={path} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid rgba(31,36,56,0.4)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', width: 18 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{path}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#5b6af6', fontFamily: 'Space Mono, monospace' }}>{count}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13 }}>Top Länder</div>
              {topCountries.length === 0 ? (
                <div style={{ padding: '24px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Keine Daten</div>
              ) : topCountries.map(([country, count]) => {
                const pct = totalViews > 0 ? (count / totalViews) * 100 : 0
                return (
                  <div key={country} style={{ padding: '10px 18px', borderBottom: '1px solid rgba(31,36,56,0.4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{country}</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>{count} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#5b6af6', borderRadius: 2 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

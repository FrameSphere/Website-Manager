'use client'
import { useState, useEffect, useCallback } from 'react'
import { BarChart2, TrendingUp, Users, AlertTriangle, Globe, Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react'

interface Event { event_type: string; path: string; country: string; device: string; referrer: string; created_at: string; value: number }
interface Site { id: string; name: string; color: string }

const CHART_COLORS = ['#5b6af6','#22c55e','#f59e0b','#ef4444','#a78bfa','#60a5fa','#f97316','#34d399']

function MiniBar({ val, max, color }: { val: number; max: number; color: string }) {
  return (
    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${max > 0 ? (val / max) * 100 : 0}%`, background: color, borderRadius: 2, transition: 'width .4s ease' }} />
    </div>
  )
}

function LineChart({ data, color = '#5b6af6', height = 80 }: { data: { date: string; val: number }[]; color?: string; height?: number }) {
  if (data.length < 2) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>Nicht genug Daten</div>
  )
  const max = Math.max(...data.map(d => d.val), 1)
  const w = 100 / (data.length - 1)

  const points = data.map((d, i) => ({ x: i * w, y: 100 - (d.val / max) * 90 }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${path} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`

  return (
    <div style={{ position: 'relative', height }}>
      <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${color.replace('#','')})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {/* X-axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {data.filter((_, i) => i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1).map(d => (
          <span key={d.date} style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
            {new Date(d.date + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
          </span>
        ))}
      </div>
    </div>
  )
}

function BarChartComp({ data, color = '#5b6af6' }: { data: { label: string; val: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.val), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.label}: ${d.val}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', background: color + '80', borderRadius: '3px 3px 0 0', height: `${(d.val / max) * 100}%`, minHeight: d.val > 0 ? 3 : 0, transition: 'height .3s ease', cursor: 'default' }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = color)}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = color + '80')} />
          <span style={{ fontSize: 8, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
            {d.label.slice(-5)}
          </span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data }: { data: { label: string; val: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.val, 0)
  if (total === 0) return <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)', fontSize: 12 }}>Keine Daten</div>

  let cumAngle = -90
  const segments = data.map(d => {
    const angle = (d.val / total) * 360
    const start = cumAngle
    cumAngle += angle
    return { ...d, startAngle: start, angle }
  })

  function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
    const s = polarToCartesian(cx, cy, r, start)
    const e = polarToCartesian(cx, cy, r, end)
    const large = end - start > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg viewBox="0 0 60 60" width={90} height={90} style={{ flexShrink: 0 }}>
        {segments.map((s, i) => (
          <path key={i} d={describeArc(30, 30, 22, s.startAngle, s.startAngle + s.angle - 0.5)}
            fill="none" stroke={s.color} strokeWidth="10" strokeLinecap="butt" />
        ))}
        <circle cx={30} cy={30} r={14} fill="var(--surface)" />
        <text x={30} y={33} textAnchor="middle" fontSize={8} fill="var(--text2)" fontWeight="bold">{total}</text>
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, flex: 1, color: 'var(--text2)' }}>{s.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: 'Space Mono, monospace' }}>
              {((s.val / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSite, setFilterSite] = useState('')
  const [days, setDays] = useState(7)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [liveCount, setLiveCount] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [er, sr] = await Promise.all([
      fetch(`/api/analytics?days=${days}${filterSite ? `&site_id=${filterSite}` : ''}`),
      fetch('/api/sites'),
    ])
    const [ed, sd] = await Promise.all([er.json(), sr.json()])
    setEvents(Array.isArray(ed) ? ed : [])
    setSites(Array.isArray(sd) ? sd : [])
    setLastRefresh(new Date())
    setLoading(false)
  }, [days, filterSite])

  useEffect(() => { loadData() }, [loadData])

  // Live visitor polling every 30s (events in last 5 min)
  useEffect(() => {
    async function pollLive() {
      const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const url = `/api/analytics?days=1${filterSite ? `&site_id=${filterSite}` : ''}`
      const r = await fetch(url).catch(() => null)
      if (!r) return
      const d = await r.json().catch(() => [])
      if (Array.isArray(d)) {
        const live = d.filter((e: any) => e.event_type === 'pageview' && e.created_at > since).length
        setLiveCount(live)
      }
    }
    pollLive()
    const interval = setInterval(pollLive, 30000)
    return () => clearInterval(interval)
  }, [filterSite])

  // Derived data
  const pageviews = events.filter(e => e.event_type === 'pageview')
  const errorEvents = events.filter(e => e.event_type === 'error')
  const outboundClicks = events.filter(e => e.event_type === 'outbound_click')
  const totalViews = pageviews.reduce((s, e) => s + (e.value || 1), 0)

  // Daily pageviews for line chart
  const dailyMap: Record<string, number> = {}
  const since = new Date(); since.setDate(since.getDate() - days)
  for (let i = 0; i <= days; i++) {
    const d = new Date(since); d.setDate(d.getDate() + i)
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  pageviews.forEach(e => { const d = e.created_at.slice(0, 10); if (dailyMap[d] !== undefined) dailyMap[d] += e.value || 1 })
  const dailyData = Object.entries(dailyMap).sort().map(([date, val]) => ({ date, val }))

  // Bar chart (last 7 days condensed or by day)
  const barData = dailyData.slice(-14).map(d => ({ label: d.date, val: d.val }))

  // Top paths
  const pathMap: Record<string, number> = {}
  pageviews.forEach(e => { if (e.path) pathMap[e.path] = (pathMap[e.path] || 0) + (e.value || 1) })
  const topPaths = Object.entries(pathMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxPath = topPaths[0]?.[1] || 1

  // Device split
  const deviceMap: Record<string, number> = {}
  pageviews.forEach(e => { const d = e.device || 'desktop'; deviceMap[d] = (deviceMap[d] || 0) + 1 })
  const deviceData = [
    { label: 'Desktop', val: deviceMap['desktop'] || 0, color: '#5b6af6' },
    { label: 'Mobile', val: deviceMap['mobile'] || 0, color: '#22c55e' },
    { label: 'Tablet', val: deviceMap['tablet'] || 0, color: '#f59e0b' },
  ].filter(d => d.val > 0)

  // Top countries
  const countryMap: Record<string, number> = {}
  pageviews.forEach(e => { if (e.country) countryMap[e.country] = (countryMap[e.country] || 0) + 1 })
  const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxCountry = topCountries[0]?.[1] || 1

  // Top referrers
  const refMap: Record<string, number> = {}
  pageviews.forEach(e => {
    if (e.referrer) {
      try { const host = new URL(e.referrer).hostname || 'Direkt'; refMap[host] = (refMap[host] || 0) + 1 } catch { refMap[e.referrer] = (refMap[e.referrer] || 0) + 1 }
    } else { refMap['Direkt'] = (refMap['Direkt'] || 0) + 1 }
  })
  const topReferrers = Object.entries(refMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxRef = topReferrers[0]?.[1] || 1

  // Bounce rate approx (sessions with 1 pageview)
  const avgPagesPerVisit = pageviews.length > 0 ? (totalViews / Math.max(Object.keys(dailyMap).filter(d => dailyMap[d] > 0).length, 1)).toFixed(1) : '—'

  const cardStyle: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={20} color="var(--text2)" />
          <h1 style={{ fontWeight: 900, fontSize: 22 }}>Analytics</h1>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
            Aktualisiert {lastRefresh.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="">Alle Websites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={days} onChange={e => setDays(+e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value={7}>7 Tage</option>
            <option value={14}>14 Tage</option>
            <option value={30}>30 Tage</option>
            <option value={90}>90 Tage</option>
          </select>
          <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 90, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} />)}
        </div>
      ) : (
        <>
          {/* Live Counter Banner */}
          {liveCount !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, background: liveCount > 0 ? 'rgba(34,197,94,0.08)' : 'var(--surface)', border: `1px solid ${liveCount > 0 ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: liveCount > 0 ? '#22c55e' : '#6b7280', boxShadow: liveCount > 0 ? '0 0 0 3px rgba(34,197,94,0.2)' : 'none', animation: liveCount > 0 ? 'pulse 2s infinite' : 'none', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: liveCount > 0 ? '#22c55e' : 'var(--text3)' }}>
                {liveCount > 0 ? `${liveCount} aktiver Besucher` : 'Gerade niemand online'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>letzte 5 Min · aktualisiert alle 30s</span>
            </div>
          )}

          {/* KPI Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Pageviews', val: totalViews.toLocaleString('de-DE'), color: '#5b6af6', Icon: TrendingUp, sub: `${days} Tage` },
              { label: 'Unique Events', val: events.length.toLocaleString('de-DE'), color: '#22c55e', Icon: Users, sub: 'alle Typen' },
              { label: 'Fehler', val: errorEvents.length.toLocaleString('de-DE'), color: '#ef4444', Icon: AlertTriangle, sub: 'JS + API' },
              { label: 'Outbound', val: outboundClicks.length.toLocaleString('de-DE'), color: '#f59e0b', Icon: Globe, sub: 'externe Klicks' },
              { label: 'Ø Views/Tag', val: days > 0 ? (totalViews / days).toFixed(1) : '—', color: '#a78bfa', Icon: BarChart2, sub: 'Durchschnitt' },
            ].map(k => (
              <div key={k.label} style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.color }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>{k.label}</div>
                  <k.Icon size={13} color={k.color} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', marginTop: 4 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Line Chart – Pageviews over time */}
          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Pageviews über Zeit</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
                Peak: {Math.max(...dailyData.map(d => d.val))} · Total: {totalViews}
              </div>
            </div>
            <LineChart data={dailyData} color="#5b6af6" height={100} />
          </div>

          {/* 3-col: Bar chart + Device donut + Countries */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Bar chart */}
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Tägliche Verteilung</div>
              <BarChartComp data={barData} color="#5b6af6" />
            </div>

            {/* Device split */}
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Monitor size={14} color="var(--text2)" /> Geräte
              </div>
              <DonutChart data={deviceData.length > 0 ? deviceData : [{ label: 'Desktop', val: 1, color: '#5b6af6' }]} />
            </div>

            {/* Top countries */}
            <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Länder</div>
              {topCountries.length === 0 ? (
                <div style={{ padding: 20, color: 'var(--text3)', fontSize: 12, textAlign: 'center' }}>Keine Länderdaten</div>
              ) : topCountries.map(([country, count], i) => (
                <div key={country} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid rgba(31,36,56,0.4)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', width: 16 }}>{i + 1}</span>
                  <span style={{ fontSize: 12, flex: 1, fontWeight: 600 }}>{country}</span>
                  <MiniBar val={count} max={maxCountry} color={CHART_COLORS[i % CHART_COLORS.length]} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length], fontFamily: 'Space Mono, monospace', width: 28, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2-col: Top Pages + Referrers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Top pages */}
            <div style={{ ...cardStyle, padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Top Seiten</div>
              {topPaths.length === 0 ? (
                <div style={{ padding: '24px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Keine Daten</div>
              ) : topPaths.map(([path, count], i) => (
                <div key={path} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid rgba(31,36,56,0.35)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', width: 18, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Space Mono, monospace', color: 'var(--text2)' }}>{path}</span>
                  <MiniBar val={count} max={maxPath} color="#5b6af6" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#5b6af6', fontFamily: 'Space Mono, monospace', width: 32, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Referrers */}
            <div style={{ ...cardStyle, padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Referrer</div>
              {topReferrers.length === 0 ? (
                <div style={{ padding: '24px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Keine Daten</div>
              ) : topReferrers.map(([ref, count], i) => (
                <div key={ref} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid rgba(31,36,56,0.35)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', width: 18, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text2)' }}>{ref}</span>
                  <MiniBar val={count} max={maxRef} color="#22c55e" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', fontFamily: 'Space Mono, monospace', width: 32, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error log */}
          {errorEvents.length > 0 && (
            <div style={{ ...cardStyle, padding: 0, marginTop: 16 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <AlertTriangle size={14} color="#ef4444" /> Frontend-Fehler ({errorEvents.length})
              </div>
              {errorEvents.slice(0, 10).map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 18px', borderBottom: '1px solid rgba(31,36,56,0.35)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Space Mono, monospace' }}>{e.path}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>{new Date(e.created_at).toLocaleDateString('de-DE')}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

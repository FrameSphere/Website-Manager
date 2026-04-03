'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, Check, ChevronDown, ChevronRight, Code, Zap, Globe } from 'lucide-react'

const APP = 'https://site-control-nine.vercel.app'

function CopyBox({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
      {label && <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '.08em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 5, border: '1px solid var(--border)', background: copied ? 'rgba(34,197,94,.1)' : 'var(--surface)', color: copied ? '#22c55e' : 'var(--text3)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
          {copied ? <><Check size={10} /> Kopiert</> : <><Copy size={10} /> Kopieren</>}
        </button>
      </div>}
      <pre style={{ padding: '14px 16px', fontSize: 12, lineHeight: 1.6, overflowX: 'auto', margin: 0, color: 'var(--text2)', fontFamily: 'Space Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{code}</pre>
    </div>
  )
}

function Section({ title, icon, open: defOpen = false, children }: any) {
  const [open, setOpen] = useState(defOpen)
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
      <button onClick={() => setOpen((o: boolean) => !o)} style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text1)', fontFamily: 'inherit', textAlign: 'left' }}>
        {icon}
        <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{title}</span>
        {open ? <ChevronDown size={16} color="var(--text3)" /> : <ChevronRight size={16} color="var(--text3)" />}
      </button>
      {open && <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>{children}</div>}
    </div>
  )
}

interface Site { id: string; name: string; url: string }

const TYPE_INFO: Record<string, { label: string; color: string }> = {
  feature:     { label: 'Feature',      color: '#5b6af6' },
  fix:         { label: 'Fix',          color: '#22c55e' },
  improvement: { label: 'Verbesserung', color: '#f59e0b' },
  breaking:    { label: 'Breaking',     color: '#ef4444' },
}

export default function ChangelogSetupPage() {
  const searchParams = useSearchParams()
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSite, setSelectedSite] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cfg, setCfg] = useState({
    show_types: ['feature', 'fix', 'improvement', 'breaking'] as string[],
    widget_title: 'Changelog',
    widget_color: '#5b6af6',
    max_entries: 20,
    show_version: true,
    link_url: '',
  })

  useEffect(() => {
    fetch('/api/sites').then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setSites(d)
        const first = searchParams.get('site') || d[0]?.id || ''
        setSelectedSite(first)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedSite) return
    fetch(`/api/site-settings?site_id=${selectedSite}`).then(r => r.json()).then(d => {
      if (d.changelog_config) setCfg({ ...cfg, ...d.changelog_config })
    })
  }, [selectedSite])

  async function save() {
    setSaving(true)
    await fetch('/api/site-settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: selectedSite, changelog_enabled: true, changelog_config: cfg }),
    })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const siteId = selectedSite

  // ── Embed: Inline Widget ──────────────────────────────────────────
  const inlineWidget = `<!-- SiteControl Changelog Widget -->
<!-- Als <div id="sc-changelog"></div> in deine Seite einfügen, dann Script laden -->

<div id="sc-changelog" style="font-family:-apple-system,sans-serif"></div>

<script>
(function(){
  var SITE_ID = '${siteId}';
  var API = '${APP}/api/public/changelog';
  var TITLE = '${cfg.widget_title}';
  var COLOR = '${cfg.widget_color}';
  var LIMIT = ${cfg.max_entries};
  var SHOW_VERSION = ${cfg.show_version};

  var TYPE_COLORS = { feature:'#5b6af6', fix:'#22c55e', improvement:'#f59e0b', breaking:'#ef4444' };
  var TYPE_LABELS = { feature:'Feature', fix:'Fix', improvement:'Verbesserung', breaking:'Breaking' };

  fetch(API + '?site_id=' + SITE_ID + '&limit=' + LIMIT)
    .then(function(r){ return r.json(); })
    .then(function(entries){
      var el = document.getElementById('sc-changelog');
      if (!el) return;

      el.innerHTML = [
        '<h2 style="font-size:1.2rem;font-weight:800;margin:0 0 1.2rem;color:#e8eaf0">' + TITLE + '</h2>',
        entries.map(function(e){
          var col = TYPE_COLORS[e.type] || COLOR;
          var lbl = TYPE_LABELS[e.type] || e.type;
          var date = new Date(e.published_at||e.created_at).toLocaleDateString('de-DE',{year:'numeric',month:'short',day:'numeric'});
          return [
            '<div style="padding:14px 0;border-bottom:1px solid #1f2438;display:flex;align-items:flex-start;gap:12px">',
            '  <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:5px;background:' + col + '18;color:' + col + ';border:1px solid ' + col + '30;white-space:nowrap;margin-top:2px">' + lbl + '</span>',
            '  <div style="flex:1">',
            '    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">',
            '      <span style="font-weight:700;font-size:14px;color:#e8eaf0">' + e.title + '</span>',
            SHOW_VERSION && e.version ? '      <span style="font-size:11px;color:#5a6280;font-family:monospace">v' + e.version + '</span>' : '',
            '    </div>',
            e.description ? '    <p style="font-size:13px;color:#9098b8;margin:0">' + e.description + '</p>' : '',
            '    <time style="font-size:11px;color:#5a6280;margin-top:4px;display:block">' + date + '</time>',
            '  </div>',
            '</div>',
          ].join('');
        }).join('') || '<p style="color:#5a6280;font-size:13px">Noch keine Einträge.</p>',
      ].join('');
    })
    .catch(function(){ });
})();
</script>`

  // ── Floating Changelog Badge ──────────────────────────────────────
  const floatingBadge = `<!-- Changelog-Badge (floating, zeigt neuesten Eintrag) -->
<script>
(function(){
  var SITE_ID = '${siteId}';
  var API = '${APP}/api/public/changelog?site_id=' + SITE_ID + '&limit=1';
  var COLOR = '${cfg.widget_color}';
  var SEEN_KEY = 'sc_cl_seen_' + SITE_ID;

  fetch(API).then(r=>r.json()).then(function(entries){
    if (!entries.length) return;
    var latest = entries[0];
    var seen = localStorage.getItem(SEEN_KEY);
    if (seen === latest.id) return; // already seen

    var badge = document.createElement('div');
    badge.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:9999;max-width:300px;background:#111420;border:1px solid ' + COLOR + '44;border-radius:12px;padding:14px 16px;box-shadow:0 8px 30px rgba(0,0,0,.4);font-family:-apple-system,sans-serif;animation:scSlide .3s ease';
    badge.innerHTML = [
      '<style>@keyframes scSlide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}</style>',
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">',
      '  <div>',
      '    <div style="font-size:10px;font-weight:700;color:' + COLOR + ';text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">🆕 ${cfg.widget_title}</div>',
      '    <div style="font-size:13px;font-weight:700;color:#e8eaf0;margin-bottom:3px">' + latest.title + '</div>',
      latest.description ? '    <div style="font-size:12px;color:#9098b8">' + latest.description.slice(0,80) + (latest.description.length>80?'…':'') + '</div>' : '',
      '  </div>',
      '  <button onclick="this.closest(\'div[style*=fixed]\').remove();localStorage.setItem(\'' + SEEN_KEY + '\',\'' + latest.id + '\')" style="background:none;border:none;color:#5a6280;cursor:pointer;font-size:16px;padding:0;flex-shrink:0">✕</button>',
      '</div>',
    ].join('');
    document.body.appendChild(badge);
    setTimeout(() => { badge.remove(); localStorage.setItem(SEEN_KEY, latest.id); }, 8000);
  }).catch(()=>{});
})();
</script>`

  // ── Cloudflare Pages Changelog Page ──────────────────────────────
  const cfChangelogPage = `// functions/changelog.js — Cloudflare Pages Function
// Route: /changelog

const SITE_ID = '${siteId}';
const API = '${APP}';
const TITLE = '${cfg.widget_title}';
const COLOR = '${cfg.widget_color}';
const SITE_NAME = '${sites.find(s => s.id === selectedSite)?.name || 'Website'}';
const LIMIT = ${cfg.max_entries};

const TYPE_COLORS = { feature:'#5b6af6', fix:'#22c55e', improvement:'#f59e0b', breaking:'#ef4444' };
const TYPE_LABELS = { feature:'Feature', fix:'Fix', improvement:'Verbesserung', breaking:'Breaking' };

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtDate(d){ return new Date(d).toLocaleDateString('de-DE',{year:'numeric',month:'long',day:'numeric'}); }

export async function onRequestGet() {
  let entries = [];
  try {
    const res = await fetch(\`\${API}/api/public/changelog?site_id=\${SITE_ID}&limit=\${LIMIT}\`);
    if (res.ok) entries = await res.json();
  } catch {}

  const rows = entries.map(e => {
    const col = TYPE_COLORS[e.type] || COLOR;
    const lbl = TYPE_LABELS[e.type] || e.type;
    return \`<div style="padding:20px 0;border-bottom:1px solid #1f2438;display:flex;gap:14px;align-items:flex-start">
      <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;background:\${col}18;color:\${col};border:1px solid \${col}30;white-space:nowrap;margin-top:2px">\${lbl}</span>
      <div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px">
          <strong style="font-size:15px;color:#e8eaf0">\${esc(e.title)}</strong>
          \${e.version ? \`<span style="font-size:11px;color:#5a6280;font-family:monospace">v\${esc(e.version)}</span>\` : ''}
        </div>
        \${e.description ? \`<p style="font-size:13px;color:#9098b8;margin:0 0 5px">\${esc(e.description)}</p>\` : ''}
        <time style="font-size:11px;color:#5a6280">\${fmtDate(e.published_at||e.created_at)}</time>
      </div>
    </div>\`;
  }).join('') || '<p style="color:#5a6280;padding:2rem 0">Noch keine Einträge veröffentlicht.</p>';

  const html = \`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>\${TITLE} – \${SITE_NAME}</title>
  <style>body{font-family:-apple-system,sans-serif;background:#0c0e14;color:#e8eaf0;margin:0;padding:2rem 1rem}.wrap{max-width:680px;margin:0 auto}h1{font-size:1.8rem;font-weight:900;margin-bottom:.5rem}nav{margin-bottom:2rem}nav a{color:#9098b8;text-decoration:none;font-size:14px}nav a:hover{color:\${COLOR}}</style>
</head>
<body>
<div class="wrap">
  <nav><a href="/">← \${SITE_NAME}</a></nav>
  <h1>\${TITLE}</h1>
  <p style="color:#9098b8;margin-bottom:2rem">Alle Updates und Änderungen auf einen Blick.</p>
  \${rows}
</div>
</body>
</html>\`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
}`

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <a href="/dashboard/changelog" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}>← Changelog</a>
        <h1 style={{ fontWeight: 900, fontSize: 22 }}>🗂️ Changelog Setup & Einbindung</h1>
      </div>

      {/* Site Selector */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>1. Website wählen</div>
        <select style={{ ...inp, maxWidth: 340 }} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
          <option value="">Website wählen…</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {selectedSite && <>

        {/* Config */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>2. Changelog konfigurieren</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Widget-Titel</label>
              <input style={inp} value={cfg.widget_title} onChange={e => setCfg(c => ({ ...c, widget_title: e.target.value }))} placeholder="Changelog" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Farbe</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={cfg.widget_color} onChange={e => setCfg(c => ({ ...c, widget_color: e.target.value }))} style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', padding: 2 }} />
                <input style={{ ...inp, flex: 1 }} value={cfg.widget_color} onChange={e => setCfg(c => ({ ...c, widget_color: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Max. Einträge</label>
              <input type="number" style={inp} value={cfg.max_entries} min={1} max={50}
                onChange={e => setCfg(c => ({ ...c, max_entries: +e.target.value }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
                <input type="checkbox" checked={cfg.show_version} onChange={e => setCfg(c => ({ ...c, show_version: e.target.checked }))} />
                Versionsnummer anzeigen
              </label>
            </div>
          </div>

          {/* Types */}
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Sichtbare Typen</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(TYPE_INFO).map(([key, info]) => {
                const on = cfg.show_types.includes(key)
                return (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${on ? info.color + '44' : 'var(--border)'}`, background: on ? info.color + '12' : 'var(--bg)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: on ? info.color : 'var(--text2)' }}>
                    <input type="checkbox" checked={on} onChange={e => setCfg(c => ({ ...c, show_types: e.target.checked ? [...c.show_types, key] : c.show_types.filter(x => x !== key) }))} style={{ display: 'none' }} />
                    {info.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <button onClick={save} disabled={saving} style={{ padding: '11px 24px', borderRadius: 9, background: saved ? '#22c55e' : 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
              {saved ? '✓ Gespeichert' : saving ? 'Speichern…' : 'Konfiguration speichern'}
            </button>
          </div>
        </div>

        {/* API */}
        <Section title="API-Endpunkt" icon={<Zap size={16} color="#f59e0b" />} open>
          <div style={{ paddingTop: 16 }}>
            <CopyBox label="GET Changelog-Einträge" code={`${APP}/api/public/changelog?site_id=${siteId}&limit=${cfg.max_entries}`} />
            <CopyBox label="GET — nur bestimmte Typen" code={`${APP}/api/public/changelog?site_id=${siteId}&type=feature`} />
          </div>
        </Section>

        {/* Inline Widget */}
        <Section title="Inline Widget — JavaScript" icon={<Globe size={16} color="#22c55e" />}>
          <div style={{ paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
              <code style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, background: 'var(--bg)', padding: '1px 6px', borderRadius: 4 }}>&lt;div id="sc-changelog"&gt;&lt;/div&gt;</code> auf der Seite platzieren, dann das Script einfügen.
            </p>
            <CopyBox label="Inline Changelog Widget" code={inlineWidget} />
          </div>
        </Section>

        {/* Floating Badge */}
        <Section title='Floating Badge — "Was ist neu?"' icon={<Code size={16} color="#a78bfa" />}>
          <div style={{ paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
              Erscheint unten links wenn ein neuer Eintrag da ist. Wird automatisch ausgeblendet wenn der Nutzer ihn gesehen hat (via localStorage).
            </p>
            <CopyBox label="Floating Changelog Badge" code={floatingBadge} />
          </div>
        </Section>

        {/* Cloudflare Pages */}
        <Section title="Cloudflare Pages Function — /changelog" icon={<Code size={16} color="#f97316" />}>
          <div style={{ paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
              Komplette SSR-Changelog-Seite als Cloudflare Pages Function.
            </p>
            <CopyBox label="functions/changelog.js" code={cfChangelogPage} />
          </div>
        </Section>

      </>}
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, Check, ChevronDown, ChevronRight, Globe, Code, FileText, Zap } from 'lucide-react'

const APP = 'https://site-control-nine.vercel.app'
const LANGS_ALL = [
  { code: 'de', label: 'Deutsch' }, { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' }, { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
]

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

function Section({ title, icon, open: defOpen = false, children }: { title: string; icon: React.ReactNode; open?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defOpen)
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text1)', fontFamily: 'inherit', textAlign: 'left' }}>
        {icon}
        <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{title}</span>
        {open ? <ChevronDown size={16} color="var(--text3)" /> : <ChevronRight size={16} color="var(--text3)" />}
      </button>
      {open && <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>{children}</div>}
    </div>
  )
}

interface Site { id: string; name: string; url: string; slug: string }

export default function BlogSetupPage() {
  const searchParams = useSearchParams()
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSite, setSelectedSite] = useState('')
  const [settings, setSettings] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cfg, setCfg] = useState({
    langs: ['de'] as string[],
    base_url: '',
    site_name: '',
    site_logo: '',
    primary_color: '#5b6af6',
    accent_color: '#a78bfa',
    play_url: '',
    play_label: '🎮 Jetzt spielen →',
    footer_links: [] as { label: string; href: string }[],
  })

  useEffect(() => {
    fetch('/api/sites').then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setSites(d)
        const fromUrl = searchParams.get('site')
        const first = fromUrl || d[0]?.id || ''
        setSelectedSite(first)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedSite) return
    fetch(`/api/site-settings?site_id=${selectedSite}`).then(r => r.json()).then(d => {
      setSettings(d)
      if (d.blog_config) setCfg({ ...cfg, ...d.blog_config })
    })
  }, [selectedSite])

  async function save() {
    setSaving(true)
    await fetch('/api/site-settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: selectedSite, blog_enabled: true, blog_config: cfg }),
    })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const site = sites.find(s => s.id === selectedSite)
  const siteId = selectedSite
  const base = cfg.base_url || site?.url || 'https://meineblog.de'
  const langs = cfg.langs.length ? cfg.langs : ['de']

  // ── Cloudflare Pages Function Code ────────────────────────────────
  const cfFunction = `// Cloudflare Pages Function
// Pfad: functions/blog/[lang]/[slug].js
// Erstellt SEO-optimierte Blog-Post-Seiten

const API = '${APP}';
const SITE_ID = '${siteId}';
const BASE_URL = '${base}';
const SITE_NAME = '${cfg.site_name || site?.name || 'Meine Website'}';
const PRIMARY = '${cfg.primary_color}';
const LANGS = ${JSON.stringify(langs)};

const LANG_META = {
  de: { locale:'de_DE', back:'← Blog', readMore:'Mehr Artikel', play:'${cfg.play_label || '→ Zur Website'}', notFound:'Artikel nicht gefunden.' },
  en: { locale:'en_US', back:'← Blog', readMore:'More Articles', play:'${cfg.play_label || '→ Visit Website'}', notFound:'Article not found.' },
  fr: { locale:'fr_FR', back:'← Blog', readMore:"Plus d'articles", play:'${cfg.play_label || '→ Visiter'}', notFound:'Article introuvable.' },
  es: { locale:'es_ES', back:'← Blog', readMore:'Más artículos', play:'${cfg.play_label || '→ Visitar'}', notFound:'Artículo no encontrado.' },
  it: { locale:'it_IT', back:'← Blog', readMore:'Altri articoli', play:'${cfg.play_label || '→ Visita'}', notFound:'Articolo non trovato.' },
};

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmtDate(d,lang){ const loc={de:'de-DE',en:'en-GB',fr:'fr-FR',es:'es-ES',it:'it-IT'}; return new Date(d).toLocaleDateString(loc[lang]||'en-GB',{year:'numeric',month:'long',day:'numeric'}); }

function renderHTML(post, lang, m, siblings) {
  const desc = post.meta_description || post.excerpt || post.title;
  const canonical = \`\${BASE_URL}/blog/\${lang}/\${post.slug}\`;
  const hreflangs = siblings.map(s =>
    \`  <link rel="alternate" hreflang="\${s.lang}" href="\${BASE_URL}/blog/\${s.lang}/\${s.slug}">\`
  ).join('\\n');
  const enSib = siblings.find(s => s.lang === 'en');
  const xDefault = enSib
    ? \`  <link rel="alternate" hreflang="x-default" href="\${BASE_URL}/blog/en/\${enSib.slug}">\`
    : '';
  const tags = (post.tags||'').split(',').map(t=>t.trim()).filter(Boolean);

  return \`<!DOCTYPE html>
<html lang="\${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${esc(post.title)} – \${SITE_NAME}</title>
  <meta name="description" content="\${esc(desc)}">
  \${post.meta_keywords?.length ? \`<meta name="keywords" content="\${esc(Array.isArray(post.meta_keywords)?post.meta_keywords.join(', '):post.meta_keywords)}">\` : ''}
  <link rel="canonical" href="\${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="\${esc(post.title)}">
  <meta property="og:description" content="\${esc(desc)}">
  <meta property="og:url" content="\${canonical}">
  <meta property="og:locale" content="\${m.locale}">
  \${hreflangs}
  \${xDefault}
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":\${JSON.stringify(post.title)},"description":\${JSON.stringify(desc)},"datePublished":"\${post.published_at||post.created_at}","url":"\${canonical}","inLanguage":"\${lang}"}<\/script>
  <style>
    :root{--brand:${cfg.primary_color};--accent:${cfg.accent_color}}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0c0e14;color:#e8eaf0;line-height:1.7}
    .wrap{max-width:760px;margin:0 auto;padding:2rem 1.5rem 4rem}
    .nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem}
    .nav a{color:#9098b8;text-decoration:none;font-size:14px}
    .nav a:hover{color:var(--brand)}
    .logo{background:linear-gradient(135deg,var(--brand),var(--accent));color:#fff;width:28px;height:28px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;margin-right:6px;vertical-align:middle}
    .meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center}
    .tag{font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;background:rgba(91,106,246,.15);color:var(--brand);text-decoration:none}
    .date{font-size:12px;color:#5a6280}
    h1{font-size:clamp(1.5rem,4vw,2rem);font-weight:800;line-height:1.25;margin-bottom:1rem}
    .excerpt{font-size:1.05rem;color:#9098b8;border-left:3px solid var(--brand);padding-left:1rem;margin-bottom:2rem}
    hr{border:none;border-top:1px solid #1f2438;margin:2rem 0}
    .body{font-size:1rem;color:#9098b8}
    .body h2{font-size:1.3rem;font-weight:700;color:#e8eaf0;margin:2rem 0 .75rem}
    .body h3{font-size:1.1rem;font-weight:700;color:#e8eaf0;margin:1.5rem 0 .5rem}
    .body p{margin-bottom:1rem}
    .body ul,.body ol{padding-left:1.4rem;margin-bottom:1rem}
    .body strong{color:#e8eaf0}
    .body a{color:var(--brand)}
    .cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:2.5rem}
    .btn-back{display:inline-flex;align-items:center;padding:10px 20px;border-radius:10px;background:rgba(91,106,246,.1);color:var(--brand);text-decoration:none;font-weight:600;font-size:.9rem;border:1px solid rgba(91,106,246,.25)}
    .btn-play{display:inline-flex;align-items:center;padding:10px 20px;border-radius:10px;background:linear-gradient(135deg,var(--brand),var(--accent));color:#fff;text-decoration:none;font-weight:700;font-size:.9rem}
    footer{text-align:center;padding:24px;color:#5a6280;font-size:13px;border-top:1px solid #1f2438;margin-top:2rem}
    footer a{color:#5a6280;text-decoration:none}
  </style>
</head>
<body>
<article class="wrap">
  <nav class="nav">
    <a href="/"><span class="logo">\${SITE_NAME.charAt(0).toUpperCase()}</span>\${SITE_NAME}</a>
    <a href="/blog/">\${m.back}</a>
  </nav>
  <div class="meta">
    \${tags.map(t=>\`<a href="/blog/?tag=\${encodeURIComponent(t)}" class="tag">\${esc(t)}</a>\`).join('')}
    <time class="date">\${fmtDate(post.published_at||post.created_at, lang)}</time>
  </div>
  <h1>\${esc(post.title)}</h1>
  \${post.excerpt?\`<p class="excerpt">\${esc(post.excerpt)}</p>\`:''}
  <hr>
  <div class="body">\${post.content||''}</div>
  <hr>
  <div class="cta">
    <a href="/blog/" class="btn-back">\${m.readMore}</a>
    \${${JSON.stringify(cfg.play_url)}?\`<a href="${cfg.play_url}" class="btn-play">\${m.play}</a>\`:''}
  </div>
</article>
<footer>\${SITE_NAME} · <a href="/blog/">Blog</a> · <a href="/impressum.html">Impressum</a> · <a href="/datenschutz.html">Datenschutz</a></footer>
</body>
</html>\`;
}

export async function onRequestGet({ params }) {
  const { lang, slug } = params;
  if (!LANGS.includes(lang)) return new Response('Not Found', { status: 404 });
  const m = LANG_META[lang] || LANG_META.de;

  let post;
  try {
    const res = await fetch(\`\${API}/api/public/blog?site_id=\${SITE_ID}&lang=\${lang}&slug=\${encodeURIComponent(slug)}\`);
    if (!res.ok) throw new Error('not found');
    post = await res.json();
  } catch {
    return new Response(\`<!DOCTYPE html><html lang="\${lang}"><body style="font-family:sans-serif;padding:2rem;background:#0c0e14;color:#e8eaf0"><h1>404 – \${m.notFound}</h1><a href="/blog/" style="color:#5b6af6">\${m.back}</a></body></html>\`, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // Fetch sibling translations via group_id for hreflang
  let siblings = [{ lang, slug }];
  if (post.group_id) {
    try {
      const sr = await fetch(\`\${API}/api/public/blog?site_id=\${SITE_ID}&group_id=\${encodeURIComponent(post.group_id)}\`);
      if (sr.ok) { const d = await sr.json(); if (Array.isArray(d) && d.length) siblings = d; }
    } catch {}
  }

  return new Response(renderHTML(post, lang, m, siblings), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=600, s-maxage=1800' },
  });
}`

  // ── Sitemap Function ──────────────────────────────────────────────
  const sitemapFunction = `// functions/sitemap.xml.js — Cloudflare Pages Function
export async function onRequestGet() {
  const res = await fetch(
    '${APP}/api/public/sitemap?site_id=${siteId}&base_url=${base}&langs=${langs.join(',')}'
  );
  const xml = await res.text();
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
}`

  // ── Next.js Dynamic Route ─────────────────────────────────────────
  const nextjsRoute = `// app/blog/[lang]/[slug]/page.tsx (Next.js 14 App Router)
import { notFound } from 'next/navigation'

const API = '${APP}'
const SITE_ID = '${siteId}'

export async function generateMetadata({ params }: any) {
  const res = await fetch(\`\${API}/api/public/blog?site_id=\${SITE_ID}&lang=\${params.lang}&slug=\${params.slug}\`, { next: { revalidate: 300 } })
  if (!res.ok) return {}
  const post = await res.json()
  return {
    title: post.title,
    description: post.meta_description || post.excerpt,
    alternates: { canonical: \`${base}/blog/\${params.lang}/\${params.slug}\` },
  }
}

export default async function BlogPost({ params }: any) {
  const res = await fetch(\`\${API}/api/public/blog?site_id=\${SITE_ID}&lang=\${params.lang}&slug=\${params.slug}\`, { next: { revalidate: 300 } })
  if (!res.ok) notFound()
  const post = await res.json()

  return (
    <article>
      <h1>{post.title}</h1>
      {post.excerpt && <p>{post.excerpt}</p>}
      <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
    </article>
  )
}

export async function generateStaticParams() {
  const res = await fetch(\`\${API}/api/public/blog?site_id=\${SITE_ID}&limit=100\`)
  const { posts } = await res.json()
  return (posts || []).map((p: any) => ({ lang: p.lang, slug: p.slug }))
}`

  // ── Blog Listing JS ───────────────────────────────────────────────
  const blogListingJs = `// Vanilla JS – Blog-Liste laden und rendern
// In deine blog/index.html einbinden

const SITE_ID = '${siteId}';
const API = '${APP}';

async function loadBlogPosts(lang = 'de', container = '#blog-list') {
  const el = document.querySelector(container);
  if (!el) return;

  const res = await fetch(\`\${API}/api/public/blog?site_id=\${SITE_ID}&lang=\${lang}&limit=20\`);
  const { posts } = await res.json();

  el.innerHTML = posts.map(p => \`
    <article style="margin-bottom:2rem;padding-bottom:2rem;border-bottom:1px solid #1f2438">
      <time style="font-size:12px;color:#5a6280">\${new Date(p.published_at||p.created_at).toLocaleDateString()}</time>
      <h2 style="margin:.5rem 0"><a href="/blog/\${lang}/\${p.slug}" style="color:#e8eaf0;text-decoration:none">\${p.title}</a></h2>
      \${p.excerpt ? \`<p style="color:#9098b8">\${p.excerpt}</p>\` : ''}
    </article>
  \`).join('') || '<p>Keine Artikel gefunden.</p>';
}

// Usage: loadBlogPosts('de', '#blog-list');`

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <a href="/dashboard/blog" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}>← Blog</a>
        <h1 style={{ fontWeight: 900, fontSize: 22 }}>📝 Blog Setup & Einbindung</h1>
      </div>

      {/* Site Selector */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>1. Website wählen</div>
        <select style={{ ...inp, maxWidth: 340 }} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
          <option value="">Website wählen…</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.url.replace('https://', '')})</option>)}
        </select>
      </div>

      {selectedSite && <>

        {/* Config */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>2. Blog konfigurieren</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Site-Name (für Blog-Header)</label>
              <input style={inp} value={cfg.site_name} onChange={e => setCfg(c => ({ ...c, site_name: e.target.value }))} placeholder={site?.name || 'Meine Website'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Base-URL (ohne /)</label>
              <input style={inp} value={cfg.base_url} onChange={e => setCfg(c => ({ ...c, base_url: e.target.value }))} placeholder={site?.url || 'https://meineblog.de'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Primärfarbe</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={cfg.primary_color} onChange={e => setCfg(c => ({ ...c, primary_color: e.target.value }))} style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', padding: 2 }} />
                <input style={{ ...inp, flex: 1 }} value={cfg.primary_color} onChange={e => setCfg(c => ({ ...c, primary_color: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Akzentfarbe</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={cfg.accent_color} onChange={e => setCfg(c => ({ ...c, accent_color: e.target.value }))} style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', padding: 2 }} />
                <input style={{ ...inp, flex: 1 }} value={cfg.accent_color} onChange={e => setCfg(c => ({ ...c, accent_color: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>CTA-URL (Play / Zurück-Button)</label>
              <input style={inp} value={cfg.play_url} onChange={e => setCfg(c => ({ ...c, play_url: e.target.value }))} placeholder="https://meineblog.de/spielen" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>CTA-Label</label>
              <input style={inp} value={cfg.play_label} onChange={e => setCfg(c => ({ ...c, play_label: e.target.value }))} placeholder="🎮 Jetzt spielen →" />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Unterstützte Sprachen</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LANGS_ALL.map(l => (
                <label key={l.code} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${cfg.langs.includes(l.code) ? 'rgba(91,106,246,.4)' : 'var(--border)'}`, background: cfg.langs.includes(l.code) ? 'rgba(91,106,246,.08)' : 'var(--bg)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: cfg.langs.includes(l.code) ? '#7e93fb' : 'var(--text2)' }}>
                  <input type="checkbox" checked={cfg.langs.includes(l.code)} onChange={e => setCfg(c => ({ ...c, langs: e.target.checked ? [...c.langs, l.code] : c.langs.filter(x => x !== l.code) }))} style={{ display: 'none' }} />
                  {l.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <button onClick={save} disabled={saving} style={{ padding: '11px 24px', borderRadius: 9, background: saved ? '#22c55e' : 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', transition: 'background .3s' }}>
              {saved ? '✓ Gespeichert' : saving ? 'Speichern…' : 'Konfiguration speichern'}
            </button>
          </div>
        </div>

        {/* API-Endpunkte */}
        <Section title="API-Endpunkte" icon={<Zap size={16} color="#f59e0b" />} open>
          <div style={{ paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 16 }}>
              Alle Endpunkte sind öffentlich — kein API-Key nötig. CORS ist offen (<code style={{ fontFamily: 'Space Mono, monospace', fontSize: 11 }}>*</code>).
            </p>
            {[
              { label: 'Posts liste (DE)', url: `${APP}/api/public/blog?site_id=${siteId}&lang=de&limit=20` },
              { label: 'Einzelner Post', url: `${APP}/api/public/blog?site_id=${siteId}&lang=de&slug=DEIN-SLUG` },
              { label: 'Alle Sprachen eines Posts (via group_id)', url: `${APP}/api/public/blog?site_id=${siteId}&group_id=DEINE-GROUP-ID` },
              { label: 'Dynamische Sitemap', url: `${APP}/api/public/sitemap?site_id=${siteId}&base_url=${base}&langs=${langs.join(',')}` },
            ].map(e => (
              <CopyBox key={e.label} label={e.label} code={e.url} />
            ))}
          </div>
        </Section>

        {/* Cloudflare Pages Function */}
        <Section title="Cloudflare Pages Function — [slug].js" icon={<Code size={16} color="#f97316" />}>
          <div style={{ paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
              Diese Datei in deinem Cloudflare Pages Projekt unter <code style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, background: 'var(--bg)', padding: '1px 6px', borderRadius: 4 }}>functions/blog/[lang]/[slug].js</code> ablegen. Rendert Blog-Posts server-seitig mit vollem SEO (Canonical, OG, JSON-LD, hreflang).
            </p>
            <CopyBox label="functions/blog/[lang]/[slug].js" code={cfFunction} />
            <CopyBox label="functions/sitemap.xml.js" code={sitemapFunction} />
          </div>
        </Section>

        {/* Next.js */}
        <Section title="Next.js App Router — Dynamic Route" icon={<Globe size={16} color="#60a5fa" />}>
          <div style={{ paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
              Für Next.js-Projekte: <code style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, background: 'var(--bg)', padding: '1px 6px', borderRadius: 4 }}>app/blog/[lang]/[slug]/page.tsx</code>
            </p>
            <CopyBox label="app/blog/[lang]/[slug]/page.tsx" code={nextjsRoute} />
          </div>
        </Section>

        {/* Vanilla JS Listing */}
        <Section title="Vanilla JS — Blog-Liste" icon={<FileText size={16} color="#22c55e" />}>
          <div style={{ paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
              Für statische HTML-Seiten: Blog-Posts via JS laden und rendern.
            </p>
            <CopyBox label="blog-loader.js" code={blogListingJs} />
          </div>
        </Section>

      </>}
    </div>
  )
}

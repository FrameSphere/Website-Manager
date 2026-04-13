'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  FileText, LifeBuoy, Layers, Globe, Code, Download, Check, Copy,
  ChevronRight, ChevronLeft, AlertCircle, Zap, Monitor, Cloud, Info,
  ArrowRight, ExternalLink, Star, Smartphone
} from 'lucide-react'

const APP = process.env.NEXT_PUBLIC_APP_URL || 'https://site-control-nine.vercel.app'

// ── Types ──────────────────────────────────────────────────────────
type Feature = 'blog' | 'support' | 'changelog'
type Platform = 'cloudflare' | 'nextjs' | 'html'

interface Site { id: string; name: string; url: string; slug: string }

// ── Helpers ────────────────────────────────────────────────────────
function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function CopyBlock({ code, label, filename }: { code: string; label?: string; filename?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label || 'Code'}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {filename && (
            <button onClick={() => downloadFile(filename, code)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text3)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
              <Download size={10} /> Herunterladen
            </button>
          )}
          <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 5, border: '1px solid var(--border)', background: copied ? 'rgba(34,197,94,.1)' : 'var(--surface)', color: copied ? '#22c55e' : 'var(--text3)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
            {copied ? <><Check size={10} /> Kopiert</> : <><Copy size={10} /> Kopieren</>}
          </button>
        </div>
      </div>
      <pre style={{ padding: '14px 16px', fontSize: 12, lineHeight: 1.65, overflowX: 'auto', margin: 0, color: 'var(--text2)', fontFamily: 'Space Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 420 }}>{code}</pre>
    </div>
  )
}

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0, fontSize: 12, fontWeight: 800,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: done ? '#22c55e' : active ? '#5b6af6' : 'var(--bg)',
      border: `2px solid ${done ? '#22c55e' : active ? '#5b6af6' : 'var(--border)'}`,
      color: done || active ? '#fff' : 'var(--text3)',
    }}>
      {done ? <Check size={13} /> : n}
    </div>
  )
}

// ── Code Generators ────────────────────────────────────────────────
function genBlogCF(siteId: string, site: Site, cfg: any) {
  const base = cfg.base_url || site.url
  const langs = cfg.langs?.length ? cfg.langs : ['de']
  const name = cfg.site_name || site.name
  return `// functions/blog/[lang]/[slug].js
// Cloudflare Pages Function — SSR Blog-Posts mit SEO
// Pfad: functions/blog/[lang]/[slug].js

const API = '${APP}';
const SITE_ID = '${siteId}';
const BASE_URL = '${base}';
const SITE_NAME = '${name}';
const PRIMARY = '${cfg.primary_color || '#5b6af6'}';
const ACCENT = '${cfg.accent_color || '#a78bfa'}';
const LANGS = ${JSON.stringify(langs)};
const PLAY_URL = '${cfg.play_url || ''}';
const PLAY_LABEL = '${cfg.play_label || '→ Zur Website'}';

const LANG_META = {
  de: { locale:'de_DE', back:'← Blog', readMore:'Mehr Artikel', notFound:'Artikel nicht gefunden.' },
  en: { locale:'en_US', back:'← Blog', readMore:'More Articles', notFound:'Article not found.' },
  fr: { locale:'fr_FR', back:'← Blog', readMore:"Plus d'articles", notFound:'Article introuvable.' },
  es: { locale:'es_ES', back:'← Blog', readMore:'Más artículos', notFound:'Artículo no encontrado.' },
  it: { locale:'it_IT', back:'← Blog', readMore:'Altri articoli', notFound:'Articolo non trovato.' },
};

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmtDate(d,lang){
  const loc={de:'de-DE',en:'en-GB',fr:'fr-FR',es:'es-ES',it:'it-IT'};
  return new Date(d).toLocaleDateString(loc[lang]||'en-GB',{year:'numeric',month:'long',day:'numeric'});
}

export async function onRequestGet({ params }) {
  const { lang, slug } = params;
  if (!LANGS.includes(lang)) return new Response('Not Found', { status: 404 });
  const m = LANG_META[lang] || LANG_META.de;

  let post;
  try {
    const res = await fetch(\`\${API}/api/public/blog?site_id=\${SITE_ID}&lang=\${lang}&slug=\${encodeURIComponent(slug)}\`);
    if (!res.ok) throw new Error();
    post = await res.json();
  } catch {
    return new Response(
      \`<!DOCTYPE html><html lang="\${lang}"><body style="font-family:sans-serif;background:#0c0e14;color:#e8eaf0;padding:2rem"><h1>404</h1><p>\${m.notFound}</p><a href="/blog/" style="color:\${PRIMARY}">\${m.back}</a></body></html>\`,
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Sibling translations für hreflang
  let siblings = [{ lang, slug }];
  if (post.group_id) {
    try {
      const sr = await fetch(\`\${API}/api/public/blog?site_id=\${SITE_ID}&group_id=\${post.group_id}\`);
      if (sr.ok) { const d = await sr.json(); if (Array.isArray(d)) siblings = d; }
    } catch {}
  }

  const canonical = \`\${BASE_URL}/blog/\${lang}/\${post.slug}\`;
  const desc = post.meta_description || post.excerpt || post.title;
  const tags = (post.tags||'').split(',').map(t=>t.trim()).filter(Boolean);
  const hreflangs = siblings.map(s => \`<link rel="alternate" hreflang="\${s.lang}" href="\${BASE_URL}/blog/\${s.lang}/\${s.slug}">\`).join('\\n  ');
  const jsonLD = JSON.stringify({ "@context":"https://schema.org","@type":"Article","headline":post.title,"description":desc,"datePublished":post.published_at||post.created_at,"url":canonical,"inLanguage":lang });

  const html = \`<!DOCTYPE html>
<html lang="\${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${esc(post.title)} – \${SITE_NAME}</title>
  <meta name="description" content="\${esc(desc)}">
  <link rel="canonical" href="\${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="\${esc(post.title)}">
  <meta property="og:description" content="\${esc(desc)}">
  <meta property="og:url" content="\${canonical}">
  \${hreflangs}
  <script type="application/ld+json">\${jsonLD}<\\/script>
  <style>
    :root{--brand:\${PRIMARY};--accent:\${ACCENT}}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0c0e14;color:#e8eaf0;line-height:1.7}
    .wrap{max-width:760px;margin:0 auto;padding:2rem 1.5rem 4rem}
    .nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;gap:10px}
    .nav a{color:#9098b8;text-decoration:none;font-size:14px;display:flex;align-items:center;gap:6px}
    .nav a:hover{color:var(--brand)}
    .logo{background:linear-gradient(135deg,var(--brand),var(--accent));color:#fff;width:28px;height:28px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;flex-shrink:0}
    .meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center}
    .tag{font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;background:rgba(91,106,246,.15);color:var(--brand);text-decoration:none;border:1px solid rgba(91,106,246,.2)}
    .date{font-size:12px;color:#5a6280;font-family:monospace}
    h1{font-size:clamp(1.5rem,4vw,2rem);font-weight:900;line-height:1.2;margin-bottom:1rem;letter-spacing:-.02em}
    .excerpt{font-size:1.05rem;color:#9098b8;border-left:3px solid var(--brand);padding-left:1rem;margin-bottom:2rem;line-height:1.7}
    hr{border:none;border-top:1px solid #1f2438;margin:2rem 0}
    .body{font-size:1rem;color:#9098b8;line-height:1.8}
    .body h2{font-size:1.3rem;font-weight:800;color:#e8eaf0;margin:2rem 0 .75rem;letter-spacing:-.01em}
    .body h3{font-size:1.1rem;font-weight:700;color:#e8eaf0;margin:1.5rem 0 .5rem}
    .body p{margin-bottom:1.1rem}
    .body ul,.body ol{padding-left:1.5rem;margin-bottom:1rem}
    .body li{margin-bottom:.4rem}
    .body strong{color:#e8eaf0;font-weight:700}
    .body a{color:var(--brand);text-decoration:underline}
    .body code{font-family:monospace;background:#1f2438;padding:2px 6px;border-radius:4px;font-size:.9em}
    .body pre{background:#111420;border:1px solid #1f2438;border-radius:8px;padding:1rem;overflow-x:auto;margin-bottom:1rem}
    .cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:2.5rem}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:11px 22px;border-radius:10px;font-weight:600;font-size:.9rem;text-decoration:none}
    .btn-back{background:rgba(91,106,246,.1);color:var(--brand);border:1px solid rgba(91,106,246,.25)}
    .btn-play{background:linear-gradient(135deg,var(--brand),var(--accent));color:#fff}
    footer{text-align:center;padding:28px;color:#5a6280;font-size:13px;border-top:1px solid #1f2438;margin-top:2rem}
    footer a{color:#5a6280;text-decoration:none}
    footer a:hover{color:var(--brand)}
    @media(max-width:640px){.nav{flex-wrap:wrap}}
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

  \${post.excerpt ? \`<p class="excerpt">\${esc(post.excerpt)}</p>\` : ''}

  <hr>

  <div class="body">
    \${post.content || '<p style="color:#5a6280">Noch kein Inhalt.</p>'}
  </div>

  <hr>

  <div class="cta">
    <a href="/blog/" class="btn btn-back">\${m.readMore}</a>
    \${PLAY_URL ? \`<a href="\${PLAY_URL}" class="btn btn-play">\${PLAY_LABEL}</a>\` : ''}
  </div>
</article>

<footer>
  \${SITE_NAME} &middot; <a href="/blog/">Blog</a>
  \${PLAY_URL ? \` &middot; <a href="\${PLAY_URL}">\${PLAY_LABEL}</a>\` : ''}
</footer>
</body>
</html>\`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=1800',
    }
  });
}`
}

function genBlogSitemap(siteId: string, site: Site, cfg: any) {
  const base = cfg.base_url || site.url
  const langs = cfg.langs?.length ? cfg.langs : ['de']
  return `// functions/sitemap.xml.js
// Cloudflare Pages Function — dynamische Blog-Sitemap
// Pfad: functions/sitemap.xml.js

export async function onRequestGet() {
  const res = await fetch(
    '${APP}/api/public/sitemap?site_id=${siteId}&base_url=${base}&langs=${langs.join(',')}'
  );
  const xml = await res.text();
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    }
  });
}`
}

function genBlogNextJS(siteId: string, site: Site, cfg: any) {
  const base = cfg.base_url || site.url
  return `// app/blog/[lang]/[slug]/page.tsx
// Next.js 14 App Router — Blog-Post-Seite mit ISR

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const API = '${APP}'
const SITE_ID = '${siteId}'
const BASE_URL = '${base}'

type Params = { lang: string; slug: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const res = await fetch(
    \`\${API}/api/public/blog?site_id=\${SITE_ID}&lang=\${params.lang}&slug=\${params.slug}\`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) return { title: 'Not Found' }
  const post = await res.json()
  return {
    title: post.title,
    description: post.meta_description || post.excerpt,
    alternates: {
      canonical: \`\${BASE_URL}/blog/\${params.lang}/\${params.slug}\`,
    },
    openGraph: {
      title: post.title,
      description: post.meta_description || post.excerpt,
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const res = await fetch(
    \`\${API}/api/public/blog?site_id=\${SITE_ID}&lang=\${params.lang}&slug=\${params.slug}\`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) notFound()
  const post = await res.json()

  return (
    <article>
      <h1>{post.title}</h1>
      {post.excerpt && <p className="lead">{post.excerpt}</p>}
      <time>{new Date(post.published_at || post.created_at).toLocaleDateString('de-DE')}</time>
      <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
    </article>
  )
}

// Statische Pfade für Build-Zeit generieren
export async function generateStaticParams() {
  const res = await fetch(\`\${API}/api/public/blog?site_id=\${SITE_ID}&limit=100\`)
  const { posts } = await res.json()
  return (posts || []).map((p: any) => ({ lang: p.lang, slug: p.slug }))
}`
}

function genBlogListing(siteId: string) {
  return `<!-- Blog-Liste: Einfach in deine HTML-Seite einbinden -->
<!-- 1. <div id="blog-list"></div> an die Stelle wo die Liste erscheinen soll -->
<!-- 2. Script darunter einfügen -->

<div id="blog-list">
  <p style="color:#9098b8">Beiträge werden geladen…</p>
</div>

<script>
(function() {
  var SITE_ID = '${siteId}';
  var API = '${APP}';
  var lang = document.documentElement.lang || 'de';

  fetch(API + '/api/public/blog?site_id=' + SITE_ID + '&lang=' + lang + '&limit=20')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var posts = data.posts || [];
      var el = document.getElementById('blog-list');
      if (!el) return;

      if (!posts.length) {
        el.innerHTML = '<p style="color:#9098b8">Noch keine Beiträge veröffentlicht.</p>';
        return;
      }

      el.innerHTML = posts.map(function(p) {
        var date = new Date(p.published_at || p.created_at).toLocaleDateString('de-DE', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        return [
          '<article style="margin-bottom:2rem;padding-bottom:2rem;border-bottom:1px solid rgba(255,255,255,.08)">',
          '  <time style="font-size:12px;color:#5a6280">' + date + '</time>',
          '  <h2 style="margin:.4rem 0 .5rem;font-size:1.1rem">',
          '    <a href="/blog/' + lang + '/' + p.slug + '" style="color:#e8eaf0;text-decoration:none">' + p.title + '</a>',
          '  </h2>',
          p.excerpt ? '  <p style="color:#9098b8;margin:0;font-size:.9rem">' + p.excerpt + '</p>' : '',
          '</article>',
        ].join('\\n');
      }).join('');
    })
    .catch(function() {
      var el = document.getElementById('blog-list');
      if (el) el.innerHTML = '<p style="color:#ef4444">Blog konnte nicht geladen werden.</p>';
    });
})();
</script>`
}

function genSupportWidget(siteId: string, cfg: any) {
  return `<!-- SiteControl Support-Widget -->
<!-- Vor </body> einfügen — erscheint als 💬-Button unten rechts -->

<script>
(function() {
  'use strict';
  var SITE_ID = '${siteId}';
  var API = '${APP}/api/public/support';
  var TITLE = '${cfg.widget_title || 'Support'}';
  var COLOR = '${cfg.widget_color || '#5b6af6'}';
  var SUCCESS_MSG = '${cfg.success_message || 'Danke! Wir melden uns bald.'}';
  var FIELDS = ${JSON.stringify(cfg.fields || ['name', 'email', 'subject', 'message'])};
  var CATEGORIES = ${JSON.stringify(cfg.categories || [])};

  // CSS injizieren
  var s = document.createElement('style');
  s.textContent = \`
    #_sc-fab{position:fixed;bottom:24px;right:24px;z-index:10000;width:54px;height:54px;border-radius:50%;background:COLOR;color:#fff;border:none;cursor:pointer;font-size:24px;box-shadow:0 6px 24px rgba(0,0,0,.35);transition:transform .2s,box-shadow .2s;display:flex;align-items:center;justify-content:center}
    #_sc-fab:hover{transform:scale(1.08);box-shadow:0 8px 30px rgba(0,0,0,.4)}
    #_sc-fab.open{background:#374151}
    #_sc-box{position:fixed;bottom:90px;right:24px;z-index:9999;width:min(380px,calc(100vw - 32px));background:#111420;border:1px solid #1f2438;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.6);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:hidden;display:none}
    #_sc-box.open{display:block;animation:_scUp .25s ease}
    @keyframes _scUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    #_sc-head{padding:14px 18px;background:COLOR;display:flex;align-items:center;justify-content:space-between}
    #_sc-head span{font-weight:700;font-size:15px;color:#fff}
    #_sc-hclose{background:rgba(255,255,255,.2);border:none;color:#fff;cursor:pointer;width:26px;height:26px;border-radius:50%;font-size:14px;display:flex;align-items:center;justify-content:center}
    #_sc-hclose:hover{background:rgba(255,255,255,.3)}
    #_sc-form{padding:18px}
    #_sc-form input,#_sc-form textarea,#_sc-form select{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #1f2438;background:#0c0e14;color:#e8eaf0;font-size:13px;font-family:inherit;margin-bottom:10px;outline:none;box-sizing:border-box;transition:border-color .15s}
    #_sc-form input:focus,#_sc-form textarea:focus,#_sc-form select:focus{border-color:COLOR}
    #_sc-form textarea{height:88px;resize:none}
    #_sc-btn{width:100%;padding:11px;border-radius:9px;border:none;background:COLOR;color:#fff;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit}
    #_sc-btn:disabled{opacity:.6;cursor:not-allowed}
    #_sc-err{color:#ef4444;font-size:12px;margin:-4px 0 8px;display:none}
    #_sc-ok{padding:28px 18px;text-align:center;color:#22c55e;font-size:14px;font-weight:700;display:none}
    #_sc-ok svg{display:block;margin:0 auto 12px}
  \`.replace(/COLOR/g, COLOR);
  document.head.appendChild(s);

  // HTML aufbauen
  var fields = [
    FIELDS.includes('name')    ? '<input id="_sc-name" placeholder="Dein Name">' : '',
    FIELDS.includes('email')   ? '<input id="_sc-email" placeholder="E-Mail" type="email">' : '',
    FIELDS.includes('subject') ? '<input id="_sc-subj" placeholder="Betreff" required>' : '',
    CATEGORIES.length          ? '<select id="_sc-cat"><option value="">Kategorie wählen…</option>' + CATEGORIES.map(function(c){return '<option>'+c+'</option>';}).join('') + '</select>' : '',
    FIELDS.includes('message') ? '<textarea id="_sc-msg" placeholder="Deine Nachricht…" required></textarea>' : '',
  ].join('');

  var wrap = document.createElement('div');
  wrap.innerHTML =
    '<button id="_sc-fab" aria-label="Support öffnen">💬</button>' +
    '<div id="_sc-box" role="dialog" aria-label="Support">' +
      '<div id="_sc-head"><span>' + TITLE + '</span><button id="_sc-hclose" aria-label="Schließen">✕</button></div>' +
      '<div id="_sc-form">' + fields +
        '<div id="_sc-err"></div>' +
        '<button id="_sc-btn">Nachricht senden</button>' +
      '</div>' +
      '<div id="_sc-ok">' +
        '<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="none" stroke="#22c55e" stroke-width="2.5"/><polyline points="12,21 18,27 28,14" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        SUCCESS_MSG +
      '</div>' +
    '</div>';
  document.body.appendChild(wrap);

  var fab = document.getElementById('_sc-fab');
  var box = document.getElementById('_sc-box');
  var hclose = document.getElementById('_sc-hclose');
  var btn = document.getElementById('_sc-btn');
  var err = document.getElementById('_sc-err');
  var ok = document.getElementById('_sc-ok');
  var form = document.getElementById('_sc-form');

  function toggle() { var open = box.classList.toggle('open'); fab.classList.toggle('open', open); }
  fab.addEventListener('click', toggle);
  hclose.addEventListener('click', function() { box.classList.remove('open'); fab.classList.remove('open'); });

  // Außerhalb klicken schließt
  document.addEventListener('click', function(e) {
    if (!box.contains(e.target) && e.target !== fab) {
      box.classList.remove('open'); fab.classList.remove('open');
    }
  });

  btn.addEventListener('click', async function() {
    var subj = (document.getElementById('_sc-subj') || {}).value;
    var msg  = (document.getElementById('_sc-msg')  || {}).value;
    if (!msg || (FIELDS.includes('subject') && !subj)) {
      err.textContent = 'Bitte alle Pflichtfelder ausfüllen.';
      err.style.display = 'block'; return;
    }
    err.style.display = 'none';
    btn.disabled = true;
    try {
      var payload = {
        site_id: SITE_ID, message: msg,
        subject:  subj  || TITLE,
        name:     (document.getElementById('_sc-name')  || {}).value || null,
        email:    (document.getElementById('_sc-email') || {}).value || null,
        category: (document.getElementById('_sc-cat')   || {}).value || null,
        source: 'widget',
      };
      var res = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler beim Senden');
      form.style.display = 'none';
      ok.style.display = 'block';
      if (data.token) localStorage.setItem('sc_ticket_' + SITE_ID, data.token);
    } catch(e) {
      err.textContent = e.message; err.style.display = 'block'; btn.disabled = false;
    }
  });
})();
</script>`
}

function genSupportPage(siteId: string, siteName: string, cfg: any) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support – ${siteName}</title>
  <meta name="description" content="Kontaktiere uns – wir helfen dir schnell weiter.">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0c0e14;color:#e8eaf0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem}
    .card{width:100%;max-width:520px;background:#111420;border:1px solid #1f2438;border-radius:18px;overflow:hidden}
    .head{background:${cfg.widget_color || '#5b6af6'};padding:24px 28px}
    .head h1{font-size:1.4rem;font-weight:800;color:#fff;margin-bottom:4px}
    .head p{color:rgba(255,255,255,.75);font-size:14px}
    .body{padding:24px 28px}
    input,textarea,select{width:100%;padding:11px 14px;border-radius:9px;border:1px solid #1f2438;background:#0c0e14;color:#e8eaf0;font-size:14px;font-family:inherit;margin-bottom:12px;outline:none;transition:border-color .15s}
    input:focus,textarea:focus,select:focus{border-color:${cfg.widget_color || '#5b6af6'}}
    textarea{height:120px;resize:vertical}
    .label{display:block;font-size:12px;font-weight:600;color:#9098b8;margin-bottom:5px;margin-top:2px}
    .required{color:#ef4444;margin-left:2px}
    button{width:100%;padding:13px;border-radius:9px;background:${cfg.widget_color || '#5b6af6'};color:#fff;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:inherit;margin-top:4px;transition:opacity .15s}
    button:disabled{opacity:.6;cursor:not-allowed}
    .err{color:#ef4444;font-size:13px;margin-bottom:10px;display:none;padding:10px 14px;border-radius:8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2)}
    .success{padding:40px 28px;text-align:center;display:none}
    .success svg{display:block;margin:0 auto 16px}
    .success h2{font-size:1.2rem;font-weight:800;margin-bottom:8px;color:#22c55e}
    .success p{color:#9098b8;font-size:14px}
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <h1>💬 ${cfg.widget_title || 'Support'}</h1>
      <p>Hast du eine Frage? Wir helfen dir gerne weiter.</p>
    </div>
    <div class="body">
      <form id="sc-form">
        ${(cfg.fields || []).includes('name') ? '<label class="label">Name</label><input id="sc-name" placeholder="Dein Name">' : ''}
        ${(cfg.fields || []).includes('email') ? '<label class="label">E-Mail</label><input id="sc-email" type="email" placeholder="du@beispiel.de">' : ''}
        ${(cfg.fields || []).includes('subject') ? '<label class="label">Betreff <span class="required">*</span></label><input id="sc-subject" placeholder="Worum geht es?" required>' : ''}
        ${(cfg.categories || []).length ? `<label class="label">Kategorie</label><select id="sc-cat"><option value="">Bitte wählen…</option>${(cfg.categories || []).map((c: string) => `<option>${c}</option>`).join('')}</select>` : ''}
        ${(cfg.fields || []).includes('message') ? '<label class="label">Nachricht <span class="required">*</span></label><textarea id="sc-msg" placeholder="Beschreibe dein Anliegen…" required></textarea>' : ''}
        <div class="err" id="sc-err"></div>
        <button type="submit" id="sc-btn">Nachricht senden →</button>
      </form>
      <div class="success" id="sc-ok">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="none" stroke="#22c55e" stroke-width="2.5"/>
          <polyline points="14,25 21,32 34,17" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h2>Nachricht gesendet!</h2>
        <p>${cfg.success_message || 'Danke! Wir melden uns so schnell wie möglich.'}</p>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('sc-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      var btn = document.getElementById('sc-btn');
      var err = document.getElementById('sc-err');
      btn.disabled = true; err.style.display = 'none';
      try {
        var body = {
          site_id: '${siteId}',
          subject:  (document.getElementById('sc-subject') || {}).value || 'Kontaktanfrage',
          message:  (document.getElementById('sc-msg') || {}).value || '',
          name:     (document.getElementById('sc-name') || {}).value || null,
          email:    (document.getElementById('sc-email') || {}).value || null,
          category: (document.getElementById('sc-cat') || {}).value || null,
          source: 'page',
        };
        if (!body.message) throw new Error('Bitte eine Nachricht eingeben.');
        var res = await fetch('${APP}/api/public/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fehler beim Senden');
        document.getElementById('sc-form').style.display = 'none';
        document.getElementById('sc-ok').style.display = 'block';
        if (data.token) localStorage.setItem('sc_ticket_${siteId}', data.token);
      } catch(e) {
        err.textContent = e.message; err.style.display = 'block'; btn.disabled = false;
      }
    });
  </script>
</body>
</html>`
}

function genChangelogWidget(siteId: string, cfg: any) {
  return `<!-- SiteControl Changelog Widget -->
<!-- 1. Diesen Container an die gewünschte Stelle setzen: -->
<div id="sc-changelog"></div>

<!-- 2. Script darunter einfügen: -->
<script>
(function() {
  var SITE_ID = '${siteId}';
  var API = '${APP}/api/public/changelog';
  var COLOR = '${cfg.widget_color || '#5b6af6'}';
  var LIMIT = ${cfg.max_entries || 20};
  var SHOW_VERSION = ${cfg.show_version !== false};

  var TYPE_COLORS = { feature:'#5b6af6', fix:'#22c55e', improvement:'#f59e0b', breaking:'#ef4444' };
  var TYPE_LABELS = { feature:'Feature', fix:'Fix', improvement:'Verbesserung', breaking:'Breaking' };

  fetch(API + '?site_id=' + SITE_ID + '&limit=' + LIMIT)
    .then(function(r) { return r.json(); })
    .then(function(entries) {
      var el = document.getElementById('sc-changelog');
      if (!el) return;

      var style = document.createElement('style');
      style.textContent = '#sc-changelog{font-family:-apple-system,sans-serif}#sc-changelog .sc-entry{padding:16px 0;border-bottom:1px solid rgba(255,255,255,.08);display:flex;gap:12px;align-items:flex-start}#sc-changelog .sc-badge{font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;white-space:nowrap;margin-top:3px}#sc-changelog .sc-title{font-size:14px;font-weight:700;color:#e8eaf0;margin-bottom:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}#sc-changelog .sc-ver{font-size:11px;color:#5a6280;font-family:monospace}#sc-changelog .sc-desc{font-size:13px;color:#9098b8;margin-bottom:4px}#sc-changelog .sc-date{font-size:11px;color:#5a6280}';
      document.head.appendChild(style);

      if (!entries.length) {
        el.innerHTML = '<p style="color:#5a6280;font-size:14px;padding:1rem 0">Noch keine Einträge.</p>';
        return;
      }

      el.innerHTML = entries.map(function(e) {
        var col = TYPE_COLORS[e.type] || COLOR;
        var lbl = TYPE_LABELS[e.type] || e.type;
        var date = new Date(e.published_at || e.created_at).toLocaleDateString('de-DE', { year:'numeric', month:'short', day:'numeric' });
        return [
          '<div class="sc-entry">',
          '  <span class="sc-badge" style="background:' + col + '18;color:' + col + ';border:1px solid ' + col + '30">' + lbl + '</span>',
          '  <div>',
          '    <div class="sc-title">',
          '      ' + e.title,
          SHOW_VERSION && e.version ? '      <span class="sc-ver">v' + e.version + '</span>' : '',
          '    </div>',
          e.description ? '    <div class="sc-desc">' + e.description + '</div>' : '',
          '    <time class="sc-date">' + date + '</time>',
          '  </div>',
          '</div>',
        ].join('\\n');
      }).join('');
    })
    .catch(function() {
      var el = document.getElementById('sc-changelog');
      if (el) el.innerHTML = '<p style="color:#ef4444;font-size:13px">Changelog konnte nicht geladen werden.</p>';
    });
})();
</script>`
}

function genChangelogBadge(siteId: string, cfg: any) {
  return `<!-- Changelog "Was ist neu?" Badge -->
<!-- Erscheint nur wenn es einen Eintrag gibt den der User noch nicht gesehen hat -->
<!-- Vor </body> einfügen -->
<script>
(function() {
  var SITE_ID = '${siteId}';
  var API = '${APP}/api/public/changelog?site_id=' + SITE_ID + '&limit=1';
  var COLOR = '${cfg.widget_color || '#5b6af6'}';
  var STORAGE_KEY = 'sc_cl_seen_' + SITE_ID;

  fetch(API)
    .then(function(r) { return r.json(); })
    .then(function(entries) {
      if (!entries || !entries.length) return;
      var latest = entries[0];
      if (localStorage.getItem(STORAGE_KEY) === latest.id) return; // bereits gesehen

      var s = document.createElement('style');
      s.textContent = '@keyframes _scUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(s);

      var badge = document.createElement('div');
      badge.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:9999;max-width:320px;background:#111420;border:1px solid ' + COLOR + '44;border-radius:14px;padding:16px 18px;box-shadow:0 12px 40px rgba(0,0,0,.5);font-family:-apple-system,sans-serif;animation:_scUp .3s ease;display:flex;align-items:flex-start;gap:12px';

      var title_line = latest.version ? latest.title + ' <span style="font-size:11px;color:#5a6280;font-family:monospace">v' + latest.version + '</span>' : latest.title;
      var desc_line = latest.description ? '<div style="font-size:12px;color:#9098b8;margin-top:3px">' + (latest.description.length > 80 ? latest.description.slice(0,80) + '…' : latest.description) + '</div>' : '';

      badge.innerHTML = [
        '<div style="flex:1">',
        '  <div style="font-size:10px;font-weight:700;color:' + COLOR + ';text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">🆕 Neu in ' + new Date(latest.published_at||latest.created_at).toLocaleDateString('de-DE',{month:'short',day:'numeric'}) + '</div>',
        '  <div style="font-size:13px;font-weight:700;color:#e8eaf0">' + title_line + '</div>',
        desc_line,
        '</div>',
        '<button onclick="this.closest(\'[style*=fixed]\').remove();localStorage.setItem(\'' + STORAGE_KEY + '\',\'' + latest.id + '\')" style="background:none;border:none;color:#5a6280;cursor:pointer;font-size:18px;padding:0;margin-top:-2px;flex-shrink:0;line-height:1" aria-label="Schließen">✕</button>',
      ].join('');

      document.body.appendChild(badge);

      // Auto-hide nach 10 Sekunden
      setTimeout(function() {
        if (badge.parentNode) {
          badge.style.opacity = '0';
          badge.style.transition = 'opacity .4s';
          setTimeout(function() { badge.remove(); }, 400);
        }
        localStorage.setItem(STORAGE_KEY, latest.id);
      }, 10000);
    })
    .catch(function() {});
})();
</script>`
}

function genChangelogCF(siteId: string, site: Site, cfg: any) {
  return `// functions/changelog.js
// Cloudflare Pages Function — /changelog Seite (SSR)
// Pfad: functions/changelog.js

const SITE_ID = '${siteId}';
const API = '${APP}';
const SITE_NAME = '${site.name}';
const TITLE = '${cfg.widget_title || 'Changelog'}';
const COLOR = '${cfg.widget_color || '#5b6af6'}';
const LIMIT = ${cfg.max_entries || 20};

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
    return \`
    <div style="padding:20px 0;border-bottom:1px solid #1f2438;display:flex;gap:14px;align-items:flex-start">
      <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:\${col}18;color:\${col};border:1px solid \${col}30;white-space:nowrap;margin-top:3px">\${lbl}</span>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:5px">
          <a href="/changelog/\${e.id}" style="font-size:15px;color:#e8eaf0;font-weight:700;text-decoration:none">\${esc(e.title)}</a>
          \${e.version ? \`<span style="font-size:11px;color:#5a6280;font-family:monospace">v\${esc(e.version)}</span>\` : ''}
        </div>
        \${e.description ? \`<p style="font-size:13px;color:#9098b8;margin:0 0 6px">\${esc(e.description)}</p>\` : ''}
        <time style="font-size:11px;color:#5a6280">\${fmtDate(e.published_at||e.created_at)}</time>
      </div>
    </div>\`;
  }).join('') || '<p style="color:#5a6280;padding:2rem 0;font-size:14px">Noch keine Einträge veröffentlicht.</p>';

  const html = \`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>\${TITLE} – \${SITE_NAME}</title>
  <meta name="description" content="Alle Updates und Änderungen zu \${SITE_NAME}">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0c0e14;color:#e8eaf0}
    .wrap{max-width:680px;margin:0 auto;padding:2rem 1.5rem 4rem}
    nav{margin-bottom:2rem}
    nav a{color:#9098b8;text-decoration:none;font-size:14px}
    nav a:hover{color:\${COLOR}}
    h1{font-size:1.8rem;font-weight:900;margin-bottom:.5rem;letter-spacing:-.02em}
    .sub{color:#9098b8;font-size:15px;margin-bottom:2rem}
  </style>
</head>
<body>
<div class="wrap">
  <nav><a href="/">← \${SITE_NAME}</a></nav>
  <h1>\${TITLE}</h1>
  <p class="sub">Alle Updates und Änderungen auf einen Blick.</p>
  \${rows}
</div>
</body>
</html>\`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
    }
  });
}`
}

function genChangelogBadgeLinked(siteId: string, cfg: any) {
  return `<!-- SiteControl Changelog Badge (verlinkt auf /changelog) -->
<!-- Vor </body> einfügen — erscheint wenn neuer Eintrag vorhanden -->
<script>
(function() {
  var SITE_ID = '${siteId}';
  var API = '${APP}/api/public/changelog?site_id=' + SITE_ID + '&limit=1';
  var COLOR = '${cfg.widget_color || '#5b6af6'}';
  var STORAGE_KEY = 'sc_cl_seen_' + SITE_ID;
  var CL_URL = '/changelog';

  fetch(API)
    .then(function(r) { return r.json(); })
    .then(function(entries) {
      if (!entries || !entries.length) return;
      var latest = entries[0];
      if (localStorage.getItem(STORAGE_KEY) === latest.id) return;

      var s = document.createElement('style');
      s.textContent = '@keyframes _scSlide{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}';
      document.head.appendChild(s);

      var badge = document.createElement('div');
      badge.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:9999;max-width:300px;background:#111420;border:1px solid ' + COLOR + '44;border-radius:14px;padding:14px 16px;box-shadow:0 12px 40px rgba(0,0,0,.5);font-family:-apple-system,sans-serif;animation:_scSlide .3s ease;cursor:pointer';

      var date = new Date(latest.published_at||latest.created_at).toLocaleDateString('de-DE',{month:'short',day:'numeric'});
      var desc = latest.description ? (latest.description.length > 70 ? latest.description.slice(0,70) + '\u2026' : latest.description) : '';
      var version = latest.version ? ' <span style="font-size:10px;color:#5a6280;font-family:monospace">v' + latest.version + '</span>' : '';

      badge.innerHTML = '<div style="display:flex;align-items:flex-start;gap:10px">' +
        '<div style="flex:1">' +
          '<div style="font-size:10px;font-weight:700;color:' + COLOR + ';text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">\uD83D\uDD04 Neuigkeiten · ' + date + '</div>' +
          '<div style="font-size:13px;font-weight:700;color:#e8eaf0;margin-bottom:' + (desc ? '4' : '0') + 'px">' + latest.title + version + '</div>' +
          (desc ? '<div style="font-size:11px;color:#9098b8;line-height:1.4">' + desc + '</div>' : '') +
          '<div style="font-size:11px;color:' + COLOR + ';margin-top:7px;font-weight:600">Mehr erfahren \u2192</div>' +
        '</div>' +
        '<button id="_sc_cl_close" style="background:none;border:none;color:#5a6280;cursor:pointer;font-size:16px;padding:0;line-height:1;flex-shrink:0" aria-label="Schließen">\u2715</button>' +
      '</div>';

      badge.addEventListener('click', function(e) {
        if (e.target && (e.target as Element).id === '_sc_cl_close') {
          badge.remove();
          localStorage.setItem(STORAGE_KEY, latest.id);
          return;
        }
        localStorage.setItem(STORAGE_KEY, latest.id);
        window.location.href = CL_URL;
      });

      document.body.appendChild(badge);

      setTimeout(function() {
        if (badge.parentNode) {
          badge.style.opacity = '0';
          badge.style.transition = 'opacity .4s';
          setTimeout(function() { badge.remove(); }, 400);
        }
      }, 12000);
    })
    .catch(function() {});
})();
<\/script>` }

function genChangelogEntryCF(siteId: string, site: Site, cfg: any) {
  return `// functions/changelog/[id].js
// Cloudflare Pages Function — /changelog/[id] (Einzeleintrag)
// Pfad: functions/changelog/[id].js

const SITE_ID = '${siteId}';
const API = '${APP}';
const SITE_NAME = '${site.name}';
const CL_TITLE = '${cfg.widget_title || 'Changelog'}';
const COLOR = '${cfg.widget_color || '#5b6af6'}';

const TYPE_COLORS = { feature:'#5b6af6', fix:'#22c55e', improvement:'#f59e0b', breaking:'#ef4444' };
const TYPE_LABELS = { feature:'Feature', fix:'Fix', improvement:'Verbesserung', breaking:'Breaking' };

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtDate(d){ return new Date(d).toLocaleDateString('de-DE',{year:'numeric',month:'long',day:'numeric'}); }

export async function onRequestGet({ params }) {
  const { id } = params;
  let entry;
  try {
    const res = await fetch(\`\${API}/api/public/changelog?site_id=\${SITE_ID}&id=\${id}&limit=1\`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    entry = Array.isArray(data) ? data[0] : data;
    if (!entry) throw new Error();
  } catch {
    return new Response(
      \`<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0c0e14;color:#e8eaf0;padding:2rem"><h1>404</h1><p>Eintrag nicht gefunden.</p><a href="/changelog" style="color:\${COLOR}">← \${CL_TITLE}</a></body></html>\`,
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const col = TYPE_COLORS[entry.type] || COLOR;
  const lbl = TYPE_LABELS[entry.type] || entry.type;

  const html = \`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>\${esc(entry.title)} – \${CL_TITLE} – \${SITE_NAME}</title>
  <meta name="description" content="\${esc(entry.description || entry.title)}">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0c0e14;color:#e8eaf0}
    .wrap{max-width:640px;margin:0 auto;padding:2rem 1.5rem 4rem}
    nav{margin-bottom:2rem}nav a{color:#9098b8;text-decoration:none;font-size:14px}nav a:hover{color:COLOR}
    .badge{font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;background:COL18;color:COL;border:1px solid COL30;display:inline-block;margin-bottom:14px}
    h1{font-size:1.6rem;font-weight:900;line-height:1.2;margin-bottom:.75rem}
    .meta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:1.5rem;font-size:12px;color:#5a6280;font-family:monospace}
    .body{font-size:15px;color:#9098b8;line-height:1.8;border-top:1px solid #1f2438;padding-top:1.5rem;margin-top:1rem}
    .back{margin-top:2.5rem}
    .back a{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:9px;background:rgba(91,106,246,.1);color:COLOR;text-decoration:none;font-weight:600;font-size:14px;border:1px solid rgba(91,106,246,.2)}
    footer{text-align:center;padding:24px;color:#5a6280;font-size:13px;border-top:1px solid #1f2438;margin-top:2rem}
  </style>
</head>
<body>
<div class="wrap">
  <nav><a href="/changelog">← \${CL_TITLE}</a></nav>
  <span class="badge" style="background:\${col}18;color:\${col};border-color:\${col}30">\${lbl}</span>
  <h1>\${esc(entry.title)}</h1>
  <div class="meta">
    \${entry.version ? \`<span>v\${esc(entry.version)}</span>\` : ''}
    <time>\${fmtDate(entry.published_at||entry.created_at)}</time>
  </div>
  \${entry.description ? \`<div class="body">\${esc(entry.description)}</div>\` : ''}
  <div class="back"><a href="/changelog">← Alle Einträge</a></div>
</div>
<footer>\${SITE_NAME} &middot; <a href="/changelog" style="color:#5a6280">\${CL_TITLE}</a></footer>
</body>
</html>\`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=1800',
    }
  });
}` }

// ── Main Component ─────────────────────────────────────────────────
function EmbedPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [sites, setSites] = useState<Site[]>([])
  const [selectedSite, setSelectedSite] = useState('')
  const [feature, setFeature] = useState<Feature>('blog')
  const [platform, setPlatform] = useState<Platform>('cloudflare')
  const [step, setStep] = useState(1)
  const [settings, setSettings] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Blog config
  const [blogCfg, setBlogCfg] = useState({
    langs: ['de'], base_url: '', site_name: '', primary_color: '#5b6af6', accent_color: '#a78bfa',
    play_url: '', play_label: '→ Zur Website',
  })
  // Support config
  const [suppCfg, setSuppCfg] = useState({
    fields: ['name', 'email', 'subject', 'message'], categories: [] as string[],
    widget_title: 'Support', widget_color: '#5b6af6',
    success_message: 'Danke! Wir melden uns so schnell wie möglich.',
  })
  const [newCat, setNewCat] = useState('')
  // Changelog config
  const [clCfg, setClCfg] = useState({
    widget_title: 'Changelog', widget_color: '#5b6af6',
    max_entries: 20, show_version: true,
    show_types: ['feature', 'fix', 'improvement', 'breaking'],
  })

  useEffect(() => {
    fetch('/api/sites').then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setSites(d)
        const fromUrl = searchParams.get('site')
        const f = (searchParams.get('feature') || 'blog') as Feature
        setFeature(f)
        setSelectedSite(fromUrl || d[0]?.id || '')
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedSite) return
    fetch(`/api/site-settings?site_id=${selectedSite}`).then(r => r.json()).then(d => {
      setSettings(d)
      if (d.blog_config) setBlogCfg(cfg => ({ ...cfg, ...d.blog_config }))
      if (d.support_config) setSuppCfg(cfg => ({ ...cfg, ...d.support_config }))
      if (d.changelog_config) setClCfg(cfg => ({ ...cfg, ...d.changelog_config }))
    })
  }, [selectedSite])

  async function saveConfig() {
    setSaving(true)
    const body: any = { site_id: selectedSite }
    if (feature === 'blog')      { body.blog_enabled = true; body.blog_config = blogCfg }
    if (feature === 'support')   { body.support_enabled = true; body.support_config = suppCfg }
    if (feature === 'changelog') { body.changelog_enabled = true; body.changelog_config = clCfg }
    await fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const site = sites.find(s => s.id === selectedSite)

  // Compute codes
  const codes = site && selectedSite ? {
    blog: {
      cloudflare: genBlogCF(selectedSite, site, blogCfg),
      sitemap: genBlogSitemap(selectedSite, site, blogCfg),
      nextjs: genBlogNextJS(selectedSite, site, blogCfg),
      html: genBlogListing(selectedSite),
    },
    support: {
      widget: genSupportWidget(selectedSite, suppCfg),
      page: genSupportPage(selectedSite, site.name, suppCfg),
    },
    changelog: {
      widget: genChangelogWidget(selectedSite, clCfg),
      badge: genChangelogBadge(selectedSite, clCfg),
      badgeLinked: genChangelogBadgeLinked(selectedSite, clCfg),
      cloudflare: genChangelogCF(selectedSite, site, clCfg),
      entryPage: genChangelogEntryCF(selectedSite, site, clCfg),
    },
  } : null

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
    background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)',
    outline: 'none', fontFamily: 'inherit',
  }

  const FEATURES = [
    { id: 'blog' as Feature, Icon: FileText, label: 'Blog', desc: 'Blog-Posts auf deiner Website anzeigen', color: '#5b6af6' },
    { id: 'support' as Feature, Icon: LifeBuoy, label: 'Support', desc: 'Kontaktformular oder Chat-Widget einbinden', color: '#22c55e' },
    { id: 'changelog' as Feature, Icon: Layers, label: 'Changelog', desc: 'Updates und Änderungen anzeigen', color: '#f59e0b' },
  ]

  const PLATFORMS = [
    { id: 'cloudflare' as Platform, label: 'Cloudflare Pages', Icon: Cloud, desc: 'Empfohlen — SSR, SEO-optimiert' },
    { id: 'nextjs' as Platform, label: 'Next.js', Icon: Code, desc: 'App Router mit ISR/SSG' },
    { id: 'html' as Platform, label: 'HTML / Statisch', Icon: Globe, desc: 'Vanilla JS, keine Frameworks nötig' },
  ]

  const BLOG_STEPS = [
    { title: 'Website & Feature wählen', desc: 'Welche Site und was möchtest du einbinden?' },
    { title: 'Konfigurieren', desc: 'Farben, Sprachen und Links anpassen' },
    { title: 'Plattform wählen', desc: 'Wie ist deine Website gebaut?' },
    { title: 'Dateien herunterladen', desc: 'Fertige Dateien in dein Projekt kopieren' },
  ]

  const SUPPORT_STEPS = [
    { title: 'Website & Feature wählen', desc: 'Welche Site?' },
    { title: 'Formular konfigurieren', desc: 'Felder, Kategorien, Farbe' },
    { title: 'Variante wählen', desc: 'Widget oder eigene Seite?' },
    { title: 'Einbinden', desc: 'Code kopieren oder herunterladen' },
  ]

  const CL_STEPS = [
    { title: 'Website & Feature wählen', desc: 'Welche Site?' },
    { title: 'Widget konfigurieren', desc: 'Farbe, Einträge, Typen' },
    { title: 'Variante wählen', desc: 'Inline, Badge oder eigene Seite?' },
    { title: 'Einbinden', desc: 'Code kopieren oder herunterladen' },
  ]

  const steps = feature === 'blog' ? BLOG_STEPS : feature === 'support' ? SUPPORT_STEPS : CL_STEPS
  const maxStep = steps.length

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left: Steps sidebar */}
      <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', padding: '24px 20px', overflowY: 'auto' }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 24 }}>Einbindungs-Assistent</div>

        {/* Feature selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10, fontFamily: 'Space Mono, monospace' }}>Feature</div>
          {FEATURES.map(f => (
            <button key={f.id} onClick={() => { setFeature(f.id); setStep(1) }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 9, border: `1px solid ${feature === f.id ? f.color + '40' : 'transparent'}`,
              background: feature === f.id ? f.color + '10' : 'transparent',
              cursor: 'pointer', marginBottom: 4, textAlign: 'left', fontFamily: 'inherit',
            }}>
              <f.Icon size={15} color={feature === f.id ? f.color : 'var(--text3)'} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: feature === f.id ? 'var(--text1)' : 'var(--text2)' }}>{f.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Step indicator */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12, fontFamily: 'Space Mono, monospace' }}>Schritte</div>
        {steps.map((s, i) => {
          const n = i + 1
          const isActive = step === n
          const isDone = step > n
          return (
            <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 14, opacity: isDone || isActive ? 1 : 0.45 }}>
              <StepBadge n={n} active={isActive} done={isDone} />
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'var(--text1)' : 'var(--text2)' }}>{s.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.desc}</div>
              </div>
            </div>
          )
        })}

        {/* Help */}
        <div style={{ marginTop: 24, padding: 14, background: 'rgba(91,106,246,.08)', border: '1px solid rgba(91,106,246,.2)', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Info size={13} color="#7e93fb" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a4bbfd' }}>Wie funktioniert das?</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
            SiteControl stellt öffentliche APIs bereit. Der Assistent generiert fertige Code-Dateien die du direkt in dein Projekt einfügst.
          </p>
        </div>
      </div>

      {/* Right: Step content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

        {/* STEP 1 — Site & Feature */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>Website & Feature wählen</h2>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Wähle zuerst für welche deiner Websites du {feature === 'blog' ? 'den Blog' : feature === 'support' ? 'Support' : 'den Changelog'} einbinden möchtest.</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8 }}>Website *</label>
              <select style={{ ...inp, maxWidth: 380 }} value={selectedSite} onChange={e => setSelectedSite(e.target.value)}>
                <option value="">Website wählen…</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name} — {s.url.replace(/^https?:\/\//, '')}</option>)}
              </select>
              {selectedSite && site && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text3)' }}>
                  <Check size={13} color="#22c55e" />
                  <a href={site.url} target="_blank" rel="noreferrer" style={{ color: '#7e93fb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {site.url} <ExternalLink size={11} />
                  </a>
                </div>
              )}
              {selectedSite && site && (
                <div style={{ marginTop: 14, background: 'rgba(91,106,246,.06)', border: '1px solid rgba(91,106,246,.2)', borderRadius: 10, padding: '14px 16px', maxWidth: 460 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7e93fb', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'Space Mono, monospace' }}>🔑 Deine Verbindungs-ID</div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#e8eaf0', marginBottom: 8, background: 'var(--bg)', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', wordBreak: 'break-all', letterSpacing: '.02em' }}>{selectedSite}</div>
                  <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.65, margin: 0 }}>Diese ID verbindet alle generierten Dateien automatisch mit deinen Inhalten. Sie ist bereits in jede Datei eingebaut — du musst <strong style={{ color: 'var(--text2)' }}>nirgends etwas manuell eintragen</strong>. Einfach Datei herunterladen, einsetzen, fertig.</p>
                </div>
              )}
            </div>

            {/* API Endpoint Info */}
            {selectedSite && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Zap size={14} color="#f59e0b" /> Öffentliche API-Endpunkte
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 12 }}>
                  Diese Endpunkte sind vollständig öffentlich — kein API-Key, kein Login nötig. CORS ist offen (<code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3 }}>Access-Control-Allow-Origin: *</code>).
                </div>
                {feature === 'blog' && (
                  <>
                    <CopyBlock label="Liste aller Posts (DE)" code={`${APP}/api/public/blog?site_id=${selectedSite}&lang=de&limit=20`} />
                    <CopyBlock label="Einzelner Post" code={`${APP}/api/public/blog?site_id=${selectedSite}&lang=de&slug=DEIN-SLUG`} />
                    <CopyBlock label="Dynamische Sitemap" code={`${APP}/api/public/sitemap?site_id=${selectedSite}&base_url=${blogCfg.base_url || site?.url}&langs=de`} />
                  </>
                )}
                {feature === 'support' && (
                  <>
                    <CopyBlock label="POST — Ticket einreichen" code={`${APP}/api/public/support\n\nBody: { "site_id": "${selectedSite}", "subject": "...", "message": "...", "name": "...", "email": "..." }`} />
                    <CopyBlock label="GET — Ticket-Status abfragen" code={`${APP}/api/public/support?token=DEIN_TOKEN`} />
                  </>
                )}
                {feature === 'changelog' && (
                  <>
                    <CopyBlock label="Alle veröffentlichten Einträge" code={`${APP}/api/public/changelog?site_id=${selectedSite}&limit=20`} />
                    <CopyBlock label="Nur bestimmter Typ" code={`${APP}/api/public/changelog?site_id=${selectedSite}&type=feature`} />
                  </>
                )}
              </div>
            )}

            <button onClick={() => { if (selectedSite) setStep(2) }} disabled={!selectedSite}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: selectedSite ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', opacity: selectedSite ? 1 : 0.5 }}>
              Weiter: Konfigurieren <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2 — Configure */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>
                {feature === 'blog' ? 'Blog konfigurieren' : feature === 'support' ? 'Support konfigurieren' : 'Changelog konfigurieren'}
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>
                Diese Einstellungen werden in den generierten Dateien verwendet. Du kannst sie jederzeit hier ändern.
              </p>
            </div>

            {/* BLOG CONFIG */}
            {feature === 'blog' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16 }}>Basis-Einstellungen</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Site-Name (für Browser-Titel)</label>
                      <input style={inp} value={blogCfg.site_name} onChange={e => setBlogCfg(c => ({ ...c, site_name: e.target.value }))} placeholder={site?.name} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Base-URL deiner Website</label>
                      <input style={inp} value={blogCfg.base_url} onChange={e => setBlogCfg(c => ({ ...c, base_url: e.target.value }))} placeholder={site?.url} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Primärfarbe</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="color" value={blogCfg.primary_color} onChange={e => setBlogCfg(c => ({ ...c, primary_color: e.target.value }))} style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2, background: 'var(--bg)' }} />
                        <input style={{ ...inp, flex: 1 }} value={blogCfg.primary_color} onChange={e => setBlogCfg(c => ({ ...c, primary_color: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Akzentfarbe</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="color" value={blogCfg.accent_color} onChange={e => setBlogCfg(c => ({ ...c, accent_color: e.target.value }))} style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2, background: 'var(--bg)' }} />
                        <input style={{ ...inp, flex: 1 }} value={blogCfg.accent_color} onChange={e => setBlogCfg(c => ({ ...c, accent_color: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>CTA-URL (z.B. Spiel/App)</label>
                      <input style={inp} value={blogCfg.play_url} onChange={e => setBlogCfg(c => ({ ...c, play_url: e.target.value }))} placeholder="https://meinespiel.de" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>CTA-Button-Text</label>
                      <input style={inp} value={blogCfg.play_label} onChange={e => setBlogCfg(c => ({ ...c, play_label: e.target.value }))} placeholder="→ Zur Website" />
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Sprachen</div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>Wähle die Sprachen in denen du Blog-Posts schreibst. Das wird für hreflang-Tags und Routing verwendet.</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[{c:'de',l:'Deutsch'},{c:'en',l:'English'},{c:'fr',l:'Français'},{c:'es',l:'Español'},{c:'it',l:'Italiano'}].map(lang => {
                      const on = blogCfg.langs.includes(lang.c)
                      return (
                        <label key={lang.c} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 9, border: `1px solid ${on ? 'rgba(91,106,246,.4)' : 'var(--border)'}`, background: on ? 'rgba(91,106,246,.08)' : 'var(--bg)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: on ? '#7e93fb' : 'var(--text2)' }}>
                          <input type="checkbox" checked={on} onChange={e => setBlogCfg(c => ({ ...c, langs: e.target.checked ? [...c.langs, lang.c] : c.langs.filter(x => x !== lang.c) }))} style={{ display: 'none' }} />
                          {on ? <Check size={13} /> : <div style={{ width: 13 }} />}
                          {lang.l}
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SUPPORT CONFIG */}
            {feature === 'support' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16 }}>Aussehen</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Titel</label>
                      <input style={inp} value={suppCfg.widget_title} onChange={e => setSuppCfg(c => ({ ...c, widget_title: e.target.value }))} placeholder="Support" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Farbe</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="color" value={suppCfg.widget_color} onChange={e => setSuppCfg(c => ({ ...c, widget_color: e.target.value }))} style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2, background: 'var(--bg)' }} />
                        <input style={{ ...inp, flex: 1 }} value={suppCfg.widget_color} onChange={e => setSuppCfg(c => ({ ...c, widget_color: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Erfolgs-Meldung (nach dem Senden)</label>
                      <input style={inp} value={suppCfg.success_message} onChange={e => setSuppCfg(c => ({ ...c, success_message: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Formular-Felder</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['name', 'email', 'subject', 'message'].map(f => {
                      const on = suppCfg.fields.includes(f)
                      const req = f === 'message'
                      const labels: any = { name: 'Name', email: 'E-Mail', subject: 'Betreff', message: 'Nachricht (Pflicht)' }
                      return (
                        <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 9, border: `1px solid ${on ? 'rgba(91,106,246,.4)' : 'var(--border)'}`, background: on ? 'rgba(91,106,246,.08)' : 'var(--bg)', cursor: req ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, color: on ? '#7e93fb' : 'var(--text2)' }}>
                          <input type="checkbox" checked={on} disabled={req} onChange={e => setSuppCfg(c => ({ ...c, fields: e.target.checked ? [...c.fields, f] : c.fields.filter(x => x !== f) }))} style={{ display: 'none' }} />
                          {on ? <Check size={13} /> : <div style={{ width: 13 }} />}
                          {labels[f]}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Kategorien <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>Zeigt im Formular ein Dropdown mit diesen Kategorien.</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {suppCfg.categories.map(cat => (
                      <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, background: 'rgba(91,106,246,.1)', border: '1px solid rgba(91,106,246,.2)', fontSize: 12, fontWeight: 600, color: '#a4bbfd' }}>
                        {cat}
                        <button onClick={() => setSuppCfg(c => ({ ...c, categories: c.categories.filter(x => x !== cat) }))} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '0 2px' }}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...inp, maxWidth: 220 }} value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Bug / Feature / Sonstiges…"
                      onKeyDown={e => { if (e.key === 'Enter' && newCat.trim()) { setSuppCfg(c => ({ ...c, categories: [...c.categories, newCat.trim()] })); setNewCat('') } }} />
                    <button onClick={() => { if (newCat.trim()) { setSuppCfg(c => ({ ...c, categories: [...c.categories, newCat.trim()] })); setNewCat('') } }}
                      style={{ padding: '9px 16px', borderRadius: 8, background: '#5b6af6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
                      + Hinzufügen
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CHANGELOG CONFIG */}
            {feature === 'changelog' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16 }}>Aussehen & Verhalten</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Titel</label>
                      <input style={inp} value={clCfg.widget_title} onChange={e => setClCfg(c => ({ ...c, widget_title: e.target.value }))} placeholder="Changelog" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Farbe</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="color" value={clCfg.widget_color} onChange={e => setClCfg(c => ({ ...c, widget_color: e.target.value }))} style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2, background: 'var(--bg)' }} />
                        <input style={{ ...inp, flex: 1 }} value={clCfg.widget_color} onChange={e => setClCfg(c => ({ ...c, widget_color: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Max. Einträge</label>
                      <input type="number" style={inp} value={clCfg.max_entries} min={1} max={50} onChange={e => setClCfg(c => ({ ...c, max_entries: +e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 1 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: clCfg.show_version ? '#7e93fb' : 'var(--text2)', userSelect: 'none' }}>
                        <div style={{ width: 36, height: 20, borderRadius: 10, background: clCfg.show_version ? '#5b6af6' : 'var(--bg)', border: `1px solid ${clCfg.show_version ? '#5b6af6' : 'var(--border)'}`, position: 'relative', transition: 'background .2s', cursor: 'pointer' }}
                          onClick={() => setClCfg(c => ({ ...c, show_version: !c.show_version }))}>
                          <div style={{ position: 'absolute', top: 2, left: clCfg.show_version ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
                        </div>
                        Versionsnummer anzeigen
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}>
                <ChevronLeft size={15} /> Zurück
              </button>
              <button onClick={async () => { await saveConfig(); setStep(3) }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 10, background: saved ? '#22c55e' : 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
                {saving ? 'Speichern…' : saved ? <><Check size={15} /> Gespeichert – Weiter</> : <>Speichern & Weiter <ChevronRight size={15} /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Platform / Variant */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>
                {feature === 'blog' ? 'Welche Plattform nutzt du?' : 'Welche Variante möchtest du?'}
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>
                {feature === 'blog' ? 'Je nach Plattform bekommst du unterschiedliche Dateien.' : 'Wähle wie du das Feature einbinden möchtest.'}
              </p>
            </div>

            {/* BLOG: Platform */}
            {feature === 'blog' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {PLATFORMS.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 20px', borderRadius: 12, border: `2px solid ${platform === p.id ? 'rgba(91,106,246,.5)' : 'var(--border)'}`, background: platform === p.id ? 'rgba(91,106,246,.06)' : 'var(--surface)', cursor: 'pointer', transition: 'all .15s' }}>
                    <input type="radio" name="platform" value={p.id} checked={platform === p.id} onChange={() => setPlatform(p.id)} style={{ display: 'none' }} />
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: platform === p.id ? 'rgba(91,106,246,.15)' : 'var(--bg)', border: `1px solid ${platform === p.id ? 'rgba(91,106,246,.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <p.Icon size={17} color={platform === p.id ? '#7e93fb' : 'var(--text3)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: platform === p.id ? 'var(--text1)' : 'var(--text2)', marginBottom: 3 }}>{p.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text3)' }}>{p.desc}</div>
                    </div>
                    {platform === p.id && <Check size={18} color="#22c55e" style={{ marginTop: 9 }} />}
                  </label>
                ))}
              </div>
            )}

            {/* SUPPORT: Variant */}
            {feature === 'support' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { id: 'html', Icon: Smartphone, label: 'Chat-Widget (empfohlen)', desc: '💬-Button der aufklappt wenn der User draufklickt. Auf jeder Seite einsetzbar — ein Script vor </body> reicht.' },
                  { id: 'cloudflare', Icon: Globe, label: 'Eigene Support-Seite', desc: 'Komplette HTML-Seite als support.html oder support.js (Cloudflare Pages).' },
                ].map(v => (
                  <label key={v.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 20px', borderRadius: 12, border: `2px solid ${platform === v.id ? 'rgba(34,197,94,.5)' : 'var(--border)'}`, background: platform === v.id ? 'rgba(34,197,94,.05)' : 'var(--surface)', cursor: 'pointer', transition: 'all .15s' }}>
                    <input type="radio" name="variant" value={v.id} checked={platform === v.id} onChange={() => setPlatform(v.id as any)} style={{ display: 'none' }} />
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: platform === v.id ? 'rgba(34,197,94,.1)' : 'var(--bg)', border: `1px solid ${platform === v.id ? 'rgba(34,197,94,.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <v.Icon size={17} color={platform === v.id ? '#22c55e' : 'var(--text3)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: platform === v.id ? 'var(--text1)' : 'var(--text2)', marginBottom: 3 }}>{v.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>{v.desc}</div>
                    </div>
                    {platform === v.id && <Check size={18} color="#22c55e" style={{ marginTop: 9 }} />}
                  </label>
                ))}
              </div>
            )}

            {/* CHANGELOG: Variant */}
            {feature === 'changelog' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { id: 'cloudflare', Icon: Cloud, label: 'Vollständiges System (⭐ empfohlen)', desc: 'Floating Badge → /changelog Übersichtsseite → /changelog/[id] Einzelseite. Drei fertige Cloudflare Pages Functions.' },
                  { id: 'html', Icon: Code, label: 'Nur Inline-Widget (direkt einbetten)', desc: 'Rendert die Changelog-Liste in ein beliebiges <div> deiner Seite — ohne Routing, ohne eigene Seiten.' },
                  { id: 'nextjs', Icon: Globe, label: 'Nur Badge (standalone)', desc: 'Der "Was ist neu?"-Badge erscheint als Popup — ohne Link auf eine Changelog-Seite.' },
                ].map(v => (
                  <label key={v.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 20px', borderRadius: 12, border: `2px solid ${platform === v.id ? 'rgba(245,158,11,.5)' : 'var(--border)'}`, background: platform === v.id ? 'rgba(245,158,11,.05)' : 'var(--surface)', cursor: 'pointer', transition: 'all .15s' }}>
                    <input type="radio" name="variant" value={v.id} checked={platform === v.id} onChange={() => setPlatform(v.id as any)} style={{ display: 'none' }} />
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: platform === v.id ? 'rgba(245,158,11,.1)' : 'var(--bg)', border: `1px solid ${platform === v.id ? 'rgba(245,158,11,.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <v.Icon size={17} color={platform === v.id ? '#f59e0b' : 'var(--text3)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: platform === v.id ? 'var(--text1)' : 'var(--text2)', marginBottom: 3 }}>{v.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>{v.desc}</div>
                    </div>
                    {platform === v.id && <Check size={18} color="#f59e0b" style={{ marginTop: 9 }} />}
                  </label>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}>
                <ChevronLeft size={15} /> Zurück
              </button>
              <button onClick={() => setStep(4)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
                Weiter <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Files & Instructions */}
        {step === 4 && codes && site && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 100, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', fontSize: 12, fontWeight: 700, color: '#22c55e', marginBottom: 14 }}>
                <Check size={13} /> Fast fertig!
              </div>
              <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>Dateien herunterladen & einbinden</h2>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Folge den Schritten unten. Alle Dateien sind bereits mit deinen Einstellungen befüllt.</p>
            </div>

            {/* BLOG STEPS */}
            {feature === 'blog' && platform === 'cloudflare' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  {
                    n: 1, title: 'Cloudflare Pages Projekt öffnen',
                    body: <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>Gehe zu <a href="https://pages.cloudflare.com" target="_blank" rel="noreferrer" style={{ color: '#7e93fb' }}>pages.cloudflare.com</a> und öffne dein Projekt. Im Ordner <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>functions/</code> werden die Pages Functions abgelegt.</p>
                  },
                  {
                    n: 2, title: 'Blog-Post-Function herunterladen',
                    body: <>
                      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>
                        Lade die Datei herunter und lege sie in deinem Projekt unter <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>functions/blog/[lang]/[slug].js</code> ab. Erstelle ggf. die Ordner.
                      </p>
                      <CopyBlock label="functions/blog/[lang]/[slug].js" code={codes.blog.cloudflare} filename="[slug].js" />
                    </>
                  },
                  {
                    n: 3, title: 'Sitemap herunterladen (optional, aber empfohlen)',
                    body: <>
                      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>
                        Lege diese Datei unter <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>functions/sitemap.xml.js</code> ab. Sie generiert automatisch eine XML-Sitemap für alle Blog-Posts.
                      </p>
                      <CopyBlock label="functions/sitemap.xml.js" code={codes.blog.sitemap} filename="sitemap.xml.js" />
                    </>
                  },
                  {
                    n: 4, title: 'Blog-Listing auf deiner Website einbinden',
                    body: <>
                      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>
                        Für die Übersichtsseite (z.B. <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>blog/index.html</code>) — füge einen Container und das Script ein:
                      </p>
                      <CopyBlock label="Blog-Liste (in deine index.html)" code={codes.blog.html} filename="blog-listing.html" />
                    </>
                  },
                  {
                    n: 5, title: 'Deployen & testen',
                    body: <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>Pushe deine Änderungen zu GitHub/GitLab — Cloudflare Pages deployed automatisch. Teste dann:</p>
                      <CopyBlock label="Test-URL" code={`${blogCfg.base_url || site.url}/blog/de/DEIN-SLUG`} />
                      <CopyBlock label="Sitemap-URL" code={`${blogCfg.base_url || site.url}/sitemap.xml`} />
                    </div>
                  },
                ].map(({ n, title, body }) => (
                  <div key={n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StepBadge n={n} active done={false} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>{body}</div>
                  </div>
                ))}
              </div>
            )}

            {feature === 'blog' && platform === 'nextjs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { n: 1, title: 'Dynamic Route erstellen', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Erstelle folgende Datei in deinem Next.js Projekt: <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>app/blog/[lang]/[slug]/page.tsx</code></p><CopyBlock label="app/blog/[lang]/[slug]/page.tsx" code={codes.blog.nextjs} filename="page.tsx" /></> },
                  { n: 2, title: 'Blog-Liste einbinden', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Für die Übersichtsseite kannst du die API direkt in einem Server Component aufrufen oder das JS-Snippet nutzen:</p><CopyBlock label="Listing-Script (für client-side)" code={codes.blog.html} filename="blog-listing.html" /></> },
                ].map(({ n, title, body }) => (
                  <div key={n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StepBadge n={n} active done={false} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>{body}</div>
                  </div>
                ))}
              </div>
            )}

            {feature === 'blog' && platform === 'html' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <StepBadge n={1} active done={false} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Blog-Liste in deine Seite einbinden</span>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Füge diesen Code in deine Blog-Übersichtsseite ein — entweder in eine bestehende HTML-Datei oder als eigene Seite:</p>
                    <CopyBlock label="blog/index.html — Blog-Listing" code={codes.blog.html} filename="blog-listing.html" />
                  </div>
                </div>
                <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 12, padding: 18 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <AlertCircle size={16} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#f59e0b', marginBottom: 4 }}>Hinweis: Kein Server-seitiges Rendering</div>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
                        Für statische HTML-Seiten werden Blog-Posts client-seitig geladen. Das bedeutet: Google sieht möglicherweise keine Inhalte beim Crawlen. Für volle SEO-Indexierung empfehlen wir <strong>Cloudflare Pages Functions</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUPPORT STEPS */}
            {feature === 'support' && platform === 'html' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { n: 1, title: 'Script kopieren oder herunterladen', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Kopiere dieses Script und füge es auf jeder Seite deiner Website <strong>vor <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>&lt;/body&gt;</code></strong> ein. In WordPress, in dein Theme, in deinen Layout-Header — überall.</p><CopyBlock label="support-widget.js (vor </body>)" code={codes.support.widget} filename="support-widget.js" /></> },
                  { n: 2, title: 'Fertig — Widget erscheint auf deiner Website', body: <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>Nach dem Einfügen erscheint ein 💬-Button unten rechts. Neue Tickets landen direkt in deinem SiteControl Dashboard unter Support-Tickets.</p>
                    <div style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 10, padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <Check size={15} color="#22c55e" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>Ticket-Tokens</div>
                        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>Jedes Ticket bekommt einen eindeutigen Token der im localStorage gespeichert wird. Damit können User ihren Ticket-Status später abfragen.</p>
                      </div>
                    </div>
                  </div> },
                ].map(({ n, title, body }) => (
                  <div key={n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StepBadge n={n} active done={false} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>{body}</div>
                  </div>
                ))}
              </div>
            )}

            {feature === 'support' && platform === 'cloudflare' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { n: 1, title: 'support.html herunterladen', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Lade die fertige HTML-Seite herunter und füge sie in dein Projekt ein. Für Cloudflare Pages unter <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>public/support.html</code> oder als Pages Function.</p><CopyBlock label="support.html" code={codes.support.page} filename="support.html" /></> },
                  { n: 2, title: 'Verlinken', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Verlinke auf deine neue Support-Seite:</p><CopyBlock label="Link zu deiner Support-Seite" code='<a href="/support.html">Support kontaktieren</a>' /></> },
                ].map(({ n, title, body }) => (
                  <div key={n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StepBadge n={n} active done={false} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>{body}</div>
                  </div>
                ))}
              </div>
            )}

            {/* CHANGELOG STEPS */}
            {feature === 'changelog' && platform === 'cloudflare' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 12, padding: 16, display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⭐</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#f59e0b', marginBottom: 3 }}>Vollständiges Changelog-System</div>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>Du bekommst 3 Dateien: Badge-Script (auf beliebigen Seiten), Übersichtsseite → Einzelseiten. Alle Cloudflare Pages Functions.</p>
                  </div>
                </div>
                {[
                  { n: 1, title: 'Badge-Script einbinden (zeigt Neuigkeiten)', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Füge dieses Script <strong>vor <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>&lt;/body&gt;</code></strong> ein — auf deiner Startseite oder überall. Der Badge erscheint wenn ein neuer Eintrag da ist und führt zur Changelog-Seite.</p><CopyBlock label="changelog-badge.js (vor </body>)" code={codes.changelog.badgeLinked} filename="changelog-badge.js" /></> },
                  { n: 2, title: 'Übersichtsseite herunterladen (functions/changelog.js)', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Lege diese Datei unter <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>functions/changelog.js</code> ab. Sie rendert <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>/changelog</code> als SSR-Seite — mit allen Einträgen als Links.</p><CopyBlock label="functions/changelog.js" code={codes.changelog.cloudflare} filename="changelog.js" /></> },
                  { n: 3, title: 'Einzelseite herunterladen (functions/changelog/[id].js)', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Lege diese Datei unter <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>functions/changelog/[id].js</code> ab. Damit erhält jeder Eintrag eine eigene Seite unter <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>/changelog/[id]</code>.</p><CopyBlock label="functions/changelog/[id].js" code={codes.changelog.entryPage} filename="[id].js" /></> },
                  { n: 4, title: 'Navigation verlinken & deployen', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Füge einen Link zu <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>/changelog</code> in deine Navigation ein, dann deployen:</p><CopyBlock label="Nav-Link" code='<a href="/changelog">Changelog</a>' /></> },
                ].map(({ n, title, body }) => (
                  <div key={n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StepBadge n={n} active done={false} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>{body}</div>
                  </div>
                ))}
              </div>
            )}

            {feature === 'changelog' && platform === 'html' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { n: 1, title: 'Container in deine Seite einfügen', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Füge zuerst einen leeren Container ein wo der Changelog erscheinen soll, dann das Script darunter. Alles wird automatisch geladen.</p><CopyBlock label="Inline Changelog Widget" code={codes.changelog.widget} filename="changelog-widget.html" /></> },
                  { n: 2, title: 'Fertig!', body: <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>Der Changelog lädt automatisch alle veröffentlichten Einträge aus SiteControl und rendert sie in deinen Container. Du musst nichts weiter tun — neue Einträge erscheinen automatisch.</p> },
                ].map(({ n, title, body }) => (
                  <div key={n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StepBadge n={n} active done={false} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>{body}</div>
                  </div>
                ))}
              </div>
            )}

            {feature === 'changelog' && platform === 'nextjs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { n: 1, title: '"Was ist neu?" Badge einbinden (standalone)', body: <><p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.7 }}>Füge dieses Script <strong>vor <code style={{ fontFamily: 'Space Mono, monospace', background: 'var(--bg)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>&lt;/body&gt;</code></strong> ein. Der Badge zeigt den neuesten Eintrag als Popup — ohne auf eine Seite zu verlinken.</p><CopyBlock label="Changelog Badge standalone (vor </body>)" code={codes.changelog.badge} filename="changelog-badge-standalone.html" /></> },
                  { n: 2, title: 'Fertig!', body: <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>Der Badge erscheint automatisch für neue Einträge und verschwindet nach 12 Sekunden oder beim Schließen. Der Status wird im localStorage gespeichert.</p> },
                ].map(({ n, title, body }) => (
                  <div key={n} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StepBadge n={n} active done={false} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>{body}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Success banner */}
            <div style={{ marginTop: 24, background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Star size={16} color="#22c55e" fill="#22c55e" />
                <span style={{ fontWeight: 700, fontSize: 15, color: '#22c55e' }}>Du bist bereit!</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 16 }}>
                Wenn du neue Inhalte in SiteControl hinzufügst oder veränderst, erscheinen sie automatisch auf deiner Website — kein Re-Deploy nötig.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href={`/dashboard/${feature}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 9, background: '#22c55e', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                  {feature === 'blog' ? 'Blog-Posts schreiben' : feature === 'support' ? 'Tickets verwalten' : 'Changelog-Einträge anlegen'} <ArrowRight size={14} />
                </a>
                <button onClick={() => setStep(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>
                  Anderes Feature einbinden
                </button>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button onClick={() => setStep(3)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>
                <ChevronLeft size={14} /> Andere Variante wählen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>Laden…</div>}>
      <EmbedPageContent />
    </Suspense>
  )
}

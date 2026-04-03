'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, Check, ChevronDown, ChevronRight, Code, MessageSquare, Globe, Zap, Plus, X } from 'lucide-react'

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

const ALL_FIELDS = ['name', 'email', 'subject', 'message', 'category']
const FIELD_LABELS: Record<string, string> = { name: 'Name', email: 'E-Mail', subject: 'Betreff', message: 'Nachricht', category: 'Kategorie' }

export default function SupportSetupPage() {
  const searchParams = useSearchParams()
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSite, setSelectedSite] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [cfg, setCfg] = useState({
    fields: ['name', 'email', 'subject', 'message'] as string[],
    categories: [] as string[],
    statuses: ['open', 'in_progress', 'resolved', 'closed'] as string[],
    notify_email: '',
    widget_title: 'Support',
    widget_color: '#5b6af6',
    success_message: 'Danke! Wir melden uns so schnell wie möglich.',
    allowed_origins: ['*'] as string[],
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
      if (d.support_config) setCfg({ ...cfg, ...d.support_config })
    })
  }, [selectedSite])

  async function save() {
    setSaving(true)
    await fetch('/api/site-settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: selectedSite, support_enabled: true, support_config: cfg }),
    })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const siteId = selectedSite
  const site = sites.find(s => s.id === selectedSite)

  // ── Embed: Floating Widget ────────────────────────────────────────
  const widgetScript = `<!-- SiteControl Support Widget -->
<!-- Einfach vor </body> einfügen -->
<script>
(function(){
  var SITE_ID = '${siteId}';
  var API = '${APP}/api/public/support';
  var TITLE = '${cfg.widget_title}';
  var COLOR = '${cfg.widget_color}';
  var SUCCESS = '${cfg.success_message}';
  var CATS = ${JSON.stringify(cfg.categories)};
  var FIELDS = ${JSON.stringify(cfg.fields)};

  // Create styles
  var style = document.createElement('style');
  style.textContent = [
    '#sc-btn{position:fixed;bottom:24px;right:24px;z-index:9999;width:52px;height:52px;border-radius:50%;background:COLOR;color:#fff;border:none;cursor:pointer;font-size:22px;box-shadow:0 4px 20px rgba(0,0,0,.3);transition:transform .2s}',
    '#sc-btn:hover{transform:scale(1.1)}',
    '#sc-modal{display:none;position:fixed;bottom:88px;right:24px;z-index:9998;width:min(380px,96vw);background:#111420;border:1px solid #1f2438;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.5);font-family:-apple-system,sans-serif}',
    '#sc-modal.open{display:block}',
    '#sc-head{padding:16px 20px;border-bottom:1px solid #1f2438;display:flex;align-items:center;justify-content:space-between}',
    '#sc-head span{font-weight:700;font-size:15px;color:#e8eaf0}',
    '#sc-close{background:none;border:none;color:#9098b8;cursor:pointer;font-size:18px;line-height:1;padding:2px 6px;border-radius:5px}',
    '#sc-body{padding:20px}',
    '#sc-body input,#sc-body textarea,#sc-body select{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #1f2438;background:#0c0e14;color:#e8eaf0;font-size:13px;font-family:inherit;margin-bottom:10px;outline:none;box-sizing:border-box}',
    '#sc-body input:focus,#sc-body textarea:focus{border-color:COLOR}',
    '#sc-body textarea{height:90px;resize:none}',
    '#sc-send{width:100%;padding:11px;border-radius:8px;border:none;background:COLOR;color:#fff;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;margin-top:4px}',
    '#sc-send:disabled{opacity:.6;cursor:not-allowed}',
    '#sc-success{display:none;padding:28px;text-align:center;color:#22c55e;font-size:14px;font-weight:600}',
    '#sc-err{color:#ef4444;font-size:12px;margin-bottom:8px;display:none}',
  ].join('').replace(/COLOR/g, COLOR);
  document.head.appendChild(style);

  // Widget HTML
  var wrap = document.createElement('div');
  wrap.innerHTML = [
    '<button id="sc-btn" aria-label="Support">💬</button>',
    '<div id="sc-modal">',
    '  <div id="sc-head"><span>' + TITLE + '</span><button id="sc-close">✕</button></div>',
    '  <div id="sc-body">',
    '    <div id="sc-success">' + SUCCESS + '</div>',
    '    <div id="sc-err"></div>',
    FIELDS.includes('name')    ? '<input id="sc-name" placeholder="Name">' : '',
    FIELDS.includes('email')   ? '<input id="sc-email" placeholder="E-Mail" type="email">' : '',
    FIELDS.includes('subject') ? '<input id="sc-subject" placeholder="Betreff" required>' : '',
    CATS.length ? '<select id="sc-cat"><option value="">Kategorie wählen…</option>' + CATS.map(c => '<option>' + c + '</option>').join('') + '</select>' : '',
    FIELDS.includes('message') ? '<textarea id="sc-msg" placeholder="Deine Nachricht…" required></textarea>' : '',
    '    <button id="sc-send">Senden</button>',
    '  </div>',
    '</div>',
  ].join('');
  document.body.appendChild(wrap);

  var btn = document.getElementById('sc-btn');
  var modal = document.getElementById('sc-modal');
  var closeBtn = document.getElementById('sc-close');
  var sendBtn = document.getElementById('sc-send');
  var errEl = document.getElementById('sc-err');
  var successEl = document.getElementById('sc-success');

  btn.addEventListener('click', function(){ modal.classList.toggle('open'); });
  closeBtn.addEventListener('click', function(){ modal.classList.remove('open'); });

  sendBtn.addEventListener('click', async function(){
    var subject = (document.getElementById('sc-subject') || {}).value || TITLE;
    var message = (document.getElementById('sc-msg') || {}).value || '';
    if (!subject || !message) { errEl.textContent = 'Bitte Betreff und Nachricht ausfüllen.'; errEl.style.display='block'; return; }
    errEl.style.display='none';
    sendBtn.disabled = true;
    try {
      var body = {
        site_id: SITE_ID, subject, message,
        name:     (document.getElementById('sc-name')    || {}).value || null,
        email:    (document.getElementById('sc-email')   || {}).value || null,
        category: (document.getElementById('sc-cat')     || {}).value || null,
        source:   'widget',
      };
      var res = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler');
      document.getElementById('sc-body').querySelector('form,div').style.display='none';
      ['sc-name','sc-email','sc-subject','sc-cat','sc-msg'].forEach(id=>{var el=document.getElementById(id);if(el)el.style.display='none';});
      sendBtn.style.display='none';
      successEl.style.display='block';
      if(data.token) localStorage.setItem('sc_ticket_' + SITE_ID, data.token);
    } catch(e) {
      errEl.textContent = e.message; errEl.style.display='block'; sendBtn.disabled=false;
    }
  });
})();
</script>`

  // ── Embed: HTML Support Page ──────────────────────────────────────
  const supportPage = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support – ${site?.name || 'Meine Website'}</title>
  <style>
    body{font-family:-apple-system,sans-serif;background:#0c0e14;color:#e8eaf0;margin:0;padding:2rem 1rem}
    .wrap{max-width:540px;margin:0 auto}
    h1{font-size:1.8rem;font-weight:900;margin-bottom:.5rem}
    p{color:#9098b8;margin-bottom:2rem}
    input,textarea,select{width:100%;padding:11px 14px;border-radius:9px;border:1px solid #1f2438;background:#111420;color:#e8eaf0;font-size:14px;font-family:inherit;margin-bottom:12px;box-sizing:border-box;outline:none}
    input:focus,textarea:focus{border-color:${cfg.widget_color}}
    textarea{height:120px;resize:vertical}
    button{width:100%;padding:13px;border-radius:9px;background:${cfg.widget_color};color:#fff;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:inherit}
    button:disabled{opacity:.6}
    .success{padding:24px;border-radius:12px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);color:#22c55e;text-align:center;font-weight:600;display:none}
    .error{color:#ef4444;font-size:13px;margin-bottom:10px;display:none}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>💬 ${cfg.widget_title}</h1>
    <p>Hast du eine Frage oder ein Problem? Schreib uns – wir helfen dir schnell weiter.</p>

    <form id="support-form">
      ${cfg.fields.includes('name')    ? '<input id="sc-name" placeholder="Dein Name">' : ''}
      ${cfg.fields.includes('email')   ? '<input id="sc-email" type="email" placeholder="E-Mail Adresse">' : ''}
      ${cfg.fields.includes('subject') ? '<input id="sc-subject" placeholder="Betreff" required>' : ''}
      ${cfg.categories.length ? `<select id="sc-cat"><option value="">Kategorie wählen…</option>${cfg.categories.map(c => `<option>${c}</option>`).join('')}</select>` : ''}
      ${cfg.fields.includes('message') ? '<textarea id="sc-msg" placeholder="Deine Nachricht…" required></textarea>' : ''}
      <div class="error" id="sc-err"></div>
      <button type="submit" id="sc-send">Nachricht senden</button>
    </form>
    <div class="success" id="sc-success">${cfg.success_message}</div>
  </div>

  <script>
    const SITE_ID = '${siteId}';
    const API = '${APP}/api/public/support';

    document.getElementById('support-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = document.getElementById('sc-send');
      const err = document.getElementById('sc-err');
      btn.disabled = true; err.style.display = 'none';

      try {
        const body = {
          site_id: SITE_ID,
          subject:  (document.getElementById('sc-subject') || {}).value || 'Kontaktanfrage',
          message:  (document.getElementById('sc-msg')     || {}).value,
          name:     (document.getElementById('sc-name')    || {}).value || null,
          email:    (document.getElementById('sc-email')   || {}).value || null,
          category: (document.getElementById('sc-cat')     || {}).value || null,
          source: 'page',
        };
        const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fehler');
        document.getElementById('support-form').style.display = 'none';
        document.getElementById('sc-success').style.display = 'block';
        if (data.token) localStorage.setItem('sc_ticket_${siteId}', data.token);
      } catch(e) {
        err.textContent = e.message; err.style.display = 'block'; btn.disabled = false;
      }
    });
  </script>
</body>
</html>`

  // ── Cloudflare Pages Function Support ────────────────────────────
  const cfSupportPage = `// functions/support.js — Cloudflare Pages Function
// Route: /support  (auch als /kontakt oder /contact nutzbar)

const SITE_ID = '${siteId}';
const API = '${APP}';
const WIDGET_TITLE = '${cfg.widget_title}';
const COLOR = '${cfg.widget_color}';
const SUCCESS = '${cfg.success_message}';
const CATEGORIES = ${JSON.stringify(cfg.categories)};
const FIELDS = ${JSON.stringify(cfg.fields)};
const SITE_NAME = '${site?.name || 'Website'}';

export async function onRequestGet() {
  const html = \`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support – \${SITE_NAME}</title>
  <style>/* ... dein CSS ... */</style>
</head>
<body>
  <!-- Support-Formular wie oben in "HTML Support-Seite" -->
</body>
</html>\`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' }});
}`

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <a href="/dashboard/support" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}>← Support</a>
        <h1 style={{ fontWeight: 900, fontSize: 22 }}>🎫 Support Setup & Einbindung</h1>
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
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>2. Support konfigurieren</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Widget-Titel</label>
              <input style={inp} value={cfg.widget_title} onChange={e => setCfg(c => ({ ...c, widget_title: e.target.value }))} placeholder="Support" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Widget-Farbe</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={cfg.widget_color} onChange={e => setCfg(c => ({ ...c, widget_color: e.target.value }))} style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', padding: 2 }} />
                <input style={{ ...inp, flex: 1 }} value={cfg.widget_color} onChange={e => setCfg(c => ({ ...c, widget_color: e.target.value }))} />
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Erfolgs-Nachricht</label>
              <input style={inp} value={cfg.success_message} onChange={e => setCfg(c => ({ ...c, success_message: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>Benachrichtigungs-E-Mail (optional)</label>
              <input style={inp} type="email" value={cfg.notify_email} onChange={e => setCfg(c => ({ ...c, notify_email: e.target.value }))} placeholder="du@beispiel.de" />
            </div>
          </div>

          {/* Fields */}
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Formular-Felder</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ALL_FIELDS.map(f => {
                const on = cfg.fields.includes(f)
                const req = f === 'subject' || f === 'message'
                return (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${on ? 'rgba(91,106,246,.4)' : 'var(--border)'}`, background: on ? 'rgba(91,106,246,.08)' : 'var(--bg)', cursor: req ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, color: on ? '#7e93fb' : 'var(--text2)', opacity: req ? 0.75 : 1 }}>
                    <input type="checkbox" checked={on} disabled={req} onChange={e => setCfg(c => ({ ...c, fields: e.target.checked ? [...c.fields, f] : c.fields.filter(x => x !== f) }))} style={{ display: 'none' }} />
                    {FIELD_LABELS[f]} {req && <span style={{ fontSize: 10, color: 'var(--text3)' }}>(Pflicht)</span>}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Categories */}
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Kategorien (optional)</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {cfg.categories.map(cat => (
                <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 7, background: 'rgba(91,106,246,.1)', border: '1px solid rgba(91,106,246,.2)', fontSize: 12, fontWeight: 600, color: '#a4bbfd' }}>
                  {cat}
                  <button onClick={() => setCfg(c => ({ ...c, categories: c.categories.filter(x => x !== cat) }))} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '0 2px', fontSize: 12 }}>✕</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...inp, maxWidth: 220 }} value={newCategory} onChange={e => setNewCategory(e.target.value)}
                placeholder="Neue Kategorie…"
                onKeyDown={e => { if (e.key === 'Enter' && newCategory.trim()) { setCfg(c => ({ ...c, categories: [...c.categories, newCategory.trim()] })); setNewCategory('') } }} />
              <button onClick={() => { if (newCategory.trim()) { setCfg(c => ({ ...c, categories: [...c.categories, newCategory.trim()] })); setNewCategory('') } }}
                style={{ padding: '9px 16px', borderRadius: 8, background: '#5b6af6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
                + Hinzufügen
              </button>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <button onClick={save} disabled={saving} style={{ padding: '11px 24px', borderRadius: 9, background: saved ? '#22c55e' : 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
              {saved ? '✓ Gespeichert' : saving ? 'Speichern…' : 'Konfiguration speichern'}
            </button>
          </div>
        </div>

        {/* API */}
        <Section title="API-Endpunkte" icon={<Zap size={16} color="#f59e0b" />} open>
          <div style={{ paddingTop: 16 }}>
            <CopyBox label="POST Ticket senden" code={`curl -X POST ${APP}/api/public/support \\
  -H "Content-Type: application/json" \\
  -d '{
    "site_id": "${siteId}",
    "name": "Max Mustermann",
    "email": "max@beispiel.de",
    "subject": "Problem mit Account",
    "message": "Ich kann mich nicht anmelden.",
    "category": "${cfg.categories[0] || 'Allgemein'}"
  }'`} />
            <CopyBox label="GET Ticket-Status (User)" code={`${APP}/api/public/support?token=DEIN_TOKEN`} />
          </div>
        </Section>

        {/* Floating Widget */}
        <Section title="Floating Widget — JavaScript" icon={<MessageSquare size={16} color="#a78bfa" />}>
          <div style={{ paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
              Dieses Script vor <code style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, background: 'var(--bg)', padding: '1px 6px', borderRadius: 4 }}>&lt;/body&gt;</code> auf jeder Seite einfügen. Erscheint als 💬-Button unten rechts.
            </p>
            <CopyBox label="Widget-Script (vor </body>)" code={widgetScript} />
          </div>
        </Section>

        {/* HTML Support Page */}
        <Section title="Fertige Support-Seite (HTML)" icon={<Globe size={16} color="#22c55e" />}>
          <div style={{ paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
              Vollständige HTML-Seite — einfach als <code style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, background: 'var(--bg)', padding: '1px 6px', borderRadius: 4 }}>support.html</code> oder <code style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, background: 'var(--bg)', padding: '1px 6px', borderRadius: 4 }}>kontakt.html</code> speichern.
            </p>
            <CopyBox label="support.html" code={supportPage} />
          </div>
        </Section>

        {/* Cloudflare Pages */}
        <Section title="Cloudflare Pages Function" icon={<Code size={16} color="#f97316" />}>
          <div style={{ paddingTop: 16 }}>
            <CopyBox label="functions/support.js" code={cfSupportPage} />
          </div>
        </Section>

      </>}
    </div>
  )
}

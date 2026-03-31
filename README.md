# SiteControl — Website Management Dashboard (SaaS)

Kommerzielle Version von WebControl HQ. Verwalte alle deine Websites, Blog-Posts, Changelogs, Support-Tickets, Todos und Analytics in einem zentralen Dashboard.

**Stack:** Next.js 14 (App Router) + Supabase (Auth, DB, RLS) + Vercel

---

## 🚀 Setup in 5 Schritten

### 1. Dependencies installieren
```bash
cd Website_Manager
npm install
```

### 2. Supabase Projekt erstellen
1. Gehe zu [supabase.com](https://supabase.com) → Neues Projekt
2. SQL Editor → Inhalt von `supabase-schema.sql` ausführen
3. Project Settings → API → URL + anon key kopieren

### 3. `.env.local` anlegen
```bash
cp .env.local.example .env.local
```
Dann eintragen:
```
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Lokal starten
```bash
npm run dev
```
→ Öffne http://localhost:3000

### 5. Auf Vercel deployen
```bash
npm install -g vercel
vercel
```
Umgebungsvariablen in Vercel Dashboard eintragen.

---

## 📁 Projektstruktur

```
Website_Manager/
├── app/
│   ├── page.tsx                  ← Landing Page (SEO)
│   ├── layout.tsx                ← Root Layout
│   ├── globals.css
│   ├── login/page.tsx            ← Anmeldung
│   ├── signup/page.tsx           ← Registrierung (Free + Pro Trial)
│   ├── dashboard/
│   │   ├── layout.tsx            ← Auth-Guard + DashboardShell
│   │   ├── page.tsx              ← Dashboard Hauptseite
│   │   ├── sites/page.tsx        ← Website-Verwaltung
│   │   ├── todos/page.tsx        ← Todo-Manager
│   │   ├── blog/page.tsx         ← Blog-CMS (Pro)
│   │   ├── changelog/page.tsx    ← Changelog (Pro)
│   │   ├── support/page.tsx      ← Support-Tickets (Pro)
│   │   ├── analytics/page.tsx    ← Analytics
│   │   ├── upgrade/page.tsx      ← Upgrade-Seite
│   │   └── settings/page.tsx     ← Einstellungen
│   └── api/
│       ├── sites/route.ts        ← GET/POST Sites (mit Plan-Check)
│       ├── todos/route.ts        ← GET/POST/PATCH/DELETE Todos
│       ├── blog/route.ts         ← GET/POST/PATCH/DELETE Blog (Pro)
│       ├── changelog/route.ts    ← GET/POST/PATCH/DELETE Changelog (Pro)
│       ├── support/route.ts      ← GET/PATCH Tickets (Pro)
│       └── analytics/route.ts    ← GET/POST Analytics
├── components/
│   └── DashboardShell.tsx        ← Sidebar + Layout
├── lib/
│   └── supabase/
│       ├── client.ts             ← Browser Client
│       ├── server.ts             ← Server Client
│       └── middleware.ts         ← Auth Middleware
├── middleware.ts                 ← Route Protection
├── supabase-schema.sql           ← DB Schema + RLS Policies
└── vercel.json
```

---

## 🔐 Auth & Plan-System

- Supabase Auth (E-Mail + Passwort)
- Automatisches Profil-Anlegen via DB Trigger
- `profiles.plan_id` = `'free'` | `'pro'`
- Free: max. 3 Websites
- Pro: unbegrenzte Websites + Blog, Changelog, Support, Analytics, Widgets

---

## 🌐 Externe Sites tracken

Von externen Websites Analytics-Events senden:
```javascript
fetch('https://deine-app.vercel.app/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    site_slug: 'mein-blog',    // slug aus der Sites-DB
    owner_id: 'deine-user-id', // Supabase User ID
    event_type: 'pageview',
    path: window.location.pathname,
    country: 'DE',
    device: 'desktop'
  })
})
```

---

## 💳 Stripe-Integration (nächster Schritt)

Für echte Zahlungen Stripe Checkout einbauen:
1. `npm install stripe @stripe/stripe-js`
2. `/api/stripe/checkout/route.ts` anlegen
3. Webhook für `checkout.session.completed` → `plan_id` auf `'pro'` setzen

---

## 📦 Weitere geplante Features

- [ ] Stripe Checkout + Webhook
- [ ] Pinboard-Seite
- [ ] Team-Mitglieder einladen
- [ ] AdSense + GSC Widgets (wie im Original-Manager)
- [ ] E-Mail-Benachrichtigungen (Supabase Edge Functions)
- [ ] Öffentliche Changelog-Seite per Site-Slug
- [ ] API-Keys für externe Sites

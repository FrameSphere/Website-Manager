// PUBLIC endpoint — no auth required
// POST /api/public/support  { site_id, name, email, subject, message, category, source }
// GET  /api/public/support/status?token=xxx  (user checking own ticket status)

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400, headers: CORS })

  const { site_id, name, email, subject, message, category, source } = body

  if (!site_id)  return NextResponse.json({ error: 'site_id fehlt' }, { status: 400, headers: CORS })
  if (!subject)  return NextResponse.json({ error: 'subject fehlt' }, { status: 400, headers: CORS })
  if (!message)  return NextResponse.json({ error: 'message fehlt' }, { status: 400, headers: CORS })

  // Verify site exists and get owner_id + support config
  const { data: site } = await supabase
    .from('sites').select('id, owner_id').eq('id', site_id).single()
  if (!site) return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404, headers: CORS })

  // Get support config to check if enabled
  const { data: settings } = await supabase
    .from('site_settings').select('support_enabled, support_config').eq('site_id', site_id).single()

  if (settings && settings.support_enabled === false) {
    return NextResponse.json({ error: 'Support ist für diese Site nicht aktiviert' }, { status: 403, headers: CORS })
  }

  // Generate user token for status tracking
  const userToken = Math.random().toString(36).slice(2) + Date.now().toString(36)

  const { data, error } = await supabase.from('support_tickets').insert({
    site_id,
    owner_id: site.owner_id,
    name:     name    || null,
    email:    email   || null,
    subject,
    message,
    category: category || null,
    source:   source || 'widget',
    user_token: userToken,
    status: 'open',
    priority: 'normal',
    read: false,
  }).select('id, user_token, created_at').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })

  // Create dashboard notification for owner
  await supabase.from('notifications').insert({
    owner_id: site.owner_id,
    site_id,
    type: 'info',
    title: `Neues Support-Ticket: ${subject}`,
    message: name ? `Von: ${name}` : 'Anonym',
    read: false,
  })

  return NextResponse.json({
    ok: true,
    ticket_id: data.id,
    token: data.user_token,
    message: settings?.support_config?.success_message || 'Deine Nachricht wurde gesendet!',
  }, { status: 201, headers: CORS })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token fehlt' }, { status: 400, headers: CORS })

  const { data, error } = await supabase.from('support_tickets')
    .select('id, subject, status, reply, created_at, updated_at')
    .eq('user_token', token)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Ticket nicht gefunden' }, { status: 404, headers: CORS })

  return NextResponse.json(data, { headers: CORS })
}

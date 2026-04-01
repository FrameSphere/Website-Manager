import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public endpoint — no auth required, called by tracker.js from external sites
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { site_id, event_type, path, referrer, device } = body

    if (!site_id || !event_type) {
      return NextResponse.json({ error: 'site_id and event_type required' }, { status: 400 })
    }

    // Get country from Vercel geo headers
    const country = req.headers.get('x-vercel-ip-country') || null

    const supabase = createClient()

    // Verify site exists (basic check — no owner auth needed since script is public)
    const { data: site } = await supabase
      .from('sites').select('id, owner_id').eq('id', site_id).single()

    if (!site) {
      return NextResponse.json({ error: 'Unknown site' }, { status: 404 })
    }

    await supabase.from('analytics_events').insert({
      owner_id: site.owner_id,
      site_id,
      event_type,
      path: path || '/',
      referrer: referrer || null,
      device: device || null,
      country,
      value: 1,
    })

    return NextResponse.json({ ok: true }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Preflight for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

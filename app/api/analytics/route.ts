import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public endpoint – called from external sites to track events
export async function POST(req: Request) {
  const supabase = createClient()

  // Public: authenticate via site API key (simplified: accept any valid site slug + owner token)
  // For production: validate a per-site API token stored in DB
  const body = await req.json()
  const { site_slug, owner_id, event_type, path, referrer, country, device, value } = body

  if (!site_slug || !owner_id || !event_type) {
    return NextResponse.json({ error: 'site_slug, owner_id und event_type sind Pflichtfelder' }, { status: 400 })
  }

  // Find site
  const { data: site } = await supabase
    .from('sites').select('id').eq('slug', site_slug).eq('owner_id', owner_id).single()

  if (!site) return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })

  const { error } = await supabase.from('analytics_events').insert({
    owner_id, site_id: site.id, event_type,
    path: path || null, referrer: referrer || null,
    country: country || null, device: device || null,
    value: value || 1,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('site_id')
  const days = parseInt(searchParams.get('days') || '7')
  const since = new Date()
  since.setDate(since.getDate() - days)

  let query = supabase.from('analytics_events')
    .select('event_type, path, country, device, created_at, value')
    .eq('owner_id', user.id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (siteId) query = query.eq('site_id', siteId)

  const { data, error } = await query.limit(5000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

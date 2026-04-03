// PUBLIC endpoint — no auth required
// GET /api/public/changelog?site_id=xxx&limit=20

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=120, s-maxage=600',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('site_id')
  const limit  = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const type   = searchParams.get('type') // feature|fix|improvement|breaking

  if (!siteId) return NextResponse.json({ error: 'site_id fehlt' }, { status: 400, headers: CORS })

  let q = supabase.from('changelog_entries')
    .select('id, version, title, description, type, published_at, created_at')
    .eq('site_id', siteId)
    .eq('published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (type) q = q.eq('type', type)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })

  return NextResponse.json(data || [], { headers: CORS })
}

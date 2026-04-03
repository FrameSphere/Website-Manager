// PUBLIC endpoint — no auth required
// GET /api/public/blog?site_id=xxx&lang=de&limit=20&offset=0&tag=xxx
// GET /api/public/blog?site_id=xxx&lang=de&slug=my-post  ← single post

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
  'Cache-Control': 'public, max-age=60, s-maxage=300',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const siteId  = searchParams.get('site_id')
  const lang    = searchParams.get('lang')
  const slug    = searchParams.get('slug')
  const tag     = searchParams.get('tag')
  const groupId = searchParams.get('group_id')
  const limit   = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset  = parseInt(searchParams.get('offset') || '0')

  if (!siteId) return NextResponse.json({ error: 'site_id fehlt' }, { status: 400, headers: CORS })

  // Single post by slug
  if (slug) {
    let q = supabase.from('blog_posts').select('*')
      .eq('site_id', siteId)
      .eq('status', 'published')
      .eq('slug', slug)
    if (lang) q = q.eq('lang', lang)

    const { data, error } = await q.single()
    if (error || !data) return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404, headers: CORS })
    return NextResponse.json(data, { headers: CORS })
  }

  // Group siblings (for hreflang)
  if (groupId) {
    const { data, error } = await supabase.from('blog_posts')
      .select('id, slug, lang, title')
      .eq('site_id', siteId)
      .eq('group_id', groupId)
      .eq('status', 'published')
    if (error) return NextResponse.json([], { headers: CORS })
    return NextResponse.json(data || [], { headers: CORS })
  }

  // List posts
  let q = supabase.from('blog_posts')
    .select('id, title, slug, excerpt, lang, tags, published_at, created_at, featured_image, reading_time_min, group_id', { count: 'exact' })
    .eq('site_id', siteId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (lang) q = q.eq('lang', lang)
  if (tag)  q = q.ilike('tags', `%${tag}%`)

  const { data, error, count } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })

  return NextResponse.json({ posts: data || [], total: count ?? 0, limit, offset }, { headers: CORS })
}

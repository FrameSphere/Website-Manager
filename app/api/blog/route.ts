import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requirePro(supabase: any, userId: string) {
  const { data: profile } = await supabase.from('profiles').select('plan_id').eq('id', userId).single()
  return profile?.plan_id === 'pro'
}

export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requirePro(supabase, user.id)) return NextResponse.json({ error: 'Pro-Plan erforderlich' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('site_id')
  const status = searchParams.get('status')
  const lang = searchParams.get('lang')

  let query = supabase.from('blog_posts').select('*, sites(name, color)').eq('owner_id', user.id)
  if (siteId) query = query.eq('site_id', siteId)
  if (status) query = query.eq('status', status)
  if (lang)   query = query.eq('lang', lang)
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requirePro(supabase, user.id)) return NextResponse.json({ error: 'Pro-Plan erforderlich' }, { status: 403 })

  const body = await req.json()
  const { title, site_id, content, excerpt, lang, status, publish_at, meta_title, meta_description, meta_keywords } = body
  if (!title || !site_id) return NextResponse.json({ error: 'title und site_id sind Pflichtfelder' }, { status: 400 })

  const slug = title.toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) + '-' + Date.now().toString(36)

  const { data, error } = await supabase.from('blog_posts').insert({
    owner_id: user.id, site_id, title, slug,
    content: content || null, excerpt: excerpt || null,
    lang: lang || 'de', status: status || 'draft',
    publish_at: publish_at || null,
    published_at: status === 'published' ? new Date().toISOString() : null,
    meta_title: meta_title || null,
    meta_description: meta_description || null,
    meta_keywords: meta_keywords || [],
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requirePro(supabase, user.id)) return NextResponse.json({ error: 'Pro-Plan erforderlich' }, { status: 403 })

  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 })

  if (updates.status === 'published' && !updates.published_at) {
    updates.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase.from('blog_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('owner_id', user.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 })

  const { error } = await supabase.from('blog_posts').delete().eq('id', id).eq('owner_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

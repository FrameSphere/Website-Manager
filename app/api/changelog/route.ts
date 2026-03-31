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

  let query = supabase.from('changelog_entries').select('*, sites(name, color)').eq('owner_id', user.id)
  if (siteId) query = query.eq('site_id', siteId)
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
  const { site_id, version, title, description, type, published } = body
  if (!site_id || !version || !title) return NextResponse.json({ error: 'site_id, version und title sind Pflichtfelder' }, { status: 400 })

  const { data, error } = await supabase.from('changelog_entries').insert({
    owner_id: user.id, site_id, version, title,
    description: description || null,
    type: type || 'feature',
    published: published || false,
    published_at: published ? new Date().toISOString() : null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 })

  if (updates.published && !updates.published_at) updates.published_at = new Date().toISOString()

  const { data, error } = await supabase.from('changelog_entries')
    .update(updates).eq('id', id).eq('owner_id', user.id).select().single()

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

  const { error } = await supabase.from('changelog_entries').delete().eq('id', id).eq('owner_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

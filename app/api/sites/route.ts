import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan_id').eq('id', user.id).single()
  if (profile?.plan_id === 'free') {
    const { count } = await supabase.from('sites').select('*', { count: 'exact', head: true }).eq('owner_id', user.id)
    if ((count || 0) >= 3) {
      return NextResponse.json({ error: 'Free-Plan: Maximal 3 Websites erlaubt. Upgrade auf Pro.' }, { status: 403 })
    }
  }

  const body = await req.json()
  const { name, url, color, description } = body
  if (!name || !url) return NextResponse.json({ error: 'name und url sind Pflichtfelder' }, { status: 400 })

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '-' + Date.now().toString(36)

  const { data, error } = await supabase.from('sites').insert({
    owner_id: user.id, name, url, slug,
    color: color || '#5b6af6',
    description: description || null,
    status: 'active',
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

  const allowed = ['name', 'url', 'color', 'description', 'status', 'notes']
  const filtered = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))
  filtered.updated_at = new Date().toISOString()

  // If status changed, log to history
  if (updates.status) {
    const { data: current } = await supabase.from('sites').select('status').eq('id', id).single()
    if (current && current.status !== updates.status) {
      await supabase.from('site_status_history').insert({
        site_id: id, owner_id: user.id,
        old_status: current.status, new_status: updates.status,
      })
    }
  }

  const { data, error } = await supabase
    .from('sites').update(filtered)
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

  const { error } = await supabase.from('sites').delete().eq('id', id).eq('owner_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

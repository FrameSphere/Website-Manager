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

  // Plan check: Free = max 3 sites
  const { data: profile } = await supabase.from('profiles').select('plan_id').eq('id', user.id).single()
  if (profile?.plan_id === 'free') {
    const { count } = await supabase.from('sites').select('*', { count: 'exact', head: true }).eq('owner_id', user.id)
    if ((count || 0) >= 3) {
      return NextResponse.json({ error: 'Free-Plan: Maximal 3 Websites erlaubt. Upgrade auf Pro für unbegrenzte Websites.' }, { status: 403 })
    }
  }

  const body = await req.json()
  const { name, url, slug, icon, color, description } = body
  if (!name || !url) return NextResponse.json({ error: 'name und url sind Pflichtfelder' }, { status: 400 })

  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '-' + Date.now().toString(36)

  const { data, error } = await supabase.from('sites').insert({
    owner_id: user.id, name, url, slug: finalSlug,
    icon: icon || 'globe', color: color || '#5b6af6',
    description: description || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

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

  let query = supabase.from('support_tickets').select('*, sites(name, color)').eq('owner_id', user.id)
  if (siteId) query = query.eq('site_id', siteId)
  if (status) query = query.eq('status', status)
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 })

  const { data, error } = await supabase.from('support_tickets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('owner_id', user.id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

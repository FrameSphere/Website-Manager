import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('site_id')
  if (!siteId) return NextResponse.json({ error: 'site_id fehlt' }, { status: 400 })

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('site_id', siteId)
    .eq('owner_id', user.id)
    .single()

  // Return defaults if not yet created
  if (error || !data) {
    return NextResponse.json({
      site_id: siteId,
      blog_enabled: false,
      blog_config: { langs: ['de'], base_url: '', site_name: '', primary_color: '#5b6af6', accent_color: '#a78bfa', footer_links: [], play_url: '', play_label: '' },
      support_enabled: false,
      support_config: { fields: ['name','email','subject','message'], categories: [], statuses: ['open','in_progress','resolved','closed'], notify_email: '', widget_title: 'Support', widget_color: '#5b6af6', success_message: 'Danke! Wir melden uns so schnell wie möglich.', allowed_origins: ['*'] },
      changelog_enabled: false,
      changelog_config: { show_types: ['feature','fix','improvement','breaking'], widget_title: 'Changelog', widget_color: '#5b6af6', max_entries: 20, show_version: true, link_url: '' },
    })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { site_id, ...updates } = body
  if (!site_id) return NextResponse.json({ error: 'site_id fehlt' }, { status: 400 })

  // Verify ownership
  const { data: site } = await supabase.from('sites').select('id').eq('id', site_id).eq('owner_id', user.id).single()
  if (!site) return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ site_id, owner_id: user.id, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'site_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

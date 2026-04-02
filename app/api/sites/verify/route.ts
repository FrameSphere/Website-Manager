import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { site_id } = await req.json()
  if (!site_id) return NextResponse.json({ error: 'site_id fehlt' }, { status: 400 })

  const { data: site, error: siteErr } = await supabase
    .from('sites').select('*').eq('id', site_id).eq('owner_id', user.id).single()
  if (siteErr || !site) return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })

  try {
    const res = await fetch(site.url, {
      headers: { 'User-Agent': 'SiteControl-Verifier/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    const html = await res.text()

    const pattern = new RegExp(
      `<meta[^>]+name=["']sitecontrol-site-id["'][^>]+content=["']${site_id}["'][^>]*>|` +
      `<meta[^>]+content=["']${site_id}["'][^>]+name=["']sitecontrol-site-id["'][^>]*>`,
      'i'
    )
    const verified = pattern.test(html)

    if (verified) {
      // Save verified status permanently in DB
      await supabase.from('sites').update({
        verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', site_id).eq('owner_id', user.id)

      return NextResponse.json({
        verified: true,
        message: 'Verifizierung erfolgreich! Deine Website wurde bestätigt.',
      })
    } else {
      return NextResponse.json({
        verified: false,
        message: 'Meta-Tag nicht gefunden. Stelle sicher dass der Tag im <head> deiner Startseite steht und die Seite öffentlich erreichbar ist.',
      })
    }
  } catch (err: any) {
    return NextResponse.json({
      verified: false,
      message: `Website konnte nicht erreicht werden: ${err.message}`,
    }, { status: 422 })
  }
}

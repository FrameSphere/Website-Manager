import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { site_id } = await req.json()
  if (!site_id) return NextResponse.json({ error: 'site_id fehlt' }, { status: 400 })

  // Load site — make sure it belongs to this user
  const { data: site, error: siteErr } = await supabase
    .from('sites').select('*').eq('id', site_id).eq('owner_id', user.id).single()
  if (siteErr || !site) return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })

  const expectedToken = site_id // we use the site UUID as verification token

  try {
    const res = await fetch(site.url, {
      headers: { 'User-Agent': 'SiteControl-Verifier/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()

    // Check for meta tag: <meta name="sitecontrol-site-id" content="UUID">
    const metaRegex = new RegExp(
      `<meta[^>]+name=["']sitecontrol-site-id["'][^>]+content=["']${expectedToken}["']`,
      'i'
    )
    const metaRegex2 = new RegExp(
      `<meta[^>]+content=["']${expectedToken}["'][^>]+name=["']sitecontrol-site-id["']`,
      'i'
    )

    const verified = metaRegex.test(html) || metaRegex2.test(html)

    if (verified) {
      // Mark as verified in DB — status stays active, we store verified timestamp in description for now
      // (or add verified column via migration — see instructions)
      await supabase.from('sites').update({
        status: 'active',
        updated_at: new Date().toISOString(),
      }).eq('id', site_id)

      return NextResponse.json({ verified: true, message: 'Verifizierung erfolgreich! Deine Website wurde bestätigt.' })
    } else {
      return NextResponse.json({
        verified: false,
        message: 'Meta-Tag nicht gefunden. Stelle sicher dass der Tag im <head> deiner Seite ist und die Seite öffentlich erreichbar ist.',
      })
    }
  } catch (err: any) {
    return NextResponse.json({
      verified: false,
      message: `Deine Website konnte nicht erreicht werden: ${err.message}`,
    }, { status: 422 })
  }
}

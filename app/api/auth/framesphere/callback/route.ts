import { NextResponse, type NextRequest } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// GET /api/auth/framesphere/callback
// FrameSphere redirectet hierher mit ?code=...
// Wir tauschen den Code gegen Userdaten, finden/erstellen den Supabase-User
// und generieren einen Magic Link für die Session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin

  // Abgelehnt oder Fehler
  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=framesphere_cancelled`)
  }

  try {
    // ── 1. Code gegen FrameSphere-Userdaten tauschen ──────────────
    const fsApiUrl     = process.env.FRAMESPHERE_API_URL      || 'https://framesphere-backend.vercel.app/api'
    const clientId     = process.env.FRAMESPHERE_CLIENT_ID    || 'sitecontrol'
    const clientSecret = process.env.FRAMESPHERE_CLIENT_SECRET!

    const tokenRes = await fetch(`${fsApiUrl}/sso/token`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code, client_id: clientId, client_secret: clientSecret }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.success) {
      console.error('[FS-SSO] token exchange failed:', tokenRes.status, JSON.stringify(tokenData))
      return NextResponse.redirect(`${appUrl}/login?error=framesphere_failed`)
    }

    const fsUser = tokenData.user // { id, name, email, role, avatarUrl }
    if (!fsUser?.email) {
      return NextResponse.redirect(`${appUrl}/login?error=framesphere_failed`)
    }

    // ── 2. Supabase Admin Client ───────────────────────────────────
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // ── 3. User finden oder erstellen ─────────────────────────────
    const { data: { users: allUsers } } = await supabase.auth.admin.listUsers()
    const existingUser = allUsers.find(u => u.email === fsUser.email.toLowerCase())

    if (existingUser) {
      // framesphere_id in user_metadata speichern (für spätere Lookups)
      if (!existingUser.user_metadata?.framesphere_id) {
        await supabase.auth.admin.updateUserById(existingUser.id, {
          user_metadata: {
            ...existingUser.user_metadata,
            framesphere_id: String(fsUser.id),
          },
        })
      }
    } else {
      // Neuen User anlegen — E-Mail direkt bestätigt, kein Verify-Flow nötig
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email:         fsUser.email.toLowerCase(),
        email_confirm: true,
        user_metadata: {
          full_name:      fsUser.name || '',
          avatar_url:     fsUser.avatarUrl || '',
          framesphere_id: String(fsUser.id),
        },
      })
      if (createError || !newUser?.user) {
        console.error('[FS-SSO] createUser failed:', createError)
        return NextResponse.redirect(`${appUrl}/login?error=framesphere_server_error`)
      }
    }

    // ── 4. Magic Link generieren → setzt Supabase Session-Cookie ──
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type:  'magiclink',
      email: fsUser.email.toLowerCase(),
      options: {
        redirectTo: `${appUrl}/sso-welcome`,
      },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[FS-SSO] generateLink failed:', linkError)
      return NextResponse.redirect(`${appUrl}/login?error=framesphere_server_error`)
    }

    // ── 5. User zur Supabase Action-URL schicken (setzt Session-Cookie)
    return NextResponse.redirect(linkData.properties.action_link)

  } catch (err) {
    console.error('[FS-SSO] unexpected error:', err)
    return NextResponse.redirect(`${appUrl}/login?error=framesphere_server_error`)
  }
}

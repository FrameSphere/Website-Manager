import { NextResponse, type NextRequest } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'

// GET /api/auth/framesphere/callback
// Flow: Code → FS-User → Supabase-User (find/create)
//       → generateLink → verifyOtp (server-seitig) → Session-Cookies setzen → /sso-welcome
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=framesphere_cancelled`)
  }

  try {
    // ── 1. Code gegen FrameSphere-Userdaten tauschen ──────────────
    const fsApiUrl     = process.env.FRAMESPHERE_API_URL       || 'https://framesphere-backend.vercel.app/api'
    const clientId     = process.env.FRAMESPHERE_CLIENT_ID     || 'sitecontrol'
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

    const email = fsUser.email.toLowerCase()

    // ── 2. Supabase Admin Client ───────────────────────────────────
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ── 3. User per Email suchen (paginiert) ──────────────────────
    let supabaseUserId: string | null = null
    let page = 1

    while (true) {
      const { data: { users }, error: listErr } = await adminClient.auth.admin.listUsers({
        page,
        perPage: 1000,
      })
      if (listErr || !users) break

      const found = users.find(u => u.email?.toLowerCase() === email)
      if (found) {
        supabaseUserId = found.id
        if (!found.user_metadata?.framesphere_id) {
          await adminClient.auth.admin.updateUserById(found.id, {
            user_metadata: {
              ...found.user_metadata,
              framesphere_id: String(fsUser.id),
            },
          })
        }
        break
      }

      if (users.length < 1000) break
      page++
    }

    // ── 4. Neuen User erstellen falls nicht gefunden ───────────────
    if (!supabaseUserId) {
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name:      fsUser.name     || '',
          avatar_url:     fsUser.avatarUrl || '',
          framesphere_id: String(fsUser.id),
        },
      })
      if (createError || !newUser?.user) {
        console.error('[FS-SSO] createUser failed:', createError)
        return NextResponse.redirect(`${appUrl}/login?error=framesphere_server_error`)
      }
      supabaseUserId = newUser.user.id
    }

    // ── 5. Magic Link generieren – wir brauchen nur den hashed_token ─
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type:  'magiclink',
      email,
      options: { redirectTo: appUrl },
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('[FS-SSO] generateLink failed:', linkError)
      return NextResponse.redirect(`${appUrl}/login?error=framesphere_server_error`)
    }

    // ── 6. Token server-seitig einlösen → Session direkt bekommen ──
    const anonClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: otpData, error: otpError } = await anonClient.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type:       'magiclink',
    })

    if (otpError || !otpData?.session) {
      console.error('[FS-SSO] verifyOtp failed:', otpError)
      return NextResponse.redirect(`${appUrl}/login?error=framesphere_server_error`)
    }

    const { access_token, refresh_token } = otpData.session

    // ── 7. Session-Cookies auf den Redirect setzen ─────────────────
    const redirectResponse = NextResponse.redirect(`${appUrl}/sso-welcome`)

    const ssrClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set(name, value, options as Parameters<typeof redirectResponse.cookies.set>[2])
            })
          },
        },
      }
    )

    await ssrClient.auth.setSession({ access_token, refresh_token })

    return redirectResponse

  } catch (err) {
    console.error('[FS-SSO] unexpected error:', err)
    return NextResponse.redirect(`${appUrl}/login?error=framesphere_server_error`)
  }
}

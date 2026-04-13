import { NextResponse, type NextRequest } from 'next/server'

// GET /api/auth/framesphere
// Leitet den User zum FrameSphere Consent Screen weiter
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url)

  const fsUrl      = process.env.FRAMESPHERE_URL       || 'https://frame-sphere.vercel.app'
  const clientId   = process.env.FRAMESPHERE_CLIENT_ID || 'sitecontrol'
  const redirectUri = `${origin}/api/auth/framesphere/callback`

  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri })
  return NextResponse.redirect(`${fsUrl}/sso/authorize?${params}`)
}

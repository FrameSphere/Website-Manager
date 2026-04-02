import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Called with ?session_id=xxx — fetches the Stripe session directly and activates Pro
// Fallback for when the webhook hasn't fired yet
export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id fehlt' }, { status: 400 })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify session belongs to this user
    const metaUserId = session.metadata?.supabase_user_id
    if (metaUserId !== user.id) {
      // Also check via customer_id
      const { data: profile } = await supabaseAdmin
        .from('profiles').select('stripe_customer_id').eq('id', user.id).single()
      if (profile?.stripe_customer_id !== session.customer) {
        return NextResponse.json({ error: 'Session gehört nicht diesem Account' }, { status: 403 })
      }
    }

    if (session.payment_status === 'paid' || session.status === 'complete') {
      await supabaseAdmin.from('profiles').update({
        plan_id: 'pro',
        plan_started_at: new Date().toISOString(),
        plan_ends_at: null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)

      return NextResponse.json({ activated: true, plan: 'pro' })
    }

    return NextResponse.json({ activated: false, status: session.status, payment_status: session.payment_status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

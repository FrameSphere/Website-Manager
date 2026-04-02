import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

// Use service role for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// App Router reads raw body via req.text() natively — no config needed

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  async function getUserId(customerId: string): Promise<string | null> {
    const { data } = await supabaseAdmin
      .from('profiles').select('id').eq('stripe_customer_id', customerId).single()
    return data?.id || null
  }

  async function setProPlan(userId: string) {
    await supabaseAdmin.from('profiles').update({
      plan_id: 'pro',
      plan_started_at: new Date().toISOString(),
      plan_ends_at: null,
      updated_at: new Date().toISOString(),
    }).eq('id', userId)
  }

  async function setFreePlan(userId: string, endsAt?: string) {
    await supabaseAdmin.from('profiles').update({
      plan_id: 'free',
      plan_ends_at: endsAt || null,
      updated_at: new Date().toISOString(),
    }).eq('id', userId)
  }

  switch (event.type) {

    // Trial started or subscription activated
    // Stripe v16: Stripe.CheckoutSession → Stripe.Checkout.Session
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
        || (await getUserId(session.customer as string))
      if (userId) await setProPlan(userId)
      break
    }

    // Subscription renewed successfully
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.billing_reason === 'subscription_cycle') {
        const userId = await getUserId(invoice.customer as string)
        if (userId) await setProPlan(userId)
      }
      break
    }

    // Payment failed
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const userId = await getUserId(invoice.customer as string)
      if (userId) {
        // Keep pro active but set ends_at to now+3 days grace period
        const grace = new Date()
        grace.setDate(grace.getDate() + 3)
        await supabaseAdmin.from('profiles').update({
          plan_ends_at: grace.toISOString(),
        }).eq('id', userId)
      }
      break
    }

    // Subscription cancelled or ended
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = await getUserId(sub.customer as string)
      if (userId) {
        const endsAt = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : undefined
        await setFreePlan(userId, endsAt)
      }
      break
    }

    // Subscription updated (plan change, trial ended, etc.)
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = await getUserId(sub.customer as string)
      if (!userId) break

      if (sub.status === 'active' || sub.status === 'trialing') {
        await setProPlan(userId)
      } else if (sub.status === 'canceled' || sub.status === 'unpaid') {
        const endsAt = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : undefined
        await setFreePlan(userId, endsAt)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

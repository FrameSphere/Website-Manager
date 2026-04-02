import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Polled by the success page to confirm the webhook updated plan_id to 'pro'
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ plan: 'free', confirmed: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_id, plan_started_at')
    .eq('id', user.id)
    .single()

  const isPro = profile?.plan_id === 'pro'
  return NextResponse.json({
    plan: profile?.plan_id ?? 'free',
    confirmed: isPro,
    plan_started_at: profile?.plan_started_at ?? null,
  })
}

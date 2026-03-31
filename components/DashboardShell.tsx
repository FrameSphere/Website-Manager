'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/dashboard',           label: 'Dashboard',   icon: '⊞',  pro: false },
  { href: '/dashboard/sites',     label: 'Websites',    icon: '🌐', pro: false },
  { href: '/dashboard/todos',     label: 'Todos',       icon: '✅',  pro: false },
  { href: '/dashboard/blog',      label: 'Blog',        icon: '📝',  pro: true  },
  { href: '/dashboard/changelog', label: 'Changelog',   icon: '🗂️',  pro: true  },
  { href: '/dashboard/support',   label: 'Support',     icon: '🎫',  pro: true  },
  { href: '/dashboard/analytics', label: 'Analytics',   icon: '📊',  pro: false },
  { href: '/dashboard/pinboard',  label: 'Pinboard',    icon: '📌',  pro: false },
  { href: '/dashboard/settings',  label: 'Einstellungen', icon: '⚙️', pro: false },
]

interface Props {
  user: User
  profile: any
  children: React.ReactNode
}

export default function DashboardShell({ user, profile, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const isPro = profile?.plan_id === 'pro'
  const firstName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .2s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #5b6af6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0 }}>S</div>
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden' }}>SiteControl</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const locked = item.pro && !isPro

            return (
              <Link key={item.href} href={locked ? '/dashboard/upgrade' : item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: sidebarOpen ? '9px 12px' : '9px',
                borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                background: active ? 'rgba(91,106,246,0.12)' : 'transparent',
                border: active ? '1px solid rgba(91,106,246,0.2)' : '1px solid transparent',
                transition: 'background .12s, border-color .12s',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                opacity: locked ? 0.6 : 1,
              }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#7e93fb' : 'var(--text2)', flex: 1, whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                    {item.pro && !isPro && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', flexShrink: 0 }}>PRO</span>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Plan badge + collapse */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {sidebarOpen && !isPro && (
            <Link href="/dashboard/upgrade" style={{
              display: 'block', padding: '10px 12px', borderRadius: 9, marginBottom: 8,
              background: 'linear-gradient(135deg, rgba(91,106,246,0.12), rgba(167,139,250,0.08))',
              border: '1px solid rgba(91,106,246,0.2)', textDecoration: 'none',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#a4bbfd', marginBottom: 2 }}>⭐ Upgrade auf Pro</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>14 Tage kostenlos testen</div>
            </Link>
          )}

          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--bg)', marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#5b6af622', border: '1px solid #5b6af644', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#7e93fb', flexShrink: 0 }}>
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstName}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{isPro ? '⭐ Pro' : 'Free'}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleLogout} style={{
              flex: sidebarOpen ? 1 : 0, padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 11, fontWeight: 600,
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {sidebarOpen ? '← Abmelden' : '←'}
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 12,
              fontFamily: 'inherit',
            }}>
              {sidebarOpen ? '‹' : '›'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {children}
      </main>

    </div>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SiteControl – Website Management Dashboard',
    template: '%s | SiteControl',
  },
  description: 'Das zentrale Dashboard für alle deine Websites. Blog-Management, Analytics, Support-Tickets, Todos und mehr – in einer App.',
  keywords: ['website management', 'dashboard', 'blog management', 'analytics', 'support tickets', 'SaaS'],
  authors: [{ name: 'SiteControl' }],
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://sitecontrol.app',
    title: 'SiteControl – Website Management Dashboard',
    description: 'Das zentrale Dashboard für alle deine Websites.',
    siteName: 'SiteControl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteControl – Website Management Dashboard',
    description: 'Das zentrale Dashboard für alle deine Websites.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}

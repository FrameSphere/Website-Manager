// PUBLIC dynamic sitemap for a site's blog
// GET /api/public/sitemap?site_id=xxx&base_url=https://meinblog.de&langs=de,en

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const siteId  = searchParams.get('site_id')
  const baseUrl = (searchParams.get('base_url') || '').replace(/\/$/, '')
  const langs   = (searchParams.get('langs') || 'de').split(',').map(l => l.trim())

  if (!siteId || !baseUrl) {
    return new Response('site_id und base_url erforderlich', { status: 400 })
  }

  const { data: posts } = await supabase.from('blog_posts')
    .select('id, slug, lang, published_at, created_at, group_id')
    .eq('site_id', siteId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Group posts by group_id for hreflang
  const groups: Record<string, any[]> = {}
  const solo: any[] = []
  for (const p of posts || []) {
    if (p.group_id) {
      if (!groups[p.group_id]) groups[p.group_id] = []
      groups[p.group_id].push(p)
    } else {
      solo.push(p)
    }
  }

  function altLinks(siblings: any[]) {
    const enSib = siblings.find(s => s.lang === 'en')
    const alts = siblings.map(s =>
      `    <xhtml:link rel="alternate" hreflang="${s.lang}" href="${baseUrl}/blog/${s.lang}/${s.slug}"/>`
    ).join('\n')
    const xd = enSib
      ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/blog/en/${enSib.slug}"/>`
      : ''
    return alts + (xd ? '\n' + xd : '')
  }

  function postEntry(p: any, siblings: any[]) {
    const lastmod = (p.published_at || p.created_at || '').slice(0, 10)
    return `  <url>
    <loc>${baseUrl}/blog/${p.lang}/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
${altLinks(siblings)}
  </url>`
  }

  const blogUrls = [
    ...Object.values(groups).flatMap(siblings => siblings.map(p => postEntry(p, siblings))),
    ...solo.map(p => postEntry(p, [p])),
  ].join('\n')

  // Lang homepages
  const langAlts = langs.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${baseUrl}/${l}/"/>`).join('\n')
  const homeEntries = langs.map(l => `  <url>
    <loc>${baseUrl}/${l}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
${langAlts}
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${homeEntries}
  <url>
    <loc>${baseUrl}/blog/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${blogUrls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

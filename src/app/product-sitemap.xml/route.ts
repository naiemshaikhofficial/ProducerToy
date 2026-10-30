import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { cleanDescriptionText } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache dynamically for 1 hour

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Dedicated Product XML Sitemap (/product-sitemap.xml)
 * Conforms to Google Sitemaps XML protocol (xmlns:image="http://www.google.com/schemas/sitemap-image/1.1").
 * Provides high-priority direct crawling of all active products, high-resolution artwork,
 * lastmod timestamps, and SEO metadata without mixing with high-volume news items.
 */
export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      : 'https://producertoy.com'

  try {
    const supabase = getAdminClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, cover_image, updated_at, created_at, short_description, full_description, product_type, brands ( name )')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[Product Sitemap Database Error]:', error)
      return new NextResponse('Error generating product sitemap', { status: 500 })
    }

    const xmlItems = (products || [])
      .map((p: any) => {
        const productUrl = `${baseUrl}/product/${encodeURIComponent(p.slug)}`
        const lastMod = new Date(p.updated_at || p.created_at || Date.now()).toISOString()
        const title = escapeXml(p.name)
        const brandName = p.brands?.name || 'Producer Toy'
        const cleanDesc = escapeXml(cleanDescriptionText(p.short_description || p.full_description || `${p.name} by ${brandName}`))

        let coverImg = p.cover_image && !p.cover_image.includes('placeholder')
          ? escapeXml(p.cover_image)
          : null

        return `  <url>
    <loc>${escapeXml(productUrl)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
${coverImg ? `    <image:image>
      <image:loc>${coverImg}</image:loc>
      <image:title>${title} by ${escapeXml(brandName)}</image:title>
      <image:caption>${cleanDesc}</image:caption>
    </image:image>` : ''}
  </url>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlItems}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (err: any) {
    console.error('[Product Sitemap Unexpected Error]:', err)
    return new NextResponse('Error generating product sitemap', { status: 500 })
  }
}

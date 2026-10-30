import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { cleanDescriptionText } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

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
 * Official Google Merchant Center RSS 2.0 Product Feed (/google-shopping.xml)
 * Conforms to Google Merchant Center specification (xmlns:g="http://base.google.com/ns/1.0").
 * Enables instant synchronization with Google Shopping, Free Product Listings,
 * and high-intent Google Search Product carousels.
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
      .select('id, name, slug, price_usd, cover_image, short_description, full_description, product_type, brands ( name )')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Google Merchant Feed Error]:', error)
      return new NextResponse('Error generating Google Merchant feed', { status: 500 })
    }

    const itemsXml = (products || [])
      .map((p: any) => {
        const productUrl = `${baseUrl}/product/${encodeURIComponent(p.slug)}`
        const title = escapeXml(p.name)
        const brandName = p.brands?.name || 'Producer Toy'
        const rawDesc = cleanDescriptionText(p.short_description || p.full_description) || `${p.name} - Studio-grade audio plugin by ${brandName}`
        const description = escapeXml(rawDesc)
        const numericPrice = Number(p.price_usd) || 0
        const formattedPrice = `${numericPrice.toFixed(2)} USD`
        const imageLink = p.cover_image && !p.cover_image.includes('placeholder')
          ? escapeXml(p.cover_image)
          : `${baseUrl}/Icon.png`
        const productType = escapeXml(p.product_type || 'Audio Software > VST Plugins')

        return `    <item>
      <g:id>${escapeXml(p.id || p.slug)}</g:id>
      <g:title>${title} by ${escapeXml(brandName)}</g:title>
      <g:description>${description}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${formattedPrice}</g:price>
      <g:brand>${escapeXml(brandName)}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${productType}</g:product_type>
      <g:google_product_category>Software &gt; Digital Audio Workstation Software</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Producer Toy Store - Audio Software &amp; Plugins</title>
    <link>${baseUrl}</link>
    <description>Official Google Merchant Center Product Feed for Producer Toy audio plugins, sound packs, and music production software.</description>
${itemsXml}
  </channel>
</rss>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (err: any) {
    console.error('[Google Merchant Feed Unexpected Error]:', err)
    return new NextResponse('Error generating Google Merchant feed', { status: 500 })
  }
}

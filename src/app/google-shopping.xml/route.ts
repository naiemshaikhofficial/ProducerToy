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
 * 100% Dynamic - binds every product's real DB genres, subcategories, DAWs, OS, MPN, and licensing.
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
      .select('id, name, slug, price_usd, original_price_usd, cover_image, short_description, full_description, product_type, vst_format, supported_daws, operating_system, category_slugs, plugin_identifier, is_coming_soon, release_date, brands ( name ), subcategories ( name, slug )')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Google Merchant Feed Error]:', error)
      return new NextResponse('Error generating Google Merchant feed', { status: 500 })
    }

    const itemsXml = (products || [])
      .map((p: any) => {
        const productUrl = `${baseUrl}/product/${encodeURIComponent(p.slug)}`
        const cleanName = (p.name || '')
          .replace(/[\u2010-\u2015\u2212]/g, '-')
          .replace(/Autotune-style\s+Autotune-Style/gi, 'Auto-Tune Style')
          .replace(/\s+/g, ' ')
          .trim()
        const brandName = p.brands?.name || 'Producer Toy'
        const subCat = (p.subcategories as any)?.name || (Array.isArray(p.category_slugs) && p.category_slugs[0]) || ''
        const rawDesc = cleanDescriptionText(p.short_description || p.full_description) || `${cleanName} - Studio-grade audio plugin by ${brandName}`
        const topDaws = p.supported_daws ? p.supported_daws.split(',').slice(0, 3).map((d: string) => d.trim()).join(', ') : 'FL Studio, Ableton Live, Logic Pro'
        const osInfo = p.operating_system || 'macOS (Apple Silicon & Intel), Windows 10/11'
        const richDesc = escapeXml(`${rawDesc} Tested for ${topDaws}. Formats: ${p.vst_format || 'VST3, AU, AAX'}. Works on ${osInfo}. 100% royalty-free.`)

        const numericPrice = Number(p.price_usd) || 0
        const formattedPrice = `${numericPrice.toFixed(2)} USD`
        const imageLink = p.cover_image && !p.cover_image.includes('placeholder')
          ? escapeXml(p.cover_image)
          : `${baseUrl}/Icon.png`

        const breadcrumbType = escapeXml(
          `Audio Software > ${p.product_type === 'sample_pack' || p.product_type === 'sample-pack' ? 'Sample Packs' : 'VST Plugins'}${subCat ? ` > ${subCat}` : ''}`
        )
        const mpn = escapeXml(p.plugin_identifier || p.slug)
        const isPreorder = Boolean(p.is_coming_soon)
        const availability = isPreorder ? 'preorder' : 'in_stock'

        let availabilityDateXml = ''
        if (isPreorder) {
          let dateObj: Date
          if (p.release_date) {
            dateObj = new Date(p.release_date)
            if (isNaN(dateObj.getTime()) || dateObj.getTime() <= Date.now()) {
              dateObj = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
          } else {
            dateObj = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          }
          availabilityDateXml = `\n      <g:availability_date>${dateObj.toISOString()}</g:availability_date>`
        }

        return `    <item>
      <g:id>${escapeXml(p.id || p.slug)}</g:id>
      <g:title>${escapeXml(cleanName)} by ${escapeXml(brandName)}</g:title>
      <g:description>${richDesc}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:availability>${availability}</g:availability>${availabilityDateXml}
      <g:price>${formattedPrice}</g:price>
      <g:brand>${escapeXml(brandName)}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${breadcrumbType}</g:product_type>
      <g:google_product_category>Software &gt; Digital Audio Workstation Software</g:google_product_category>
      <g:mpn>${mpn}</g:mpn>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Digital Download</g:service>
        <g:price>0.00 USD</g:price>
        <g:min_handling_time>0</g:min_handling_time>
        <g:max_handling_time>0</g:max_handling_time>
        <g:min_transit_time>0</g:min_transit_time>
        <g:max_transit_time>0</g:max_transit_time>
      </g:shipping>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Digital Download</g:service>
        <g:price>0.00 USD</g:price>
        <g:min_handling_time>0</g:min_handling_time>
        <g:max_handling_time>0</g:max_handling_time>
        <g:min_transit_time>0</g:min_transit_time>
        <g:max_transit_time>0</g:max_transit_time>
      </g:shipping>
      <g:shipping>
        <g:country>GB</g:country>
        <g:service>Digital Download</g:service>
        <g:price>0.00 USD</g:price>
        <g:min_handling_time>0</g:min_handling_time>
        <g:max_handling_time>0</g:max_handling_time>
        <g:min_transit_time>0</g:min_transit_time>
        <g:max_transit_time>0</g:max_transit_time>
      </g:shipping>
      <g:shipping>
        <g:country>CA</g:country>
        <g:service>Digital Download</g:service>
        <g:price>0.00 USD</g:price>
        <g:min_handling_time>0</g:min_handling_time>
        <g:max_handling_time>0</g:max_handling_time>
        <g:min_transit_time>0</g:min_transit_time>
        <g:max_transit_time>0</g:max_transit_time>
      </g:shipping>
      <g:shipping>
        <g:country>AU</g:country>
        <g:service>Digital Download</g:service>
        <g:price>0.00 USD</g:price>
        <g:min_handling_time>0</g:min_handling_time>
        <g:max_handling_time>0</g:max_handling_time>
        <g:min_transit_time>0</g:min_transit_time>
        <g:max_transit_time>0</g:max_transit_time>
      </g:shipping>
      <g:shipping_weight>0 kg</g:shipping_weight>
      <g:custom_label_0>${escapeXml(subCat || 'Audio Plugins')}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(topDaws)}</g:custom_label_1>
      <g:custom_label_2>${escapeXml(osInfo)}</g:custom_label_2>
      <g:custom_label_3>${numericPrice === 0 ? 'Free Download' : 'Perpetual Commercial License'}</g:custom_label_3>
      <g:custom_label_4>${escapeXml(p.vst_format || 'VST3, AU, AAX')}</g:custom_label_4>
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

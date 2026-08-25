import React, { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { EpicProductDetailClient } from './EpicProductDetailClient'
import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import { ProductJsonLd } from '@/components/JsonLd'
import { generatePageMetadata, generateSmartKeywords } from '@/lib/seo/metadata'

export const revalidate = 3600 // Cache static page for 1 hour (revalidate via /api/revalidate)

// React cache wrapper: Ensures Database is queried EXACTLY ONCE per request instead of twice!
const getCachedProduct = cache(async (slug: string) => {
  const cleanSlug = decodeURIComponent(slug).trim()
  const supabase = getAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name, slug), subcategories!subcategory_id(name, slug), brands!brand_id(name, slug, logo_url)')
    .eq('slug', cleanSlug.toLowerCase())
    .eq('is_active', true)
    .maybeSingle()

  return product
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getCachedProduct(slug)

  if (!product) {
    return {
      title: 'Product Not Found | Producer Toy Store',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://producertoy.com'
  const brandName = product.brands?.name || product.brand || 'Producer Toy'
  const isFree = product.price_usd === 0
  const productType = product.product_type || 'VST Plugin'
  const priceDisplay = isFree ? 'Free Download' : `$${product.price_usd}`

  const pageTitle = `${product.name} by ${brandName} - ${priceDisplay} ${productType}`
  const pageDescription = product.short_description || product.description
    ? `${product.name} by ${brandName}. ${product.short_description || product.description}. Instant direct download for FL Studio, Ableton Live, Logic Pro, Cubase & Pro Tools.`
    : `Download ${product.name} by ${brandName} on Producer Toy Store. High-quality ${productType} for music producers.`

  const smartKeywords = generateSmartKeywords(product.name, `${productType} ${brandName}`)
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(product.name)}&brand=${encodeURIComponent(brandName)}&price=${isFree ? 'FREE' : product.price_usd}&type=${encodeURIComponent(productType)}`

  return generatePageMetadata({
    title: pageTitle,
    description: pageDescription,
    image: ogImageUrl,
    keywords: smartKeywords,
    path: `/product/${product.slug}`,
  })
}

export default async function EpicProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getCachedProduct(slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 py-4 space-y-4 text-white min-h-screen">
      <ProductJsonLd
        name={product.name}
        description={product.short_description || product.description}
        image={product.cover_image}
        brandName={product.brands?.name || product.brand || 'Producer Toy'}
        priceUsd={product.price_usd || 0}
        isFree={product.price_usd === 0}
        url={`https://producertoy.com/product/${product.slug}`}
        categoryName={product.product_type || 'VST Plugin'}
        vstFormat={product.vst_format || 'VST3, AU, AAX'}
      />
      {/* Main Epic Games Product Detail Client View */}
      <EpicProductDetailClient product={product} />
    </div>
  )
}

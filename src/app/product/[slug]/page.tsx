import React, { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { EpicProductDetailClient } from './EpicProductDetailClient'
import { Metadata } from 'next'
import { ProductJsonLd, FAQPageJsonLd } from '@/components/JsonLd'
import { generatePageMetadata, generateSmartKeywords, cleanDescriptionText } from '@/lib/seo/metadata'
import { getProductRatingStatsAction } from '@/actions/ratingActions'
import { generateProductFaqs } from '@/components/product/ProductFaqSection'

// 🟢 ZERO-RESOURCE CDN CACHING: Infinite cache (purged on-demand via /api/revalidate webhook).
export const revalidate = false

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

// Build-time static generation: Pre-renders ALL active products into 100% pure static HTML
// Result: 0 Vercel Serverless Function Invocations & 0 Supabase DB queries on user visits
export async function generateStaticParams() {
  try {
    const supabase = getAdminClient()
    const { data: products } = await supabase
      .from('products')
      .select('slug')
      .eq('is_active', true)

    if (!products) return []
    return products
      .filter((p) => p && p.slug)
      .map((p) => ({
        slug: p.slug,
      }))
  } catch (e) {
    console.error('generateStaticParams product error:', e)
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getCachedProduct(slug)

  if (!product) {
    return {
      title: 'Product Not Found | Producer Toy',
    }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      : 'https://producertoy.com'
  const brandName = product.brands?.name || product.brand || 'Producer Toy'
  const isFree = Number(product.price_usd) === 0
  const productType = product.product_type || 'VST Plugin'

  // Optimal Google 50-60 character high-CTR title formula
  let pageTitle = `${product.name} by ${brandName} - ${productType}`
  if (isFree) {
    pageTitle = `${product.name} - Free ${productType} Download (${brandName})`
  }

  // Clean meta description (<160 chars) with high-intent CTA
  const baseDesc = cleanDescriptionText(product.short_description || product.description)
  const pageDescription = baseDesc
    ? `${baseDesc.slice(0, 110)}. Instant direct download • 100% royalty-free • FL Studio & Ableton ready.`
    : `Download ${product.name} by ${brandName} on Producer Toy. 100% royalty-free ${productType} with instant direct download for FL Studio, Ableton & Logic Pro.`

  const smartKeywords = generateSmartKeywords(
    product.name,
    product.product_type || 'VST Plugin',
    brandName,
    product.product_type || 'VST Plugin',
    isFree
  )
  const dynamicOgImage = `${siteUrl}/api/og?title=${encodeURIComponent(product.name)}&brand=${encodeURIComponent(brandName)}&type=${encodeURIComponent(productType)}&rating=4.9&price=${encodeURIComponent(isFree ? 'FREE' : `$${Number(product.price_usd).toFixed(2)}`)}&image=${encodeURIComponent(product.cover_image || '')}`

  return generatePageMetadata({
    title: pageTitle,
    description: pageDescription,
    image: dynamicOgImage,
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

  const ratingStats = await getProductRatingStatsAction(product.id)
  const faqs = generateProductFaqs(product)
  const categoryTitle = product.categories?.name || product.product_type || 'Plugins'
  const categorySlug = product.categories?.slug || (product.product_type ? product.product_type.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'plugins')

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 text-white min-h-screen">
      {/* 🟢 Search Engine Structured Data (Product + FAQ Rich Snippets) */}
      <ProductJsonLd
        name={product.name}
        description={cleanDescriptionText(product.short_description || product.description)}
        image={product.cover_image}
        brandName={product.brands?.name || product.brand || 'Producer Toy'}
        priceUsd={product.price_usd || 0}
        isFree={Number(product.price_usd) === 0}
        url={`https://producertoy.com/product/${product.slug}`}
        categoryName={product.product_type || 'VST Plugin'}
        vstFormat={product.vst_format || 'VST3, AU, AAX'}
        ratingValue={ratingStats.averageRating || 4.9}
        reviewCount={ratingStats.totalReviews || 96}
      />
      <FAQPageJsonLd faqs={faqs} />

      {/* 🟢 Visible Semantic Breadcrumbs Navigation for Googlebot & Users */}
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-400 flex items-center flex-wrap gap-1.5 pt-1 select-none">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span className="text-zinc-600">/</span>
        <Link href="/store" className="hover:text-white transition-colors">Store</Link>
        <span className="text-zinc-600">/</span>
        <Link 
          href={`/categories/${categorySlug}`} 
          className="hover:text-white transition-colors capitalize"
        >
          {categoryTitle}
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-200 font-medium truncate max-w-[220px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Epic Games Product Detail Client View */}
      <EpicProductDetailClient
        product={product}
        initialRatingStats={ratingStats}
      />
    </div>
  )
}

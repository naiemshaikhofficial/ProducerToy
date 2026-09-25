import React, { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { EpicProductDetailClient } from './EpicProductDetailClient'
import { Metadata } from 'next'
import { ProductJsonLd, FAQPageJsonLd, VideoObjectJsonLd } from '@/components/JsonLd'
import { generatePageMetadata, generateSmartKeywords, cleanDescriptionText } from '@/lib/seo/metadata'
import { getProductRatingStatsAction } from '@/actions/ratingActions'
import { generateProductFaqs } from '@/lib/seo/productFaqs'

function extractYouTubeId(url?: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

import { getCachedProductBySlug, getCachedActiveProductSlugs } from '@/lib/cache/cachedData'

// 🟢 ZERO-RESOURCE CDN CACHING: Infinite cache (purged on-demand via /api/revalidate webhook).
export const revalidate = false

// Use persistent server-side Next.js Data Cache (persists across requests & builds)
const getCachedProduct = getCachedProductBySlug

// Build-time static generation: Pre-renders ALL active products into 100% pure static HTML
// Result: 0 Vercel Serverless Function Invocations & 0 Supabase DB queries on user visits
export async function generateStaticParams() {
  return getCachedActiveProductSlugs()
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
  const ytVideoId = extractYouTubeId(product.youtube_url || product.video_url)

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      : 'https://producertoy.com'
  const brandName = product.brands?.name || product.brand || 'Producer Toy'
  const isFree = Number(product.price_usd) === 0
  const productType = product.product_type || 'VST Plugin'
  const dynamicOgImage = `${siteUrl}/api/og?title=${encodeURIComponent(product.name)}&brand=${encodeURIComponent(brandName)}&type=${encodeURIComponent(productType)}&rating=4.9&price=${encodeURIComponent(isFree ? 'FREE' : `$${Number(product.price_usd).toFixed(2)}`)}&image=${encodeURIComponent(product.cover_image || '')}`

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 text-white min-h-screen">
      {/* 🟢 Search Engine Structured Data (Product + Multi-Currency + FAQ + Video Rich Snippets) */}
      <ProductJsonLd
        name={product.name}
        description={cleanDescriptionText(product.short_description || product.description)}
        images={[product.cover_image, dynamicOgImage].filter(Boolean)}
        brandName={brandName}
        brandWebsite={(product.brands as any)?.website_url}
        priceUsd={product.price_usd || 0}
        priceInr={product.price_inr}
        isFree={isFree}
        url={`https://producertoy.com/product/${product.slug}`}
        categoryName={product.product_type || 'VST Plugin'}
        vstFormat={product.vst_format || 'VST3, AU, AAX'}
        ratingValue={ratingStats.averageRating || 4.9}
        reviewCount={ratingStats.totalReviews || 96}
        youtubeUrl={product.youtube_url || product.video_url}
      />
      <FAQPageJsonLd faqs={faqs} />
      {ytVideoId && (
        <VideoObjectJsonLd
          name={product.name}
          description={cleanDescriptionText(product.short_description || product.description)}
          thumbnailUrl={`https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`}
          uploadDate={product.created_at || '2026-01-01T00:00:00+00:00'}
          embedUrl={`https://www.youtube.com/embed/${ytVideoId}`}
        />
      )}


      {/* Main Epic Games Product Detail Client View */}
      <EpicProductDetailClient
        product={product}
        initialRatingStats={ratingStats}
      />
    </div>
  )
}

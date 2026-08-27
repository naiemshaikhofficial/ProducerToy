import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminClient } from '@/lib/supabase/admin'
import { ProductCard, Product } from '@/components/ProductCard'
import { generatePageMetadata, generateSmartKeywords } from '@/lib/seo/metadata'
import { CollectionPageJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { LocalDataCache } from '@/components/LocalDataCache'
import { ArrowLeft, Building2, ExternalLink, Handshake, Sparkles, CheckCircle2, SlidersHorizontal } from 'lucide-react'

export const revalidate = 3600 // Cache brand pages for 1 hour with on-demand ISR

interface BrandPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    free?: string
    deals?: string
    sort?: string
  }>
}

export async function generateStaticParams() {
  try {
    const supabase = getAdminClient()
    const { data: brands } = await supabase
      .from('brands')
      .select('slug')

    if (!brands) return []
    return brands
      .filter((b) => b && b.slug)
      .map((b) => ({
        slug: b.slug,
      }))
  } catch (err) {
    console.error('Error in brand generateStaticParams:', err)
    return []
  }
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase()
  const supabase = getAdminClient()

  const { data: brand } = await supabase
    .from('brands')
    .select('id, name, slug, description, logo_url')
    .eq('slug', cleanSlug)
    .maybeSingle()

  if (!brand) {
    return {
      title: 'Brand Not Found | Producer Toy Store',
    }
  }

  const title = `${brand.name} VST Plugins, Samples & Audio Software — Producer Toy`
  const description =
    brand.description ||
    `Browse official ${brand.name} audio plugins, virtual instruments, synth presets, and sample packs on Producer Toy Store. Fast instant digital download.`

  return generatePageMetadata({
    title,
    description,
    path: `/manufacturers/${brand.slug}`,
    keywords: generateSmartKeywords(brand.name, 'audio plugin developer brand manufacturer'),
  })
}

export default async function BrandShowcasePage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params
  const { free: freeParam, deals: dealsParam, sort: sortParam } = await searchParams

  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase()
  const supabase = getAdminClient()

  // 1. Fetch Brand Info and All Active Products for this brand in parallel
  const [brandRes, productsRes, otherBrandsRes] = await Promise.all([
    supabase
      .from('brands')
      .select('id, name, slug, logo_url, description, website_url')
      .eq('slug', cleanSlug)
      .maybeSingle(),
    supabase
      .from('products')
      .select('*, categories(slug, name), subcategories(slug, name), brands!brand_id(id, name, slug, logo_url)')
      .eq('is_active', true),
    supabase
      .from('brands')
      .select('id, name, slug, logo_url')
      .neq('slug', cleanSlug)
      .limit(8),
  ])

  const brand = brandRes.data
  if (!brand) {
    notFound()
  }

  const allProducts = (productsRes.data || []) as Product[]
  
  // Filter products by this brand (either by brand_id or brand name / slug)
  let brandProducts = allProducts.filter((p) => {
    const pBrandSlug = p.brands?.slug?.toLowerCase() || p.brand?.toLowerCase()
    const pBrandId = (p as any).brand_id
    return pBrandSlug === cleanSlug || pBrandId === brand.id || p.brand?.toLowerCase() === brand.name.toLowerCase()
  })

  const isFree = freeParam === 'true'
  const isDeals = dealsParam === 'true'

  if (isFree) {
    brandProducts = brandProducts.filter((p) => (p.price_usd ?? 0) === 0)
  }
  if (isDeals) {
    brandProducts = brandProducts.filter((p) => (p.original_price_usd ?? 0) > 0)
  }

  if (sortParam === 'price-low') {
    brandProducts.sort((a, b) => (a.price_usd || 0) - (b.price_usd || 0))
  } else if (sortParam === 'price-high') {
    brandProducts.sort((a, b) => (b.price_usd || 0) - (a.price_usd || 0))
  }

  const otherBrands = otherBrandsRes.data || []
  const baseUrl = `/manufacturers/${brand.slug}`

  return (
    <main className="min-h-screen bg-[#121212] text-white py-8 px-4 sm:px-6 lg:px-8 font-sans select-none pb-24">
      {/* Schema Structured Data */}
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', url: 'https://producertoy.com' },
          { name: 'Manufacturers', url: 'https://producertoy.com/manufacturers' },
          { name: brand.name, url: `https://producertoy.com/manufacturers/${brand.slug}` },
        ]}
      />

      <CollectionPageJsonLd
        title={`${brand.name} Audio Software & Plugins — Producer Toy`}
        description={brand.description || `Browse official ${brand.name} products.`}
        url={`https://producertoy.com/manufacturers/${brand.slug}`}
        items={brandProducts.map((p) => ({
          name: p.name,
          url: `https://producertoy.com/product/${p.slug}`,
          price: p.price_usd,
          image: p.cover_image,
        }))}
      />

      <div className="max-w-[1240px] mx-auto space-y-10">
        
        {/* Navigation Breadcrumb & Back Link */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <Link
            href="/manufacturers"
            prefetch={true}
            className="inline-flex items-center gap-1.5 hover:text-white font-bold transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Manufacturers</span>
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">{brand.name}</span>
        </div>

        {/* ========================================================================= */}
        {/* BRAND HERO HEADER                                                         */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1c1c1c] to-[#141414] border border-zinc-800/80 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8">
            
            {/* Brand Logo Card */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[#202020] border border-zinc-700/80 flex items-center justify-center p-4 shadow-xl flex-shrink-0">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={`${brand.name} logo`}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-zinc-400">
                  <Building2 className="w-8 h-8 text-[#FA742B]" />
                  <span className="text-xs font-black uppercase">{brand.name.slice(0, 3)}</span>
                </div>
              )}
            </div>

            {/* Brand Meta & Info */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#2a170d] text-[#FA742B] border border-[#542813]">
                  <CheckCircle2 size={13} />
                  Official Audio Developer
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold text-zinc-400 bg-[#222222] border border-zinc-800">
                  {brandProducts.length} {brandProducts.length === 1 ? 'Product' : 'Products Available'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {brand.name}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
                {brand.description ||
                  `Explore ${brand.name}'s sound kits, virtual instruments, and audio plugins on Producer Toy. Download with 100% royalty-free commercial clearance.`}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
              <Link
                href={`/store?brand=${brand.slug}`}
                prefetch={true}
                className="bg-[#FA742B] hover:bg-[#E05800] text-white text-xs font-black px-6 py-3 rounded-xl uppercase tracking-wider text-center transition-all shadow-lg inline-flex items-center justify-center gap-2"
              >
                <span>Filter in Store</span>
                <ExternalLink size={14} />
              </Link>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* BRAND CATALOG & FILTER TABS                                               */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={baseUrl}
                prefetch={true}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  !isFree && !isDeals
                    ? 'bg-[#2b2b2b] text-white border border-zinc-600 shadow-md'
                    : 'bg-[#1a1a1a] text-zinc-400 hover:text-white hover:bg-[#242424] border border-zinc-800'
                }`}
              >
                All Products ({brandProducts.length})
              </Link>

              <Link
                href={`${baseUrl}?free=true`}
                prefetch={true}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isFree
                    ? 'bg-[#2b2b2b] text-white border border-zinc-600 shadow-md'
                    : 'bg-[#1a1a1a] text-zinc-400 hover:text-white hover:bg-[#242424] border border-zinc-800'
                }`}
              >
                Free Downloads
              </Link>

              <Link
                href={`${baseUrl}?deals=true`}
                prefetch={true}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isDeals
                    ? 'bg-[#2b2b2b] text-white border border-zinc-600 shadow-md'
                    : 'bg-[#1a1a1a] text-zinc-400 hover:text-white hover:bg-[#242424] border border-zinc-800'
                }`}
              >
                Special Deals
              </Link>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Sort by:</span>
              <Link
                href={`${baseUrl}?sort=price-low`}
                prefetch={true}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  sortParam === 'price-low' ? 'bg-white text-black border-white' : 'bg-[#181818] border-zinc-800 hover:text-white'
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`${baseUrl}?sort=price-high`}
                prefetch={true}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  sortParam === 'price-high' ? 'bg-white text-black border-white' : 'bg-[#181818] border-zinc-800 hover:text-white'
                }`}
              >
                Price: High to Low
              </Link>
            </div>

          </div>

          {/* Products Grid or Partnering In Progress Banner */}
          {brandProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-10">
              {brandProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 rounded-3xl bg-[#161616] border border-[#262626] max-w-3xl mx-auto shadow-2xl space-y-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-[#202020] border border-[#2a2a2a] text-[#FA742B] flex items-center justify-center mx-auto shadow-inner">
                <Handshake className="w-8 h-8" />
              </div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                Partnering in Progress
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                We are tying up with {brand.name}!
              </h2>
              <p className="text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
                We are actively tying up with {brand.name} to bring their complete catalog of VST plugins, sample packs, and sound expansions to Producer Toy Store. Stay tuned!
              </p>
              <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href="/manufacturers"
                  prefetch={true}
                  className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3 px-6 rounded-xl uppercase transition-all shadow-lg"
                >
                  Explore All 300+ Manufacturers
                </Link>
                <Link
                  href="/store"
                  prefetch={true}
                  className="bg-[#202020] hover:bg-[#282828] text-white font-extrabold text-xs py-3 px-6 rounded-xl border border-[#303030] uppercase transition-all"
                >
                  Browse Available Store Catalog
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* OTHER POPULAR AUDIO MANUFACTURERS                                         */}
        {/* ========================================================================= */}
        {otherBrands.length > 0 && (
          <section className="pt-10 border-t border-zinc-800/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Explore More Audio Developers</h2>
                <p className="text-xs text-zinc-400">Discover sound designers and plugin creators worldwide</p>
              </div>
              <Link
                href="/manufacturers"
                prefetch={true}
                className="text-xs font-bold text-[#FA742B] hover:underline uppercase tracking-wider"
              >
                View All Developers &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {otherBrands.map((b) => (
                <Link
                  key={b.id}
                  href={`/manufacturers/${b.slug}`}
                  prefetch={true}
                  className="bg-[#161616] hover:bg-[#202020] border border-zinc-800 rounded-xl p-3.5 flex flex-col items-center justify-center text-center transition-all group"
                >
                  <div className="w-10 h-10 flex items-center justify-center mb-2">
                    {b.logo_url ? (
                      <img
                        src={b.logo_url}
                        alt={b.name}
                        className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white truncate w-full">
                    {b.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      <LocalDataCache data={{ products: brandProducts }} />
    </main>
  )
}

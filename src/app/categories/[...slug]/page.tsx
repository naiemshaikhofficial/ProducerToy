import React from 'react'
import { getAdminClient } from '@/lib/supabase/admin'
import { ProductCard, Product } from '@/components/ProductCard'
import Link from 'next/link'
import { Metadata } from 'next'
import { CategoryFilterBar } from '@/components/CategoryFilterBar'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<{
    q?: string
    sort?: string
    free?: string
    deals?: string
    bundles?: string
    rent_to_own?: string
    brand?: string
    price?: string
    cat?: string
  }>
}

const CATEGORY_META_MAP: Record<string, { title: string; productType?: string; description: string }> = {
  'effects': {
    title: 'Effects',
    productType: 'plugin',
    description: 'Explore premier audio effect plugins including reverbs, delays, compressors, saturators, and EQ processors.'
  },
  'studio-tools': {
    title: 'Studio Tools',
    productType: 'template',
    description: 'Utility plugins, DAW project templates, analysis tools, and studio helpers to streamline your production.'
  },
  'instruments': {
    title: 'Instruments',
    productType: 'plugin',
    description: 'Virtual synthesizers, sampled instruments, drum machines, and polyphonic sound engines.'
  },
  'sounds': {
    title: 'Sounds & Samples',
    productType: 'sample_pack',
    description: 'Royalty-free sample packs, 808 sub basses, drum kits, melody loops, and vocal stems.'
  },
  'sample-packs': {
    title: 'Sample Packs',
    productType: 'sample_pack',
    description: 'Royalty-free sample packs, 808 sub basses, drum kits, melody loops, and vocal stems.'
  },
  'presets': {
    title: 'Synth Presets',
    productType: 'preset',
    description: 'Xfer Serum, Vital, and Kontakt preset banks for modern electronic and hip-hop producers.'
  },
  'bundles': {
    title: 'Bundles & Collections',
    description: 'Save big with complete product bundles, software suites, and producer collections.'
  }
}

function expandCategoryVariants(rawCats: string[]): string[] {
  const set = new Set<string>()
  rawCats.forEach(raw => {
    if (!raw) return
    const s = raw.trim()
    set.add(s)
    const lower = s.toLowerCase()
    set.add(lower)

    const withSpace = lower.replace(/[-_]+/g, ' ')
    set.add(withSpace)

    const withHyphen = lower.replace(/[\s_]+/g, '-')
    set.add(withHyphen)

    const withUnderscore = lower.replace(/[\s-]+/g, '_')
    set.add(withUnderscore)

    const titleCaseSpace = withSpace.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    set.add(titleCaseSpace)

    const titleCaseHyphen = withHyphen.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    set.add(titleCaseHyphen)

    set.add(withSpace.toUpperCase())
    set.add(withHyphen.toUpperCase())
  })
  return Array.from(set)
}

// Clean helper to convert "2-Effects" or "3-Studio-Tools" to "effects" or "studio-tools"
function parseCategorySlug(rawSlug: string): string {
  if (!rawSlug) return 'all'
  return rawSlug.replace(/^\d+-/, '').toLowerCase()
}

// Capitalize title nicely (e.g. "studio-tools" -> "Studio Tools")
function formatTitle(slug: string): string {
  const meta = CATEGORY_META_MAP[slug]
  if (meta) return meta.title

  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const rawSlug = slug?.[0] || 'all'
  const cleanSlug = parseCategorySlug(rawSlug)
  const title = formatTitle(cleanSlug)
  
  return {
    title: `${title} | Producer Toy Store`,
    description: CATEGORY_META_MAP[cleanSlug]?.description || `Browse top rated ${title} on Producer Toy.`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const {
    q: queryText = '',
    sort: sortOption = 'popularity',
    free: freeParam,
    deals: dealsParam,
    bundles: bundlesParam,
    rent_to_own: rentParam,
    brand: brandParam,
    price: priceParam,
    cat: catParam
  } = await searchParams

  const rawCategorySlug = slug?.[0] || ''
  const cleanCategorySlug = parseCategorySlug(rawCategorySlug)
  
  const isFree = freeParam === 'true'
  const isDeals = dealsParam === 'true'
  const isBundles = bundlesParam === 'true' || cleanCategorySlug === 'bundles'
  const isRentToOwn = rentParam === 'true'

  let products: Product[] = []
  let categoriesOptions: Array<{ id: string; name: string; slug: string }> = []
  let brandsOptions: Array<{ id: string; name: string; slug: string }> = []
  let isFromDatabase = false

  try {
    const supabase = getAdminClient()

    // Fast parallel metadata fetching
    const [dbCatRes, dbSubRes, dbBrandRes] = await Promise.all([
      supabase.from('categories').select('id, name, slug'),
      supabase.from('subcategories').select('id, name, slug'),
      supabase.from('brands').select('id, name, slug').order('name')
    ])

    const dbCatData = dbCatRes.data || []
    const dbSubData = dbSubRes.data || []
    const dbBrandData = dbBrandRes.data || []

    const combinedCategories: Array<{ id: string; name: string; slug: string }> = [
      { id: 'reverb', name: 'Reverb', slug: 'reverb' },
      { id: 'delay', name: 'Delay & Echo', slug: 'delay' },
      { id: 'compressor', name: 'Compressor', slug: 'compressor' },
      { id: 'saturation', name: 'Saturation & Warmth', slug: 'saturation' },
      { id: 'eq', name: 'Equalizer (EQ)', slug: 'eq' },
      { id: 'distortion', name: 'Distortion & Overdrive', slug: 'distortion' },
      { id: 'modulation', name: 'Chorus & Modulation', slug: 'modulation' },
      { id: 'synth', name: 'Synthesizer VST', slug: 'synth' },
      { id: 'vocal', name: 'Vocal Processor', slug: 'vocal' },
      { id: '808', name: '808 & Bass', slug: '808' },
      { id: 'drum-kit', name: 'Drum Kit & Loops', slug: 'drum-kit' },
    ]

    dbCatData.forEach(c => {
      if (!combinedCategories.some(e => e.slug === c.slug)) combinedCategories.push(c)
    })
    dbSubData.forEach(s => {
      if (!combinedCategories.some(e => e.slug === s.slug)) combinedCategories.push(s)
    })

    categoriesOptions = combinedCategories
    brandsOptions = dbBrandData

    let query = supabase
      .from('products')
      .select('*, categories(slug, name), subcategories(slug, name), brands!brand_id(id, name, slug, logo_url)')
      .eq('is_active', true)

    // Main page Category filtering
    const meta = CATEGORY_META_MAP[cleanCategorySlug]
    if (meta?.productType) {
      query = query.eq('product_type', meta.productType)
    } else if (cleanCategorySlug && cleanCategorySlug !== 'all' && cleanCategorySlug !== 'bundles') {
      const catObj = dbCatData.find(c => c.slug.toLowerCase() === cleanCategorySlug.toLowerCase())
      if (catObj) {
        query = query.eq('category_id', catObj.id)
      } else {
        query = query.ilike('name', `%${cleanCategorySlug}%`)
      }
    }

    // MULTI-CATEGORY / MULTI-SUBCATEGORY FILTERING FROM SUPABASE
    if (catParam) {
      const selectedCats = catParam.split(',').map(c => c.trim()).filter(Boolean)
      if (selectedCats.length > 0) {
        const expandedCats = expandCategoryVariants(selectedCats)
        query = query.overlaps('category_slugs', expandedCats)
      }
    }

    // MULTI-BRAND FILTERING FROM SUPABASE
    if (brandParam) {
      const selectedBrands = brandParam.split(',').map(b => b.trim().toLowerCase()).filter(Boolean)
      if (selectedBrands.length > 0) {
        const brandIds = dbBrandData.filter(b => selectedBrands.includes(b.slug.toLowerCase())).map(b => b.id)
        if (brandIds.length > 0) {
          query = query.in('brand_id', brandIds)
        }
      }
    }

    // Filter pills
    if (isFree) {
      query = query.eq('price_usd', 0)
    }
    if (isDeals) {
      query = query.gt('original_price_usd', 0)
    }

    if (queryText) {
      query = query.ilike('name', `%${queryText}%`)
    }

    // Sorting
    if (sortOption === 'price-low') {
      query = query.order('price_usd', { ascending: true })
    } else if (sortOption === 'price-high') {
      query = query.order('price_usd', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (!error && data) {
      products = data as Product[]
      isFromDatabase = true
    }
  } catch (err) {
    console.error('Error querying category products:', err)
  }

  // Fallback mock items including Valhalla Supermassive
  if (!isFromDatabase || products.length === 0) {
    let mockAll: Product[] = [
      {
        id: 'valhalla-supermassive',
        name: 'Valhalla Supermassive',
        slug: 'valhalla-supermassive',
        brand: 'Valhalla DSP',
        brands: { id: 'valhalla', name: 'Valhalla DSP', slug: 'valhalla-dsp' },
        product_type: 'plugin',
        price_usd: 0,
        original_price_usd: 49.99,
        cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
        demo_audio_url: '',
        short_description: 'Lush reverbs, harmonic delays, and space echo clouds in one plugin.',
      },
      {
        id: 'mock-1',
        name: 'Depthcharge Compressor',
        slug: 'depthcharge-compressor',
        brand: '7air Media',
        brands: { id: 'b1', name: '7air Media', slug: '7air-media' },
        product_type: 'plugin',
        price_usd: 0,
        original_price_usd: 29.99,
        cover_image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop',
        demo_audio_url: '',
        short_description: 'Punchy analog compressor VST for drums & master bus.',
      },
      {
        id: 'mock-2',
        name: 'DRX8R Reverb Processor',
        slug: 'drx8r-reverb',
        brand: '7air Media',
        brands: { id: 'b1', name: '7air Media', slug: '7air-media' },
        product_type: 'plugin',
        price_usd: 0,
        original_price_usd: 19.99,
        cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
        demo_audio_url: '',
        short_description: 'Lush studio hall reverb with warm decay.',
      },
      {
        id: 'mock-3',
        name: 'ZA8 Dual Delay',
        slug: 'za8-dual-delay',
        brand: '7air Media',
        brands: { id: 'b1', name: '7air Media', slug: '7air-media' },
        product_type: 'plugin',
        price_usd: 0,
        original_price_usd: 14.99,
        cover_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
        demo_audio_url: '',
        short_description: 'Ping-pong stereo tape delay plugin.',
      },
      {
        id: 'mock-4',
        name: 'Filter Bank V3',
        slug: 'filter-bank-v3',
        brand: 'Minimal System Group',
        brands: { id: 'b2', name: 'Minimal System Group', slug: 'minimal-system' },
        product_type: 'plugin',
        price_usd: 0,
        original_price_usd: 39.99,
        cover_image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop',
        demo_audio_url: '',
        short_description: 'Dual resonant filter with LFO modulation.',
      },
      {
        id: 'mock-5',
        name: 'Blue Cat\'s Gain Suite',
        slug: 'blue-cat-gain-suite',
        brand: 'Blue Cat Audio',
        brands: { id: 'b3', name: 'Blue Cat Audio', slug: 'blue-cat-audio' },
        product_type: 'plugin',
        price_usd: 0,
        cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
        demo_audio_url: '',
        short_description: 'Gain utility suite for precise volume automation.',
      },
      {
        id: 'mock-6',
        name: 'Panipulator 2',
        slug: 'panipulator-2',
        brand: 'Boz Digital Labs',
        brands: { id: 'b4', name: 'Boz Digital Labs', slug: 'boz-digital-labs' },
        product_type: 'plugin',
        price_usd: 0,
        cover_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
        demo_audio_url: '',
        short_description: 'Check mono compatibility and invert phase in 1 click.',
      }
    ]

    if (isFree) {
      mockAll = mockAll.filter(p => (p.price_usd ?? 0) === 0)
    }

    if (catParam) {
      const selectedCats = catParam.split(',').map(c => c.trim().toLowerCase()).filter(Boolean)
      mockAll = mockAll.filter(p => {
        const text = `${p.name} ${p.short_description}`.toLowerCase()
        return selectedCats.some(cat => text.includes(cat))
      })
    }

    products = mockAll
  }

  const categoryTitle = formatTitle(cleanCategorySlug)

  // Build Filter Pills URLs
  const baseUrl = `/categories/${rawCategorySlug || 'all'}`
  const activeFilter = isFree ? 'free' : isDeals ? 'deals' : isBundles ? 'bundles' : isRentToOwn ? 'rent' : 'all'

  return (
    <div className="min-h-screen bg-[#121212] text-white py-8 px-4 sm:px-8 lg:px-12 font-sans select-none">
      <div className="max-w-[1500px] mx-auto space-y-8">
        
        {/* Category Header Title (Plugin Boutique Style) */}
        <div className="space-y-2 pt-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {categoryTitle}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl">
            {CATEGORY_META_MAP[cleanCategorySlug]?.description || `Discover top-rated ${categoryTitle} tools and software.`}
          </p>
        </div>

        {/* Plugin Boutique Style Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={baseUrl}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-[#2b2b2b] text-white border border-zinc-600 shadow-md'
                : 'bg-[#1a1a1a] text-zinc-400 hover:text-white hover:bg-[#242424] border border-zinc-800'
            }`}
          >
            All
          </Link>

          <Link
            href={`${baseUrl}?deals=true`}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'deals'
                ? 'bg-[#2b2b2b] text-white border border-zinc-600 shadow-md'
                : 'bg-[#1a1a1a] text-zinc-400 hover:text-white hover:bg-[#242424] border border-zinc-800'
            }`}
          >
            Deals
          </Link>

          <Link
            href={`${baseUrl}?free=true`}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'free'
                ? 'bg-[#2b2b2b] text-white border border-zinc-600 shadow-md'
                : 'bg-[#1a1a1a] text-zinc-400 hover:text-white hover:bg-[#242424] border border-zinc-800'
            }`}
          >
            Free
          </Link>

          <Link
            href={`${baseUrl}?bundles=true`}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'bundles'
                ? 'bg-[#2b2b2b] text-white border border-zinc-600 shadow-md'
                : 'bg-[#1a1a1a] text-zinc-400 hover:text-white hover:bg-[#242424] border border-zinc-800'
            }`}
          >
            Bundles
          </Link>

          <Link
            href={`${baseUrl}?rent_to_own=true`}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'rent'
                ? 'bg-[#2b2b2b] text-white border border-zinc-600 shadow-md'
                : 'bg-[#1a1a1a] text-zinc-400 hover:text-white hover:bg-[#242424] border border-zinc-800'
            }`}
          >
            Rent to Own
          </Link>
        </div>

        {/* Interactive Dropdown Filter Bar (Multi-Category, Multi-Brand, Price, Popularity Sort) */}
        <CategoryFilterBar
          categories={categoriesOptions}
          brands={brandsOptions}
          activeCategory={catParam}
          activeBrand={brandParam}
          activePrice={priceParam}
          activeSort={sortOption}
        />

        {/* Product Cards Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-[#161616] rounded-2xl border border-zinc-800 max-w-md mx-auto space-y-3">
            <p className="text-base font-bold text-white">No products found</p>
            <p className="text-xs text-zinc-400">No items match your selected category filter.</p>
            <Link
              href={baseUrl}
              className="inline-block mt-2 bg-[#FC6301] hover:bg-[#E05800] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              Clear Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

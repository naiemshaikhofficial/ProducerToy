import React from 'react'
import { getAdminClient } from '@/lib/supabase/admin'
import { ProductCard, Product } from '@/components/ProductCard'
import Link from 'next/link'
import Image from 'next/image'
import { Handshake } from 'lucide-react'
import { CategoryFilterBar } from '@/components/CategoryFilterBar'
import { LocalDataCache } from '@/components/LocalDataCache'

export const revalidate = 1800 // Cache static page for 30 minutes (instant 0ms loading, revalidated via /api/revalidate)

interface StorePageProps {
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

const CATEGORY_TYPE_MAP: Record<string, { productType: string; categorySlugs: string[] }> = {
  'sounds': { productType: 'sample_pack', categorySlugs: ['sounds', 'sample-packs'] },
  'sample-packs': { productType: 'sample_pack', categorySlugs: ['sounds', 'sample-packs'] },
  'samples': { productType: 'sample_pack', categorySlugs: ['sounds', 'sample-packs'] },
  'plugins': { productType: 'plugin', categorySlugs: ['plugins', 'effects', 'instruments'] },
  'effects': { productType: 'plugin', categorySlugs: ['plugins', 'effects'] },
  'instruments': { productType: 'plugin', categorySlugs: ['plugins', 'instruments'] },
  'presets': { productType: 'preset', categorySlugs: ['presets'] },
  'templates': { productType: 'template', categorySlugs: ['templates'] },
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

export default async function StorePage({ params, searchParams }: StorePageProps) {
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

  const categorySlug = slug?.[0] || ''
  const subTypeSlug = slug?.[1] || ''

  const isFree = categorySlug.toLowerCase() === 'free' || freeParam === 'true'
  const isDeals = dealsParam === 'true'
  const isBundles = bundlesParam === 'true' || categorySlug.toLowerCase() === 'bundles'
  const isRentToOwn = rentParam === 'true'

  let products: Product[] = []
  let categoriesOptions: Array<{ id: string; name: string; slug: string }> = []
  let brandsOptions: Array<{ id: string; name: string; slug: string }> = []
  let selectedBrand: { id: string; name: string; slug: string; logo_url: string | null; description?: string | null } | null = null
  let isFromDatabase = false

  try {
    const supabase = getAdminClient()

    // 1. Build products query prior to parallel execution
    let query = supabase
      .from('products')
      .select('*, categories(slug, name), subcategories(slug, name), brands!brand_id(id, name, slug, logo_url, description)')
      .eq('is_active', true)

    if (queryText) {
      query = query.ilike('name', `%${queryText}%`)
    }

    if (isFree) {
      query = query.eq('price_usd', 0)
    }

    if (isDeals) {
      query = query.gt('original_price_usd', 0)
    }

    // Category / Product type filtering
    if (categorySlug && categorySlug.toLowerCase() !== 'brand' && categorySlug.toLowerCase() !== 'free') {
      const typeInfo = CATEGORY_TYPE_MAP[categorySlug.toLowerCase()]
      if (typeInfo) {
        query = query.eq('product_type', typeInfo.productType)
      } else {
        const expandedCats = expandCategoryVariants([categorySlug])
        query = query.overlaps('category_slugs', expandedCats)
      }
    }

    // Subcategory / Tag filter
    const activeCatString = catParam || subTypeSlug
    if (activeCatString) {
      const selectedCats = activeCatString.split(',').map(c => c.trim()).filter(Boolean)
      if (selectedCats.length > 0) {
        const expandedCats = expandCategoryVariants(selectedCats)
        query = query.overlaps('category_slugs', expandedCats)
      }
    }

    // Sort order
    if (sortOption === 'price-low') {
      query = query.order('price_usd', { ascending: true })
    } else if (sortOption === 'price-high') {
      query = query.order('price_usd', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // 2. SINGLE PARALLEL NETWORK CALL (1 Roundtrip for ALL database queries)
    const [dbCatRes, dbSubRes, dbBrandRes, productsRes] = await Promise.all([
      supabase.from('categories').select('id, name, slug'),
      supabase.from('subcategories').select('id, name, slug'),
      supabase.from('brands').select('id, name, slug, logo_url, description').order('name'),
      query
    ])

    const dbCatData = dbCatRes.data || []
    const dbSubData = dbSubRes.data || []
    const dbBrandData = dbBrandRes.data || []
    let fetchedProducts = (productsRes.data || []) as Product[]

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

    // Fast in-memory lookup & filter for selected brand
    const brandSearchTerm = brandParam || (categorySlug.toLowerCase() === 'brand' ? subTypeSlug : categorySlug)
    if (brandSearchTerm && brandSearchTerm.toLowerCase() !== 'free') {
      const cleanTerm = brandSearchTerm.toLowerCase()
      selectedBrand = dbBrandData.find(b => b.slug.toLowerCase() === cleanTerm || b.name.toLowerCase().includes(cleanTerm)) || null

      if (selectedBrand) {
        fetchedProducts = fetchedProducts.filter(p => p.brand_id === selectedBrand?.id || p.brands?.slug === selectedBrand?.slug)
      }
    }

    // Multi-Brand filter parameter
    if (brandParam) {
      const selectedBrands = brandParam.split(',').map(b => b.trim().toLowerCase()).filter(Boolean)
      if (selectedBrands.length > 0) {
        fetchedProducts = fetchedProducts.filter(p => {
          const pBrandSlug = p.brands?.slug?.toLowerCase() || p.brand?.toLowerCase()
          return selectedBrands.some(sb => pBrandSlug?.includes(sb))
        })
      }
    }

    if (productsRes.error) {
      console.error('Supabase products fetch error:', productsRes.error)
    } else {
      products = fetchedProducts
      isFromDatabase = true
    }
  } catch (err) {
    console.error('Supabase store page query exception:', err)
  }

  // Fallback Mock Products
  if (!isFromDatabase && products.length === 0) {
    let mockProducts: Product[] = [
      {
        id: 'valhalla-supermassive',
        name: 'Valhalla Supermassive',
        slug: 'valhalla-supermassive',
        brand: 'Valhalla DSP',
        category_slugs: ['reverb', 'delay', 'effects'],
        brands: { id: 'valhalla', name: 'Valhalla DSP', slug: 'valhalla-dsp' },
        product_type: 'plugin',
        price_usd: 0,
        original_price_usd: 49.99,
        cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
        short_description: 'Lush reverbs, harmonic delays, and space echo clouds in one plugin.',
      },
      {
        id: 'c527a285-1440-431e-a06e-ca798cbf4538',
        name: 'Fresh Air',
        slug: 'fresh-air',
        brand: 'Slate Digital',
        category_slugs: ['saturation', 'effects'],
        brand_id: '3d6f7802-69f4-4bf9-af36-dd8ba37bca08',
        brands: {
          id: '3d6f7802-69f4-4bf9-af36-dd8ba37bca08',
          name: 'Slate Digital',
          slug: 'slate-digital',
          logo_url: 'https://images.equipboard.com/uploads/item/image/93658/slate-digital-fresh-air-xl.webp?v=1785999836'
        },
        product_type: 'plugin',
        price_inr: 0,
        price_usd: 0,
        cover_image: 'https://images.equipboard.com/uploads/item/image/93658/slate-digital-fresh-air-xl.webp?v=1785999836',
        vst_format: 'VST3, AU, AAX (64-Bit)',
        short_description: 'Add the smoothest high end you’ve ever heard without even a hint of harshness.',
      },
      {
        id: 'b19c8010-7fdd-4569-96e3-957d1993e45a',
        name: 'TDR Nova',
        slug: 'tdr-nova',
        brand: 'Tokyo Dawn Records',
        category_slugs: ['eq'],
        brands: { id: 'tdr', name: 'Tokyo Dawn Records', slug: 'tokyo-dawn-records' },
        product_type: 'plugin',
        price_usd: 0,
        original_price_usd: 29.99,
        cover_image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop',
        short_description: 'Parallel dynamic equalizer plugin.',
      },
      {
        id: '866725e6-9a20-4b09-8033-386bb83a5e83',
        name: 'iZotope Ozone EQ',
        slug: 'ozone-eq',
        brand: 'iZotope',
        category_slugs: ['eq'],
        brands: { id: 'izotope', name: 'iZotope', slug: 'izotope' },
        product_type: 'plugin',
        price_usd: 0,
        cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
        short_description: 'Surgical mixing and mastering EQ with transient processing.',
      }
    ]

    if (isFree) {
      mockProducts = mockProducts.filter(p => p.price_usd === 0)
    }

    products = mockProducts
  }

  // Calculate Header Titles
  const getHeaderMeta = () => {
    if (selectedBrand) {
      return {
        subLabel: null,
        title: selectedBrand.name,
        logo: selectedBrand.logo_url,
        description: selectedBrand.description || `Explore premier VST plugins, sample packs, and sound design tools created by ${selectedBrand.name}.`
      }
    }

    if (subTypeSlug) {
      const formattedSub = subTypeSlug.replace(/-/g, ' ')
      return {
        subLabel: null,
        title: formattedSub.toUpperCase(),
        logo: null,
        description: `Explore top-rated ${formattedSub} plugins and presets curated for mixing, mastering, and modern sound design.`
      }
    }

    if (categorySlug) {
      switch (categorySlug.toLowerCase()) {
        case 'plugins':
          return {
            subLabel: null,
            title: 'VST Plugins',
            logo: null,
            description: 'Browse premier VST audio plugins, analog saturators, synths, and mixing processors crafted for professional music producers.'
          }
        case 'sample-packs':
        case 'sounds':
        case 'samples':
          return {
            subLabel: null,
            title: 'Sample Packs & Drum Kits',
            logo: null,
            description: 'Explore high-quality royalty-free 808 sub basses, drum kits, vocal chops, and melody loops ready for your DAW.'
          }
        case 'presets':
          return {
            subLabel: null,
            title: 'Synth & Mixing Presets',
            logo: null,
            description: 'Instantly upgrade your sound with synth presets for Serum, Vital, and DAW vocal chain mixing templates.'
          }
        case 'templates':
          return {
            subLabel: null,
            title: 'DAW Templates & Stems',
            logo: null,
            description: 'Full DAW project templates designed to jumpstart your track creation and learn pro arrangement techniques.'
          }
        default:
          const formattedCat = categorySlug.replace(/-/g, ' ')
          return {
            subLabel: null,
            title: formattedCat.charAt(0).toUpperCase() + formattedCat.slice(1),
            logo: null,
            description: `Discover top tools and resources under ${formattedCat}.`
          }
      }
    }

    return {
      subLabel: null,
      title: 'Store Catalog',
      logo: null,
      description: 'Discover the premier marketplace for VST plugins, royalty-free sample packs, synth presets, and DAW templates.'
    }
  }

  const { subLabel, title, logo, description } = getHeaderMeta()
  const baseUrl = categorySlug ? `/store/${categorySlug}` : '/store'
  const activeFilter = isFree ? 'free' : isDeals ? 'deals' : isBundles ? 'bundles' : isRentToOwn ? 'rent' : 'all'

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#121212] min-h-screen text-white select-none">
      <LocalDataCache data={{ categories: categoriesOptions, brands: brandsOptions }} />
      
      {/* Header (Title, Description) */}
      <div className="space-y-2 pt-2">
        {subLabel && (
          <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block">
            {subLabel}
          </span>
        )}
        <div className="flex items-center gap-4">
          {logo && (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-zinc-800 flex-shrink-0">
              <Image src={logo} alt={title} fill className="object-contain p-1" />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase flex items-center gap-3">
            {title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed pt-1">
          {description}
        </p>
      </div>

      {/* Quick Filter Pills (All, Deals, Free, Bundles, Rent to Own) */}
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

      {/* Interactive Dropdown Filter Bar (Category, Brand, Price, Popularity Sort) */}
      <CategoryFilterBar
        categories={categoriesOptions}
        brands={brandsOptions}
        activeCategory={catParam || subTypeSlug}
        activeBrand={brandParam}
        activePrice={priceParam}
        activeSort={sortOption}
      />

      {/* Product Grid or Brand Tying-Up Banner */}
      {products.length === 0 ? (
        selectedBrand ? (
          <div className="text-center py-16 px-6 rounded-3xl bg-[#161616] border border-[#262626] max-w-3xl mx-auto shadow-2xl space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#202020] border border-[#2a2a2a] text-white flex items-center justify-center mx-auto shadow-inner">
              <Handshake className="w-8 h-8" />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
              Partnering in Progress
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              We are tying up with {selectedBrand.name}!
            </h2>
            <p className="text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
              {selectedBrand.description || `We are currently tying up with ${selectedBrand.name} to bring their complete catalog of VST plugins, sample tools, and presets to ProducerToy. Stay tuned!`}
            </p>
            <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
              <Link href="/manufacturers" className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3 px-6 rounded-xl uppercase transition-all shadow-lg">
                Browse All Manufacturers
              </Link>
              <Link href="/store" className="bg-[#202020] hover:bg-[#282828] text-white font-extrabold text-xs py-3 px-6 rounded-xl border border-[#303030] uppercase transition-all">
                Explore Available Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 px-6 rounded-2xl bg-[#161616] border border-[#262626] max-w-xl mx-auto my-8 space-y-3">
            <p className="text-lg font-bold text-white tracking-tight">No products found matching your filter</p>
            <p className="text-xs text-zinc-400">Try searching for another keyword or clearing category filters.</p>
            <div className="pt-2">
              <Link href="/store" className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3 px-6 rounded-full inline-block uppercase transition-all shadow-lg">
                Reset Store Catalog
              </Link>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <LocalDataCache data={{ products, categories: categoriesOptions, brands: brandsOptions }} />
    </div>
  )
}

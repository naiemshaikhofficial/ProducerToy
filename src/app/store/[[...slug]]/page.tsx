import React from 'react'
import { Metadata } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'
import { getCachedCategories, getCachedSubcategories, getCachedBrands } from '@/lib/cache/cachedData'
import { ProductCard, Product } from '@/components/ProductCard'
import { LocalDataCache } from '@/components/LocalDataCache'
import { matchesSearchQuery } from '@/lib/search'
import { generatePageMetadata, generateSmartKeywords } from '@/lib/seo/metadata'
import { CollectionPageJsonLd } from '@/components/JsonLd'
import { EpicStoreBrowser } from '@/components/store/EpicStoreBrowser'
import { generateStoreHeaderMeta } from '@/lib/store/metadataEngine'

export const revalidate = false // 🟢 Infinite edge cache (purged on-demand via /api/revalidate)

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

export function resolveProductType(slug?: string | null): string | null {
  if (!slug) return null
  const clean = slug.toLowerCase().trim().replace(/[-_\s]+/g, '_')
  const map: Record<string, string> = {
    plugin: 'plugin',
    plugins: 'plugin',
    vst: 'plugin',
    vst_plugin: 'plugin',
    vst_plugins: 'plugin',
    vsts: 'plugin',
    effect: 'plugin',
    effects: 'plugin',
    instrument: 'plugin',
    instruments: 'plugin',
    sound: 'sample_pack',
    sounds: 'sample_pack',
    sample: 'sample_pack',
    samples: 'sample_pack',
    sample_pack: 'sample_pack',
    sample_packs: 'sample_pack',
    drum_kit: 'sample_pack',
    drum_kits: 'sample_pack',
    preset: 'preset',
    presets: 'preset',
    template: 'template',
    templates: 'template',
    bundle: 'bundle',
    bundles: 'bundle',
  }
  return map[clean] || null
}

export function matchesCategoryFilter(product: Product, categorySlug: string): boolean {
  if (!categorySlug) return true
  const clean = categorySlug.toLowerCase().trim()
  const mappedType = resolveProductType(clean)

  // 1. Direct or mapped product_type match
  if (mappedType && product.product_type === mappedType) return true
  if (product.product_type && product.product_type.toLowerCase() === clean) return true

  // 2. Direct category relation match from DB (e.g. categories table)
  const catSlug = product.categories?.slug?.toLowerCase()
  const catName = product.categories?.name?.toLowerCase()
  if (catSlug === clean || catName === clean) return true
  if (mappedType && (catSlug === mappedType || catSlug === mappedType.replace('_', '-'))) return true

  // 3. Subcategory relation match from DB (e.g. subcategories table)
  const subSlug = product.subcategories?.slug?.toLowerCase()
  const subName = product.subcategories?.name?.toLowerCase()
  if (subSlug === clean || subName === clean) return true

  // 4. category_slugs array match
  const inArray = (product.category_slugs || []).some((c) => {
    const cl = c.toLowerCase().trim()
    return cl === clean || cl.replace(/[\s_]+/g, '-') === clean || clean.replace(/[\s_]+/g, '-') === cl
  })
  if (inArray) return true

  return false
}

const CATEGORY_TYPE_MAP: Record<string, { productType: string; categorySlugs: string[] }> = {
  'sounds': { productType: 'sample_pack', categorySlugs: ['sounds', 'sample-packs', 'sample-pack', 'drum-kits', '808-bass', 'trap-drums'] },
  'sound': { productType: 'sample_pack', categorySlugs: ['sounds', 'sound', 'sample-packs', 'sample-pack'] },
  'sample': { productType: 'sample_pack', categorySlugs: ['sounds', 'samples', 'sample', 'sample-packs', 'sample-pack'] },
  'samples': { productType: 'sample_pack', categorySlugs: ['sounds', 'samples', 'sample-packs', 'sample-pack'] },
  'sample-pack': { productType: 'sample_pack', categorySlugs: ['sounds', 'sample-packs', 'sample-pack', 'drum-kits'] },
  'sample-packs': { productType: 'sample_pack', categorySlugs: ['sounds', 'sample-packs', 'sample-pack', 'drum-kits'] },
  'plugins': { productType: 'plugin', categorySlugs: ['plugins', 'plugin', 'effects', 'instruments', 'saturation', 'tape-saturation', 'eq', 'dynamic-eq', 'reverb', 'delay', 'tape-delay', 'compressor', 'bus-compressor', 'auto-tune', 'vocal-processing'] },
  'plugin': { productType: 'plugin', categorySlugs: ['plugins', 'plugin', 'effects', 'instruments', 'reverb', 'delay', 'compressor'] },
  'vst': { productType: 'plugin', categorySlugs: ['plugins', 'plugin', 'effects', 'instruments'] },
  'vst-plugins': { productType: 'plugin', categorySlugs: ['plugins', 'plugin', 'effects', 'instruments'] },
  'vst-plugin': { productType: 'plugin', categorySlugs: ['plugins', 'plugin', 'effects', 'instruments'] },
  'effects': { productType: 'plugin', categorySlugs: ['plugins', 'effects', 'saturation', 'tape-saturation', 'eq', 'dynamic-eq', 'reverb', 'delay', 'tape-delay', 'compressor', 'bus-compressor', 'auto-tune', 'vocal-processing'] },
  'instruments': { productType: 'plugin', categorySlugs: ['plugins', 'instruments', 'synthesizers', 'guitars-bass', 'acoustic-guitar'] },
  'saturation': { productType: 'plugin', categorySlugs: ['saturation', 'tape-saturation', 'harmonic-exciter', 'effects'] },
  'tape-saturation': { productType: 'plugin', categorySlugs: ['tape-saturation', 'saturation', 'effects'] },
  'harmonic-exciter': { productType: 'plugin', categorySlugs: ['harmonic-exciter', 'saturation', 'effects'] },
  'eq': { productType: 'plugin', categorySlugs: ['eq', 'dynamic-eq', 'effects', 'mastering'] },
  'dynamic-eq': { productType: 'plugin', categorySlugs: ['dynamic-eq', 'eq', 'effects'] },
  'reverb': { productType: 'plugin', categorySlugs: ['reverb', 'space-reverb', 'effects', 'echo'] },
  'delay': { productType: 'plugin', categorySlugs: ['delay', 'tape-delay', 'effects', 'echo'] },
  'tape-delay': { productType: 'plugin', categorySlugs: ['tape-delay', 'delay', 'effects'] },
  'compressor': { productType: 'plugin', categorySlugs: ['compressor', 'bus-compressor', 'limiter', 'effects'] },
  'bus-compressor': { productType: 'plugin', categorySlugs: ['bus-compressor', 'compressor', 'effects'] },
  'auto-tune': { productType: 'plugin', categorySlugs: ['auto-tune', 'vocal-processing', 'pitch-shifter', 'effects'] },
  'vocal-processing': { productType: 'plugin', categorySlugs: ['vocal-processing', 'auto-tune', 'pitch-shifter', 'effects'] },
  'synthesizers': { productType: 'plugin', categorySlugs: ['synthesizers', 'instruments'] },
  'guitars-bass': { productType: 'plugin', categorySlugs: ['guitars-bass', 'instruments', 'acoustic-guitar'] },
  'presets': { productType: 'preset', categorySlugs: ['presets', 'serum-presets', 'vital-presets'] },
  'preset': { productType: 'preset', categorySlugs: ['presets', 'serum-presets', 'vital-presets'] },
  'serum-presets': { productType: 'preset', categorySlugs: ['serum-presets', 'presets'] },
  'vital-presets': { productType: 'preset', categorySlugs: ['vital-presets', 'presets'] },
  'drum-kits': { productType: 'sample_pack', categorySlugs: ['drum-kits', 'trap-drums', '808-bass', 'sounds', 'sample-packs'] },
  'drum-kit': { productType: 'sample_pack', categorySlugs: ['drum-kits', 'trap-drums', '808-bass', 'sounds', 'sample-packs'] },
  'trap-drums': { productType: 'sample_pack', categorySlugs: ['trap-drums', 'drum-kits', 'sounds'] },
  '808-bass': { productType: 'sample_pack', categorySlugs: ['808-bass', 'drum-kits', 'sounds'] },
  'templates': { productType: 'template', categorySlugs: ['templates', 'fl-studio-templates', 'ableton-templates'] },
  'template': { productType: 'template', categorySlugs: ['templates', 'fl-studio-templates', 'ableton-templates'] },
  'fl-studio-templates': { productType: 'template', categorySlugs: ['fl-studio-templates', 'templates'] },
  'bundles': { productType: 'bundle', categorySlugs: ['bundles'] },
  'bundle': { productType: 'bundle', categorySlugs: ['bundles'] },
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

export async function generateStaticParams() {
  return [
    { slug: [] },
    { slug: ['plugins'] },
    { slug: ['plugin'] },
    { slug: ['sounds'] },
    { slug: ['sound'] },
    { slug: ['sample-pack'] },
    { slug: ['sample-packs'] },
    { slug: ['presets'] },
    { slug: ['preset'] },
    { slug: ['templates'] },
    { slug: ['template'] },
    { slug: ['effects'] },
    { slug: ['instruments'] },
    { slug: ['bundles'] },
    { slug: ['bundle'] },
  ]
}

export async function generateMetadata({ params, searchParams }: StorePageProps): Promise<Metadata> {
  const { slug } = await params
  const { free, deals, brand, q, cat } = await searchParams

  const rawSlug = slug?.[0] || ''
  const isFree = rawSlug === 'free' || free === 'true'
  const isDeals = deals === 'true'

  let title = 'Music Production Store — VST Plugins, Sample Packs & Presets'
  let description = 'Browse the Producer Toy marketplace for premier VST plugins, royalty-free sample packs, synth presets, and DAW templates with instant digital download.'
  let path = '/store'

  if (rawSlug) {
    const metaHeader = generateStoreHeaderMeta({
      selectedCategorySlug: rawSlug,
      selectedSubCategorySlug: slug?.[1] || cat || '',
      isFree,
      isDeals,
      searchQuery: q,
    })
    title = `${metaHeader.title} Store — Music Production Tools`
    description = metaHeader.description || `Download top-rated ${metaHeader.title} for FL Studio, Ableton Live, Logic Pro, and more on Producer Toy.`
    path = `/store/${rawSlug}`
  }

  if (brand) {
    const brandName = brand.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    title = `${brandName} Audio Plugins & Software Tools`
    description = `Discover ${brandName} VST plugins, sound banks, and music software on Producer Toy Store.`
  }

  if (isFree) {
    title = 'Free VST Plugins, Sample Packs & Sound Kits'
    description = 'Download 100% free VST audio plugins, royalty-free sample packs, and synth presets on Producer Toy Store.'
    path = '/store?free=true'
  } else if (isDeals) {
    title = 'Hot Deals & Special Sales on Audio Plugins & Sounds'
    description = 'Save up to 80% off on top VST plugins, sample packs, and music production suites.'
  }

  if (q) {
    title = `Search Results for "${q}" — Producer Toy`
    description = `Find the best VST plugins, sample packs, and presets matching "${q}".`
  }

  return generatePageMetadata({
    title,
    description,
    path,
    keywords: generateSmartKeywords(title, rawSlug || 'store', brand || '', rawSlug || '', isFree),
  })
}

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { slug } = await params
  const {
    q: queryText = '',
    sort: sortOption = 'newest',
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

  const isFree = categorySlug.toLowerCase() === 'free' || freeParam === 'true' || priceParam === 'free'
  const isDeals = dealsParam === 'true'
  const isBundles = bundlesParam === 'true' || categorySlug.toLowerCase() === 'bundles'
  const isRentToOwn = rentParam === 'true'

  let products: Product[] = []
  let categoriesOptions: Array<{ id: string; name: string; slug: string }> = []
  let brandsOptions: Array<{ id: string; name: string; slug: string; logo_url?: string | null }> = []
  let selectedBrand: { id: string; name: string; slug: string; logo_url: string | null; description?: string | null } | null = null
  let isFromDatabase = false

  try {
    const supabase = getAdminClient()

    // 1. Build products query prior to parallel execution
    let query = supabase
      .from('products')
      .select('*, categories(slug, name), subcategories(slug, name), brands!brand_id(id, name, slug, logo_url, description)')
      .eq('is_active', true)

    if (isFree) {
      query = query.eq('price_usd', 0)
    }

    if (isDeals) {
      query = query.gt('original_price_usd', 0)
    }

    // Sort order
    if (sortOption === 'price-low') {
      query = query.order('price_usd', { ascending: true })
    } else if (sortOption === 'price-high') {
      query = query.order('price_usd', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // 2. ULTRA-FAST FETCH: Categories, subcategories, and brands are read from Vercel persistent Data Cache (0 Supabase DB hits!)
    const [dbCatData, dbSubData, dbBrandData, productsRes] = await Promise.all([
      getCachedCategories(),
      getCachedSubcategories(),
      getCachedBrands(),
      query
    ])

    let fetchedProducts = (productsRes.data || []) as Product[]

    // 3. Dynamic Category / Product Type Filtering (DB relation + product_type + category_slugs)
    if (categorySlug && categorySlug.toLowerCase() !== 'brand' && categorySlug.toLowerCase() !== 'free') {
      fetchedProducts = fetchedProducts.filter((p) => matchesCategoryFilter(p, categorySlug))
    }

    // Subcategory / Tag filter
    const activeCatString = catParam || subTypeSlug
    if (activeCatString) {
      const selectedCats = activeCatString.split(',').map((c) => c.trim()).filter(Boolean)
      const specificCats = selectedCats.filter(
        (c) => !['all', 'all-sample-pack', 'all-plugins', 'sounds', 'sample-pack', 'sample-packs', 'samples', 'plugins', 'vst-plugins', 'presets'].includes(c.toLowerCase())
      )
      if (specificCats.length > 0) {
        fetchedProducts = fetchedProducts.filter((p) => specificCats.some((sc) => matchesCategoryFilter(p, sc)))
      }
    }

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

    dbCatData.forEach((c) => {
      if (!combinedCategories.some((e) => e.slug === c.slug)) combinedCategories.push(c)
    })
    dbSubData.forEach((s) => {
      if (!combinedCategories.some((e) => e.slug === s.slug)) combinedCategories.push(s)
    })

    categoriesOptions = combinedCategories
    brandsOptions = dbBrandData

    // Fast in-memory lookup & filter for selected brand (avoid false positives on category words like 'sounds')
    const isBrandRoute = categorySlug.toLowerCase() === 'brand'
    const isKnownCategory = Boolean(
      resolveProductType(categorySlug) ||
      CATEGORY_TYPE_MAP[categorySlug.toLowerCase()] ||
      combinedCategories.some((c) => c.slug.toLowerCase() === categorySlug.toLowerCase())
    )
    const brandSearchTerm = brandParam || (isBrandRoute ? subTypeSlug : !isKnownCategory ? categorySlug : '')
    if (brandSearchTerm && brandSearchTerm.toLowerCase() !== 'free') {
      const cleanTerm = brandSearchTerm.toLowerCase().trim()
      selectedBrand = dbBrandData.find((b) => b.slug.toLowerCase() === cleanTerm || b.name.toLowerCase() === cleanTerm) || null

      if (selectedBrand) {
        fetchedProducts = fetchedProducts.filter((p) => p.brand_id === selectedBrand?.id || p.brands?.slug === selectedBrand?.slug)
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
      // High-performance multi-field token search (Name, Slug, Brand, Category, Subcategory, Description, Type, Format, Tags)
      if (queryText) {
        fetchedProducts = fetchedProducts.filter(p => matchesSearchQuery(p, queryText))
      }
      products = fetchedProducts
      isFromDatabase = true
    }
  } catch (err) {
    console.error('Supabase store page query exception:', err)
  }

  // Calculate Header Titles & Descriptions with dynamic scalability engine
  const { title, description } = generateStoreHeaderMeta({
    searchQuery: queryText,
    isFree,
    isDeals,
    isBundles,
    isRentToOwn,
    selectedBrand,
    selectedCategorySlug: categorySlug,
    selectedSubCategorySlug: subTypeSlug,
    selectedPriceTier: priceParam,
  })

  return (
    <div className="w-full bg-[#121212] min-h-screen text-white select-none">
      <LocalDataCache data={{ categories: categoriesOptions, brands: brandsOptions }} />
      
      {/* 1:1 Epic Games Store Browser with Two-Column Filter System & Orange Theme */}
      <EpicStoreBrowser
        products={products}
        categories={categoriesOptions}
        brands={brandsOptions}
        activeCategorySlug={categorySlug}
        activeSubTypeSlug={subTypeSlug || catParam || ''}
        activeBrandSlug={brandParam}
        activeQuery={queryText}
        activeSort={sortOption}
        isDealsActive={isDeals}
        isFreeActive={isFree}
        isBundlesActive={isBundles}
        isRentActive={isRentToOwn}
        activePriceTier={priceParam}
        headerTitle={title}
        headerDescription={description}
      />

      <CollectionPageJsonLd
        title={selectedBrand ? `${selectedBrand.name} Plugins & Sounds` : title ? `${title} Store` : 'Producer Toy Store'}
        description={`Explore premier ${title || categorySlug || 'music production'} products on Producer Toy.`}
        url={`https://producertoy.com/store${categorySlug ? `/${categorySlug}` : ''}`}
        items={products.map((p) => ({
          name: p.name,
          url: `https://producertoy.com/product/${p.slug}`,
          price: p.price_usd,
          image: p.cover_image,
          brand: p.brands?.name || p.brand || 'Producer Toy',
        }))}
      />
    </div>
  )
}

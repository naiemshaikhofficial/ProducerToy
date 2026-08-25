import React from 'react'
import { getAdminClient } from '@/lib/supabase/admin'
import { ProductCard, Product } from '@/components/ProductCard'
import Link from 'next/link'
import Image from 'next/image'
import { Handshake, Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface StorePageProps {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<{ q?: string; sort?: string; free?: string; brand?: string }>
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

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { slug } = await params
  const { q: queryText = '', sort: sortOption = 'newest', free: freeParam, brand: brandParam } = await searchParams

  const categorySlug = slug?.[0] || ''
  const subTypeSlug = slug?.[1] || ''

  const isFree = categorySlug.toLowerCase() === 'free' || freeParam === 'true'

  let products: Product[] = []
  let selectedBrand: { id: string; name: string; slug: string; logo_url: string | null; description?: string | null } | null = null
  let isFromDatabase = false

  try {
    const supabase = getAdminClient()

    // 1. Check if Brand is requested via URL /store/[brandSlug] or ?brand=...
    const brandSearchTerm = brandParam || (categorySlug.toLowerCase() === 'brand' ? subTypeSlug : categorySlug)
    if (brandSearchTerm && brandSearchTerm.toLowerCase() !== 'free') {
      const cleanTerm = brandSearchTerm.replace(/-/g, ' ')
      const { data: brandData } = await supabase
        .from('brands')
        .select('id, name, slug, logo_url, description')
        .or(`slug.ilike.${brandSearchTerm},name.ilike.%${cleanTerm}%`)
        .maybeSingle()

      if (brandData) {
        selectedBrand = brandData
      }
    }

    // 2. Build product query joining relational brands (via foreign key brand_id)
    let query = supabase
      .from('products')
      .select('*, categories(slug, name), subcategories(slug, name), brands!brand_id(id, name, slug, logo_url)')
      .eq('is_active', true)

    if (queryText) {
      query = query.ilike('name', `%${queryText}%`)
    }

    if (isFree) {
      query = query.eq('price_usd', 0)
    }

    if (selectedBrand) {
      query = query.eq('brand_id', selectedBrand.id)
    } else if (categorySlug && categorySlug.toLowerCase() !== 'brand' && categorySlug.toLowerCase() !== 'free') {
      const typeInfo = CATEGORY_TYPE_MAP[categorySlug.toLowerCase()]
      if (typeInfo) {
        query = query.eq('product_type', typeInfo.productType)
      } else {
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle()

        if (catData) {
          query = query.eq('category_id', catData.id)
        } else {
          // Check if categorySlug matches a brand name or slug
          const cleanCat = categorySlug.replace(/-/g, ' ')
          const { data: matchedBrand } = await supabase
            .from('brands')
            .select('*')
            .or(`slug.ilike.${categorySlug},name.ilike.%${cleanCat}%`)
            .maybeSingle()

          if (matchedBrand) {
            selectedBrand = matchedBrand
            query = query.eq('brand_id', matchedBrand.id)
          }
        }
      }
    }

    if (subTypeSlug && !selectedBrand) {
      const { data: subData } = await supabase
        .from('subcategories')
        .select('id')
        .eq('slug', subTypeSlug)
        .maybeSingle()

      if (subData) {
        query = query.eq('subcategory_id', subData.id)
      } else {
        query = query.ilike('vst_format', `%${subTypeSlug}%`)
      }
    }

    if (sortOption === 'price-low') {
      query = query.order('price_usd', { ascending: true })
    } else if (sortOption === 'price-high') {
      query = query.order('price_usd', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) {
      console.error('Supabase products fetch error:', error)
    } else if (data) {
      products = data as Product[]
      isFromDatabase = true
    }
  } catch (err) {
    console.error('Supabase store page query exception:', err)
  }

  // Fallback Mock Products if DB is offline or returned no rows
  if (!isFromDatabase && products.length === 0) {
    let mockProducts: Product[] = [
      {
        id: 'c527a285-1440-431e-a06e-ca798cbf4538',
        name: 'Fresh Air',
        slug: 'fresh-air',
        brand: 'Slate Digital',
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
        demo_audio_url: '',
        external_url: 'https://slatedigital.com/fresh-air',
        button_text: 'Get It On Slate Digital',
        vst_format: 'VST3, AU, AAX (64-Bit)',
        short_description: 'Add the smoothest high end you’ve ever heard without even a hint of harshness.',
      },
      {
        id: '1',
        name: 'Analog Warmth Saturator VST',
        slug: 'analog-warmth-saturator-vst',
        brand: 'Toy Audio',
        brands: { id: '61db0d9d-3aaa-455e-bfed-578313cfa024', name: 'Toy Audio', slug: 'toy-audio' },
        product_type: 'plugin',
        price_inr: 1499,
        price_usd: 19.99,
        cover_image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop',
        demo_audio_url: 'https://cdn.freesound.org/previews/612/612683_5674468-lq.mp3',
        vst_format: 'VST3, AU, AAX (64-Bit)',
        short_description: 'Vintage analog saturation & tube warmth plugin for vocals, drums, and mixbus.',
      },
      {
        id: '2',
        name: 'Cyber Drill Sample Pack',
        slug: 'cyber-drill-sample-pack',
        brand: 'Producer Toy',
        brands: { id: '7f4acc81-4d35-4f94-b1f3-cc7717471f26', name: 'Producer Toy', slug: 'producer-toy' },
        product_type: 'sample_pack',
        price_inr: 999,
        price_usd: 12.99,
        cover_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
        demo_audio_url: 'https://cdn.freesound.org/previews/573/573582_11861866-lq.mp3',
        vst_format: 'WAV 24-Bit / 44.1kHz',
        short_description: 'Dark UK & Brooklyn drill melodies, aggressive 808s, and hard-hitting drum loops.',
      },
      {
        id: '3',
        name: 'Serum Polyphonic Synth Presets',
        slug: 'serum-polyphonic-synth-presets',
        brand: 'SoundCraft',
        brands: { id: '8d5c08c3-f41f-4e63-9107-6cda07b00b9f', name: 'SoundCraft', slug: 'soundcraft' },
        product_type: 'preset',
        price_inr: 799,
        price_usd: 9.99,
        cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
        demo_audio_url: 'https://cdn.freesound.org/previews/456/456123_1234567-lq.mp3',
        vst_format: 'Xfer Serum v1.357+',
        short_description: '64 Lush ambient pads, cyberpunk leads, and heavy Reese basses for Xfer Serum.',
      }
    ]

    if (isFree) {
      mockProducts = mockProducts.filter((p) => (p.price_usd ?? 0) === 0 && (p.price_inr ?? 0) === 0)
    }

    if (selectedBrand) {
      mockProducts = mockProducts.filter((p) => p.brands?.name.toLowerCase() === selectedBrand!.name.toLowerCase() || p.brand_id === selectedBrand!.id)
    } else if (categorySlug && categorySlug.toLowerCase() !== 'brand' && categorySlug.toLowerCase() !== 'free') {
      const typeInfo = CATEGORY_TYPE_MAP[categorySlug.toLowerCase()]
      if (typeInfo) {
        mockProducts = mockProducts.filter((p) => p.product_type === typeInfo.productType)
      }
    }

    if (queryText) {
      mockProducts = mockProducts.filter((p) =>
        p.name.toLowerCase().includes(queryText.toLowerCase())
      )
    }

    products = mockProducts
  }

  // Helper to generate dynamic Epic Games style category header details
  const getHeaderMeta = () => {
    if (selectedBrand) {
      return {
        subLabel: 'OFFICIAL BRAND',
        title: selectedBrand.name,
        logo: selectedBrand.logo_url,
        description: selectedBrand.description || `Explore premier VST plugins, sample packs, and sound design tools created by ${selectedBrand.name}.`
      }
    }

    if (isFree) {
      return {
        subLabel: 'Play More & Download',
        title: 'Free Plugins & Sounds',
        logo: null,
        description: 'Producer Toy gives you free studio VST plugins, 808 sample toolkits, and vocal chain presets. Download free tools to enhance your music production today.'
      }
    }

    if (queryText) {
      return {
        subLabel: 'Search Results',
        title: `Search: "${queryText}"`,
        logo: null,
        description: `Showing available music production tools matching "${queryText}".`
      }
    }

    if (subTypeSlug) {
      const formattedSub = subTypeSlug.replace(/-/g, ' ')
      return {
        subLabel: categorySlug ? `${categorySlug.toUpperCase()} SUB-CATEGORY` : 'COLLECTION',
        title: formattedSub.charAt(0).toUpperCase() + formattedSub.slice(1),
        logo: null,
        description: `Explore top-rated ${formattedSub} plugins and presets curated for mixing, mastering, and modern sound design.`
      }
    }

    if (categorySlug) {
      switch (categorySlug.toLowerCase()) {
        case 'plugins':
          return {
            subLabel: 'Software & FX',
            title: 'VST Plugins',
            logo: null,
            description: 'Browse premier VST audio plugins, analog saturators, synths, and mixing processors crafted for professional music producers.'
          }
        case 'sample-packs':
        case 'sounds':
        case 'samples':
          return {
            subLabel: 'Royalty Free Audio',
            title: 'Sample Packs & Drum Kits',
            logo: null,
            description: 'Explore high-quality royalty-free 808 sub basses, drum kits, vocal chops, and melody loops ready for your DAW.'
          }
        case 'presets':
          return {
            subLabel: 'Sound Design',
            title: 'Synth & Mixing Presets',
            logo: null,
            description: 'Instantly upgrade your sound with synth presets for Serum, Vital, and DAW vocal chain mixing templates.'
          }
        case 'templates':
          return {
            subLabel: 'DAW Projects',
            title: 'DAW Templates & Stems',
            description: 'Full DAW project templates designed to jumpstart your track creation and learn pro arrangement techniques.'
          }
        default:
          const formattedCat = categorySlug.replace(/-/g, ' ')
          return {
            subLabel: 'Catalog',
            title: formattedCat.charAt(0).toUpperCase() + formattedCat.slice(1),
            logo: null,
            description: `Discover top tools and resources under ${formattedCat}.`
          }
      }
    }

    return {
      subLabel: 'Explore Store',
      title: 'Store Catalog',
      logo: null,
      description: 'Discover the premier marketplace for VST plugins, royalty-free sample packs, synth presets, and DAW templates.'
    }
  }

  const { subLabel, title, logo, description } = getHeaderMeta()

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-[#121212] min-h-screen text-white">
      
      {/* Epic Games Store Dynamic Header (Sublabel, Logo, Title, Description) */}
      <div className="space-y-2 pt-2 pb-2">
        <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block">
          {subLabel}
        </span>
        <div className="flex items-center gap-4">
          {logo && (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-zinc-800 flex-shrink-0">
              <Image src={logo} alt={title} fill className="object-contain p-1" />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase flex items-center gap-3">
            {title}
          </h1>
        </div>
        <p className="text-sm md:text-base text-zinc-400 font-medium max-w-3xl leading-relaxed pt-1">
          {description}
        </p>
      </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  )
}

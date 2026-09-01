import React from 'react'
import { Metadata } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'
import { Product } from '@/components/ProductCard'
import { CollectionPageJsonLd, FAQPageJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { FreePageClient } from './FreePageClient'

export const revalidate = false // 🟢 Infinite edge cache

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Toys — Download Free VST Plugins, Samples & Sounds (2026)',
  description:
    'Producer Toy gives you free VST plugins, sample packs, synths, and audio tools every week. Download 100% royalty-free tools with instant cloud library access.',
  path: '/free-vst-plugins',
  keywords: [
    'free toys',
    'free VST plugins',
    'best free VST plugins 2026',
    'free audio plugins',
    'free saturation VST',
    'free compressor VST',
    'free autotune plugin',
    'free delay plugin',
    'free reverb VST',
    'FL Studio free plugins',
    'Ableton Live free plugins',
    'Logic Pro free plugins',
  ],
})

const FREE_VST_FAQS = [
  {
    question: 'Are all plugins on this page 100% free to download?',
    answer: 'Yes! Every plugin, sample pack, and sound tool featured on this page is 100% freeware with zero subscription fees, hidden trial watermarks, or credit card requirements.',
  },
  {
    question: 'Are these free VST plugins compatible with FL Studio and Ableton Live?',
    answer: 'Yes, all plugins come in standard 64-bit VST3, AU, and AAX formats and work seamlessly in FL Studio, Ableton Live, Logic Pro X, Pro Tools, Cubase, Studio One, and Reaper.',
  },
  {
    question: 'Can I use these free plugins in commercial music releases?',
    answer: 'Yes, all products downloaded from Producer Toy include commercial license clearance for Spotify, Apple Music, YouTube, and commercial beat sales.',
  },
]

export default async function FreeVstPluginsHubPage() {
  const supabase = getAdminClient()

  // Fetch all active products from DB (Free and Coming Soon)
  const { data: allActiveProducts } = await supabase
    .from('products')
    .select('*, categories(slug, name), subcategories(slug, name), brands!brand_id(id, name, slug, logo_url)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const allProducts: Product[] = (allActiveProducts as any[]) || []
  
  // Real DB Free products (price === 0)
  const freeProducts = allProducts.filter((p) => Number(p.price_usd) === 0 && !p.is_coming_soon)

  return (
    <div className="w-full bg-[#121212] min-h-screen text-white select-none pb-20">
      
      {/* Schema.org Structured Data for Google Ranking */}
      <CollectionPageJsonLd
        title="Free Producer Toys — VST Plugins & Sounds"
        description="Browse and download 100% free VST3 and AU plugins for FL Studio, Ableton Live, Logic Pro, and Cubase."
        url="https://producertoy.com/free-vst-plugins"
        items={freeProducts.map((p) => ({
          name: p.name,
          url: `https://producertoy.com/product/${p.slug}`,
          price: 0,
          image: p.cover_image,
        }))}
      />
      <FAQPageJsonLd faqs={FREE_VST_FAQS} />
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', url: 'https://producertoy.com' },
          { name: 'Store', url: 'https://producertoy.com/store' },
          { name: 'Free Toys', url: 'https://producertoy.com/free-vst-plugins' },
        ]}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <FreePageClient products={allProducts} />
      </div>

    </div>
  )
}



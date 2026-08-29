import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminClient } from '@/lib/supabase/admin'
import { ProductCard, Product } from '@/components/ProductCard'
import { CollectionPageJsonLd, FAQPageJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { generatePageMetadata, generateSmartKeywords } from '@/lib/seo/metadata'

export const revalidate = 1800 // Cache static page for 30 minutes

export const metadata: Metadata = generatePageMetadata({
  title: 'Best Free VST Plugins (2026) — Download VST3 & AU Audio Plugins',
  description:
    'Download the best 100% free VST plugins, synthesizers, saturators, equalizers, and compressors for FL Studio, Ableton Live, Logic Pro & Cubase on Producer Toy.',
  path: '/free-vst-plugins',
  keywords: [
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
    'VST3 AU download free',
  ],
})

const FREE_VST_FAQS = [
  {
    question: 'Are all plugins on this page 100% free to download?',
    answer: 'Yes! Every plugin and sound tool featured on this page is 100% freeware with zero subscription fees, hidden trial watermarks, or credit card requirements.',
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

  // Fetch all active free products
  const { data: freeProducts } = await supabase
    .from('products')
    .select('*, categories(slug, name), subcategories(slug, name), brands!brand_id(id, name, slug, logo_url)')
    .eq('is_active', true)
    .eq('price_usd', 0)
    .order('created_at', { ascending: false })

  const products: Product[] = (freeProducts as any[]) || []

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-white min-h-screen">
      
      {/* Schema.org Structured Data for Google Ranking */}
      <CollectionPageJsonLd
        title="Best Free VST Plugins — Producer Toy Store"
        description="Browse and download 100% free VST3 and AU plugins for FL Studio, Ableton Live, Logic Pro, and Cubase."
        url="https://producertoy.com/free-vst-plugins"
        items={products.map((p) => ({
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
          { name: 'Free VST Plugins', url: 'https://producertoy.com/free-vst-plugins' },
        ]}
      />

      {/* Hero Header Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/store" className="hover:text-white transition-colors">Store</Link>
          <span>/</span>
          <span className="text-white font-medium">Free VST Plugins</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Best Free VST Plugins & Software
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
          Explore our curated selection of 100% free VST3, AU, and AAX audio plugins. Tested for 64-bit Windows and macOS with instant direct download.
        </p>
      </div>

      {/* Sub-Category Quick Links */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        {[
          { label: 'All Free Tools', href: '/free-vst-plugins' },
          { label: 'Saturation & Tape', href: '/categories/saturation' },
          { label: 'Equalizers (EQ)', href: '/categories/eq' },
          { label: 'Reverb & Space', href: '/categories/reverb' },
          { label: 'Delay & Echo', href: '/categories/delay' },
          { label: 'Auto-Tune & Pitch', href: '/categories/auto-tune' },
          { label: 'Trap Drum Kits', href: '/categories/trap-drums' },
        ].map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            prefetch={true}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border whitespace-nowrap transition-colors ${
              idx === 0
                ? 'bg-white text-black border-white'
                : 'bg-[#181818] hover:bg-[#222222] text-zinc-300 hover:text-white border-[#2c2c2c]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-400 bg-[#141414] rounded-2xl border border-[#222222]">
          <p>No free plugins available at the moment.</p>
        </div>
      )}

      {/* SEO Content & FAQs */}
      <div className="pt-12 border-t border-[#202020] space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Frequently Asked Questions about Free VST Plugins
          </h2>
          <p className="text-xs text-zinc-400">
            Learn more about installing, using, and licensing free audio plugins on Producer Toy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FREE_VST_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#181818] border border-[#262626] rounded-xl p-5 space-y-2"
            >
              <h3 className="text-sm font-bold text-white">{faq.question}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

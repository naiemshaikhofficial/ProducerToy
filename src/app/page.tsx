import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/components/ProductCard'
import { getHomepageProducts } from '@/lib/data/products'
import { generatePageMetadata } from '@/lib/seo/metadata'

import { EpicHeroCarousel } from '@/components/EpicHeroCarousel'
import { EpicSpotlightBanner } from '@/components/EpicSpotlightBanner'
import { FreeProducerToys } from '@/components/FreeProducerToys'
import { ProducerToyGrid } from '@/components/ProducerToyGrid'
import { EpicNewReleases } from '@/components/EpicNewReleases'
import { EpicStorefrontLists } from '@/components/EpicStorefrontLists'
import { EpicMostPopular } from '@/components/EpicMostPopular'
import { EpicTrending } from '@/components/EpicTrending'
import { LocalDataCache } from '@/components/LocalDataCache'

export const revalidate = 86400 // 24-hour Edge Cache (instant on-demand revalidation via /api/revalidate & Server Actions)

export const metadata: Metadata = generatePageMetadata({
  title: 'Producer Toy | Music Production VST Plugins, Samples & Presets',
  description:
    'Download world-class VST plugins, royalty-free sample packs, Serum synth presets, and DAW templates. The premier minimalist marketplace for modern music creators.',
  path: '/',
  keywords: [
    'VST Plugins',
    'Free VST Plugins',
    'Sample Packs',
    'Free Sample Packs',
    'Serum Presets',
    'Vital Presets',
    'FL Studio Templates',
    'Ableton Live Plugins',
    'Toywards Rewards',
  ],
})

export default async function HomePage() {
  let products: Product[] = await getHomepageProducts()

  if (products.length === 0) {
    products = [
      {
        id: '1',
        name: 'Analog Warmth Saturator VST',
        slug: 'analog-warmth-saturator-vst',
        brand: 'Producer Toy',
        product_type: 'plugin',
        price_inr: 1499,
        price_usd: 19.99,
        cover_image: 'https://imagizer.imageshack.com/img921/4770/lbZQ86.png',
        demo_audio_url: 'https://cdn.freesound.org/previews/612/612683_5674468-lq.mp3',
        vst_format: 'VST3, AU, AAX (64-Bit)',
        short_description: 'Vintage analog saturation & tube warmth plugin for vocals, drums, and mixbus.',
      },
      {
        id: '2',
        name: 'Skull And Love Trap Drum Kit',
        slug: 'skull-and-love',
        brand: 'Producer Toy',
        product_type: 'sample_pack',
        price_inr: 999,
        price_usd: 9.99,
        cover_image: 'https://imagizer.imageshack.com/img922/1539/4FyC2M.png',
        demo_audio_url: 'https://cdn.freesound.org/previews/573/573582_11861866-lq.mp3',
        vst_format: 'WAV 24-Bit / 44.1kHz',
        short_description: 'Dark UK & Brooklyn drill melodies, aggressive 808s, and hard-hitting drum loops.',
      },
      {
        id: '3',
        name: 'Serum Polyphonic Synth Presets',
        slug: 'serum-polyphonic-synth-presets',
        brand: 'Producer Toy',
        product_type: 'preset',
        price_inr: 799,
        price_usd: 9.99,
        cover_image: 'https://imagizer.imageshack.com/img924/8785/ZZlWA9.png',
        demo_audio_url: 'https://cdn.freesound.org/previews/456/456123_1234567-lq.mp3',
        vst_format: 'Xfer Serum v1.357+',
        short_description: '64 Lush ambient pads, cyberpunk leads, and heavy Reese basses for Xfer Serum.',
      },
      {
        id: '4',
        name: 'FL Studio Trap Mixing Template',
        slug: 'fl-studio-trap-mixing-template',
        brand: 'Producer Toy',
        product_type: 'template',
        price_inr: 1199,
        price_usd: 14.99,
        cover_image: 'https://imagizer.imageshack.com/img922/4266/oEGOCb.png',
        demo_audio_url: 'https://cdn.freesound.org/previews/321/321987_7654321-lq.mp3',
        vst_format: 'FL Studio 20 / 21',
        short_description: 'Pro mix bus routing, vocal chain preset, and punchy drum bus for FL Studio 21.',
      }
    ]
  }

  return (
    <div className="w-full bg-[#121212] min-h-screen text-white flex flex-col items-center select-none">
      
      {/* 1st Section: Epic Store Billboard Poster Banner (Desktop only - Hidden on Mobile) */}
      <section className="hidden lg:block w-full mt-2 sm:mt-3 mb-10 sm:mb-12">
        <EpicSpotlightBanner />
      </section>

      {/* Main Content Area */}
      <div className="w-full max-w-[1220px] mx-auto px-0 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-0 pb-16 space-y-8 sm:space-y-12 lg:space-y-16">
        
        {/* Centered Epic Hero Carousel (Starts immediately on mobile) */}
        <EpicHeroCarousel products={products} />

        {/* 2nd Section: Producer Toy Originals Row (First) */}
        <div className="px-4 sm:px-0">
          <ProducerToyGrid products={products} title="Producer Toy Originals" />
        </div>

        {/* 3rd Section: Free Producer Toys (Second) */}
        <div className="px-4 sm:px-0">
          <FreeProducerToys products={products} />
        </div>

        {/* 4th Section: 1:1 Epic Games New Releases (Sorted by created_at) */}
        <div className="px-4 sm:px-0">
          <EpicNewReleases products={products} />
        </div>

        {/* 5th Section: 1:1 Epic Games Tri-Column Lists (Top Sellers, Coming Soon, Top Deals) */}
        <div className="px-4 sm:px-0">
          <EpicStorefrontLists products={products} />
        </div>

        {/* 6th Section: 1:1 Epic Games Most Popular (Highly Purchased Products with Carousel Arrows) */}
        <div className="px-4 sm:px-0">
          <EpicMostPopular products={products} />
        </div>

        {/* 7th Section: 1:1 Epic Games Trending Row (High Demand & Latest Products) */}
        <div className="px-4 sm:px-0">
          <EpicTrending products={products} />
        </div>

      </div>

      <LocalDataCache data={{ products }} />
    </div>
  )
}

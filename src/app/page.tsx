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

// 🟢 ZERO-RESOURCE CDN CACHING: Infinite cache (purged on-demand via /api/revalidate webhook).
// Secures 0 DB hits and 0 serverless executions under normal traffic.
export const revalidate = false

export const metadata: Metadata = generatePageMetadata({
  title: 'Producer Toy — Music Production VST Plugins, Samples & Presets',
  description:
    'Download world-class VST plugins, royalty-free sample packs, Serum synth presets, and DAW templates on Producer Toy. The premier marketplace for modern music creators.',
  path: '/',
  keywords: [
    'Producer Toy',
    'producertoy',
    'producertoy.com',
    'producer toys',
    'producers toy',
    'producers toys',
    'producer toy store',
    'VST Plugins',
    'Free VST Plugins',
    'Sample Packs',
    'Free Sample Packs',
    'Serum Presets',
    'Vital Presets',
    'FL Studio Templates',
    'Ableton Live Plugins',
    'Saturation Plugins',
    'Free Saturator VST',
    'Dynamic EQ VST',
    'Space Reverb VST',
    'Toywards Rewards',
  ],
})

export default async function HomePage() {
  const products: Product[] = await getHomepageProducts()

  return (
    <div className="w-full bg-[#121212] min-h-screen text-white flex flex-col items-center select-none">
      <h1 className="sr-only">Producer Toy — Music Production VST Plugins, Samples & Presets</h1>
      
      {/* Main Content Area - Exact 1:1 margin and width alignment with SubBar */}
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 sm:pb-28 space-y-12 sm:space-y-16">
        
        {/* 1st Section: Epic Hero Carousel (Starts immediately at top under SubBar) */}
        <EpicHeroCarousel products={products} />

        {/* 2nd Section: Epic Store Billboard Spotlight Banner (Sitting flush inside 1280px container) */}
        <section className="hidden lg:block w-full">
          <EpicSpotlightBanner />
        </section>

        {/* 3rd Section: Producer Toy Originals Row */}
        <div>
          <ProducerToyGrid products={products} title="Producer Toy Originals" />
        </div>

        {/* 4th Section: Free Producer Toys */}
        <div>
          <FreeProducerToys products={products} />
        </div>

        {/* 5th Section: 1:1 Epic Games New Releases */}
        <div>
          <EpicNewReleases products={products} />
        </div>

        {/* 6th Section: 1:1 Epic Games Tri-Column Lists (Top Sellers, Coming Soon, Top Deals) */}
        <div>
          <EpicStorefrontLists products={products} />
        </div>

        {/* 7th Section: 1:1 Epic Games Most Popular */}
        <div>
          <EpicMostPopular products={products} />
        </div>

        {/* 8th Section: 1:1 Epic Games Trending Row */}
        <div>
          <EpicTrending products={products} />
        </div>

      </div>

      <LocalDataCache data={{ products }} />
    </div>
  )
}

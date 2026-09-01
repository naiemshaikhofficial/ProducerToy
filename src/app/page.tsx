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
import { ChooseYourDaw } from '@/components/ChooseYourDaw'
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
  title: 'Producer Toy | Music Production VST Plugins, Samples & Presets',
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
      
      {/* 1st Section: Epic Store Billboard Poster Banner (Desktop only - Hidden on Mobile) */}
      <section className="hidden lg:block w-full mt-3 sm:mt-4 mb-12 sm:mb-16">
        <EpicSpotlightBanner />
      </section>

      {/* Main Content Area */}
      <div className="w-full max-w-[1280px] mx-auto px-0 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-2 pb-20 sm:pb-28 space-y-12 sm:space-y-16 lg:space-y-24">
        
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

        {/* 8th Section: Choose Your Favourite DAW (Last Section) */}
        <div className="px-4 sm:px-0">
          <ChooseYourDaw />
        </div>

      </div>

      <LocalDataCache data={{ products }} />
    </div>
  )
}

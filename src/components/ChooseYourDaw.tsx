'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

interface DawCardItem {
  id: string
  name: string
  developer: string
  slug: string
  categoryTag: string
  format: string
  coverImage: string
  glowColor: string
}

const DAW_ITEMS: DawCardItem[] = [
  {
    id: 'fl-studio',
    name: 'FL Studio 26',
    developer: 'Image-Line',
    slug: 'fl-studio',
    categoryTag: 'Digital Audio Workstation',
    format: '',
    coverImage: '/images/daws/fl-studio.png',
    glowColor: 'rgba(255, 107, 0, 0.25)',
  },
]

export function ChooseYourDaw() {
  return (
    <section className="w-full my-8 sm:my-12 lg:my-16 select-none font-sans">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2>
            <Link
              href="/daw/fl-studio"
              prefetch={true}
              className="group inline-flex items-center gap-1.5 text-xl sm:text-2xl font-bold text-white hover:text-white/80 transition-colors tracking-tight"
            >
              <span>Choose Your Favourite DAW</span>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Official Image-Line FL Studio licenses with Lifetime Free Updates.
          </p>
        </div>
      </div>

      {/* Cards Grid: 1:1 Match with ProductCard (3:4 Ratio Poster + Details below) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {DAW_ITEMS.map((daw) => (
          <Link
            key={daw.id}
            href={`/daw/${daw.slug}`}
            prefetch={true}
            className="group flex flex-col cursor-pointer select-none"
            title={`${daw.name} by ${daw.developer}`}
          >
            {/* 3:4 Tall Epic Games Store Poster Card */}
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#181818] border border-[#222222] shadow-md mb-3.5 sm:mb-4 flex items-center justify-center p-6 bg-gradient-to-b from-[#202024] via-[#161618] to-[#111113]">
              {/* Radial ambient glow */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${daw.glowColor} 0%, transparent 70%)`,
                }}
              />

              {/* Official DAW Logo (High Res Image) */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={daw.coverImage}
                  alt={`${daw.name} by ${daw.developer}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-contain p-4 group-hover:scale-108 group-hover:brightness-110 transition-all duration-300 ease-out drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
                />
              </div>

              {/* Minimal Epic Games Store Light Glow Overlay on Hover */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
            </div>

            {/* Content Details Below Card (Exact 1:1 ProductCard Layout) */}
            <div className="flex flex-col justify-between flex-1 px-0.5 min-h-[92px]">
              <div className="space-y-1">
                {/* Category / Subcategory Tag */}
                <span className="text-xs font-semibold text-zinc-400 capitalize line-clamp-1 block">
                  {daw.categoryTag}
                </span>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-zinc-200 transition-colors">
                  {daw.name}
                </h3>

                {/* Developer */}
                <span className="text-xs text-zinc-400 font-medium line-clamp-1 block">
                  by <span className="text-zinc-300 font-semibold">{daw.developer}</span>
                </span>
              </div>

              {/* Bottom Baseline Action */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
                <span className="text-xs font-bold text-zinc-400">
                  From ₹2,599
                </span>
                <span className="text-xs text-white group-hover:text-[#FA742B] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1 font-bold">
                  <span>Buy Now</span>
                  <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

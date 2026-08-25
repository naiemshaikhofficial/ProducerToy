'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function EpicSpotlightBanner() {
  return (
    <div className="w-full relative overflow-hidden rounded-none shadow-2xl aspect-[2008/783] bg-[#121212] flex flex-col justify-center select-none">
      {/* 100% Uncropped Full Banner Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/pt-banner.png?v=5"
          alt="World's Upcoming Platform For Music Production Toys"
          fill
          priority
          unoptimized
          className="object-contain object-center opacity-100"
        />
      </div>

      {/* Epic Games Store Overlay Text & Button Block (Exact Epic Typography & White Button) */}
      <div className="relative z-20 p-6 pl-[6%] sm:pl-[8%] lg:pl-[10%] max-w-[540px] flex flex-col items-center text-center sm:items-start sm:text-left gap-2.5 sm:gap-3">
        
        {/* Title Heading - Exact Epic Games Store Bold White */}
        <h2 className="text-[20px] sm:text-[26px] lg:text-[32px] font-bold text-white tracking-tight leading-[1.2] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] font-sans">
          World&apos;s Upcoming Platform For Music Production Toys
        </h2>

        {/* Subtitle / Description - Exact Epic Games Store Clean Light Text */}
        <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-white/95 font-medium leading-[1.45] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-[460px]">
          Explore elite VST plugins, analog saturators, sample packs, 808s, synth presets, and DAW tools with your favorite producers.
        </p>

        {/* "Play Now" Button - Pure White Button with Black Text (Exact Epic Games Store Style) */}
        <div className="mt-2 sm:mt-3">
          <Link
            href="/store"
            className="inline-flex items-center justify-center min-w-[160px] sm:min-w-[175px] h-[44px] sm:h-[48px] bg-white hover:bg-zinc-200 text-black font-bold text-[14px] sm:text-[15px] rounded-lg active:scale-95 transition-all shadow-xl tracking-wide font-sans cursor-pointer"
          >
            Play Now
          </Link>
        </div>
      </div>
    </div>
  )
}

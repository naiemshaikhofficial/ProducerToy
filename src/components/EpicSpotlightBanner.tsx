'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function EpicSpotlightBanner() {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl shadow-2xl aspect-[2008/783] bg-[#121212] flex flex-col justify-center select-none">
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

      {/* Epic Games Store Overlay Text & Button Block (Left-anchored block, centered content) */}
      <div className="relative z-20 p-6 pl-[8%] sm:pl-[10%] lg:pl-[12%] max-w-[560px] flex flex-col items-center text-center gap-2.5 sm:gap-3">
        
        {/* Title Heading - Electric Amber Gold */}
        <h2 className="text-[20px] sm:text-[26px] lg:text-[32px] font-extrabold text-amber-300 tracking-tight leading-[1.2] [text-shadow:_0_3px_16px_rgb(0_0_0_/_100%),_0_1px_4px_rgb(0_0_0_/_100%)] font-sans">
          World&apos;s Upcoming Platform For Music Production Toys
        </h2>

        {/* Subtitle / Description - Warm Cream White */}
        <p className="text-[12px] sm:text-[14px] lg:text-[15px] text-amber-100 font-medium leading-[1.45] [text-shadow:_0_2px_12px_rgb(0_0_0_/_100%),_0_1px_4px_rgb(0_0_0_/_100%)] max-w-[460px]">
          Explore elite VST plugins, analog saturators, sample packs, 808s, synth presets, and DAW tools with your favorite producers.
        </p>

        {/* "Play Now" Button - Centered inside text block & color-matched to Electric Amber Gold */}
        <div className="mt-2 sm:mt-3">
          <Link
            href="/store"
            className="inline-flex items-center justify-center min-w-[170px] sm:min-w-[185px] h-[46px] sm:h-[50px] bg-amber-300 text-black font-extrabold text-[14px] sm:text-[15px] rounded-[14px] hover:bg-amber-200 active:scale-95 transition-all shadow-xl tracking-wide font-sans"
          >
            Play Now
          </Link>
        </div>
      </div>
    </div>
  )
}

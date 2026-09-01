'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

export function ChooseYourDaw() {
  return (
    <section className="w-full my-6 sm:my-10 select-none font-sans">
      {/* Header Row with Subtitle */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
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
          <p className="text-xs text-zinc-400 mt-1">
            Buy your favourite DAWs from Producer Toy
          </p>
        </div>
      </div>

      {/* Pure Clickable Logo Item */}
      <div className="flex items-center gap-6 pt-1">
        <Link
          href="/daw/fl-studio"
          prefetch={true}
          className="group relative flex flex-col items-center gap-2 p-2.5 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer"
          title="FL Studio 26 by Image-Line"
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            {/* Ambient hover glow */}
            <div className="absolute inset-0 bg-[#FF6B00]/25 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <Image
              src="/images/daws/fl-studio.png"
              alt="FL Studio 26 by Image-Line"
              width={96}
              height={96}
              className="object-contain group-hover:scale-110 transition-transform duration-200 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
              priority
            />
          </div>
          <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
            FL Studio
          </span>
        </Link>
      </div>
    </section>
  )
}

'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'

export function EpicSpotlightBanner() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <div
      className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white flex flex-col sm:flex-row sm:items-center select-none shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-black/[0.08] sm:min-h-[420px] lg:min-h-[460px]"
      style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
    >
      {/* Background Mascot Looping Video (Centered on mobile, positioned center-right on desktop) */}
      <div
        className="relative w-full h-[220px] xs:h-[260px] sm:h-full sm:absolute sm:inset-0 z-0 overflow-hidden pointer-events-none select-none flex items-center justify-center"
      >
        <video
          ref={videoRef}
          src="/videos/homepage-showcase.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          className="w-full h-full object-contain pointer-events-none sm:translate-x-[8%]"
          style={{
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Subtle Soft White Fade on Desktop Left to Guarantee 100% Crisp Black Text */}
      <div className="hidden sm:block absolute inset-y-0 left-0 w-[44%] bg-gradient-to-r from-white via-white/85 to-transparent pointer-events-none z-10" />

      {/* Fainted Black Ambient Glow on Bottom for Subtle Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.03] pointer-events-none z-10" />

      {/* Text & Action Block - Fully Centered & Proportioned */}
      <div className="relative z-20 w-full p-5 sm:p-8 lg:p-10 pl-5 sm:pl-[6%] lg:pl-[7%] sm:max-w-[480px] flex flex-col items-center text-center gap-3 sm:gap-4 pointer-events-auto my-auto">

        {/* Multi-line Structured Heading - Center Aligned */}
        <h2 className="text-[22px] xs:text-[24px] sm:text-[30px] lg:text-[36px] font-black text-black tracking-tight leading-[1.1] font-sans text-center">
          <span className="block text-black">World&apos;s Upcoming Platform</span>
          <span className="block text-zinc-800 mt-0.5">For Music Producers</span>
          <span className="block text-[13px] xs:text-[14px] sm:text-[17px] lg:text-[20px] font-bold text-zinc-600 mt-1 sm:mt-1.5 tracking-normal">
            Tools, Plugins, Software, Preset and Sample Pack
          </span>
        </h2>

        {/* Clean Subtitle - Center Aligned */}
        <p className="text-[12px] sm:text-[13px] lg:text-[14px] text-zinc-700 font-medium leading-relaxed max-w-[380px] text-center">
          Explore elite VST plugins, analog saturators, sample packs, 808s, synth presets, and DAW tools with your favorite producers.
        </p>

        {/* "Browse Now" Button - Premium Standard Proportions (rounded-xl, 48px height, not an oval egg) */}
        <div className="pt-1.5 sm:pt-2 w-full flex justify-center">
          <Link
            href="/store"
            prefetch={true}
            className="inline-flex items-center justify-center px-8 sm:px-9 h-[46px] sm:h-[48px] bg-black hover:bg-zinc-800 text-white font-bold text-[13px] sm:text-[14px] rounded-xl active:scale-95 transition-all shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] tracking-wider uppercase cursor-pointer gap-2"
          >
            <span>Browse Now</span>
            <span className="text-[16px]">&rarr;</span>
          </Link>
        </div>

      </div>
    </div>
  )
}

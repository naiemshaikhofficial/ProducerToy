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
      className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white flex flex-col sm:flex-row sm:items-center select-none shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-black/[0.08] sm:min-h-[520px] lg:min-h-[580px]"
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

      {/* Text & Action Block - Fully Responsive on Mobile & Desktop */}
      <div className="relative z-20 w-full p-5 pt-1 sm:pt-10 sm:p-10 lg:p-14 pl-5 sm:pl-[6%] lg:pl-[7%] sm:max-w-[480px] flex flex-col items-start text-left gap-2.5 sm:gap-4 pointer-events-auto">
        
        {/* Eyebrow Badge - High Contrast, Properly Spaced Dot */}
        <span className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 animate-pulse" />
          Platform Spotlight
        </span>

        {/* Multi-line Structured Heading with High Contrast Hierarchy */}
        <h2 className="text-[22px] xs:text-[24px] sm:text-[32px] lg:text-[38px] font-black text-black tracking-tight leading-[1.08] font-sans">
          <span className="block text-black">World&apos;s Upcoming Platform</span>
          <span className="block text-zinc-800 mt-0.5">For Music Producers</span>
          <span className="block text-[13px] xs:text-[14px] sm:text-[18px] lg:text-[21px] font-bold text-zinc-600 mt-1 sm:mt-1.5 tracking-normal">
            Tools, Plugins, Software, Preset and Sample Pack
          </span>
        </h2>

        {/* Clean Subtitle - High Contrast & Clearly Visible */}
        <p className="text-[12px] sm:text-[14px] lg:text-[15px] text-zinc-700 font-medium leading-relaxed max-w-[380px]">
          Explore elite VST plugins, analog saturators, sample packs, 808s, synth presets, and DAW tools with your favorite producers.
        </p>

        {/* "Browse Now" Button - Compact, Chunky Pill (Not flat, not overly wide) */}
        <div className="pt-2 sm:pt-3 w-full max-w-[380px] flex justify-center">
          <Link
            href="/store"
            prefetch={true}
            className="inline-flex items-center justify-center min-w-[170px] sm:min-w-[190px] h-[50px] sm:h-[54px] px-8 bg-black hover:bg-zinc-800 text-white font-extrabold text-[13px] sm:text-[14px] rounded-full active:scale-95 transition-all shadow-[0_12px_28px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/10 tracking-wider uppercase cursor-pointer gap-2.5"
          >
            <span>Browse Now</span>
            <span className="text-[17px]">&rarr;</span>
          </Link>
        </div>

      </div>
    </div>
  )
}

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
      className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] bg-white flex items-center select-none shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/[0.08]"
      style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
    >
      {/* Background Mascot Looping Video (Positioned to center-right so left side stays completely open for text) */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}
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
          className="w-full h-full object-contain pointer-events-none"
          style={{
            position: 'absolute',
            top: '50%',
            left: '58%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Subtle Soft White Gradient on Left to Guarantee 100% Crisp Black Text */}
      <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />

      {/* Text & Action Block - Strictly Confined to Left Side */}
      <div className="relative z-20 p-6 sm:p-10 lg:p-14 pl-6 sm:pl-[6%] lg:pl-[7%] max-w-[480px] w-full flex flex-col items-start text-left gap-3 sm:gap-4 pointer-events-auto">
        
        {/* Eyebrow Badge */}
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
          Platform Spotlight
        </span>

        {/* Multi-line Structured Heading (Stacked vertically, never enters the mascot) */}
        <h2 className="text-[24px] sm:text-[32px] lg:text-[38px] font-black text-black tracking-tight leading-[1.08] font-sans">
          <span className="block text-black">World&apos;s Upcoming Platform</span>
          <span className="block text-zinc-900 mt-0.5">For Music Producers</span>
          <span className="block text-[15px] sm:text-[18px] lg:text-[21px] font-bold text-zinc-600 mt-1 sm:mt-1.5 tracking-normal">
            Tools, Plugins, Software, Preset and Sample Pack
          </span>
        </h2>

        {/* Clean Subtitle */}
        <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-zinc-700 font-medium leading-relaxed max-w-[380px]">
          Explore elite VST plugins, analog saturators, sample packs, 808s, synth presets, and DAW tools with your favorite producers.
        </p>

        {/* Big, Wide "Browse Now" Button */}
        <div className="pt-1 sm:pt-2 w-full">
          <Link
            href="/store"
            prefetch={true}
            className="inline-flex items-center justify-center w-full max-w-[220px] sm:max-w-[260px] lg:max-w-[280px] h-[48px] sm:h-[54px] lg:h-[58px] bg-black hover:bg-zinc-800 text-white font-extrabold text-[14px] sm:text-[15px] lg:text-[16px] rounded-xl active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] tracking-wider uppercase cursor-pointer gap-2"
          >
            <span>Browse Now</span>
            <span className="text-[18px]">&rarr;</span>
          </Link>
        </div>

      </div>
    </div>
  )
}

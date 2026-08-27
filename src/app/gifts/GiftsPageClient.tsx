'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type GiftTab = 'all' | 'unopened' | 'received' | 'sent'

const TABS: { id: GiftTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unopened', label: 'Unopened' },
  { id: 'received', label: 'Received' },
  { id: 'sent', label: 'Sent' },
]

export function GiftsPageClient() {
  const [activeTab, setActiveTab] = useState<GiftTab>('all')

  const getEmptyHeading = () => {
    switch (activeTab) {
      case 'unopened':
        return 'No Unopened Gifts'
      case 'received':
        return 'No Received Gifts'
      case 'sent':
        return 'No Sent Gifts'
      default:
        return 'No Received or Sent Gifts'
    }
  }

  const getEmptySubtitle = () => {
    switch (activeTab) {
      case 'unopened':
        return 'Unclaimed sound kits and plugins will appear here.'
      case 'received':
        return 'Plugins and sound packs gifted to you will show up here.'
      case 'sent':
        return 'Gifts you have sent to fellow producers will appear here.'
      default:
        return 'Sound kits and plugins gifted to you will show up here.'
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans select-none pb-28">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* ========================================================================= */}
        {/* 1. TOP TITLE HEADER (Exact 1:1 Match)                                     */}
        {/* ========================================================================= */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
            Gifts
          </h1>

          {/* Filter Tabs: All, Unopened, Received, Sent */}
          <div className="border-b border-[#202020]">
            <div className="flex items-center gap-6 sm:gap-8 text-sm font-semibold overflow-x-auto custom-scrollbar">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3.5 relative transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-zinc-400 hover:text-white font-normal'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. GIFTS CONTAINER CARD (Exact Screenshot 1 & 2 1:1 Match)                */}
        {/* ========================================================================= */}
        <div className="mt-6 sm:mt-8 bg-[#181818] border border-[#242424] rounded-2xl sm:rounded-3xl min-h-[380px] sm:min-h-[480px] p-8 sm:p-14 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
          
          {/* Subtle Starburst Sparkle Background Glow Effect */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
            <div className="w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-[#FA742B]/15 rounded-full blur-[90px]" />
          </div>

          {/* Stylized Neon Gift Icon with ProducerToy Orange Glow */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Gift Icon Box */}
            <div className="relative mb-5 flex items-center justify-center">
              <svg
                className="w-20 h-20 sm:w-24 sm:h-24 text-[#FA742B] transition-transform duration-300 hover:scale-105"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Gift Box Top Lid / Ribbon Bow */}
                <path
                  d="M24 16C24 12.6863 26.6863 10 30 10C32.5 10 32 18 32 18C32 18 31.5 10 34 10C37.3137 10 40 12.6863 40 16C40 19.3137 32 19 32 19C32 19 24 19.3137 24 16Z"
                  stroke="#FA742B"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Box Top Lid */}
                <rect
                  x="14"
                  y="19"
                  width="36"
                  height="8"
                  rx="3"
                  stroke="#FA742B"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Box Body Bottom */}
                <path
                  d="M18 27V48C18 50.2091 19.7909 52 22 52H42C44.2091 52 46 50.2091 46 48V27"
                  stroke="#FA742B"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Center Vertical Ribbon */}
                <line
                  x1="32"
                  y1="19"
                  x2="32"
                  y2="52"
                  stroke="#FA742B"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                {/* Accent Ribbon Stripe */}
                <line
                  x1="26"
                  y1="27"
                  x2="26"
                  y2="52"
                  stroke="#FA742B"
                  strokeWidth="1.5"
                  strokeDasharray="2 3"
                  strokeOpacity="0.4"
                />
                <line
                  x1="38"
                  y1="27"
                  x2="38"
                  y2="52"
                  stroke="#FA742B"
                  strokeWidth="1.5"
                  strokeDasharray="2 3"
                  strokeOpacity="0.4"
                />
              </svg>

              {/* Surrounding Accent Dots / Sparkles */}
              <div className="absolute -top-2 -left-3 w-1.5 h-1.5 rounded-full bg-[#FA742B]/70" />
              <div className="absolute top-2 -right-4 w-2 h-2 rounded-full bg-[#FA742B]/80" />
              <div className="absolute -bottom-2 -right-2 w-1.5 h-1.5 rounded-full bg-[#FA742B]/60" />
              <div className="absolute bottom-1 -left-4 w-2 h-2 rounded-full bg-[#FA742B]/70" />
            </div>

            {/* Empty Heading */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {getEmptyHeading()}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-sm">
              {getEmptySubtitle()}
            </p>

            {/* Orange CTA Button (Exact Screenshot Match: Browse Sounds / Browse Tools) */}
            <Link
              href="/store"
              prefetch={true}
              className="mt-6 sm:mt-7 bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#FA742B]/20 active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Browse Sound Kits & Plugins</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

        </div>

      </div>
    </div>
  )
}

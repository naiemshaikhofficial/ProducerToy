'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface FreeCategoryItem {
  id: string
  name: string
  slug: string
  exploreUrl: string
  subcategories: {
    name: string
    href: string
  }[]
}

interface FreeMegaMenuProps {
  isOpen: boolean
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const FREE_CATEGORIES_DATA: FreeCategoryItem[] = [
  {
    id: 'free-vst',
    name: 'Free VSTs & Plugins',
    slug: 'free-vst',
    exploreUrl: '/free-vst-plugins',
    subcategories: [
      { name: 'Show All Free VSTs', href: '/free-vst-plugins' },
      { name: 'Virtual Synthesizers', href: '/free-vst-plugins?type=synthesizer' },
      { name: 'Dynamic EQs', href: '/free-vst-plugins?type=eq' },
      { name: 'Tape Saturators', href: '/free-vst-plugins?type=saturation' },
      { name: 'Space Reverbs', href: '/free-vst-plugins?type=reverb' },
      { name: 'Analog Delays', href: '/free-vst-plugins?type=delay' },
      { name: 'Vocal Pitch Shifters', href: '/free-vst-plugins?type=vocal' },
      { name: 'Bus Compressors', href: '/free-vst-plugins?type=compressor' },
      { name: 'Guitar Amp Sims', href: '/free-vst-plugins?type=amps' },
      { name: 'Stereo Expanders', href: '/free-vst-plugins?type=stereo' },
      { name: 'Mastering Limiters', href: '/free-vst-plugins?type=mastering' },
      { name: 'Chorus & Modulation', href: '/free-vst-plugins?type=modulation' },
      { name: 'Bitcrushers & Distortion', href: '/free-vst-plugins?type=distortion' },
      { name: 'Filter & Utility Tools', href: '/free-vst-plugins?type=filter' },
    ],
  },
  {
    id: 'free-samples',
    name: 'Free Samples & Loops',
    slug: 'free-samples',
    exploreUrl: '/store/sounds?price=free',
    subcategories: [
      { name: 'Show All Free Samples', href: '/store/sounds?price=free' },
      { name: 'Trap Drum Kits', href: '/store/sounds?price=free&cat=trap-drums' },
      { name: '808 Bass One-Shots', href: '/store/sounds?price=free&cat=808-bass' },
      { name: 'Hip-Hop Melody Loops', href: '/store/sounds?price=free&cat=melody-loops' },
      { name: 'Drill Hi-Hat Patterns', href: '/store/sounds?price=free&cat=drum-kits' },
      { name: 'Vintage Lofi Keys', href: '/store/sounds?price=free&cat=sample-packs' },
      { name: 'Vocal Chops & Hooks', href: '/store/sounds?price=free&cat=vocal' },
      { name: 'Boom Bap Drums', href: '/store/sounds?price=free&cat=drum-kits' },
      { name: 'Cinematic FX & Risers', href: '/store/sounds?price=free&cat=sounds' },
      { name: 'Guitar & R&B Stems', href: '/store/sounds?price=free&cat=sample-packs' },
      { name: 'MIDI Chord Progressions', href: '/store/sounds?price=free&cat=midi' },
    ],
  },
  {
    id: 'free-presets',
    name: 'Free Synth Presets',
    slug: 'free-presets',
    exploreUrl: '/store/presets?price=free',
    subcategories: [
      { name: 'Show All Free Presets', href: '/store/presets?price=free' },
      { name: 'Serum Dark Trap Presets', href: '/store/presets?price=free&type=serum' },
      { name: 'Vital Wavetable Soundbanks', href: '/store/presets?price=free&type=vital' },
      { name: 'Phase Plant Patches', href: '/store/presets?price=free&type=phase-plant' },
      { name: 'Massive Synth Presets', href: '/store/presets?price=free&type=massive' },
      { name: 'Sylenth1 Leads & Plucks', href: '/store/presets?price=free&type=sylenth1' },
      { name: 'Analog Brass & Keys', href: '/store/presets?price=free&type=analog' },
      { name: '808 Sub-Bass Presets', href: '/store/presets?price=free&type=808' },
    ],
  },
  {
    id: 'free-templates',
    name: 'Free DAW Templates',
    slug: 'free-templates',
    exploreUrl: '/store/templates?price=free',
    subcategories: [
      { name: 'Show All Free Templates', href: '/store/templates?price=free' },
      { name: 'FL Studio Trap Templates', href: '/store/templates?price=free&daw=fl-studio' },
      { name: 'Ableton Live Mixing Racks', href: '/store/templates?price=free&daw=ableton' },
      { name: 'Logic Pro Mastering Chains', href: '/store/templates?price=free&daw=logic' },
      { name: 'Vocal Chain Templates', href: '/store/templates?price=free&daw=vocal-chain' },
      { name: 'Drum Bus Routing Sessions', href: '/store/templates?price=free&daw=drum-bus' },
    ],
  },
]

export const FreeMegaMenu: React.FC<FreeMegaMenuProps> = ({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('free-vst')

  if (!isOpen) return null

  const currentCategory =
    FREE_CATEGORIES_DATA.find((c) => c.slug === activeCategorySlug) ||
    FREE_CATEGORIES_DATA[0]

  const categoryLabel = currentCategory?.name || 'Free Soundware'

  return (
    <div
      className="absolute top-full left-0 w-full bg-[#121212] shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 border-b border-[#202020]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave || onClose}
    >
      <div className="max-w-7xl mx-auto px-8 py-8 flex gap-12">
        
        {/* Left Side Category Navigation Tabs */}
        <div className="w-56 flex flex-col gap-1 border-r border-[#202020] pr-6">
          {FREE_CATEGORIES_DATA.map((cat) => {
            const isActive = activeCategorySlug === cat.slug
            return (
              <button
                key={cat.id}
                onMouseEnter={() => setActiveCategorySlug(cat.slug)}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#262626] text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                <span>{cat.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-white" />}
              </button>
            )
          })}
        </div>

        {/* Right Side Subcategory Links Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between border-b border-[#202020] pb-4 mb-6">
            <h3 className="text-white text-base font-bold tracking-wide uppercase">
              {categoryLabel} Catalog
            </h3>
            <Link
              href={currentCategory.exploreUrl}
              prefetch={true}
              onClick={onClose}
              className="text-xs font-semibold text-zinc-400 hover:text-white underline transition-colors"
            >
              Explore all {categoryLabel} →
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-x-6 gap-y-2.5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {currentCategory.subcategories.map((item, idx) => {
              const isShowAll = item.name.startsWith('Show All')
              return (
                <Link
                  key={idx}
                  href={item.href}
                  prefetch={true}
                  onClick={onClose}
                  className={`text-sm transition-colors py-1 truncate block ${
                    isShowAll
                      ? 'text-white font-bold hover:underline'
                      : 'text-zinc-400 hover:text-white font-normal'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

export default FreeMegaMenu

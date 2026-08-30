'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Sparkles, SlidersHorizontal, ArrowRight, Building2 } from 'lucide-react'

interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
}

interface ManufacturersClientProps {
  initialBrands: Brand[]
}

const ALPHABET = ['ALL', '0-9', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]

export default function ManufacturersClient({ initialBrands }: ManufacturersClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState('ALL')
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({})

  const handleImageError = (brandId: string) => {
    setFailedLogos((prev) => ({ ...prev, [brandId]: true }))
  }

  // Filter brands based on search query & selected letter
  const filteredBrands = useMemo(() => {
    return initialBrands.filter((brand) => {
      const nameLower = brand.name.toLowerCase()
      const matchesSearch = nameLower.includes(searchQuery.toLowerCase().trim())

      if (!matchesSearch) return false

      if (selectedLetter === 'ALL') return true

      if (selectedLetter === '0-9') {
        const firstChar = brand.name.trim().charAt(0)
        return /[0-9]/.test(firstChar)
      }

      const firstLetter = brand.name.trim().charAt(0).toUpperCase()
      return firstLetter === selectedLetter
    })
  }, [initialBrands, searchQuery, selectedLetter])

  return (
    <div className="w-full min-h-screen bg-[#121212] pb-24 text-white">
      {/* Top Hero Section Header matching Epic Store Aesthetic - Unified Seamless Layout */}
      <div className="w-full bg-[#121212] pt-8 md:pt-12 pb-6">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-3">
            Plugin Manufacturers & Brands
          </h1>
          
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl text-center leading-relaxed font-normal">
            Explore software tools, VST plugins, sample packs, and synth presets from over {initialBrands.length || 300}+ premier audio developers worldwide.
          </p>

          {/* Search Box Styled Compactly like Header Search Pill */}
          <div className="w-full max-w-md mt-6 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manufacturer or brand..."
              className="w-full bg-[#202020] hover:bg-[#282828] focus:bg-[#282828] text-white placeholder-zinc-400 text-xs sm:text-sm pl-10 pr-10 h-[40px] rounded-full border border-[#2e2e2e] focus:border-zinc-500 focus:outline-none transition-all shadow-md font-normal"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-[#333333] text-zinc-300 hover:text-white px-2 py-0.5 rounded-full transition-colors font-semibold"
              >
                Clear
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Sleek Minimalist Alphabet Bar - ALL, 0-9 & A to Z with Proper Breathing Room Circles */}
        <div className="w-full bg-[#181818] py-2 px-2 sm:px-3 rounded-full border border-[#242424] mb-8">
          <div className="flex items-center justify-between gap-1 w-full overflow-x-auto scrollbar-none">
            {ALPHABET.map((letter) => {
              const isActive = selectedLetter === letter
              const isLong = letter.length > 1

              return (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`h-7 sm:h-8 text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center rounded-full shrink-0 ${
                    isLong ? 'px-2.5 sm:px-3' : 'w-7 sm:w-8 aspect-square'
                  } ${
                    isActive
                      ? 'bg-white text-black font-black shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-[#262626]'
                  }`}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Counter & Filter Reset Info */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#202020]">
          <span className="text-sm font-normal text-zinc-400">
            Showing <strong className="text-white font-bold">{filteredBrands.length}</strong> {filteredBrands.length === 1 ? 'Manufacturer' : 'Manufacturers'}
            {selectedLetter !== 'ALL' && <span className="ml-1 text-white font-bold">(Letter "{selectedLetter}")</span>}
            {searchQuery && <span className="ml-1 text-white font-bold">(Search: "{searchQuery}")</span>}
          </span>

          {(selectedLetter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedLetter('ALL')
                setSearchQuery('')
              }}
              className="text-xs text-zinc-400 hover:text-white font-medium underline underline-offset-4"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Brands Grid */}
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBrands.map((brand) => {
              const hasLogo = brand.logo_url && !failedLogos[brand.id]

              return (
                <Link
                  key={brand.id}
                  href={`/manufacturers/${brand.slug}`}
                  prefetch={true}
                  className="group relative bg-[#161616] hover:bg-[#1f1f1f] rounded-2xl p-5 flex flex-col items-center justify-between transition-all duration-200 overflow-hidden min-h-[140px]"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                  {/* Logo Direct Container - Seamless Without Inner Box */}
                  <div className="w-full h-16 flex items-center justify-center p-1 mb-3">
                    {hasLogo ? (
                      <img
                        src={brand.logo_url!}
                        alt={`${brand.name} logo`}
                        onError={() => handleImageError(brand.id)}
                        className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 group-hover:brightness-110 transition-all duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-white transition-colors">
                        <Building2 className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wider">{brand.name.slice(0, 2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Brand Name */}
                  <div className="w-full text-center">
                    <span className="text-xs sm:text-sm font-bold text-zinc-300 group-hover:text-white transition-colors truncate block">
                      {brand.name}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="w-full bg-[#161616] border border-[#262626] rounded-2xl py-16 px-4 text-center my-8">
            <SlidersHorizontal className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Manufacturers Found</h3>
            <p className="text-sm text-zinc-400 mb-6">
              We couldn't find any brand matching your search or letter filter.
            </p>
            <button
              onClick={() => {
                setSelectedLetter('ALL')
                setSearchQuery('')
              }}
              className="bg-white hover:bg-zinc-200 text-black text-xs font-extrabold uppercase px-6 py-3 rounded-full transition-colors shadow-lg"
            >
              Show All Manufacturers
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

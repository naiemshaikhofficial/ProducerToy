'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { COUNTRY_PHONE_DATA, CountryPhoneData } from './countryPhoneData'

interface CustomCountrySelectProps {
  value: string
  onChange: (countryName: string) => void
  error?: boolean
  placeholder?: string
}

function CountryFlagIcon({ code, name }: { code: string; name: string }) {
  const [src, setSrc] = useState(
    `https://purecatamphetamine.github.io/country-flag-icons/3x2/${code.toUpperCase()}.svg`
  )

  useEffect(() => {
    setSrc(`https://purecatamphetamine.github.io/country-flag-icons/3x2/${code.toUpperCase()}.svg`)
  }, [code])

  return (
    <img
      src={src}
      alt={name || code}
      className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm flex-shrink-0 bg-zinc-800"
      onError={() => {
        setSrc(`https://flagcdn.com/w40/${code.toLowerCase()}.png`)
      }}
    />
  )
}

export function CustomCountrySelect({
  value,
  onChange,
  error,
  placeholder = 'Select Country',
}: CustomCountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Find currently selected country by name or code (strictly null when unselected)
  const selectedCountry =
    value && value.trim()
      ? COUNTRY_PHONE_DATA.find(
          (c) =>
            c.name.toLowerCase() === value.trim().toLowerCase() ||
            c.code.toLowerCase() === value.trim().toLowerCase()
        )
      : null

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    } else {
      setSearch('')
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (country: CountryPhoneData) => {
    onChange(country.name)
    setIsOpen(false)
  }

  const filteredCountries = COUNTRY_PHONE_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Control Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 bg-[#161616] border rounded-lg flex items-center justify-between px-3.5 transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] cursor-pointer select-none text-left ${
          error
            ? 'border-red-500/70 bg-red-950/10'
            : isOpen
            ? 'border-zinc-400 ring-1 ring-zinc-500/20'
            : 'border-[#262626] hover:border-[#383838]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedCountry ? (
            <>
              <CountryFlagIcon code={selectedCountry.code} name={selectedCountry.name} />
              <span className="text-xs font-medium text-white truncate">
                {selectedCountry.name}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-zinc-500">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Floating Dark Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full bg-[#141414] border border-[#242424] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.85)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Search Box */}
          <div className="p-2.5 border-b border-[#222222] bg-[#161616]">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full h-8 bg-[#1f1f1f] border border-[#2e2e2e] focus:border-zinc-400 rounded-lg pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Country List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-[#202020]">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No countries found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry?.code === c.code
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#222222] text-white font-bold'
                        : 'hover:bg-[#1a1a1a] text-zinc-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CountryFlagIcon code={c.code} name={c.name} />
                      <span className="text-xs truncate font-medium">{c.name}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white flex-shrink-0 ml-2" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

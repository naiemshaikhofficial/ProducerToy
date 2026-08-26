'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { COUNTRY_PHONE_DATA, CountryPhoneData } from './countryPhoneData'

interface CustomPhoneInputProps {
  value: string
  onChange: (fullPhone: string) => void
  error?: boolean
  defaultCountryCode?: string
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

export function CustomPhoneInput({
  value,
  onChange,
  error,
  defaultCountryCode = 'IN',
}: CustomPhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<CountryPhoneData>(() => {
    // Attempt to detect from value prefix
    const matched = COUNTRY_PHONE_DATA.find((c) => value.startsWith(c.dialCode))
    if (matched) return matched
    return (
      COUNTRY_PHONE_DATA.find((c) => c.code === defaultCountryCode) ||
      COUNTRY_PHONE_DATA[0]
    )
  })

  const [rawNumber, setRawNumber] = useState(() => {
    if (!value) return ''
    if (value.startsWith(selectedCountry.dialCode)) {
      return value.slice(selectedCountry.dialCode.length).trim()
    }
    return value.replace(/^\+\d+\s*/, '').trim()
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Sync state if external value changes significantly
  useEffect(() => {
    if (!value) {
      setRawNumber('')
      return
    }
    const matched = COUNTRY_PHONE_DATA.find((c) => value.startsWith(c.dialCode))
    if (matched && matched.code !== selectedCountry.code) {
      setSelectedCountry(matched)
      setRawNumber(value.slice(matched.dialCode.length).trim())
    }
  }, [value])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    } else {
      setSearch('')
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle country selection
  const handleSelectCountry = (country: CountryPhoneData) => {
    setSelectedCountry(country)
    setIsOpen(false)
    const cleanDigits = rawNumber.replace(/\D/g, '')
    const full = cleanDigits ? `${country.dialCode} ${cleanDigits}` : ''
    onChange(full)
  }

  // Handle number typing
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    const cleanDigits = inputVal.replace(/\D/g, '')
    setRawNumber(cleanDigits)
    const full = cleanDigits ? `${selectedCountry.dialCode} ${cleanDigits}` : ''
    onChange(full)
  }

  const filteredCountries = COUNTRY_PHONE_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Outer Container */}
      <div
        className={`w-full h-10 bg-[#161616] border rounded-lg flex items-center px-3 transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] ${
          error
            ? 'border-red-500/70 bg-red-950/10'
            : isOpen
            ? 'border-zinc-400 ring-1 ring-zinc-500/20'
            : 'border-[#262626] hover:border-[#383838]'
        }`}
      >
        {/* Country Selector Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 pr-2.5 border-r border-[#262626] text-xs font-semibold text-white hover:text-zinc-200 transition-colors cursor-pointer select-none"
        >
          <CountryFlagIcon code={selectedCountry.code} name={selectedCountry.name} />
          <span className="text-zinc-300 font-medium text-xs tracking-tight">{selectedCountry.dialCode}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {/* Number Input Field */}
        <input
          type="tel"
          placeholder="Mobile number"
          value={rawNumber}
          onChange={handleNumberChange}
          className="flex-1 h-full bg-transparent text-white text-xs px-3 outline-none placeholder:text-zinc-500 font-medium"
        />
      </div>

      {/* Sleek Epic Games Dark Theme Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-[#141414] border border-[#242424] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.85)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Search Box */}
          <div className="p-2.5 border-b border-[#222222] bg-[#161616]">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code..."
                className="w-full h-8 bg-[#1f1f1f] border border-[#2e2e2e] focus:border-zinc-400 rounded-lg pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Country Items List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-[#222222]">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No countries found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
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

                    <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                      <span className="text-xs text-zinc-500 font-mono font-medium">
                        {c.dialCode}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />
                      )}
                    </div>
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

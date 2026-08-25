'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'

export interface FilterOption {
  id: string
  name: string
  slug?: string
  count?: number
}

interface CategoryFilterBarProps {
  categories?: FilterOption[]
  brands?: FilterOption[]
  activeCategory?: string
  activeBrand?: string
  activePrice?: string
  activeSort?: string
}

const PRICE_RANGES = [
  { id: 'free', name: 'Free ($0)' },
  { id: '0-10', name: 'Under $10' },
  { id: '10-29', name: '$10 to $29' },
  { id: '29-49', name: '$29 to $49' },
  { id: '49-99', name: '$49 to $99' },
  { id: '99-plus', name: '$99 and above' },
]

const SORT_OPTIONS = [
  { id: 'popularity', name: 'Popularity' },
  { id: 'price-low', name: 'Price (Low to High)' },
  { id: 'price-high', name: 'Price (High to Low)' },
  { id: 'newest', name: 'Newest Additions' },
]

export function CategoryFilterBar({
  categories = [],
  brands = [],
  activeCategory = '',
  activeBrand = '',
  activePrice = '',
  activeSort = 'popularity',
}: CategoryFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [openDropdown, setOpenDropdown] = useState<'category' | 'brand' | 'price' | 'sort' | null>(null)
  
  // Local state for selected items
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    activeCategory ? activeCategory.split(',') : []
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    activeBrand ? activeBrand.split(',') : []
  )
  const [selectedPrice, setSelectedPrice] = useState<string>(activePrice || '')
  const [selectedSort, setSelectedSort] = useState<string>(activeSort || 'popularity')

  const containerRef = useRef<HTMLDivElement>(null)

  // Robust click & touch outside detection
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent | TouchEvent | PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    document.addEventListener('pointerdown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('pointerdown', handleOutsideClick)
    }
  }, [])

  // Update query params
  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
    setOpenDropdown(null)
  }

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleBrand = (id: string) => {
    setSelectedBrands(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  return (
    <div ref={containerRef} className="relative flex flex-wrap items-center justify-between gap-4 py-1 text-xs select-none">
      
      {/* Left Filter Buttons: Category, Brand, Price */}
      <div className="flex items-center gap-3 flex-wrap">
        
        {/* 1. Category Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all cursor-pointer ${
              openDropdown === 'category' || selectedCategories.length > 0
                ? 'bg-[#282828] text-white font-bold'
                : 'bg-[#1c1c1c] text-zinc-300 hover:bg-[#242424] hover:text-white'
            }`}
          >
            <span>Category {selectedCategories.length > 0 && `(${selectedCategories.length})`}</span>
            {openDropdown === 'category' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-300" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
          </button>

          {openDropdown === 'category' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-[#181818] border border-zinc-800 rounded-xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {categories.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-2 text-center">No categories found</p>
                ) : (
                  categories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id) || selectedCategories.includes(cat.slug || '')
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(cat.slug || cat.id)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-zinc-300 hover:bg-[#252525] hover:text-white cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isChecked ? 'bg-[#FC6301] border-[#FC6301] text-white' : 'border-zinc-600 bg-[#202020]'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs">{cat.name}</span>
                        </div>
                        {cat.count !== undefined && cat.count > 0 && (
                          <span className="text-[11px] text-zinc-500">({cat.count})</span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories([])
                    applyFilter('cat', '')
                  }}
                  className="px-4 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => applyFilter('cat', selectedCategories.join(','))}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-[#303030] hover:bg-[#FC6301] rounded-full transition-colors cursor-pointer shadow-md"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Brand Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'brand' ? null : 'brand')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all cursor-pointer ${
              openDropdown === 'brand' || selectedBrands.length > 0
                ? 'bg-[#282828] text-white font-bold'
                : 'bg-[#1c1c1c] text-zinc-300 hover:bg-[#242424] hover:text-white'
            }`}
          >
            <span>Brand {selectedBrands.length > 0 && `(${selectedBrands.length})`}</span>
            {openDropdown === 'brand' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-300" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
          </button>

          {openDropdown === 'brand' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-[#181818] border border-zinc-800 rounded-xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {brands.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-2 text-center">No brands found</p>
                ) : (
                  brands.map((b) => {
                    const isChecked = selectedBrands.includes(b.id) || selectedBrands.includes(b.slug || '')
                    return (
                      <div
                        key={b.id}
                        onClick={() => toggleBrand(b.slug || b.id)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-zinc-300 hover:bg-[#252525] hover:text-white cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isChecked ? 'bg-[#FC6301] border-[#FC6301] text-white' : 'border-zinc-600 bg-[#202020]'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs">{b.name}</span>
                        </div>
                        {b.count !== undefined && b.count > 0 && (
                          <span className="text-[11px] text-zinc-500">({b.count})</span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrands([])
                    applyFilter('brand', '')
                  }}
                  className="px-4 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => applyFilter('brand', selectedBrands.join(','))}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-[#303030] hover:bg-[#FC6301] rounded-full transition-colors cursor-pointer shadow-md"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Price Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all cursor-pointer ${
              openDropdown === 'price' || selectedPrice
                ? 'bg-[#282828] text-white font-bold'
                : 'bg-[#1c1c1c] text-zinc-300 hover:bg-[#242424] hover:text-white'
            }`}
          >
            <span>Price {selectedPrice && `(${PRICE_RANGES.find(p => p.id === selectedPrice)?.name})`}</span>
            {openDropdown === 'price' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-300" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
          </button>

          {openDropdown === 'price' && (
            <div className="absolute top-full left-0 mt-2 w-60 bg-[#181818] border border-zinc-800 rounded-xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {PRICE_RANGES.map((pr) => {
                  const isChecked = selectedPrice === pr.id
                  return (
                    <div
                      key={pr.id}
                      onClick={() => setSelectedPrice(isChecked ? '' : pr.id)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-zinc-300 hover:bg-[#252525] hover:text-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isChecked ? 'bg-[#FC6301] border-[#FC6301] text-white' : 'border-zinc-600 bg-[#202020]'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs">{pr.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPrice('')
                    applyFilter('price', '')
                  }}
                  className="px-4 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => applyFilter('price', selectedPrice)}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-[#303030] hover:bg-[#FC6301] rounded-full transition-colors cursor-pointer shadow-md"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Right Sort Dropdown: Popularity */}
      <div className="relative flex items-center gap-2">
        <span className="font-medium text-zinc-400">Sort by:</span>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer font-bold ${
            openDropdown === 'sort'
              ? 'bg-[#282828] text-white'
              : 'bg-[#1c1c1c] text-white hover:bg-[#242424]'
          }`}
        >
          <span>{SORT_OPTIONS.find(s => s.id === selectedSort)?.name || 'Popularity'}</span>
          {openDropdown === 'sort' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-300" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
        </button>

        {openDropdown === 'sort' && (
          <div className="absolute top-full right-0 mt-2 w-52 bg-[#181818] border border-zinc-800 rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {SORT_OPTIONS.map((opt) => {
              const isSelected = selectedSort === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedSort(opt.id)
                    applyFilter('sort', opt.id)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected ? 'bg-[#FC6301] text-white font-bold' : 'text-zinc-300 hover:bg-[#252525] hover:text-white'
                  }`}
                >
                  <span>{opt.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

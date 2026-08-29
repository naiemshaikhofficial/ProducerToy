'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react'
import { Product, ProductCard } from '@/components/ProductCard'

export interface FilterOption {
  id: string
  name: string
  slug: string
  logo_url?: string | null
}

interface EpicStoreBrowserProps {
  products: Product[]
  categories: FilterOption[]
  brands: FilterOption[]
  activeCategorySlug?: string
  activeSubTypeSlug?: string
  activeBrandSlug?: string
  activeQuery?: string
  activeSort?: string
  isDealsActive?: boolean
  isFreeActive?: boolean
  isBundlesActive?: boolean
  isRentActive?: boolean
  activePriceTier?: string
  headerTitle?: string
  headerDescription?: string
}

const SORT_OPTIONS = [
  { id: 'popularity', label: 'All (Popular)' },
  { id: 'newest', label: 'New Release' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
]

const PRICE_TIERS = [
  { id: 'free', label: 'Free' },
  { id: 'under-10', label: 'Under ₹750.00', maxUsd: 10 },
  { id: 'under-25', label: 'Under ₹1,500.00', maxUsd: 25 },
  { id: 'under-50', label: 'Under ₹2,250.00', maxUsd: 50 },
  { id: '50-plus', label: '₹2,250.00 and above', minUsd: 50 },
  { id: 'discounted', label: 'Discounted' },
]

const PRODUCT_TYPES = [
  { id: 'plugin', label: 'Audio Plugins (VST)', slug: 'plugins' },
  { id: 'sample_pack', label: 'Sample Packs & Sounds', slug: 'sounds' },
  { id: 'preset', label: 'Synth Presets', slug: 'presets' },
  { id: 'template', label: 'DAW Templates', slug: 'templates' },
  { id: 'bundle', label: 'Bundles & Suites', slug: 'bundles' },
]

const BASE_GENRES = [
  { id: 'reverb', label: 'Reverb' },
  { id: 'delay', label: 'Delay & Echo' },
  { id: 'compressor', label: 'Compressor' },
  { id: 'saturation', label: 'Saturation & Warmth' },
  { id: 'eq', label: 'Equalizer (EQ)' },
  { id: 'distortion', label: 'Distortion & Overdrive' },
  { id: 'synth', label: 'Synthesizer VST' },
  { id: 'vocal', label: 'Vocal Processor' },
  { id: '808', label: '808 & Bass' },
  { id: 'drum-kit', label: 'Drum Kit & Loops' },
  { id: 'mastering', label: 'Mastering Suite' },
  { id: 'guitar', label: 'Guitar & Amps' },
  { id: 'hip-hop', label: 'Hip Hop & Trap' },
  { id: 'edm', label: 'EDM & Dance' },
  { id: 'cinematic', label: 'Cinematic & Ambient' },
]

const PLATFORMS = [
  { id: 'windows', label: 'Windows (VST3 / 64-Bit)' },
  { id: 'macos', label: 'Mac OS (AU / Apple Silicon)' },
  { id: 'aax', label: 'AAX (Pro Tools)' },
  { id: 'wav', label: 'WAV (24-Bit Audio)' },
]

const FEATURES_LIST = [
  { id: 'royalty-free', label: '100% Royalty Free' },
  { id: 'audio-demo', label: 'Audio Demos Available' },
  { id: 'stems-included', label: 'Stems Included' },
  { id: 'midi-included', label: 'MIDI Files Included' },
  { id: 'instant-download', label: 'Instant Digital Download' },
]

export function EpicStoreBrowser({
  products,
  categories = [],
  brands = [],
  activeCategorySlug = '',
  activeSubTypeSlug = '',
  activeBrandSlug = '',
  activeQuery = '',
  activeSort = 'newest',
  isDealsActive = false,
  isFreeActive = false,
  isBundlesActive = false,
  isRentActive = false,
  activePriceTier = '',
  headerTitle,
  headerDescription,
}: EpicStoreBrowserProps) {
  const router = useRouter()

  // State
  const [searchKeyword, setSearchKeyword] = useState(activeQuery)
  const [selectedSort, setSelectedSort] = useState(activeSort)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Filters State
  const [selectedEvents, setSelectedEvents] = useState<{
    discounted: boolean
    free: boolean
    rentToOwn: boolean
  }>({
    discounted: isDealsActive,
    free: isFreeActive,
    rentToOwn: isRentActive,
  })

  const [selectedPriceTiers, setSelectedPriceTiers] = useState<string[]>(
    activePriceTier ? activePriceTier.split(',') : isDealsActive ? ['discounted'] : isFreeActive ? ['free'] : []
  )

  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>(
    activeCategorySlug && ['plugins', 'sounds', 'presets', 'templates', 'bundles'].includes(activeCategorySlug)
      ? [activeCategorySlug]
      : isBundlesActive
      ? ['bundles']
      : []
  )

  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    activeSubTypeSlug ? [activeSubTypeSlug] : []
  )

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    activeBrandSlug ? [activeBrandSlug] : []
  )

  // Explicit user toggles for accordion sections
  const [customSectionToggles, setCustomSectionToggles] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string, defaultOpen: boolean) => {
    setCustomSectionToggles((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] !== undefined ? !prev[sectionId] : !defaultOpen,
    }))
  }

  // Dynamically merge Supabase categories with base genres for full database fidelity
  const dynamicGenres = useMemo(() => {
    const list = [...BASE_GENRES]
    categories.forEach((c) => {
      const slugKey = c.slug || c.id
      if (!list.some((e) => e.id === slugKey)) {
        list.push({ id: slugKey, label: c.name })
      }
    })
    return list
  }, [categories])

  // Active filter counts per section
  const eventsCount = (selectedEvents.discounted ? 1 : 0) + (selectedEvents.free ? 1 : 0) + (selectedEvents.rentToOwn ? 1 : 0)
  const priceCount = selectedPriceTiers.length
  const typesCount = selectedProductTypes.length
  const genresCount = selectedGenres.length
  const platformsCount = selectedPlatforms.length
  const featuresCount = selectedFeatures.length
  const brandsCount = selectedBrands.length

  const activeFilterCount = useMemo(() => {
    let count = eventsCount + priceCount + typesCount + genresCount + platformsCount + featuresCount + brandsCount
    if (searchKeyword.trim()) count++
    return count
  }, [eventsCount, priceCount, typesCount, genresCount, platformsCount, featuresCount, brandsCount, searchKeyword])

  // Reset all filters
  const handleResetAll = () => {
    setSelectedEvents({ discounted: false, free: false, rentToOwn: false })
    setSelectedPriceTiers([])
    setSelectedProductTypes([])
    setSelectedGenres([])
    setSelectedPlatforms([])
    setSelectedFeatures([])
    setSelectedBrands([])
    setSearchKeyword('')
    setSelectedSort('newest')
    setCustomSectionToggles({})
    router.push('/store', { scroll: false })
  }

  // Filter products in-memory for instant 0ms response without recurring DB calls
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim()
        const match =
          p.name.toLowerCase().includes(kw) ||
          (p.brand && p.brand.toLowerCase().includes(kw)) ||
          (p.brands?.name && p.brands.name.toLowerCase().includes(kw)) ||
          (p.short_description && p.short_description.toLowerCase().includes(kw)) ||
          (p.category_slugs && p.category_slugs.some((c) => c.toLowerCase().includes(kw)))
        if (!match) return false
      }

      if (selectedEvents.discounted) {
        const hasDiscount =
          p.original_price_usd && Number(p.original_price_usd) > Number(p.price_usd)
        if (!hasDiscount) return false
      }

      if (selectedEvents.free) {
        if (Number(p.price_usd) !== 0) return false
      }

      if (selectedEvents.rentToOwn) {
        const isRto = (p as any).is_rent_to_own || p.product_type === 'rent_to_own'
        if (!isRto) return false
      }

      if (selectedPriceTiers.length > 0) {
        const price = Number(p.price_usd) || 0
        const isDisc = p.original_price_usd && Number(p.original_price_usd) > price
        const matchesAnyTier = selectedPriceTiers.some((tierId) => {
          if (tierId === 'free') return price === 0
          if (tierId === 'under-10') return price > 0 && price <= 10
          if (tierId === 'under-25') return price > 0 && price <= 25
          if (tierId === 'under-50') return price > 0 && price <= 50
          if (tierId === '50-plus') return price >= 50
          if (tierId === 'discounted') return isDisc
          return false
        })
        if (!matchesAnyTier) return false
      }

      if (selectedProductTypes.length > 0) {
        const typeMap: Record<string, string> = {
          plugins: 'plugin',
          sounds: 'sample_pack',
          presets: 'preset',
          templates: 'template',
          bundles: 'bundle',
        }
        const matchesType = selectedProductTypes.some((typeSlug) => {
          const expected = typeMap[typeSlug] || typeSlug
          return p.product_type === expected || p.category_slugs?.includes(typeSlug)
        })
        if (!matchesType) return false
      }

      if (selectedGenres.length > 0) {
        const pCats = (p.category_slugs || []).map((c) => c.toLowerCase().replace(/[-_]/g, ' '))
        const pSub = (p.subcategories?.name || p.subcategory || '').toString().toLowerCase()
        const matchesGenre = selectedGenres.some((genreSlug) => {
          const target = genreSlug.toLowerCase().replace(/[-_]/g, ' ')
          return pCats.some((c) => c.includes(target)) || pSub.includes(target)
        })
        if (!matchesGenre) return false
      }

      if (selectedPlatforms.length > 0) {
        const formatStr = (p.vst_format || '').toLowerCase()
        const matchesPlatform = selectedPlatforms.some((plat) => {
          if (plat === 'windows') return formatStr.includes('vst') || formatStr.includes('win') || !formatStr
          if (plat === 'macos') return formatStr.includes('au') || formatStr.includes('mac') || !formatStr
          if (plat === 'aax') return formatStr.includes('aax')
          if (plat === 'wav') return p.product_type === 'sample_pack' || formatStr.includes('wav')
          return true
        })
        if (!matchesPlatform) return false
      }

      if (selectedBrands.length > 0) {
        const brandSlug =
          p.brands?.slug?.toLowerCase() ||
          p.brand?.toLowerCase().trim().replace(/\s+/g, '-') ||
          ''
        const brandName = (p.brands?.name || p.brand || '').toLowerCase()
        const matchesBrand = selectedBrands.some((sb) => {
          const target = sb.toLowerCase()
          return brandSlug === target || brandName.includes(target)
        })
        if (!matchesBrand) return false
      }

      return true
    })
  }, [
    products,
    searchKeyword,
    selectedEvents,
    selectedPriceTiers,
    selectedProductTypes,
    selectedGenres,
    selectedPlatforms,
    selectedBrands,
  ])

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    if (selectedSort === 'price-low') {
      list.sort((a, b) => (Number(a.price_usd) || 0) - (Number(b.price_usd) || 0))
    } else if (selectedSort === 'price-high') {
      list.sort((a, b) => (Number(b.price_usd) || 0) - (Number(a.price_usd) || 0))
    } else if (selectedSort === 'newest') {
      list.sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0
        const db = b.created_at ? new Date(b.created_at).getTime() : 0
        return db - da
      })
    }
    return list
  }, [filteredProducts, selectedSort])

  // Sort dropdown ref
  const sortRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false)
      }
    }
    if (isSortOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSortOpen])

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === selectedSort)?.label || 'New Release'

  // Dynamic Sidebar Section Definitions
  const filterSections = useMemo(() => {
    return [
      {
        id: 'events',
        title: 'Events',
        count: eventsCount,
        defaultOpen: eventsCount > 0,
        render: () => (
          <div className="pt-2 pb-3 space-y-2.5 text-sm text-zinc-300">
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div
                className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                  selectedEvents.discounted
                    ? 'bg-[#FA742B] border-[#FA742B] text-black shadow-sm'
                    : 'border-[#3e3e3e] bg-transparent group-hover:border-zinc-400'
                }`}
              >
                {selectedEvents.discounted && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
              </div>
              <input
                type="checkbox"
                checked={selectedEvents.discounted}
                onChange={(e) =>
                  setSelectedEvents((prev) => ({ ...prev, discounted: e.target.checked }))
                }
                className="hidden"
              />
              <span className={selectedEvents.discounted ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white transition-colors'}>
                Discounted
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div
                className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                  selectedEvents.free
                    ? 'bg-[#FA742B] border-[#FA742B] text-black shadow-sm'
                    : 'border-[#3e3e3e] bg-transparent group-hover:border-zinc-400'
                }`}
              >
                {selectedEvents.free && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
              </div>
              <input
                type="checkbox"
                checked={selectedEvents.free}
                onChange={(e) =>
                  setSelectedEvents((prev) => ({ ...prev, free: e.target.checked }))
                }
                className="hidden"
              />
              <span className={selectedEvents.free ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white transition-colors'}>
                Free Producer Toys
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div
                className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                  selectedEvents.rentToOwn
                    ? 'bg-[#FA742B] border-[#FA742B] text-black shadow-sm'
                    : 'border-[#3e3e3e] bg-transparent group-hover:border-zinc-400'
                }`}
              >
                {selectedEvents.rentToOwn && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
              </div>
              <input
                type="checkbox"
                checked={selectedEvents.rentToOwn}
                onChange={(e) =>
                  setSelectedEvents((prev) => ({ ...prev, rentToOwn: e.target.checked }))
                }
                className="hidden"
              />
              <span className={selectedEvents.rentToOwn ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white transition-colors'}>
                Rent to Own
              </span>
            </label>
          </div>
        ),
      },
      {
        id: 'price',
        title: 'Price',
        count: priceCount,
        defaultOpen: priceCount > 0,
        render: () => (
          <div className="pt-2 pb-3 space-y-2.5 text-sm text-zinc-300">
            {PRICE_TIERS.map((tier) => {
              const isChecked = selectedPriceTiers.includes(tier.id)
              return (
                <label key={tier.id} className="flex items-center gap-3 cursor-pointer select-none group">
                  <div
                    className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                      isChecked
                        ? 'bg-[#FA742B] border-[#FA742B] text-black shadow-sm'
                        : 'border-[#3e3e3e] bg-transparent group-hover:border-zinc-400'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setSelectedPriceTiers((prev) =>
                        prev.includes(tier.id)
                          ? prev.filter((id) => id !== tier.id)
                          : [...prev, tier.id]
                      )
                    }}
                    className="hidden"
                  />
                  <span className={isChecked ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white transition-colors'}>
                    {tier.label}
                  </span>
                </label>
              )
            })}
          </div>
        ),
      },
      {
        id: 'genre',
        title: 'Genre',
        count: genresCount,
        defaultOpen: genresCount > 0,
        render: () => (
          <div className="pt-2 pb-3 space-y-2.5 text-sm text-zinc-300 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {[...dynamicGenres]
              .sort((a, b) => {
                const aChecked = selectedGenres.includes(a.id) ? 1 : 0
                const bChecked = selectedGenres.includes(b.id) ? 1 : 0
                return bChecked - aChecked
              })
              .map((genre) => {
                const isChecked = selectedGenres.includes(genre.id)
                return (
                  <label key={genre.id} className="flex items-center gap-3 cursor-pointer select-none group">
                    <div
                      className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                        isChecked
                          ? 'bg-[#FA742B] border-[#FA742B] text-black shadow-sm'
                          : 'border-[#3e3e3e] bg-transparent group-hover:border-zinc-400'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedGenres((prev) =>
                          prev.includes(genre.id)
                            ? prev.filter((id) => id !== genre.id)
                            : [...prev, genre.id]
                        )
                      }}
                      className="hidden"
                    />
                    <span className={isChecked ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white transition-colors'}>
                      {genre.label}
                    </span>
                  </label>
                )
              })}
          </div>
        ),
      },
      {
        id: 'features',
        title: 'Features',
        count: featuresCount,
        defaultOpen: featuresCount > 0,
        render: () => (
          <div className="pt-2 pb-3 space-y-2.5 text-sm text-zinc-300">
            {FEATURES_LIST.map((feat) => {
              const isChecked = selectedFeatures.includes(feat.id)
              return (
                <label key={feat.id} className="flex items-center gap-3 cursor-pointer select-none group">
                  <div
                    className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                      isChecked
                        ? 'bg-[#FA742B] border-[#FA742B] text-black shadow-sm'
                        : 'border-[#3e3e3e] bg-transparent group-hover:border-zinc-400'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setSelectedFeatures((prev) =>
                        prev.includes(feat.id)
                          ? prev.filter((id) => id !== feat.id)
                          : [...prev, feat.id]
                      )
                    }}
                    className="hidden"
                  />
                  <span className={isChecked ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white transition-colors'}>
                    {feat.label}
                  </span>
                </label>
              )
            })}
          </div>
        ),
      },
      {
        id: 'types',
        title: 'Types',
        count: typesCount,
        defaultOpen: typesCount > 0,
        render: () => (
          <div className="pt-2 pb-3 space-y-2.5 text-sm text-zinc-300">
            {PRODUCT_TYPES.map((type) => {
              const isChecked = selectedProductTypes.includes(type.slug)
              return (
                <label key={type.id} className="flex items-center gap-3 cursor-pointer select-none group">
                  <div
                    className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                      isChecked
                        ? 'bg-[#FA742B] border-[#FA742B] text-black shadow-sm'
                        : 'border-[#3e3e3e] bg-transparent group-hover:border-zinc-400'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setSelectedProductTypes((prev) =>
                        prev.includes(type.slug)
                          ? prev.filter((s) => s !== type.slug)
                          : [...prev, type.slug]
                      )
                    }}
                    className="hidden"
                  />
                  <span className={isChecked ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white transition-colors'}>
                    {type.label}
                  </span>
                </label>
              )
            })}
          </div>
        ),
      },
      {
        id: 'platforms',
        title: 'Platform',
        count: platformsCount,
        defaultOpen: platformsCount > 0,
        render: () => (
          <div className="pt-2 pb-3 space-y-2.5 text-sm text-zinc-300">
            {PLATFORMS.map((plat) => {
              const isChecked = selectedPlatforms.includes(plat.id)
              return (
                <label key={plat.id} className="flex items-center gap-3 cursor-pointer select-none group">
                  <div
                    className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                      isChecked
                        ? 'bg-[#FA742B] border-[#FA742B] text-black shadow-sm'
                        : 'border-[#3e3e3e] bg-transparent group-hover:border-zinc-400'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setSelectedPlatforms((prev) =>
                        prev.includes(plat.id)
                          ? prev.filter((p) => p !== plat.id)
                          : [...prev, plat.id]
                      )
                    }}
                    className="hidden"
                  />
                  <span className={isChecked ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white transition-colors'}>
                    {plat.label}
                  </span>
                </label>
              )
            })}
          </div>
        ),
      },
      {
        id: 'brands',
        title: 'Developers',
        count: brandsCount,
        defaultOpen: brandsCount > 0,
        render: () => (
          <div className="pt-2 pb-3 space-y-2.5 text-sm text-zinc-300 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {[...brands]
              .sort((a, b) => {
                const aChecked = selectedBrands.includes(a.slug) ? 1 : 0
                const bChecked = selectedBrands.includes(b.slug) ? 1 : 0
                return bChecked - aChecked
              })
              .map((brand) => {
                const isChecked = selectedBrands.includes(brand.slug)
                return (
                  <label key={brand.id} className="flex items-center gap-3 cursor-pointer select-none group">
                    <div
                      className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                        isChecked
                          ? 'bg-[#FA742B] border-[#FA742B] text-black shadow-sm'
                          : 'border-[#3e3e3e] bg-transparent group-hover:border-zinc-400'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedBrands((prev) =>
                          prev.includes(brand.slug)
                            ? prev.filter((s) => s !== brand.slug)
                            : [...prev, brand.slug]
                        )
                      }}
                      className="hidden"
                    />
                    <span className={isChecked ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white transition-colors'}>
                      {brand.name}
                    </span>
                  </label>
                )
              })}
          </div>
        ),
      },
    ]
  }, [
    eventsCount,
    priceCount,
    typesCount,
    genresCount,
    platformsCount,
    featuresCount,
    brandsCount,
    selectedEvents,
    selectedPriceTiers,
    selectedProductTypes,
    selectedGenres,
    selectedPlatforms,
    selectedFeatures,
    selectedBrands,
    dynamicGenres,
    brands,
  ])

  // Sort sections: Active filter sections (count > 0) move to the TOP automatically!
  const sortedSections = useMemo(() => {
    return [...filterSections].sort((a, b) => {
      const aActive = a.count > 0 ? 1 : 0
      const bActive = b.count > 0 ? 1 : 0
      return bActive - aActive
    })
  }, [filterSections])

  return (
    <div className="w-full bg-[#121212] min-h-screen text-white select-none pb-24">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* ========================================================================= */}
        {/* PAGE HEADER: TITLE & DESCRIPTION (Restored as requested)                 */}
        {/* ========================================================================= */}
        {headerTitle && (
          <div className="space-y-1.5 pb-6 pt-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase">
              {headerTitle}
            </h1>
            {headerDescription && (
              <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
                {headerDescription}
              </p>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. TOP BAR: SHOW DROPDOWN + ACTIVE FILTER TAGS                             */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#202020]">
          
          {/* Left: Show Sort Selector + Active Filter Pills */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Show Label & Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Show:</span>
              <div className="relative" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 text-sm font-bold text-white hover:text-zinc-200 transition-colors py-1 cursor-pointer"
                >
                  <span>{currentSortLabel}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                      isSortOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {isSortOpen && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-[#181818] border border-[#282828] rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedSort(opt.id)
                          setIsSortOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          selectedSort === opt.id
                            ? 'text-[#FA742B] font-bold bg-[#222222]'
                            : 'text-zinc-300 hover:text-white hover:bg-[#202020]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selectedSort === opt.id && <Check className="w-3.5 h-3.5 text-[#FA742B]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filter Pills (Exact Epic Games Store Match with ✕) */}
            {selectedEvents.discounted && (
              <button
                type="button"
                onClick={() => setSelectedEvents((prev) => ({ ...prev, discounted: false }))}
                className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer group border border-transparent hover:border-[#333333]"
              >
                <span>Discounted</span>
                <X className="w-3 h-3 text-zinc-400 group-hover:text-white" />
              </button>
            )}

            {selectedEvents.free && (
              <button
                type="button"
                onClick={() => setSelectedEvents((prev) => ({ ...prev, free: false }))}
                className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer group border border-transparent hover:border-[#333333]"
              >
                <span>Free</span>
                <X className="w-3 h-3 text-zinc-400 group-hover:text-white" />
              </button>
            )}

            {selectedPriceTiers.map((tierId) => {
              const label = PRICE_TIERS.find((t) => t.id === tierId)?.label || tierId
              return (
                <button
                  key={tierId}
                  type="button"
                  onClick={() =>
                    setSelectedPriceTiers((prev) => prev.filter((id) => id !== tierId))
                  }
                  className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer group border border-transparent hover:border-[#333333]"
                >
                  <span>{label}</span>
                  <X className="w-3 h-3 text-zinc-400 group-hover:text-white" />
                </button>
              )
            })}

            {selectedProductTypes.map((typeSlug) => {
              const label =
                PRODUCT_TYPES.find((t) => t.slug === typeSlug)?.label || typeSlug
              return (
                <button
                  key={typeSlug}
                  type="button"
                  onClick={() =>
                    setSelectedProductTypes((prev) => prev.filter((s) => s !== typeSlug))
                  }
                  className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer group border border-transparent hover:border-[#333333]"
                >
                  <span>{label}</span>
                  <X className="w-3 h-3 text-zinc-400 group-hover:text-white" />
                </button>
              )
            })}

            {selectedGenres.map((genreSlug) => (
              <button
                key={genreSlug}
                type="button"
                onClick={() =>
                  setSelectedGenres((prev) => prev.filter((s) => s !== genreSlug))
                }
                className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer group border border-transparent hover:border-[#333333]"
              >
                <span className="capitalize">{genreSlug.replace(/-/g, ' ')}</span>
                <X className="w-3 h-3 text-zinc-400 group-hover:text-white" />
              </button>
            ))}

            {selectedPlatforms.map((platId) => {
              const label = PLATFORMS.find((p) => p.id === platId)?.label || platId
              return (
                <button
                  key={platId}
                  type="button"
                  onClick={() =>
                    setSelectedPlatforms((prev) => prev.filter((p) => p !== platId))
                  }
                  className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer group border border-transparent hover:border-[#333333]"
                >
                  <span>{label}</span>
                  <X className="w-3 h-3 text-zinc-400 group-hover:text-white" />
                </button>
              )
            })}

            {selectedBrands.map((brandSlug) => (
              <button
                key={brandSlug}
                type="button"
                onClick={() =>
                  setSelectedBrands((prev) => prev.filter((s) => s !== brandSlug))
                }
                className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer group border border-transparent hover:border-[#333333]"
              >
                <span className="capitalize">{brandSlug.replace(/-/g, ' ')}</span>
                <X className="w-3 h-3 text-zinc-400 group-hover:text-white" />
              </button>
            ))}

            {searchKeyword.trim() && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer group border border-transparent hover:border-[#333333]"
              >
                <span>&quot;{searchKeyword}&quot;</span>
                <X className="w-3 h-3 text-zinc-400 group-hover:text-white" />
              </button>
            )}

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs text-[#FA742B] hover:underline font-semibold ml-2 cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Mobile Filter Trigger Button */}
          <div className="flex lg:hidden items-center justify-between w-full pt-2">
            <span className="text-xs text-zinc-400 font-medium">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'result' : 'results'}
            </span>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="bg-[#202020] hover:bg-[#282828] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 border border-[#303030] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FA742B]" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* 2. TWO-COLUMN MAIN STORE LAYOUT (Active Filters Auto-Top & Open)          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-start">
          
          {/* ================= LEFT COLUMN: PRODUCTS GRID (9 Cols) ================= */}
          <div className="lg:col-span-9 w-full">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 px-6 rounded-2xl bg-[#161616] border border-[#242424] max-w-xl mx-auto my-6 space-y-3">
                <p className="text-lg font-bold text-white tracking-tight">
                  No products found matching your filters
                </p>
                <p className="text-xs text-zinc-400">
                  Try clearing some filter tags or search with different keywords.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="bg-[#FA742B] hover:bg-[#E05A18] text-white font-bold text-xs py-2.5 px-6 rounded-full inline-block uppercase transition-all shadow-md cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>


          {/* ================= RIGHT COLUMN: STICKY FILTERS SIDEBAR (3 Cols) ====== */}
          <div className="hidden lg:block lg:col-span-3 sticky top-4 space-y-1 bg-[#121212] select-none">
            
            {/* Sidebar Top: Filters (Count) */}
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-base font-black text-white tracking-tight">
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </h3>
            </div>

            {/* Keyword Search Input (Exact Epic Search Box) */}
            <div className="relative pb-2">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Keywords"
                className="w-full bg-[#202020] hover:bg-[#252525] focus:bg-[#282828] text-white text-sm pl-10 pr-9 h-11 rounded-lg border border-transparent focus:border-[#383838] placeholder:text-zinc-500 font-sans transition-all outline-none"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dynamic Sorted Accordion Sections (Active sections automatically at TOP and OPEN) */}
            <div className="divide-y divide-[#222222]">
              {sortedSections.map((sec) => {
                const isOpen =
                  customSectionToggles[sec.id] !== undefined
                    ? customSectionToggles[sec.id]
                    : sec.defaultOpen

                return (
                  <div key={sec.id} className="py-1">
                    <button
                      type="button"
                      onClick={() => toggleSection(sec.id, sec.defaultOpen)}
                      className="flex items-center justify-between w-full py-3.5 text-sm font-bold text-white hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-bold tracking-tight">{sec.title}</span>
                      <div className="flex items-center gap-2.5">
                        {sec.count > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[#262626] border border-[#383838] text-zinc-200 text-[11px] font-extrabold flex items-center justify-center">
                            {sec.count}
                          </span>
                        )}
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {isOpen && sec.render()}
                  </div>
                )
              })}
            </div>

            {/* Sticky Action Bar (Clear + Orange Apply) */}
            {(activeFilterCount > 0 || searchKeyword) && (
              <div className="pt-4 flex items-center gap-3 sticky bottom-4 bg-[#121212]/95 backdrop-blur-sm z-20">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="flex-1 py-3 px-4 bg-transparent hover:bg-[#202020] text-white rounded-xl border border-[#333333] hover:border-[#555555] font-bold text-sm transition-all cursor-pointer text-center"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex-1 py-3 px-4 bg-[#FA742B] hover:bg-[#E05A18] text-white rounded-xl font-black text-sm shadow-lg shadow-[#FA742B]/20 transition-all cursor-pointer text-center"
                >
                  Apply
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE FILTER FULL-SCREEN MODAL (< lg) (1:1 Epic Games Store)          */}
      {/* ========================================================================= */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden bg-[#121212] flex flex-col h-[100dvh] w-screen overflow-hidden animate-in fade-in duration-150 select-none">
          
          {/* Header Area */}
          <div className="p-5 pb-3 border-b border-[#222222] shrink-0 space-y-3 bg-[#121212]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white tracking-tight">
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </h2>
            </div>

            {/* Keyword Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Keywords"
                className="w-full bg-[#202020] hover:bg-[#252525] focus:bg-[#282828] text-white text-sm pl-10 pr-9 h-11 rounded-lg border border-transparent focus:outline-none focus:border-[#383838] placeholder:text-zinc-500 font-sans transition-all"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Middle Accordion Filter List */}
          <div className="flex-1 overflow-y-auto px-5 py-1 divide-y divide-[#222222] custom-scrollbar">
            {sortedSections.map((sec) => {
              const isOpen =
                customSectionToggles[sec.id] !== undefined
                  ? customSectionToggles[sec.id]
                  : sec.defaultOpen

              return (
                <div key={sec.id} className="py-1">
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id, sec.defaultOpen)}
                    className="flex items-center justify-between w-full py-4 text-sm font-bold text-white cursor-pointer"
                  >
                    <span className="text-sm font-bold tracking-tight">{sec.title}</span>
                    <div className="flex items-center gap-2.5">
                      {sec.count > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#262626] border border-[#383838] text-zinc-200 text-[11px] font-extrabold flex items-center justify-center">
                          {sec.count}
                        </span>
                      )}
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && sec.render()}
                </div>
              )
            })}
          </div>

          {/* Fixed Bottom Action Bar (1:1 Epic Games Clear & Orange Apply) */}
          <div className="p-4 px-5 border-t border-[#222222] bg-[#121212] flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetAll}
              className="flex-1 h-12 bg-[#181818] hover:bg-[#202020] text-white rounded-xl border border-[#333333] hover:border-[#555555] font-bold text-sm transition-all cursor-pointer text-center flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="flex-1 h-12 bg-[#FA742B] hover:bg-[#E05A18] text-white rounded-xl font-black text-sm shadow-lg shadow-[#FA742B]/20 transition-all cursor-pointer text-center flex items-center justify-center"
            >
              Apply
            </button>
          </div>

        </div>
      )}

    </div>
  )
}

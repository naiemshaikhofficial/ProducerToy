'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Download,
  Key,
  RotateCw,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  ExternalLink,
  Copy,
  Plus,
  Package,
  X,
  Music,
  Folder,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react'
import { BillingHistory } from '@/components/BillingHistory'

interface PurchaseItem {
  id: string
  user_id: string
  product_id: string
  amount_paid: number
  currency: string
  serial_key: string | null
  razorpay_order_id?: string
  razorpay_payment_id?: string
  purchased_at: string
  products: {
    id: string
    name: string
    slug: string
    cover_image: string
    brand?: string
    brands?: { name: string; slug: string }
    product_type?: string
    vst_format?: string
    category_slugs?: string[]
    categories?: { name: string; slug: string }
    subcategories?: { name: string; slug: string }
    operating_system?: string
    platform?: string
    download_url?: string
    download_url_win?: string
    download_url_mac?: string
  }
}

interface EpicLibraryClientProps {
  purchases: PurchaseItem[]
  userEmail: string
  userName?: string
  downloadTokens: Record<string, string>
}

export function EpicLibraryClient({
  purchases,
  userEmail,
  userName,
  downloadTokens,
}: EpicLibraryClientProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'plugins' | 'sounds' | 'receipts'>('all')
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'az' | 'za' | 'recent'>('az')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchTitle, setSearchTitle] = useState('')
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [installedOnly, setInstalledOnly] = useState(false)

  // Install Modal State
  const [installProduct, setInstallProduct] = useState<PurchaseItem | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'mac' | 'universal'>('windows')

  // Filter Accordions
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    genre: false,
    features: false,
    types: false,
    platform: false,
  })

  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false)
      }
      if (activeMenuId && !(e.target as HTMLElement).closest('.menu-container')) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeMenuId])

  const toggleAccordion = (name: string) => {
    setOpenAccordions((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const toggleFilter = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value))
    } else {
      setList([...list, value])
    }
  }

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    )
  }

  const handleCopySerial = (serial: string, id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    navigator.clipboard.writeText(serial)
    setCopiedKeyId(id)
    setTimeout(() => setCopiedKeyId(null), 2500)
  }

  // Filtered and Sorted Purchases
  const filteredPurchases = useMemo(() => {
    return purchases
      .filter((item) => {
        const product = item.products
        if (!product) return false

        // Tab filter
        if (activeTab === 'favorites' && !favorites.includes(item.id)) return false
        if (activeTab === 'plugins' && product.product_type !== 'plugin' && product.product_type !== 'vst') {
          return false
        }
        if (activeTab === 'sounds' && product.product_type !== 'sample_pack' && product.product_type !== 'sound') {
          return false
        }

        // Title Search filter
        if (searchTitle.trim()) {
          const q = searchTitle.toLowerCase().trim()
          const name = (product.name || '').toLowerCase()
          const brand = (product.brands?.name || product.brand || '').toLowerCase()
          if (!name.includes(q) && !brand.includes(q)) return false
        }

        // Genre filter
        if (selectedGenres.length > 0) {
          const catSlugs = (product.category_slugs || []).map((s) => s.toLowerCase())
          const catName = (product.categories?.name || '').toLowerCase()
          const subcatName = (product.subcategories?.name || '').toLowerCase()
          const matches = selectedGenres.some(
            (g) => catSlugs.includes(g) || catName.includes(g) || subcatName.includes(g)
          )
          if (!matches) return false
        }

        // Features filter
        if (selectedFeatures.length > 0) {
          const fmt = (product.vst_format || '').toLowerCase()
          const matches = selectedFeatures.some((f) => fmt.includes(f) || f === 'all')
          if (!matches) return false
        }

        // Types filter
        if (selectedTypes.length > 0) {
          const type = (product.product_type || '').toLowerCase()
          const matches = selectedTypes.some((t) => type.includes(t))
          if (!matches) return false
        }

        // Platform filter
        if (selectedPlatforms.length > 0) {
          const plat = (product.platform || product.operating_system || '').toLowerCase()
          const matches = selectedPlatforms.some((p) => plat.includes(p) || p === 'all')
          if (!matches && !plat.includes('all')) return false
        }

        return true
      })
      .sort((a, b) => {
        const nameA = a.products?.name || ''
        const nameB = b.products?.name || ''
        if (sortBy === 'az') return nameA.localeCompare(nameB)
        if (sortBy === 'za') return nameB.localeCompare(nameA)
        return new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
      })
  }, [
    purchases,
    activeTab,
    favorites,
    searchTitle,
    selectedGenres,
    selectedFeatures,
    selectedTypes,
    selectedPlatforms,
    sortBy,
  ])

  // Get active direct CDN/Host download URL (Zero Vercel Bandwidth)
  const getActiveDownloadUrl = (item: PurchaseItem | null) => {
    if (!item) return '#'
    const product = item.products

    const isSamplePack =
      product.product_type === 'sample_pack' ||
      product.product_type === 'sound' ||
      product.product_type === 'preset'

    if (isSamplePack) {
      return product.download_url || '#'
    }

    if (selectedPlatform === 'windows') {
      return product.download_url_win || product.download_url || '#'
    }

    if (selectedPlatform === 'mac') {
      return product.download_url_mac || product.download_url || '#'
    }

    return product.download_url || '#'
  }

  const sortLabels = {
    az: 'Alphabetical A-Z',
    za: 'Alphabetical Z-A',
    recent: 'Recently Added',
  }

  return (
    <div className="w-full min-h-screen bg-[#121212] text-white py-8 select-none font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ================= TOP HEADER WITH REFRESH ================= */}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Library</h1>
          <button
            onClick={() => window.location.reload()}
            title="Refresh Library"
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-[#202020] transition-colors cursor-pointer"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* ================= SUB TABS BAR (EXACT EPIC LAUNCHER) ================= */}
        <div className="flex items-center gap-6 border-b border-[#242424] pb-2 text-sm font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 relative transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>All</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[#202020] text-zinc-400 font-normal">
              {purchases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-2 relative transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Favorites</span>
            {favorites.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[#202020] text-zinc-400 font-normal">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('plugins')}
            className={`pb-2 relative transition-colors cursor-pointer ${
              activeTab === 'plugins'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Plugins
          </button>

          <button
            onClick={() => setActiveTab('sounds')}
            className={`pb-2 relative transition-colors cursor-pointer ${
              activeTab === 'sounds'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sounds
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`pb-2 relative transition-colors cursor-pointer ${
              activeTab === 'receipts'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Receipts
          </button>

          <button
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-[#222222] transition-colors cursor-pointer"
            title="Add Custom Collection"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {activeTab === 'receipts' ? (
          <div className="pt-4 animate-in fade-in">
            <BillingHistory
              purchases={purchases as any}
              userEmail={userEmail}
              userName={userName}
            />
          </div>
        ) : (
          /* ================= MAIN CONTENT + EXACT EPIC FILTERS ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
            
            {/* LEFT MAIN POSTER GRID */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              
              {/* Sort & Grid/List Controls with Custom Sleek Dropdown */}
              <div className="flex items-center justify-between gap-4">
                
                {/* Custom Sort Dropdown */}
                <div ref={sortRef} className="relative flex items-center gap-2 text-xs font-semibold text-zinc-400">
                  <span>Sort by:</span>
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-1.5 text-white font-bold hover:text-zinc-300 transition-colors cursor-pointer focus:outline-none"
                  >
                    <span>{sortLabels[sortBy]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Custom Sort Dropdown Menu */}
                  {isSortOpen && (
                    <div className="absolute left-14 top-7 w-48 bg-[#181818] border border-[#2a2a2a] rounded-xl shadow-2xl p-1.5 z-40 text-xs space-y-0.5 animate-in fade-in">
                      {(['az', 'za', 'recent'] as const).map((key) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSortBy(key)
                            setIsSortOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                            sortBy === key
                              ? 'bg-[#242424] text-white font-bold'
                              : 'text-zinc-400 hover:text-white hover:bg-[#202020]'
                          }`}
                        >
                          <span>{sortLabels[key]}</span>
                          {sortBy === key && <Check className="w-3.5 h-3.5 text-[#FC6301]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggles */}
                <div className="flex items-center gap-1 text-zinc-400">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid' ? 'text-white bg-[#222222] border border-[#2e2e2e]' : 'hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'list' ? 'text-white bg-[#222222] border border-[#2e2e2e]' : 'hover:text-white'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* PRODUCTS CATALOG */}
              {filteredPurchases.length === 0 ? (
                <div className="text-center py-24 px-6 bg-[#161616] border border-[#242424] rounded-2xl space-y-4 max-w-xl mx-auto shadow-2xl flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#202020] border border-[#2e2e2e] rounded-full flex items-center justify-center mb-1">
                    <Package className="w-7 h-7 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">No Items Match Your Filters</h3>
                  <p className="text-xs text-zinc-400">
                    Try adjusting your search terms or clearing selected filter tags.
                  </p>
                  <div className="pt-2 w-full">
                    <Link
                      href="/store"
                      prefetch={true}
                      className="bg-[#FC6301] hover:bg-[#E05800] text-white font-extrabold text-xs py-3.5 px-6 rounded-xl inline-block uppercase tracking-wider transition-all text-center cursor-pointer active:scale-[0.99]"
                    >
                      Browse Store Catalog
                    </Link>
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                /* 3:4 TALL POSTER CARDS (EXACT EPIC GAMES STORE LAUNCHER DESIGN) */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {filteredPurchases.map((item) => {
                    const product = item.products
                    const isFav = favorites.includes(item.id)

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setInstallProduct(item)
                          setSelectedPlatform('windows')
                        }}
                        className="group flex flex-col relative select-none cursor-pointer"
                      >
                        {/* 3:4 Poster Image Container */}
                        <div
                          className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#181818] border border-[#242424] shadow-md mb-2 block cursor-pointer transition-transform duration-200 group-hover:scale-[1.01]"
                          title={`Click to Install ${product.name}`}
                        >
                          <Image
                            src={product.cover_image}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover object-center group-hover:brightness-105 transition-all"
                          />

                          {/* Subtle Favorite Bookmark Button in top corner */}
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
                              isFav
                                ? 'opacity-100 bg-white text-black'
                                : 'bg-black/60 text-white/80 hover:text-white'
                            }`}
                            title={isFav ? 'Remove Favorite' : 'Add to Favorites'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        {/* Title and Install bar */}
                        <div className="flex items-start justify-between gap-1 px-0.5">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold text-white truncate leading-snug block group-hover:text-zinc-200">
                              {product.name}
                            </span>

                            <div className="text-[11px] font-semibold text-zinc-400 group-hover:text-white flex items-center gap-1 mt-0.5 transition-colors">
                              <Download className="w-3 h-3 text-zinc-400" />
                              <span>Install</span>
                            </div>
                          </div>

                          {/* More Options Dropdown Trigger */}
                          <div className="relative menu-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenuId(activeMenuId === item.id ? null : item.id)
                              }}
                              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-[#202020] transition-colors cursor-pointer"
                              title="Options"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Context Menu Popup */}
                            {activeMenuId === item.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 bottom-7 w-52 bg-[#181818] border border-[#2a2a2a] rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-1 backdrop-blur-md animate-in fade-in"
                              >
                                {item.serial_key && (
                                  <button
                                    onClick={(e) => handleCopySerial(item.serial_key!, item.id, e)}
                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#242424] text-zinc-200 hover:text-white transition-colors cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Copy Serial Key</span>
                                    </div>
                                    {copiedKeyId === item.id ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5 text-zinc-500" />
                                    )}
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    setInstallProduct(item)
                                    setActiveMenuId(null)
                                  }}
                                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#242424] text-zinc-200 hover:text-white transition-colors cursor-pointer text-left"
                                >
                                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>Install Options</span>
                                </button>

                                <Link
                                  href={`/product/${product.slug}`}
                                  prefetch={true}
                                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#242424] text-zinc-200 hover:text-white transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>View Store Page</span>
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              ) : (
                /* LIST VIEW */
                <div className="space-y-2.5">
                  {filteredPurchases.map((item) => {
                    const product = item.products

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setInstallProduct(item)
                          setSelectedPlatform('windows')
                        }}
                        className="bg-[#181818] border border-[#242424] rounded-xl p-3.5 flex items-center justify-between gap-4 hover:border-zinc-600 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="relative w-12 h-12 bg-[#202020] rounded-lg overflow-hidden flex-shrink-0 border border-[#2e2e2e]">
                            <Image
                              src={product.cover_image}
                              alt={product.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-white truncate group-hover:text-zinc-200">
                              {product.name}
                            </h3>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {product.brand || 'Producer Toy'} • {product.vst_format || 'Digital Download'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {item.serial_key && (
                            <button
                              onClick={(e) => handleCopySerial(item.serial_key!, item.id, e)}
                              className="bg-[#202020] hover:bg-[#282828] border border-[#2e2e2e] text-zinc-300 hover:text-white px-3 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Copy Serial Key"
                            >
                              <Key className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{copiedKeyId === item.id ? 'Copied!' : item.serial_key}</span>
                            </button>
                          )}

                          <div className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-2 px-4 rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm">
                            <Download className="w-3.5 h-3.5" />
                            <span>Install</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>

            {/* ================= RIGHT SIDEBAR: EXACT EPIC GAMES LAUNCHER FILTERS ================= */}
            <div className="lg:col-span-4 xl:col-span-3 sticky top-4 space-y-4">
              <div className="bg-[#181818] rounded-2xl p-5 space-y-4 shadow-xl border border-[#242424]">
                
                {/* Filters Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-wide">Filters</h3>
                  {(searchTitle || selectedGenres.length > 0 || selectedFeatures.length > 0 || selectedTypes.length > 0 || selectedPlatforms.length > 0) && (
                    <button
                      onClick={() => {
                        setSearchTitle('')
                        setSelectedGenres([])
                        setSelectedFeatures([])
                        setSelectedTypes([])
                        setSelectedPlatforms([])
                        setInstalledOnly(false)
                      }}
                      className="text-xs text-[#FC6301] hover:underline font-bold transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Search Title Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full bg-[#202020] border border-[#2a2a2a] text-white text-xs pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-zinc-400 placeholder:text-zinc-500 transition-colors"
                  />
                </div>

                {/* Installed Option */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={installedOnly}
                      onChange={(e) => setInstalledOnly(e.target.checked)}
                      className="rounded bg-[#202020] border-[#333333] text-[#FC6301] focus:ring-0 cursor-pointer"
                    />
                    <span>Installed</span>
                  </label>
                </div>

                {/* Genre Accordion */}
                <div className="border-t border-[#242424] pt-3">
                  <button
                    onClick={() => toggleAccordion('genre')}
                    className="w-full flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    <span>Genre</span>
                    {openAccordions.genre ? (
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>

                  {openAccordions.genre && (
                    <div className="space-y-1.5 pt-2 pl-1">
                      {['eq', 'reverb', 'compressor', 'delay', 'synth', 'vocal', 'mastering', 'drums'].map((g) => {
                        const isChecked = selectedGenres.includes(g)
                        const label =
                          g === 'eq'
                            ? 'Equalizer / EQ'
                            : g.charAt(0).toUpperCase() + g.slice(1)

                        return (
                          <label
                            key={g}
                            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFilter(selectedGenres, setSelectedGenres, g)}
                              className="rounded bg-[#202020] border-[#333333] text-[#FC6301] focus:ring-0 cursor-pointer"
                            />
                            <span>{label}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Features Accordion */}
                <div className="border-t border-[#242424] pt-3">
                  <button
                    onClick={() => toggleAccordion('features')}
                    className="w-full flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    <span>Features</span>
                    {openAccordions.features ? (
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>

                  {openAccordions.features && (
                    <div className="space-y-1.5 pt-2 pl-1">
                      {['vst3', 'au', 'aax', '64-bit', 'royalty-free'].map((feat) => {
                        const isChecked = selectedFeatures.includes(feat)
                        return (
                          <label
                            key={feat}
                            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFilter(selectedFeatures, setSelectedFeatures, feat)}
                              className="rounded bg-[#202020] border-[#333333] text-[#FC6301] focus:ring-0 cursor-pointer"
                            />
                            <span className="uppercase">{feat}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Types Accordion */}
                <div className="border-t border-[#242424] pt-3">
                  <button
                    onClick={() => toggleAccordion('types')}
                    className="w-full flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    <span>Types</span>
                    {openAccordions.types ? (
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>

                  {openAccordions.types && (
                    <div className="space-y-1.5 pt-2 pl-1">
                      {['plugin', 'sample_pack', 'preset', 'sound'].map((typ) => {
                        const isChecked = selectedTypes.includes(typ)
                        const label =
                          typ === 'plugin'
                            ? 'Plugins & VSTs'
                            : typ === 'sample_pack'
                            ? 'Sample Packs'
                            : typ === 'preset'
                            ? 'Presets & Soundbanks'
                            : 'Audio Sounds'

                        return (
                          <label
                            key={typ}
                            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFilter(selectedTypes, setSelectedTypes, typ)}
                              className="rounded bg-[#202020] border-[#333333] text-[#FC6301] focus:ring-0 cursor-pointer"
                            />
                            <span>{label}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Platform Accordion */}
                <div className="border-t border-[#242424] pt-3">
                  <button
                    onClick={() => toggleAccordion('platform')}
                    className="w-full flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    <span>Platform</span>
                    {openAccordions.platform ? (
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>

                  {openAccordions.platform && (
                    <div className="space-y-1.5 pt-2 pl-1">
                      {['windows', 'mac'].map((plat) => {
                        const isChecked = selectedPlatforms.includes(plat)
                        return (
                          <label
                            key={plat}
                            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFilter(selectedPlatforms, setSelectedPlatforms, plat)}
                              className="rounded bg-[#202020] border-[#333333] text-[#FC6301] focus:ring-0 cursor-pointer"
                            />
                            <span className="capitalize">{plat === 'mac' ? 'macOS' : 'Windows'}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ================= EXACT EPIC GAMES LAUNCHER INSTALL MODAL ================= */}
        {installProduct && (() => {
          const product = installProduct.products
          const isSamplePack =
            product.product_type === 'sample_pack' ||
            product.product_type === 'sound' ||
            product.product_type === 'preset'

          const activeUrl = getActiveDownloadUrl(installProduct)

          return (
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
              onClick={() => setInstallProduct(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 text-white animate-in zoom-in-95 duration-200 relative"
              >
                {/* Close X */}
                <button
                  onClick={() => setInstallProduct(null)}
                  className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-[#242424] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Top Header with 3:4 Artwork Thumbnail */}
                <div className="flex items-start gap-4">
                  <div className="relative w-18 aspect-[3/4] rounded-xl overflow-hidden bg-[#202020] border border-[#2e2e2e] flex-shrink-0 shadow-md">
                    <Image
                      src={product.cover_image}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1 pr-6">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                      Choose Install Options
                    </h2>
                    <p className="text-xs text-zinc-300 font-semibold truncate">
                      {product.name} • <span className="text-zinc-400">{product.brands?.name || product.brand || 'Producer Toy'}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {isSamplePack
                        ? 'High-Quality Audio Pack (24-bit WAV / Samples & Presets)'
                        : `${product.vst_format || 'VST3 / AU'} • 64-Bit Digital License`}
                    </p>
                  </div>
                </div>

                {/* Serial Key Section (Only if genuinely exists) */}
                {installProduct.serial_key && (
                  <div className="bg-[#202020] border border-[#2e2e2e] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Serial License Key
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-emerald-400 tracking-wider select-all block truncate">
                        {installProduct.serial_key}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopySerial(installProduct.serial_key!, installProduct.id)}
                      className="bg-[#2a2a2a] hover:bg-[#333333] text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      {copiedKeyId === installProduct.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Download Platform Selector */}
                {isSamplePack ? (
                  /* Sample Pack / Audio Direct Package */
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                      Download Package
                    </span>
                    <div className="bg-[#202020] border border-[#2e2e2e] p-3.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#282828] flex items-center justify-center text-[#FC6301]">
                          <Music className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Direct Sample Pack ZIP Archive
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            Includes One-Shots, Loops, Midis & Presets
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                        Ready
                      </span>
                    </div>
                  </div>
                ) : (
                  /* VST / Plugin OS Platform Selection (Windows & Apple) */
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                      Select OS Platform Installer
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Windows Option */}
                      <button
                        type="button"
                        onClick={() => setSelectedPlatform('windows')}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                          selectedPlatform === 'windows'
                            ? 'bg-[#242424] border-[#FC6301]'
                            : 'bg-[#202020] border-[#2e2e2e] hover:border-zinc-500'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#282828] flex items-center justify-center flex-shrink-0 text-[#FC6301]">
                          {/* Windows SVG Icon */}
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 88 88">
                            <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.001 45.728zm4.326-39.027L87.914 0v41.527l-47.918.378zm47.918 43.435L87.914 88l-47.918-6.736V45.704z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block">Windows</span>
                          <span className="text-[10px] text-zinc-400 block truncate">VST3 / 64-Bit EXE</span>
                        </div>
                      </button>

                      {/* Apple macOS Option */}
                      <button
                        type="button"
                        onClick={() => setSelectedPlatform('mac')}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                          selectedPlatform === 'mac'
                            ? 'bg-[#242424] border-[#FC6301]'
                            : 'bg-[#202020] border-[#2e2e2e] hover:border-zinc-500'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#282828] flex items-center justify-center flex-shrink-0 text-white">
                          {/* Apple SVG Icon */}
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.85-12.01-14.43-6.08-9.35-10.74-19.78-13.98-31.28-3.24-11.51-4.86-22.42-4.86-32.75 0-14.7 3.69-26.68 11.08-35.94 7.39-9.25 16.59-13.98 27.6-14.19 4.35 0 9.29 1.16 14.83 3.48 5.53 2.32 9.07 3.54 10.6 3.66 1.7 0 5.4-1.28 11.1-3.84 5.7-2.57 10.68-3.74 14.94-3.53 11.52.54 20.73 4.67 27.63 12.39-10.02 6.09-14.92 14.77-14.7 26.04.22 8.91 3.59 16.39 10.11 22.44 6.52 6.05 14.44 9.68 23.77 10.88-2.06 6.31-4.63 12.77-7.72 19.37zM119.22 31.84c0-7.39 2.65-14.19 7.94-20.41 5.3-6.22 11.83-9.9 19.6-11.04.22 1.09.33 2.07.33 2.94 0 7.39-2.77 14.34-8.31 20.85-5.54 6.51-12.18 10.22-19.93 11.13-.11-1.09-.33-2.29-.33-3.47z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block">macOS</span>
                          <span className="text-[10px] text-zinc-400 block truncate">AU / VST3 / DMG</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Modal Actions (ProducerToy Minimalistic Clean Style) */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
                  <button
                    type="button"
                    onClick={() => setInstallProduct(null)}
                    className="bg-[#242424] hover:bg-[#2e2e2e] text-white font-bold text-xs py-3 px-6 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <a
                    href={activeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    onClick={() => setInstallProduct(null)}
                    className="bg-[#FC6301] hover:bg-[#E05800] text-white font-extrabold text-xs py-3 px-8 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 active:scale-[0.99]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install</span>
                  </a>
                </div>

              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}

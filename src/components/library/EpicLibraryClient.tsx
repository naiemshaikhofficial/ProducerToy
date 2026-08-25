'use client'

import React, { useState, useMemo } from 'react'
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
  ShieldCheck,
  FileText,
  Copy,
  Sparkles,
  Package,
  Layers
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
  const [sortBy, setSortBy] = useState<'az' | 'za' | 'recent'>('recent')
  const [searchTitle, setSearchTitle] = useState('')
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  // Filter Accordions
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    genre: true,
    platform: true,
  })

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    )
  }

  const handleCopySerial = (serial: string, id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(serial)
    setCopiedKeyId(id)
    setTimeout(() => setCopiedKeyId(null), 2000)
    setActiveMenuId(null)
  }

  const toggleAccordion = (section: string) => {
    setOpenAccordion((prev) => ({ ...prev, [section]: !prev[section] }))
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

        // Title search
        if (searchTitle.trim()) {
          const q = searchTitle.toLowerCase().trim()
          const name = (product.name || '').toLowerCase()
          const brand = (product.brands?.name || product.brand || '').toLowerCase()
          if (!name.includes(q) && !brand.includes(q)) return false
        }

        // Genre / Type filter
        if (selectedGenres.length > 0) {
          const type = (product.product_type || '').toLowerCase()
          const cat = (product.categories?.name || '').toLowerCase()
          const subcat = (product.subcategories?.name || '').toLowerCase()
          const matches = selectedGenres.some(
            (g) => type.includes(g) || cat.includes(g) || subcat.includes(g)
          )
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
  }, [purchases, activeTab, favorites, searchTitle, selectedGenres, selectedPlatforms, sortBy])

  return (
    <div className="w-full min-h-screen bg-[#121212] text-white py-8 select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ================= EPIC HEADER WITH REFRESH ================= */}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Library</h1>
          <button
            onClick={() => window.location.reload()}
            title="Refresh Library"
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-[#202020] transition-all cursor-pointer"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* ================= SUB NAVIGATION TABS ================= */}
        <div className="flex items-center gap-2 border-b border-[#262626] pb-3 text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            All ({purchases.length})
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-white text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            Favorites ({favorites.length})
          </button>

          <button
            onClick={() => setActiveTab('plugins')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'plugins'
                ? 'bg-white text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            Plugins
          </button>

          <button
            onClick={() => setActiveTab('sounds')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'sounds'
                ? 'bg-white text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            Sounds & Packs
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'receipts'
                ? 'bg-white text-black font-extrabold shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Order History & Receipts</span>
          </button>
        </div>

        {activeTab === 'receipts' ? (
          /* Receipts View */
          <div className="pt-4 animate-in fade-in">
            <BillingHistory
              purchases={purchases as any}
              userEmail={userEmail}
              userName={userName}
            />
          </div>
        ) : (
          /* ================= MAIN LIBRARY CONTENT WITH RIGHT FILTER BAR ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            
            {/* LEFT MAIN CATALOG (8 or 9 cols) */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              
              {/* Sort Bar & View Switcher */}
              <div className="flex items-center justify-between gap-4">
                
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-[#181818] border border-[#2a2a2a] text-white text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-zinc-500 transition-colors"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="az">Alphabetical A-Z</option>
                    <option value="za">Alphabetical Z-A</option>
                  </select>
                </div>

                {/* Grid / List View Toggle */}
                <div className="flex items-center bg-[#181818] border border-[#2a2a2a] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'grid' ? 'bg-[#2a2a2a] text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'list' ? 'bg-[#2a2a2a] text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* PRODUCTS LIST / GRID */}
              {filteredPurchases.length === 0 ? (
                <div className="text-center py-20 px-6 bg-[#161616] border border-[#262626] rounded-2xl space-y-4 max-w-xl mx-auto shadow-2xl flex flex-col items-center">
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
                      className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3.5 px-6 rounded-full inline-block uppercase tracking-wider transition-all shadow-lg text-center cursor-pointer"
                    >
                      Browse Store Catalog
                    </Link>
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                /* 3:4 TALL POSTER CARDS GRID (EXACT EPIC GAMES STORE LAUNCHER DESIGN) */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {filteredPurchases.map((item) => {
                    const product = item.products
                    const isFav = favorites.includes(item.id)
                    const brandName = product.brands?.name || product.brand || 'Producer Toy'
                    const token = downloadTokens[product.id] || ''
                    const downloadUrl = `/api/download/${product.id}?token=${token}`

                    return (
                      <div
                        key={item.id}
                        className="group flex flex-col cursor-pointer relative"
                      >
                        {/* 3:4 Poster Artwork Container */}
                        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#181818] border border-[#242424] shadow-lg mb-2.5 transition-transform duration-200 group-hover:scale-[1.02]">
                          <Image
                            src={product.cover_image}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover object-center group-hover:brightness-105 transition-all"
                          />

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                            
                            {/* Top Favorite Toggle */}
                            <button
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className={`self-end w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/10 ${
                                isFav ? 'bg-white text-black' : 'bg-black/60 text-white/80 hover:text-white'
                              }`}
                              title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                            >
                              <Bookmark className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                            </button>

                            {/* Download Action Button in Overlay */}
                            <a
                              href={downloadUrl}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-2.5 rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </a>

                          </div>
                        </div>

                        {/* Title & Options Bar */}
                        <div className="flex items-start justify-between gap-1 px-1">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white truncate leading-snug group-hover:text-zinc-200">
                              {product.name}
                            </h3>
                            <a
                              href={downloadUrl}
                              download
                              className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 mt-0.5 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Install / Download</span>
                            </a>
                          </div>

                          {/* More Options Dropdown Trigger */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenuId(activeMenuId === item.id ? null : item.id)
                              }}
                              className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-[#222222] transition-colors cursor-pointer"
                              title="Options"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Context Menu Popup */}
                            {activeMenuId === item.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 bottom-8 w-56 bg-[#181818] border border-[#2e2e2e] rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-1 backdrop-blur-md animate-in fade-in"
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

                                <a
                                  href={downloadUrl}
                                  download
                                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#242424] text-zinc-200 hover:text-white transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>Download Installer</span>
                                </a>

                                <Link
                                  href={`/product/${product.slug}`}
                                  prefetch={true}
                                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#242424] text-zinc-200 hover:text-white transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>View Product Page</span>
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
                <div className="space-y-3">
                  {filteredPurchases.map((item) => {
                    const product = item.products
                    const isFav = favorites.includes(item.id)
                    const token = downloadTokens[product.id] || ''
                    const downloadUrl = `/api/download/${product.id}?token=${token}`

                    return (
                      <div
                        key={item.id}
                        className="bg-[#181818] border border-[#242424] rounded-xl p-4 flex items-center justify-between gap-4 hover:border-zinc-600 transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="relative w-14 h-14 bg-[#202020] rounded-lg overflow-hidden flex-shrink-0 border border-[#2e2e2e]">
                            <Image
                              src={product.cover_image}
                              alt={product.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-white truncate">
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
                              title="Copy Serial"
                            >
                              <Key className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{copiedKeyId === item.id ? 'Copied!' : item.serial_key}</span>
                            </button>
                          )}

                          <a
                            href={downloadUrl}
                            download
                            className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>

            {/* ================= RIGHT SIDEBAR: FILTERS (EXACT EPIC GAMES LAUNCHER) ================= */}
            <div className="lg:col-span-4 xl:col-span-3 sticky top-4 space-y-4">
              <div className="bg-[#181818] border border-[#262626] rounded-2xl p-5 space-y-5 shadow-xl">
                
                {/* Filter Header */}
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <h3 className="text-sm font-extrabold text-white tracking-wider">Filters</h3>
                  {(searchTitle || selectedGenres.length > 0 || selectedPlatforms.length > 0) && (
                    <button
                      onClick={() => {
                        setSearchTitle('')
                        setSelectedGenres([])
                        setSelectedPlatforms([])
                      }}
                      className="text-xs text-[#FC6301] hover:underline font-bold transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Title Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Search Title"
                    className="w-full bg-[#222222] border border-[#2e2e2e] text-white text-xs pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-zinc-400 placeholder:text-zinc-500 transition-colors"
                  />
                </div>

                {/* Categories / Genre Accordion */}
                <div className="border-t border-[#262626] pt-3 space-y-2.5">
                  <button
                    onClick={() => toggleAccordion('genre')}
                    className="w-full flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Categories & Types</span>
                    {openAccordion.genre ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  {openAccordion.genre && (
                    <div className="space-y-2 pt-1">
                      {['plugin', 'sample_pack', 'preset', 'effects', 'instruments'].map((cat) => {
                        const isChecked = selectedGenres.includes(cat)
                        const label =
                          cat === 'plugin'
                            ? 'VST Plugins'
                            : cat === 'sample_pack'
                            ? 'Sample Packs & Drums'
                            : cat === 'preset'
                            ? 'Presets & Banks'
                            : cat.charAt(0).toUpperCase() + cat.slice(1)

                        return (
                          <label
                            key={cat}
                            className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-white cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFilter(selectedGenres, setSelectedGenres, cat)}
                              className="rounded bg-[#222222] border-[#333333] text-[#FC6301] focus:ring-0 cursor-pointer"
                            />
                            <span>{label}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Platform Accordion */}
                <div className="border-t border-[#262626] pt-3 space-y-2.5">
                  <button
                    onClick={() => toggleAccordion('platform')}
                    className="w-full flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Platform</span>
                    {openAccordion.platform ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  {openAccordion.platform && (
                    <div className="space-y-2 pt-1">
                      {['windows', 'mac'].map((plat) => {
                        const isChecked = selectedPlatforms.includes(plat)
                        return (
                          <label
                            key={plat}
                            className="flex items-center gap-2.5 text-xs text-zinc-400 hover:text-white cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFilter(selectedPlatforms, setSelectedPlatforms, plat)}
                              className="rounded bg-[#222222] border-[#333333] text-[#FC6301] focus:ring-0 cursor-pointer"
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

      </div>
    </div>
  )
}

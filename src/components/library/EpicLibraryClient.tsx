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
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUserLibraryAction } from '@/actions/libraryActions'
import { getSecureDownloadUrlAction } from '@/actions/downloadActions'
import { BillingHistory } from '@/components/BillingHistory'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'
import { LogoIcon } from '@/components/Logo'
import { PluginActivationModal } from './PluginActivationModal'

const WindowsIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="-2 -2 28 28" fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.802" />
  </svg>
)

const AppleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="1.5 2.5 20 20.5" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-.99 1.72-.88 2.76 1.01.08 2-.51 2.61-1.26z" />
  </svg>
)

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
  initialUser?: any
}

export function EpicLibraryClient({
  purchases: initialPurchases,
  userEmail: initialUserEmail,
  userName: initialUserName,
  downloadTokens: initialDownloadTokens,
  initialUser,
}: EpicLibraryClientProps) {
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuth()

  const [purchases, setPurchases] = useState<PurchaseItem[]>(initialPurchases || [])
  const [userEmail, setUserEmail] = useState<string>(initialUserEmail || '')
  const [userName, setUserName] = useState<string>(initialUserName || '')
  const [downloadTokens, setDownloadTokens] = useState<Record<string, string>>(initialDownloadTokens || {})
  const [isClientFetching, setIsClientFetching] = useState(!initialUser)

  // Hybrid Auth Check: Only redirect if client is genuinely NOT logged in
  useEffect(() => {
    if (initialUser) {
      setIsClientFetching(false)
      return
    }

    if (authLoading) return

    if (!authUser) {
      // User is genuinely not logged in
      router.push('/auth?next=/library')
      return
    }

    // User is logged in on client side -> Fetch verified purchases
    const fetchClientLibrary = async () => {
      try {
        setIsClientFetching(true)
        const res = await getUserLibraryAction()
        if (res.success && res.user) {
          setPurchases(res.purchases || [])
          setUserEmail(res.user.email || authUser.email || '')
          setUserName(res.user.name || authUser.user_metadata?.full_name || 'Producer')
          setDownloadTokens(res.downloadTokens || {})
        } else {
          // Client-side direct query fallback
          const { createClient: createBrowserClient } = await import('@/lib/supabase/client')
          const supabase = createBrowserClient()
          const { data: clientPurchases } = await supabase
            .from('purchases')
            .select('*, products(*, brands(name))')
            .eq('user_id', authUser.id)
            .order('purchased_at', { ascending: false })

          if (clientPurchases) {
            setPurchases(clientPurchases as any[])
            setUserEmail(authUser.email || '')
            setUserName(authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Producer')
          }
        }
      } catch (err) {
        console.error('Error fetching client library:', err)
      } finally {
        setIsClientFetching(false)
      }
    }

    fetchClientLibrary()
  }, [initialUser, authUser, authLoading, router])

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'plugins' | 'sounds' | 'receipts'>('all')
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'az' | 'za' | 'recent'>('az')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchTitle, setSearchTitle] = useState('')
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  // Hardware Plugin Activation Modal State
  const searchParams = useSearchParams()
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false)
  const [claimCode, setClaimCode] = useState('')

  useEffect(() => {
    const claim = searchParams?.get('claim')
    if (claim) {
      setClaimCode(claim)
      setIsActivationModalOpen(true)
    }
  }, [searchParams])

  // Download Modal State
  const [installProduct, setInstallProduct] = useState<PurchaseItem | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'mac' | 'universal'>('windows')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  // Offline License File (.ptlic) State
  const [offlineDeviceId, setOfflineDeviceId] = useState('')
  const [showOfflineLicenseInput, setShowOfflineLicenseInput] = useState(false)
  const [isDownloadingOfflineLicense, setIsDownloadingOfflineLicense] = useState(false)
  const [offlineLicenseError, setOfflineLicenseError] = useState<string | null>(null)
  const [offlineLicenseSuccess, setOfflineLicenseSuccess] = useState(false)

  const handleDownloadOfflineLicense = async (productId: string, slug?: string) => {
    if (!offlineDeviceId.trim()) {
      setOfflineLicenseError('Please paste your 64-character Device ID from your plugin.')
      return
    }

    const clean = offlineDeviceId.trim().toLowerCase().replace(/[^0-9a-f]/g, '')
    if (clean.length !== 64) {
      setOfflineLicenseError('Device ID must be exactly 64 hexadecimal characters. Copy it from your plugin under "Offline File" tab.')
      return
    }

    setIsDownloadingOfflineLicense(true)
    setOfflineLicenseError(null)

    try {
      const res = await fetch('/api/v1/license/offline/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, deviceId: clean }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setOfflineLicenseError(data.error || 'Failed to generate offline license.')
        return
      }

      const blob = await res.blob()
      const filename = `${(slug || 'license').toLowerCase()}.ptlic`
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setOfflineLicenseSuccess(true)
      setTimeout(() => setOfflineLicenseSuccess(false), 5000)
    } catch (err: any) {
      setOfflineLicenseError(err.message || 'Error downloading license file.')
    } finally {
      setIsDownloadingOfflineLicense(false)
    }
  }

  const handleStartDownload = async (productId: string, platform: 'windows' | 'mac' | 'universal') => {
    try {
      setIsDownloading(true)
      setDownloadError(null)
      const plat = platform === 'universal' ? 'all' : platform
      const res = await getSecureDownloadUrlAction(productId, plat)

      if (res.success && res.downloadUrl) {
        // Trigger secure attachment download via native link click
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = res.downloadUrl
        link.setAttribute('download', '')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => {
          setIsDownloading(false)
          setInstallProduct(null)
        }, 1200)
      } else {
        setDownloadError(res.error || 'Failed to generate secure download link')
        setIsDownloading(false)
      }
    } catch (err: any) {
      setDownloadError(err.message || 'Error initializing download')
      setIsDownloading(false)
    }
  }

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

  if (!initialUser && (authLoading || isClientFetching)) {
    return (
      <div className="w-full min-h-[70vh] bg-[#121212] flex flex-col items-center justify-center space-y-4">
        <ButtonSpinner size={32} variant="light" />
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 animate-pulse">
          Opening Your Producer Vault...
        </p>
      </div>
    )
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
        <div className="flex items-center gap-4 sm:gap-6 border-b border-[#242424] pb-2 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 relative transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'all'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full bg-[#202020] text-zinc-400 font-normal">
              {purchases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-2 relative transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'favorites'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Favorites</span>
            {favorites.length > 0 && (
              <span className="text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full bg-[#202020] text-zinc-400 font-normal">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('plugins')}
            className={`pb-2 relative transition-colors cursor-pointer flex-shrink-0 ${
              activeTab === 'plugins'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Plugins
          </button>

          <button
            onClick={() => setActiveTab('sounds')}
            className={`pb-2 relative transition-colors cursor-pointer flex-shrink-0 ${
              activeTab === 'sounds'
                ? 'text-white border-b-2 border-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sounds
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`pb-2 relative transition-colors cursor-pointer flex-shrink-0 ${
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
                          {sortBy === key && <Check className="w-3.5 h-3.5 text-white" />}
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
                      className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3.5 px-6 rounded-xl inline-block uppercase tracking-wider transition-all text-center cursor-pointer active:scale-[0.99]"
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
                          className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#181818] border border-[#242424] shadow-md mb-2 block cursor-pointer"
                          title={`Click to Download ${product.name}`}
                        >
                          <Image
                            src={product.cover_image}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover object-center group-hover:brightness-110 transition-all duration-200"
                          />
                          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

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

                        {/* Title and Download bar */}
                        <div className="flex items-start justify-between gap-1 px-0.5">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold text-white truncate leading-snug block group-hover:text-zinc-200">
                              {product.name}
                            </span>

                            <div className="text-[11px] font-semibold text-zinc-400 group-hover:text-white flex items-center gap-1 mt-0.5 transition-colors">
                              <Download className="w-3 h-3 text-zinc-400" />
                              <span>Download</span>
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
                                  <span>Download Options</span>
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
                            <span>Download</span>
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
              <div className="bg-[#141414] rounded-xl p-4.5 space-y-3.5 border border-[#222222]">
                
                {/* Filters Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Filters</h3>
                  {(searchTitle || selectedGenres.length > 0 || selectedFeatures.length > 0 || selectedTypes.length > 0 || selectedPlatforms.length > 0) && (
                    <button
                      onClick={() => {
                        setSearchTitle('')
                        setSelectedGenres([])
                        setSelectedFeatures([])
                        setSelectedTypes([])
                        setSelectedPlatforms([])
                      }}
                      className="text-[11px] text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Search Title Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Search by title..."
                    className="w-full bg-[#181818] border border-[#262626] text-white text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-zinc-400 placeholder:text-zinc-600 transition-colors"
                  />
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
                              className="rounded bg-[#202020] border-[#333333] text-white accent-white focus:ring-0 cursor-pointer"
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
                              className="rounded bg-[#202020] border-[#333333] text-white accent-white focus:ring-0 cursor-pointer"
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
                              className="rounded bg-[#202020] border-[#333333] text-white accent-white focus:ring-0 cursor-pointer"
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
                              className="rounded bg-[#202020] border-[#333333] text-white accent-white focus:ring-0 cursor-pointer"
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

        {/* ================= EXACT EPIC GAMES LAUNCHER DOWNLOAD MODAL ================= */}
        {installProduct && (() => {
          const product = installProduct.products
          const isSamplePack =
            product.product_type === 'sample_pack' ||
            product.product_type === 'sound' ||
            product.product_type === 'preset'

          const activeUrl = getActiveDownloadUrl(installProduct)

          return (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200"
              onClick={() => setInstallProduct(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[440px] bg-[#121214] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-200 relative max-h-[92vh] overflow-y-auto"
              >
                {/* Close X */}
                <button
                  onClick={() => {
                    setInstallProduct(null)
                    setDownloadError(null)
                    setShowOfflineLicenseInput(false)
                    setOfflineLicenseError(null)
                  }}
                  className="absolute top-4 right-4 text-[#71717a] hover:text-white p-1.5 rounded-lg hover:bg-[#18181b] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header */}
                {(() => {
                  const cleanTitle = (product.name || 'Plugin').split('–')[0].split('-')[0].trim()
                  return (
                    <div className="flex items-center gap-3.5 pr-6">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-[#18181b] border border-[#27272a] flex-shrink-0">
                        <Image
                          src={product.cover_image}
                          alt={cleanTitle}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-bold text-white tracking-tight truncate">
                          {cleanTitle}
                        </h2>
                        <p className="text-xs text-[#a1a1aa] truncate">
                          {product.brands?.name || product.brand || 'ProducerToy'} • {isSamplePack ? 'Sample Pack' : 'Audio Plugin'}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* Serial Key */}
                {installProduct.serial_key && (
                  <div className="bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-mono text-[#71717a] block tracking-wider">
                        Serial Key
                      </span>
                      <span className="font-mono text-xs font-semibold text-white tracking-wider select-all block truncate">
                        {installProduct.serial_key}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopySerial(installProduct.serial_key!, installProduct.id)}
                      className="px-2.5 py-1 text-xs text-[#a1a1aa] hover:text-white bg-[#27272a] hover:bg-[#3f3f46] rounded-md transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                    >
                      {copiedKeyId === installProduct.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Offline License (.ptlic) */}
                {!isSamplePack && (
                  <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#a1a1aa] font-medium">
                        Offline Workstation License (.ptlic)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOfflineLicenseInput(!showOfflineLicenseInput)
                          setOfflineLicenseError(null)
                        }}
                        className="text-xs text-white hover:text-zinc-300 font-medium underline cursor-pointer"
                      >
                        {showOfflineLicenseInput ? 'Close' : 'Generate'}
                      </button>
                    </div>

                    {showOfflineLicenseInput && (
                      <div className="pt-2 border-t border-[#27272a] space-y-2 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={offlineDeviceId}
                            onChange={(e) => {
                              setOfflineDeviceId(e.target.value)
                              setOfflineLicenseError(null)
                            }}
                            placeholder="Paste 64-char Device ID"
                            className="flex-1 h-9 bg-[#121214] border border-[#27272a] focus:border-[#52525b] rounded-lg px-2.5 text-xs text-white font-mono placeholder:text-[#52525b] focus:outline-none transition-all"
                          />
                          <button
                            type="button"
                            disabled={isDownloadingOfflineLicense}
                            onClick={() =>
                              handleDownloadOfflineLicense(
                                product.id || installProduct.product_id || installProduct.id,
                                product.slug
                              )
                            }
                            className="h-9 px-3 bg-white text-[#121212] font-semibold text-xs rounded-lg hover:bg-[#e4e4e7] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                          >
                            {isDownloadingOfflineLicense ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-500 border-t-black animate-spin" />
                            ) : offlineLicenseSuccess ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Downloaded</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Get .ptlic</span>
                              </>
                            )}
                          </button>
                        </div>

                        {offlineLicenseError && (
                          <div className="text-[11px] text-[#ff4053] font-medium">
                            {offlineLicenseError}
                          </div>
                        )}

                        {offlineLicenseSuccess && (
                          <div className="text-[11px] text-emerald-400 font-medium">
                            ✓ License downloaded. Load in plugin under Offline File tab.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Platform Selector */}
                {!isSamplePack ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlatform('windows')}
                      className={`h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        selectedPlatform === 'windows'
                          ? 'bg-white text-[#121212] border-white shadow-sm'
                          : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border-[#27272a]'
                      }`}
                    >
                      <WindowsIcon className="w-4 h-4 shrink-0" />
                      <span>Windows</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlatform('mac')}
                      className={`h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        selectedPlatform === 'mac'
                          ? 'bg-white text-[#121212] border-white shadow-sm'
                          : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border-[#27272a]'
                      }`}
                    >
                      <AppleIcon className="w-4 h-4 shrink-0" />
                      <span>Mac</span>
                    </button>
                  </div>
                ) : null}

                {/* Download Error Alert */}
                {downloadError && (
                  <div className="bg-[#ff4053] text-black font-extrabold p-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                    <span>{downloadError}</span>
                  </div>
                )}

                {/* Download Action */}
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={() =>
                    handleStartDownload(
                      product.id || installProduct.product_id || installProduct.id,
                      selectedPlatform
                    )
                  }
                  className="w-full h-12 bg-white text-[#121212] font-semibold text-xs rounded-xl hover:bg-[#e4e4e7] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-500 border-t-black animate-spin" />
                      <span>Preparing Download...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Installer</span>
                    </>
                  )}
                </button>

              </div>
            </div>
          )
        })()}

        {/* Plugin Hardware Device Activation Modal */}
        <PluginActivationModal
          isOpen={isActivationModalOpen}
          initialCode={claimCode}
          onClose={() => setIsActivationModalOpen(false)}
        />

      </div>
    </div>
  )
}

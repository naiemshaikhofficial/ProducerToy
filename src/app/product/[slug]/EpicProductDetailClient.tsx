'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Play,
  Pause,
  Check,
  ExternalLink,
  Share2,
  Flag,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ShoppingCart,
  Gift,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAudio } from '@/context/AudioContext'
import { useAuth } from '@/context/AuthContext'
import { ToywardsSparkleIcon } from '@/components/account/RewardsAndWalletTab'
import { ProductSpecsOverview } from '@/components/ProductTypeSpecs'
import { SendGiftModal } from '@/components/gifts/SendGiftModal'
import { EpicRatingModal } from '@/components/product/EpicRatingModal'
import { ProductFaqSection } from '@/components/product/ProductFaqSection'
import { RelatedProductsSection } from '@/components/product/RelatedProductsSection'
import { AutoLinkText } from '@/components/seo/AutoLinkText'
import { ProductRatingStats } from '@/actions/ratingActions'
import { createClient } from '@/lib/supabase/client'

function WindowsIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <Image
      src="/icons8-windows-100.png"
      alt="Windows"
      width={20}
      height={20}
      className={`${className} object-contain inline-block`}
    />
  )
}

function AppleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <Image
      src="/icons8-apple-100.png"
      alt="macOS"
      width={20}
      height={20}
      className={`${className} object-contain inline-block`}
    />
  )
}

export function EpicProductDetailClient({
  product,
  initialRatingStats,
  initialIsOwned = false,
}: {
  product: any
  initialRatingStats?: ProductRatingStats
  initialIsOwned?: boolean
}) {
  const router = useRouter()
  const { user } = useAuth()
  const { formatPrice, convertUsdToInr } = useCurrency()
  const { addItem, isInCart, openCheckout } = useCart()
  const { isWishlisted: checkWishlisted, toggleWishlist } = useWishlist()
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  const [activeTab, setActiveTab] = useState<'overview' | 'addons' | 'faq' | 'specs'>('overview')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isDescExpanded, setIsDescExpanded] = useState(false)
  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [isOwned, setIsOwned] = useState<boolean>(initialIsOwned)
  const [ratingStats, setRatingStats] = useState<ProductRatingStats>(
    initialRatingStats || { averageRating: 0, totalReviews: 0, userCanRate: true }
  )

  useEffect(() => {
    if (initialIsOwned) {
      setIsOwned(true)
      return
    }
    if (!user?.id || !product?.id) return

    const supabase = createClient()
    supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setIsOwned(true)
        }
      })
  }, [user?.id, product?.id, initialIsOwned])

  const isSaved = checkWishlisted(product.id)
  const isCurrentPlaying = currentTrack?.id === product.id && isPlaying
  const added = isInCart(product.id)

  const handleGetNow = () => {
    if (product.external_url) {
      window.open(product.external_url, '_blank')
      return
    }

    const priceUsd = Number(product.price_usd) || 0
    const priceInr = product.price_inr ? Number(product.price_inr) : convertUsdToInr(priceUsd)

    // Open Instant In-Place Checkout Modal
    openCheckout({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price_inr: priceInr,
      price_usd: priceUsd,
      cover_image: product.cover_image,
      product_type: product.product_type,
      brand: product.brands?.name || product.brand || 'Producer Toy',
    })
  }

  const ytVideoId = (() => {
    const url = product.youtube_url || product.video_url
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  })()

  const dbExtraImages: string[] = Array.isArray(product.gallery_images)
    ? product.gallery_images
    : Array.isArray(product.images)
    ? product.images
    : []

  const mediaItems: Array<{ type: 'video' | 'image'; url: string; videoId?: string }> = []

  if (ytVideoId) {
    mediaItems.push({
      type: 'video',
      url: `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`,
      videoId: ytVideoId,
    })
  }

  const rawImages = [
    product.cover_image,
    ...dbExtraImages.filter((url: string) => url && url !== product.cover_image),
  ].filter(Boolean)

  if (rawImages.length === 0 && product.cover_image) {
    rawImages.push(product.cover_image)
  }

  rawImages.forEach((img: string) => {
    mediaItems.push({ type: 'image', url: img })
  })

  const activeMedia = mediaItems[selectedImageIndex] || mediaItems[0] || {
    type: 'image',
    url: product.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop',
  }

  const handleAudition = () => {
    if (!product.demo_audio_url) return

    if (currentTrack?.id === product.id) {
      togglePlay()
    } else {
      playTrack({
        id: product.id,
        name: product.name,
        brand: product.brands?.name || product.brand,
        audioUrl: product.demo_audio_url,
        coverImage: product.cover_image,
      })
    }
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handlePrevThumb = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
  }

  const handleNextThumb = () => {
    setSelectedImageIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
  }

  const formattedType = (type: string) => {
    switch (type) {
      case 'plugin':
        return 'Audio Plugin'
      case 'sample_pack':
        return 'Sample Pack'
      case 'preset':
        return 'Synth Preset'
      case 'template':
        return 'DAW Project'
      case 'sound_kit':
        return 'Sound Kit'
      default:
        return 'Sound Tool'
    }
  }

  const availableFormats =
    product.vst_format ||
    product.format ||
    (product.product_type === 'sample_pack' ? '24-Bit WAV / STEMS' : 'VST3, AU, AAX (64-Bit)')
  const publisherName = product.publisher || 'Producer Toy'
  const releaseYear =
    product.release_year ||
    product.release_date ||
    (product.created_at ? new Date(product.created_at).getFullYear().toString() : '2026')
  const developerName = product.brands?.name || product.brand || 'Producer Toy'

  const licenseType = (() => {
    if (product.license_type) return product.license_type
    const type = (product.product_type || '').toLowerCase()
    const isFree = Number(product.price_usd) === 0

    if (type === 'plugin' || type === 'vst' || product.vst_format) {
      if (isFree) return 'Freeware (Free License)'
      return product.is_rent_to_own ? 'Rent-to-Own / Perpetual' : 'Lifetime Commercial License'
    }

    return '100% Royalty-Free Commercial License'
  })()

  const getProductFeaturesList = (prod: any): string[] => {
    const type = (prod.product_type || '').toLowerCase()
    const name = (prod.name || '').toLowerCase()

    if (type === 'plugin' || name.includes('plugin') || name.includes('vst')) {
      const fmt = (prod.vst_format || prod.format || 'VST3, AU, AAX').split(',')[0]?.trim() || 'VST3'
      return [fmt, '64-Bit DSP', 'Universal DAW']
    }

    if (type === 'preset' || name.includes('preset')) {
      return ['Synth Presets', '100% Royalty Free', 'Universal DAW']
    }

    if (type === 'midi' || name.includes('midi')) {
      return ['.MID Format', 'Key & Scale Tagged', '100% Royalty Free']
    }

    if (type === 'template' || name.includes('template')) {
      return ['DAW Project File', 'Mixed & Mastered', '100% Royalty Free']
    }

    return ['24-Bit / 44.1kHz WAV', 'Key & BPM Tagged', '100% Royalty Free']
  }

  const featurePills = getProductFeaturesList(product)

  const subCategoryList = product.subcategories?.name
    ? [product.subcategories.name]
    : Array.isArray(product.sub_category || product.subcategory || product.tags)
    ? product.sub_category || product.subcategory || product.tags
    : typeof (product.sub_category || product.subcategory || product.tags || product.categories?.name) === 'string'
    ? (product.sub_category || product.subcategory || product.tags || product.categories?.name).split(',')
    : ['Sound Kits']

  return (
    <div className="space-y-6 text-white max-w-[1240px] mx-auto font-sans select-none pb-20">
      {/* ========================================================================= */}
      {/* 1. TOP TITLE HEADER & EPIC RATING (Exact 1:1 Match)                       */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          {product.name}
        </h1>

        {/* Epic Games Store Static Minimalist Star Rating */}
        <div className="flex items-center gap-2 pt-0.5 text-sm">
          {ratingStats.totalReviews > 0 ? (
            <>
              <div className="flex items-center text-white text-base tracking-[-2px] select-none">
                {'★'.repeat(Math.round(ratingStats.averageRating))}
                <span className="text-zinc-700">{'★'.repeat(5 - Math.round(ratingStats.averageRating))}</span>
              </div>
              <span className="text-white font-bold text-sm ml-0.5">{ratingStats.averageRating.toFixed(1)}</span>
              <span className="text-zinc-500 text-xs font-normal">({ratingStats.totalReviews})</span>
            </>
          ) : (
            <>
              <div className="flex items-center text-zinc-600 text-base tracking-[-2px] select-none">
                ★★★★★
              </div>
              <span className="text-zinc-400 text-xs font-normal">No ratings yet</span>
            </>
          )}

          <button
            type="button"
            onClick={() => setRatingModalOpen(true)}
            className="ml-2 text-xs text-zinc-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            {ratingStats.userRating ? `Your rating: ${ratingStats.userRating}★` : 'Rate Product'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION BAR (Exact 1:1 Match)                                   */}
      {/* ========================================================================= */}
      <div className="border-b border-[#202020]">
        <div className="flex items-center gap-8 text-sm font-medium overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'addons', label: 'Presets & Sounds' },
            { id: 'specs', label: 'Specs & Compatibility' },
            { id: 'faq', label: 'FAQ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 relative transition-colors cursor-pointer whitespace-nowrap text-[14px] ${
                activeTab === tab.id ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white font-normal'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE HERO & CTA SECTION (< lg ONLY - EXACT SCREENSHOT 1 & 2 MATCH)   */}
      {/* ========================================================================= */}
      <div className="block lg:hidden space-y-5">
        {/* A. Mobile Hero Poster (16:9 aspect) */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl bg-[#141414] border border-[#262626]">
          <Image
            src={product.cover_image}
            alt={product.name}
            fill
            unoptimized
            priority
            className="object-cover"
          />
        </div>

        {/* B. Certification / License Rating Box (Exact Screenshot Match) */}
        <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-[#222222] border border-[#333333] flex flex-col items-center justify-center text-center flex-shrink-0">
            <span className="text-[10px] font-bold text-[#FA742B] uppercase leading-none">AUDIO</span>
            <span className="text-sm font-bold text-white leading-tight">100%</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">100% Royalty-Free</div>
            <div className="text-xs text-zinc-400 mt-0.5">Commercial Sync & Master Clearance Included</div>
          </div>
        </div>

        {/* C. Category Tag Pill (Centered) */}
        <div className="flex justify-center">
          <span className="bg-[#242424] text-zinc-300 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border border-[#303030]">
            {formattedType(product.product_type)}
          </span>
        </div>

        {/* D. Price Display */}
        <div className="space-y-1 text-left">
          {isOwned ? (
            <span className="text-xs bg-emerald-950/60 text-emerald-400 font-bold px-2.5 py-1 rounded-md border border-emerald-500/40 inline-block mb-1">
              ALREADY OWNED
            </span>
          ) : product.is_coming_soon ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-black text-white uppercase tracking-tight">COMING SOON</span>
              {product.release_date && (
                <span className="text-[11px] font-bold bg-[#FA742B]/15 text-[#FA742B] border border-[#FA742B]/30 px-2.5 py-0.5 rounded-full">
                  Available {product.release_date}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              {Number(product.price_usd) === 0 ? (
                <span className="text-3xl font-bold text-white">FREE</span>
              ) : (
                <>
                  {product.original_price_usd && Number(product.original_price_usd) > Number(product.price_usd) && (
                    <>
                      <span className="text-xs bg-[#FA742B] text-white font-bold px-2 py-0.5 rounded">
                        -{Math.round(((Number(product.original_price_usd) - Number(product.price_usd)) / Number(product.original_price_usd)) * 100)}%
                      </span>
                      <span className="text-base text-zinc-500 line-through">
                        {formatPrice(product.original_price_inr, Number(product.original_price_usd))}
                      </span>
                    </>
                  )}
                  <span className="text-3xl font-bold text-white">
                    {formatPrice(product.price_inr, product.price_usd)}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* E. CTA Action Buttons */}
        <div className="space-y-3 pt-1">
          {product.external_url ? (
            <a
              href={product.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FA742B] hover:bg-[#E05A18] text-white py-4 px-6 rounded-xl text-sm font-bold uppercase tracking-wide w-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FA742B]/20 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{product.button_text || 'Get Now'}</span>
            </a>
          ) : isOwned ? (
            <Link
              href="/library"
              className="w-full py-4 px-6 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 bg-[#1c1c1c] hover:bg-[#252525] border border-emerald-500/50 text-white transition-all shadow-lg cursor-pointer"
            >
              <Check className="w-5 h-5 text-emerald-400" />
              <span>In Library</span>
            </Link>
          ) : product.is_coming_soon ? (
            <button
              type="button"
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  brand: product.brands?.name || product.brand || 'Producer Toy',
                  product_type: product.product_type || 'plugin',
                  price_inr: product.price_inr ? Number(product.price_inr) : convertUsdToInr(Number(product.price_usd) || 0),
                  price_usd: Number(product.price_usd) || 0,
                  cover_image: product.cover_image,
                  vst_format: product.vst_format,
                  short_description: product.short_description,
                })
              }
              className={`w-full py-4 px-6 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                isSaved
                  ? 'bg-rose-950/50 border border-rose-600 text-rose-300'
                  : 'bg-[#FA742B] hover:bg-[#E05A18] text-white shadow-[#FA742B]/20 active:scale-95'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-300' : ''}`} />
              <span>{isSaved ? 'In Wishlist (Get Notified)' : 'Add to Wishlist (Get Notified)'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGetNow}
                className="flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer bg-[#FA742B] hover:bg-[#E05A18] text-white active:scale-[0.98] shadow-lg shadow-[#FA742B]/20"
              >
                <span>{Number(product.price_usd) === 0 ? 'Download Free' : 'Buy Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => addItem(product, true)}
                className={`w-14 h-14 rounded-xl border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                  added
                    ? 'bg-[#282828] hover:bg-[#303030] border-[#383838] text-white'
                    : 'bg-[#202020] hover:bg-[#2c2c2c] border-[#303030] text-zinc-200 hover:text-white'
                }`}
                aria-label="Add to cart"
                title={added ? 'In Cart' : 'Add to Cart'}
              >
                {added ? <Check className="w-5 h-5 text-white" /> : <ShoppingCart className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Gift Button */}
          <button
            type="button"
            onClick={() => setGiftModalOpen(true)}
            className="w-full py-3.5 px-5 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#2c2c2c] text-zinc-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 relative"
          >
            <Gift className="w-4 h-4 text-zinc-300" />
            <span>Gift</span>
            <span className="absolute right-4 bg-[#2c2c2c] text-zinc-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#383838]">
              New!
            </span>
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() =>
              toggleWishlist({
                id: product.id,
                name: product.name,
                slug: product.slug,
                brand: product.brands?.name || product.brand || 'Producer Toy',
                product_type: product.product_type || 'plugin',
                price_inr: product.price_inr ? Number(product.price_inr) : convertUsdToInr(Number(product.price_usd) || 0),
                price_usd: Number(product.price_usd) || 0,
                cover_image: product.cover_image,
                vst_format: product.vst_format,
                short_description: product.short_description,
              })
            }
            className={`w-full py-3.5 px-5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              isSaved
                ? 'bg-rose-950/40 border-rose-600 text-rose-400'
                : 'bg-[#202020] hover:bg-[#282828] border-[#2c2c2c] text-zinc-200 hover:text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
            <span>{isSaved ? 'In Wishlist' : 'Wishlist'}</span>
          </button>

          {/* Audition Demo Button */}
          {product.demo_audio_url && (
            <button
              type="button"
              onClick={handleAudition}
              className="w-full bg-[#1c1c1c] hover:bg-[#252525] text-white border border-[#303030] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isCurrentPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause Audition</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Audition Demo</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* F. Metadata Specs List */}
        <div className="border-t border-b border-[#222222] py-3 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Toywards</span>
            <Link
              href="/features/toywards"
              target="_blank"
              className="font-bold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Earn <strong className="text-[#FA742B]">Toywards</strong></span>
              <ToywardsSparkleIcon size={14} className="text-[#FA742B]" />
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Refund Type</span>
            <div className="flex items-center gap-1 font-semibold text-zinc-200">
              <span>Instant Cloud Delivery</span>
              <Info className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Developer</span>
            <span className="font-semibold text-white">{developerName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Publisher</span>
            <span className="font-semibold text-white">{publisherName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Release Date</span>
            <span className="font-semibold text-white">{releaseYear}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Platform</span>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-[#222222] text-zinc-200 rounded border border-[#333333]" title="Windows">
                <WindowsIcon className="w-3.5 h-3.5" />
              </span>
              <span className="p-1 bg-[#222222] text-zinc-200 rounded border border-[#333333]" title="macOS">
                <AppleIcon className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Format</span>
            <span className="font-semibold text-white">{availableFormats}</span>
          </div>
        </div>

        {/* G. Social Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#2c2c2c] text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-zinc-400" />
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <Link
            href="/contact"
            prefetch={true}
            className="flex-1 py-3 px-4 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#2c2c2c] text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Flag className="w-4 h-4 text-zinc-400" />
            <span>Report</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN 2-COLUMN GRID (DESKTOP >= lg & SHARED BODY CONTENT)               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start pt-2">
        {/* ================= LEFT COLUMN (MEDIA & DETAILS) ================= */}
        <div className="lg:col-span-8 space-y-8 w-full">
          {/* Media Showcase */}
          <div className="space-y-3 w-full">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl bg-[#121212] border border-[#222222]">
              {activeMedia.type === 'video' && activeMedia.videoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeMedia.videoId}?autoplay=1&mute=0&rel=0&controls=0&modestbranding=1&iv_load_policy=3&disablekb=1&showinfo=0&autohide=1&fs=0&playsinline=1&loop=1&playlist=${activeMedia.videoId}`}
                  title={`${product.name} Video Demo`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <Image
                  src={activeMedia.url}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                />
              )}

              {/* Audition Demo Button Overlay */}
              {product.demo_audio_url && activeMedia.type !== 'video' && (
                <button
                  type="button"
                  onClick={handleAudition}
                  className="absolute bottom-4 right-4 bg-black/80 hover:bg-[#FA742B] text-white px-4 py-2.5 rounded-full backdrop-blur-md transition-all z-20 flex items-center gap-2 text-xs font-bold shadow-2xl border border-white/10 cursor-pointer"
                >
                  {isCurrentPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Demo</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      <span>Audition Audio</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Thumbnail Carousel Strip (Clean Epic Spacing, No Clipping) */}
            {mediaItems.length > 1 && (
              <div className="flex items-center gap-3 pt-2 w-full">
                {mediaItems.length > 4 && (
                  <button
                    type="button"
                    onClick={handlePrevThumb}
                    className="p-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-zinc-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                    aria-label="Previous media"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                <div className="flex-1 flex items-center gap-3 overflow-x-auto py-1.5 px-0.5 custom-scrollbar">
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-24 sm:w-28 h-14 rounded-xl overflow-hidden transition-all flex-shrink-0 cursor-pointer group ${
                        selectedImageIndex === idx
                          ? 'ring-2 ring-[#FA742B] opacity-100 shadow-md'
                          : 'border border-[#282828] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={item.url} alt={`Media ${idx + 1}`} fill unoptimized className="object-cover" />
                      {item.type === 'video' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {mediaItems.length > 4 && (
                  <button
                    type="button"
                    onClick={handleNextThumb}
                    className="p-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-zinc-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                    aria-label="Next media"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Lead Hook Tagline / Description */}
          <div className="space-y-6 w-full">
            {product.short_description && (
              <p className="text-base sm:text-lg text-zinc-200 leading-relaxed font-medium">
                {product.short_description}
              </p>
            )}

            {/* Genres & Features Badges */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-6 pt-5 pb-2 border-t border-[#202020]">
                {/* Genres / Categories */}
                <div className="space-y-2.5 pr-4 border-r border-[#262626]">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Genres
                  </span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
                    <span className="bg-[#202020] text-zinc-200 border border-[#2c2c2c] text-xs font-semibold px-3 py-1.5 rounded-lg">
                      {formattedType(product.product_type)}
                    </span>
                    {subCategoryList.map((subCat: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-[#202020] text-zinc-200 border border-[#2c2c2c] text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        {subCat.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2.5 pl-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Features
                  </span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
                    {featurePills.map((feat: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-[#202020] text-zinc-200 border border-[#2c2c2c] text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Highlight Promo Card: Toywards */}
            <div className="p-6 rounded-2xl border border-[#3b1706] bg-gradient-to-r from-[#260e03] via-[#1c0a02] to-[#121212] space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FA742B]/10 border border-[#FA742B]/30 flex items-center justify-center">
                  <ToywardsSparkleIcon size={20} className="text-[#FA742B]" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white tracking-tight">
                    Earn with Toywards Rewards
                  </h4>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Earn up to 20% cashback in Toywards balance on eligible purchases. Spend 1:1 on plugins and sound kits at checkout.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  href="/features/toywards"
                  prefetch={true}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-[#242424] hover:bg-[#2c2c2c] text-white border border-[#383838] text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Explore Toywards
                </Link>
              </div>
            </div>

            {/* Detailed Description & Read More */}
            {activeTab === 'overview' && product.full_description && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xl font-bold text-white tracking-tight">About {product.name}</h3>
                <div
                  className={`text-sm text-zinc-300 leading-relaxed space-y-4 font-normal transition-all ${
                    !isDescExpanded ? 'max-h-48 overflow-hidden relative' : ''
                  }`}
                >
                  <AutoLinkText text={product.full_description} />
                  {!isDescExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 pt-1 cursor-pointer transition-colors"
                >
                  <span>{isDescExpanded ? 'Show less' : 'Show more'}</span>
                  {isDescExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Specs & Compatibility */}
            {(activeTab === 'specs' || activeTab === 'overview') && (
              <ProductSpecsOverview
                product={product}
                ratingStats={ratingStats}
                onOpenRatingModal={() => setRatingModalOpen(true)}
              />
            )}

            {/* FAQ Tab & Overview FAQ Section */}
            {(activeTab === 'faq' || activeTab === 'overview') && (
              <ProductFaqSection product={product} />
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN (STICKY DESKTOP SIDEBAR >= lg) ================= */}
        <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-4 space-y-4 w-full">
          {/* Direct Prominent Brand Logo */}
          <div className="relative w-full h-20 sm:h-24 flex items-center justify-center py-1">
            <Image
              src={product.brands?.logo_url || product.brand_logo || '/logo-white.png'}
              alt={developerName}
              width={360}
              height={144}
              unoptimized
              className="object-contain max-h-20 sm:max-h-24 w-auto mx-auto filter brightness-200 contrast-200 drop-shadow-xl"
            />
          </div>

          <div>
            <span className="bg-[#242424] text-zinc-200 text-xs font-semibold px-3 py-1 rounded-md inline-block uppercase tracking-wider border border-[#303030]">
              {formattedType(product.product_type)}
            </span>
          </div>

          <div className="space-y-2">
            {isOwned ? (
              <span className="text-xs bg-emerald-950/60 text-emerald-400 font-bold px-2.5 py-1 rounded-md border border-emerald-500/40 inline-block mb-1">
                ALREADY OWNED
              </span>
            ) : product.is_coming_soon ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl font-black text-white uppercase tracking-tight">COMING SOON</span>
                {product.release_date && (
                  <span className="text-[11px] font-bold bg-[#FA742B]/15 text-[#FA742B] border border-[#FA742B]/30 px-2.5 py-0.5 rounded-full">
                    Available {product.release_date}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                {Number(product.price_usd) === 0 ? (
                  <span className="text-3xl font-bold text-white">FREE</span>
                ) : (
                  <>
                    {product.original_price_usd && Number(product.original_price_usd) > Number(product.price_usd) && (
                      <>
                        <span className="text-xs bg-[#FA742B] text-white font-bold px-2 py-1 rounded">
                          -{Math.round(((Number(product.original_price_usd) - Number(product.price_usd)) / Number(product.original_price_usd)) * 100)}%
                        </span>
                        <span className="text-base text-zinc-500 line-through">
                          {formatPrice(product.original_price_inr, Number(product.original_price_usd))}
                        </span>
                      </>
                    )}
                    <span className="text-3xl font-bold text-white">
                      {formatPrice(product.price_inr, product.price_usd)}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Toywards Rewards Pill */}
            {Number(product.price_usd) > 0 && !isOwned && !product.is_coming_soon && (
              <Link
                href="/features/toywards"
                target="_blank"
                className="inline-flex items-center gap-2 bg-[#26150b] hover:bg-[#321b0f] border border-[#4a2412] px-3.5 py-1.5 rounded-full text-xs select-none shadow-xs transition-colors group cursor-pointer"
                title="Learn more about Toywards"
              >
                <ToywardsSparkleIcon size={14} className="text-[#FA742B]" />
                <span className="text-zinc-300">
                  Earn <span className="text-[#FA742B] font-semibold">Toywards Rewards</span> on this purchase
                </span>
              </Link>
            )}
          </div>

          {/* Desktop CTA Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {product.external_url ? (
              <a
                href={product.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FA742B] hover:bg-[#E05A18] text-white py-3.5 px-6 rounded-xl text-sm font-bold uppercase tracking-wide w-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FA742B]/20 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{product.button_text || 'Get'}</span>
              </a>
            ) : isOwned ? (
              <Link
                href="/library"
                className="w-full py-3.5 px-6 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 bg-[#1c1c1c] hover:bg-[#252525] border border-emerald-500/50 text-white transition-all shadow-md cursor-pointer"
              >
                <Check className="w-5 h-5 text-emerald-400" />
                <span>In Library</span>
              </Link>
            ) : product.is_coming_soon ? (
              <button
                type="button"
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    brand: product.brands?.name || product.brand || 'Producer Toy',
                    product_type: product.product_type || 'plugin',
                    price_inr: product.price_inr ? Number(product.price_inr) : convertUsdToInr(Number(product.price_usd) || 0),
                    price_usd: Number(product.price_usd) || 0,
                    cover_image: product.cover_image,
                    vst_format: product.vst_format,
                    short_description: product.short_description,
                  })
                }
                className={`w-full py-3.5 px-6 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  isSaved
                    ? 'bg-rose-950/50 border border-rose-600 text-rose-300'
                    : 'bg-[#FA742B] hover:bg-[#E05A18] text-white shadow-[#FA742B]/20 active:scale-95'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-300' : ''}`} />
                <span>{isSaved ? 'In Wishlist (Get Notified)' : 'Add to Wishlist (Get Notified)'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetNow}
                  className="flex-1 py-3.5 px-6 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer bg-[#FA742B] hover:bg-[#E05A18] text-white active:scale-[0.99] shadow-lg shadow-[#FA742B]/20"
                >
                  <span>{Number(product.price_usd) === 0 ? 'Download Free' : 'Buy Now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => addItem(product, true)}
                  className={`w-12 h-12 rounded-xl border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                    added
                      ? 'bg-[#282828] hover:bg-[#303030] border-[#383838] text-white'
                      : 'bg-[#222222] hover:bg-[#2c2c2c] border-[#303030] text-zinc-200 hover:text-white'
                  }`}
                  aria-label="Add to cart"
                  title={added ? 'In Cart' : 'Add to Cart'}
                >
                  {added ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}

            {/* Gift Button */}
            <button
              type="button"
              onClick={() => setGiftModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#2c2c2c] text-zinc-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 relative"
            >
              <Gift className="w-4 h-4 text-zinc-300" />
              <span>Gift</span>
              <span className="absolute right-4 bg-[#2c2c2c] text-zinc-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#383838]">
                New!
              </span>
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  brand: product.brands?.name || product.brand || 'Producer Toy',
                  product_type: product.product_type || 'plugin',
                  price_inr: product.price_inr ? Number(product.price_inr) : convertUsdToInr(Number(product.price_usd) || 0),
                  price_usd: Number(product.price_usd) || 0,
                  cover_image: product.cover_image,
                  vst_format: product.vst_format,
                  short_description: product.short_description,
                })
              }
              className={`w-full py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-white text-black border-white'
                  : 'bg-[#222222] hover:bg-[#2a2a2a] border-[#333333] text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-black' : ''}`} />
              <span>{isSaved ? 'In Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Desktop Metadata Specs Table */}
          <div className="space-y-3 pt-4 text-xs border-t border-[#202020]">
            <div className="flex items-center justify-between pb-1">
              <span className="text-zinc-400">Developer</span>
              <span className="font-semibold text-white">{developerName}</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-zinc-400">Publisher</span>
              <span className="font-semibold text-white">{publisherName}</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-zinc-400">Release Year</span>
              <span className="font-semibold text-white">{releaseYear}</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-zinc-400">Format</span>
              <span className="font-semibold text-white">{availableFormats}</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-zinc-400">Platform</span>
              <div className="flex items-center gap-2">
                <span
                  className="p-1.5 bg-[#222222] text-zinc-200 rounded-md border border-[#333333] flex items-center justify-center"
                  title="Windows"
                >
                  <WindowsIcon className="w-4 h-4" />
                </span>
                <span
                  className="p-1.5 bg-[#222222] text-zinc-200 rounded-md border border-[#333333] flex items-center justify-center"
                  title="macOS"
                >
                  <AppleIcon className="w-4 h-4" />
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-zinc-400">License Type</span>
              <span className="font-semibold text-white">{licenseType}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleShare}
              className="w-full bg-[#161616] hover:bg-[#222222] border border-[#2a2a2a] text-zinc-300 hover:text-white py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RELATED PRODUCTS / ALTERNATIVE PLUGINS INTERNAL LINKING MESH            */}
      {/* ========================================================================= */}
      <RelatedProductsSection
        currentProductId={product.id}
        currentProductSlug={product.slug}
        currentProductType={product.product_type}
        categorySlugs={product.category_slugs}
        brandName={developerName}
      />

      {/* ========================================================================= */}
      {/* 5. EPIC 1:1 STAR RATING MODAL (Minimalist Dark UI)                         */}
      {/* ========================================================================= */}
      <EpicRatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
        initialRating={ratingStats.userRating || 5}
        onRatingSuccess={(updatedStats) => setRatingStats(updatedStats)}
      />

      {/* ========================================================================= */}
      {/* 6. 1:1 SEND GIFT MODAL POPUP                                              */}
      {/* ========================================================================= */}
      <SendGiftModal isOpen={giftModalOpen} onClose={() => setGiftModalOpen(false)} product={product} />
    </div>
  )
}

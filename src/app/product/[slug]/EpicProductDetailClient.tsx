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
  ShoppingBag,
  Download,
  Gift,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  AlertCircle,
} from 'lucide-react'
import type { ProductStockStatus } from '@/lib/licensing/serialPool'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAudio } from '@/context/AudioContext'
import { ENABLE_BRANDS } from '@/config/features'
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
  initialStockStatus,
}: {
  product: any
  initialRatingStats?: ProductRatingStats
  initialIsOwned?: boolean
  initialStockStatus?: ProductStockStatus
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
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false)
  const videoIframeRef = React.useRef<HTMLIFrameElement | null>(null)

  const isOutOfStock = Boolean(
    initialStockStatus
      ? !initialStockStatus.inStock
      : (!product.download_url && !product.download_url_win && !product.download_url_mac && !(product.allow_external_url && product.external_url))
  )
  const [ratingStats, setRatingStats] = useState<ProductRatingStats>(
    initialRatingStats || { averageRating: 0, totalReviews: 0, userCanRate: true }
  )

  const hasAddons = Boolean(
    (Array.isArray(product.addons) && product.addons.length > 0) ||
    (Array.isArray(product.presets) && product.presets.length > 0) ||
    product.has_addons
  )

  const isFree = Number(product.price_usd || 0) === 0
  const originalPriceUsd = product.original_price_usd ? Number(product.original_price_usd) : 0
  const currentPriceUsd = Number(product.price_usd || 0)
  const saleEndDate = product.sale_ends_at || product.offer_ends_at || product.sale_end_date
  const hasSaleOffer = Boolean(saleEndDate || product.is_on_sale || product.sale_active)

  // Naturally free products show only "Free" (Valorant style)
  // Only promotional giveaway offers (with sale dates/flags) or discounted paid products show discount & offer pricing
  const isFreeOnSale = isFree && hasSaleOffer && originalPriceUsd > 0
  const isPaidOnSale = !isFree && originalPriceUsd > currentPriceUsd
  const isOnSale = isFreeOnSale || isPaidOnSale
  const discountPercent = isFreeOnSale
    ? 100
    : isPaidOnSale
    ? Math.round(((originalPriceUsd - currentPriceUsd) / originalPriceUsd) * 100)
    : 0

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

  const handleExternalAction = (url: string) => {
    if (!user) {
      window.location.href = `/auth?next=${encodeURIComponent(url)}`
      return
    }
    window.open(url, '_blank')
  }

  const handleGetNow = () => {
    if (product.allow_external_url && product.external_url) {
      handleExternalAction(product.external_url)
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

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    const shareUrl = window.location.href
    const shareTitle = `${product.name} - Producer Toy`
    const shareText = `Check out ${product.name} on Producer Toy Store!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
        return
      } catch (err: any) {
        if (err?.name === 'AbortError') return
      }
    }

    // Fallback: Copy to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = shareUrl
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (e) {
      console.error('Failed to copy share link:', e)
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
  const developerName = ENABLE_BRANDS ? (product.brands?.name || product.brand || 'Producer Toy') : 'Producer Toy'

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
    <div className="space-y-8 sm:space-y-10 text-white max-w-[1600px] 2xl:max-w-[1680px] mx-auto font-sans select-none pb-28">
      {/* ========================================================================= */}
      {/* 1. TOP TITLE HEADER & EPIC RATING (Exact 1:1 Match)                       */}
      {/* ========================================================================= */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          {product.name}
        </h1>

        {/* Minimalist Gray Product Type Exactly Below Name (No Box) */}
        <div className="text-sm sm:text-base font-medium text-zinc-400">
          {formattedType(product.product_type)}
        </div>

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
        <div className="flex items-center gap-8 sm:gap-10 text-sm font-medium overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview' },
            ...(hasAddons ? [{ id: 'addons', label: 'Presets & Sounds' }] : []),
            { id: 'specs', label: 'Specs & Compatibility' },
            { id: 'faq', label: 'FAQ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 relative transition-colors cursor-pointer whitespace-nowrap text-[14px] ${
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
        {/* A. Mobile Hero Poster & Media Showcase (16:9 aspect) */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl bg-[#141414] border border-[#262626]">
          {activeMedia.type === 'video' && activeMedia.videoId ? (
            <div className="relative w-full h-full">
              <iframe
                id={`youtube-trailer-mobile-${activeMedia.videoId}`}
                src={`https://www.youtube-nocookie.com/embed/${activeMedia.videoId}?autoplay=1&mute=${isVideoMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&playsinline=1&loop=1&playlist=${activeMedia.videoId}`}
                title={`${product.name} Video Demo`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                type="button"
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className="absolute bottom-4 right-4 z-30 bg-black/80 hover:bg-black text-white p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-xl cursor-pointer"
                title={isVideoMuted ? 'Unmute Video' : 'Mute Video'}
              >
                {isVideoMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
              <Image
                src={activeMedia.url || product.cover_image}
                alt={product.name}
                fill
                unoptimized
                priority
                className="object-contain object-center"
              />
            </div>
          )}
        </div>

        {/* Thumbnail Carousel Strip for Mobile (if multiple media items exist) */}
        {mediaItems.length > 1 && (
          <div className="flex items-center gap-2 pt-1 w-full">
            <button
              type="button"
              onClick={handlePrevThumb}
              className="p-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous media"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
              {mediaItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#34363d] shadow-md scale-105'
                      : 'border-[#262626] opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={item.url} alt={`Media ${idx + 1}`} fill unoptimized className="object-cover" />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center shadow">
                        <Play className="w-3 h-3 text-white fill-white translate-x-0.5" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextThumb}
              className="p-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Next media"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}


        {/* D. Price Display */}
        <div className="space-y-1">
          {isOwned ? (
            <div className="flex justify-center w-full">
              <span className="text-xs bg-[#202020] text-zinc-300 font-semibold px-3 py-1 rounded-md border border-[#303030] tracking-wider text-center">
                ALREADY OWNED
              </span>
            </div>
          ) : product.is_coming_soon ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-black text-white uppercase tracking-tight">COMING SOON</span>
              {product.release_date && (
                <span className="text-[11px] font-bold bg-[#34363d]/15 text-zinc-200 border border-[#34363d]/30 px-2.5 py-0.5 rounded-full">
                  Available {product.release_date}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              {isOnSale && (
                <>
                  <span className="text-xs bg-[#282a30] text-zinc-100 border border-[#3e414c] font-bold px-2 py-0.5 rounded">
                    -{discountPercent}%
                  </span>
                  <span className="text-base text-zinc-500 line-through">
                    {formatPrice(product.original_price_inr, originalPriceUsd)}
                  </span>
                </>
              )}
              <span className="text-3xl font-bold text-white">
                {isFree ? 'FREE' : formatPrice(product.price_inr, product.price_usd)}
              </span>
              {isOutOfStock && (
                <span className="text-xs font-extrabold text-black bg-[#ff4053] px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                  Out of Stock
                </span>
              )}
            </div>
          )}
        </div>

        {/* E. CTA Action Buttons */}
        <div className="space-y-3 pt-1">
          {(product.allow_external_url && product.external_url) ? (
            <button
              type="button"
              onClick={() => handleExternalAction(product.external_url!)}
              className="bg-[#34363d] hover:bg-[#42454e] text-white py-4 px-6 rounded-xl text-sm font-bold uppercase tracking-wide w-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/40 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{product.button_text || 'Get Now'}</span>
            </button>
          ) : isOwned ? (
            <Link
              href="/library"
              className="w-full py-3.5 px-4 rounded-xl border border-[#333333] text-sm font-bold flex items-center justify-center gap-2 bg-[#222222] hover:bg-[#2a2a2a] text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 text-zinc-300" />
              <span>In Library</span>
            </Link>
          ) : product.is_coming_soon ? (
            <button
              type="button"
              disabled
              className="w-full py-4 px-6 rounded-xl text-sm font-black uppercase tracking-wider bg-[#222222] border border-[#333333] text-zinc-400 cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-sm"
            >
              <span>COMING SOON</span>
            </button>
          ) : isOutOfStock ? (
            <div className="w-full">
              <button
                type="button"
                disabled
                className="w-full py-4 px-6 rounded-xl text-sm font-extrabold uppercase tracking-wider bg-[#ff4053] text-black cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-lg animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-black stroke-[2.5]" />
                <span>OUT OF STOCK</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGetNow}
                className="flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer bg-[#34363d] hover:bg-[#42454e] text-white active:scale-[0.98] shadow-lg shadow-black/40"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{Number(product.price_usd) === 0 ? 'Claim for Free' : 'Buy Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => addItem(product, true)}
                className={`w-14 h-14 rounded-xl border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                  added
                    ? 'bg-[#282828] hover:bg-[#303030] border-[#383838] text-white'
                    : 'bg-[#202020] hover:bg-[#2c2c2c] border-[#303030] text-zinc-200 hover:text-white'
                }`}
                aria-label={added ? 'In Cart' : 'Add to Cart'}
                title={added ? 'In Cart' : 'Add to Cart'}
              >
                {added ? <Check className="w-5 h-5 text-white" /> : <ShoppingCart className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* GIFTING FEATURE (Temporarily Commented Out for Future Launch)
          {!product.is_coming_soon && (
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
          )}
          */}

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

          {/* Mobile Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              copied
                ? 'bg-zinc-800 text-white border-zinc-500 shadow-md'
                : 'bg-[#1c1c1c] hover:bg-[#252525] border-[#303030] text-zinc-200 hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-zinc-300" />
                <span>Share Product</span>
              </>
            )}
          </button>
        </div>

        {/* F. Metadata Specs List */}
        <div className="border-t border-b border-[#222222] py-3 space-y-3 text-xs">
          {/* TOYWARDS FEATURE (Commented out for future launch)
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Toywards</span>
            <Link
              href="/features/toywards"
              target="_blank"
              className="font-bold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Earn <strong className="text-zinc-200">Toywards</strong></span>
              <ToywardsSparkleIcon size={14} className="text-zinc-200" />
            </Link>
          </div>
          */}


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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start pt-4 sm:pt-6">
        {/* ================= LEFT COLUMN (MEDIA & DETAILS) ================= */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-10 w-full">
          {/* Media Showcase (Desktop Only >= lg - Mobile Media Showcase is Rendered in Section 3) */}
          <div className="hidden lg:block space-y-3.5 w-full">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl bg-[#121212] border border-[#222222]">
              {activeMedia.type === 'video' && activeMedia.videoId ? (
                <div className="relative w-full h-full">
                  <iframe
                    ref={videoIframeRef}
                    id={`youtube-trailer-${activeMedia.videoId}`}
                    src={`https://www.youtube-nocookie.com/embed/${activeMedia.videoId}?autoplay=1&mute=${isVideoMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&playsinline=1&loop=1&playlist=${activeMedia.videoId}`}
                    title={`${product.name} Video Demo`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                  {/* Minimalist Floating Instant Mute / Unmute Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !isVideoMuted
                      setIsVideoMuted(nextState)
                      if (videoIframeRef.current && videoIframeRef.current.contentWindow) {
                        videoIframeRef.current.contentWindow.postMessage(
                          JSON.stringify({
                            event: 'command',
                            func: nextState ? 'mute' : 'unMute',
                            args: '',
                          }),
                          '*'
                        )
                      }
                    }}
                    className="absolute bottom-4 right-4 z-30 bg-black/80 hover:bg-black text-white p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-xl cursor-pointer"
                    title={isVideoMuted ? 'Unmute Video' : 'Mute Video'}
                  >
                    {isVideoMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                  <Image
                    src={activeMedia.url || product.cover_image}
                    alt={product.name}
                    fill
                    priority
                    unoptimized
                    className="object-contain object-center"
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Carousel Strip (Supports Video Trailers + Images) */}
            {mediaItems.length > 1 && (
              <div className="flex items-center gap-2 pt-2 w-full">
                <button
                  type="button"
                  onClick={handlePrevThumb}
                  className="p-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous media"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 flex items-center gap-2.5 overflow-x-auto py-1 custom-scrollbar">
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-24 sm:w-28 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer group ${
                        selectedImageIndex === idx
                          ? 'border-[#34363d] shadow-lg scale-105'
                          : 'border-[#262626] opacity-60 hover:opacity-100'
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

                <button
                  type="button"
                  onClick={handleNextThumb}
                  className="p-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Next media"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Lead Hook Tagline / Description (Screenshot 3 Match) */}
          <div className="space-y-8 w-full">
            {product.short_description && (
              <p className="text-base sm:text-lg text-zinc-200 leading-relaxed font-medium">
                {product.short_description}
              </p>
            )}

            {/* Genres & Features Badges (2-column layout with vertical divider - Screenshot 3 Match) */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-6 pt-6 pb-2 border-t border-[#202020]">
                {/* Genres / Categories (Left Column) */}
                <div className="space-y-3 pr-4 border-r border-[#262626]">
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

                {/* Features (Right Column) */}
                <div className="space-y-3 pl-2">
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

            {/* Detailed Description & Read More */}
            {activeTab === 'overview' && product.full_description && (
              <div className="space-y-3.5 pt-2">
                <h2 className="text-xl font-bold text-white tracking-tight">About {product.name}</h2>
                <div
                  className={`text-sm text-zinc-300 leading-relaxed font-normal transition-all ${
                    !isDescExpanded ? 'max-h-48 overflow-hidden relative' : ''
                  }`}
                >
                  <AutoLinkText text={product.full_description} />
                  {!isDescExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent pointer-events-none" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer pt-1"
                >
                  <span>{isDescExpanded ? 'Show Less' : 'Read More'}</span>
                  {isDescExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* TOYWARDS FEATURE (Commented out for future launch)
            <div className="p-5 sm:p-6 rounded-2xl border border-[#3b1706] bg-gradient-to-r from-[#260e03] via-[#1c0a02] to-[#121212] space-y-3 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#34363d]/10 border border-[#34363d]/30 flex items-center justify-center flex-shrink-0">
                  <ToywardsSparkleIcon size={20} className="text-zinc-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Earn with Producer Toy Rewards
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    Earn cashback in Toywards balance on eligible purchases. Spend 1:1 on plugins and sound kits at checkout.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/features/toywards"
                  prefetch={true}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#242424] hover:bg-[#2c2c2c] text-white border border-[#383838] text-xs font-bold transition-colors cursor-pointer"
                >
                  Explore Toywards
                </Link>
              </div>
            </div>
            */}

            {/* Add-ons Tab */}
            {activeTab === 'addons' && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-black text-white tracking-tight">Presets & Add-on Sounds</h3>
                <p className="text-xs text-zinc-400">
                  Expansion banks, preset kits, and complementary sound libraries designed for this release.
                </p>
                <div className="bg-[#181818] border border-[#242424] p-6 rounded-2xl text-center space-y-2">
                  <p className="text-sm font-semibold text-white">No standalone add-on packs registered for this product.</p>
                  <p className="text-xs text-zinc-400">All standard factory presets and sound banks are included with your primary license download.</p>
                </div>
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
        <div className="hidden lg:block lg:col-span-4 xl:col-span-4 2xl:col-span-3 lg:sticky lg:top-6 space-y-4 w-full max-w-[340px] xl:max-w-[360px] lg:ml-auto">
          {/* 1. Direct Prominent Brand Logo / Name */}
          <div className="relative w-full h-16 sm:h-20 flex items-center justify-center py-1">
            <Image
              src={
                ENABLE_BRANDS && (product.brands?.logo_url || product.brand_logo)
                  ? product.brands?.logo_url || product.brand_logo
                  : '/Producer Toy Charcoal 3D Logo.webp'
              }
              alt={developerName}
              width={320}
              height={120}
              unoptimized
              className="object-contain max-h-16 sm:max-h-20 w-auto mx-auto drop-shadow-md"
              onError={(e) => {
                const target = e.currentTarget
                if (!target.src.includes('Producer%20Toy%20Charcoal%203D%20Logo')) {
                  target.src = '/Producer Toy Charcoal 3D Logo.webp'
                }
              }}
            />
          </div>

          {/* 2. Product Type Pill */}
          <div>
            <span className="inline-block bg-[#202020] text-zinc-300 text-xs font-semibold px-2.5 py-1 rounded-md">
              {formattedType(product.product_type)}
            </span>
          </div>

          {/* 3. Price & Discount Display */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              {isOnSale && (
                <>
                  <span className="text-xs bg-[#282a30] text-zinc-100 border border-[#3e414c] font-bold px-2 py-0.5 rounded">
                    -{discountPercent}%
                  </span>
                  <span className="text-sm text-zinc-500 line-through">
                    {formatPrice(product.original_price_inr, originalPriceUsd)}
                  </span>
                </>
              )}
              <span className="text-2xl font-bold text-white">
                {isFree ? 'Free' : formatPrice(product.price_inr, product.price_usd)}
              </span>
            </div>
            {saleEndDate ? (
              <p className="text-[11px] text-zinc-400">
                Sale ends {new Date(saleEndDate).toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            ) : product.sale_notice ? (
              <p className="text-[11px] text-zinc-400">{product.sale_notice}</p>
            ) : null}
          </div>

          {/* 4. CTA Action Buttons: Before Buying vs After Buying */}
          <div className="space-y-2.5 pt-1">
            {(product.allow_external_url && product.external_url) ? (
              <button
                type="button"
                onClick={() => handleExternalAction(product.external_url!)}
                className="bg-[#34363d] hover:bg-[#42454e] text-white h-12 px-6 rounded-xl text-sm font-bold uppercase tracking-wide w-full flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-[0.99]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{product.button_text || 'Get'}</span>
              </button>
            ) : isOwned ? (
              /* ================= AFTER BUYING: IN LIBRARY ================= */
              <Link
                href="/library"
                className="w-full h-12 rounded-xl bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white border border-[#303030] text-sm font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer select-none"
              >
                <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
                <span>In Library</span>
              </Link>
            ) : product.is_coming_soon ? (
              <button
                type="button"
                disabled
                className="w-full h-12 px-6 rounded-xl text-sm font-black uppercase tracking-wider bg-[#202020] border border-[#303030] text-zinc-400 cursor-not-allowed flex items-center justify-center select-none shadow-sm"
              >
                <span>COMING SOON</span>
              </button>
            ) : isOutOfStock ? (
              <div className="w-full">
                <button
                  type="button"
                  disabled
                  className="w-full h-12 px-6 text-sm font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 bg-[#ff4053] text-black cursor-not-allowed shadow-md select-none"
                >
                  <AlertCircle className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Out of Stock</span>
                </button>
              </div>
            ) : (
              /* ================= BEFORE BUYING: 3 ROWS (CHARCOAL AESTHETIC) ================= */
              <div className="space-y-2.5 w-full">
                {/* Row 1: Buy Now (Charcoal #34363d) + Cart */}
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleGetNow}
                    className="flex-1 h-12 px-6 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-[#34363d] hover:bg-[#42454e] text-white active:scale-[0.99] shadow-md select-none"
                  >
                    <span>{Number(product.price_usd) === 0 ? 'Claim for Free' : 'Buy Now'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addItem(product, true)}
                    className={`w-12 h-12 rounded-xl border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                      added
                        ? 'bg-[#282828] hover:bg-[#303030] border-[#383838] text-white'
                        : 'bg-[#202020] hover:bg-[#282828] border-[#303030] text-zinc-200 hover:text-white'
                    }`}
                    aria-label={added ? 'In Cart' : 'Add to Cart'}
                    title={added ? 'In Cart' : 'Add to Cart'}
                  >
                    {added ? <Check className="w-4 h-4 text-white" /> : <ShoppingCart className="w-4 h-4 text-white" />}
                  </button>
                </div>

                {/* Row 2: Gift Button (Charcoal New! pill) */}
                <button
                  type="button"
                  onClick={() => setGiftModalOpen(true)}
                  className="w-full h-12 px-4 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#2c2c2c] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 relative select-none"
                >
                  <Gift className="w-4 h-4 text-zinc-300" />
                  <span>Gift</span>
                  <span className="absolute right-4 bg-[#2c2c2c] text-zinc-300 border border-[#383838] text-[10px] font-black px-2 py-0.5 rounded-full">
                    New!
                  </span>
                </button>

                {/* Row 3: Wishlist Button */}
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
                  className={`w-full h-12 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer select-none ${
                    isSaved
                      ? 'bg-[#282828] border-zinc-500 text-white'
                      : 'bg-[#202020] hover:bg-[#282828] border-[#2c2c2c] text-white'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                  <span>{isSaved ? 'In Wishlist' : 'Wishlist'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Metadata Specs List with Dividers (Real Specs Only) */}
          <div className="space-y-0 text-xs divide-y divide-[#202020] border-t border-b border-[#202020] pt-1 pb-1">
            <div className="flex items-center justify-between py-3">
              <span className="text-zinc-400">Developer</span>
              <span className="font-semibold text-white">{developerName}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-zinc-400">Publisher</span>
              <span className="font-semibold text-white">{publisherName}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-zinc-400">Release Date</span>
              <span className="font-semibold text-white">{releaseYear}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-zinc-400">Platform</span>
              <div className="flex items-center gap-2">
                <WindowsIcon className="w-3.5 h-3.5" />
                <AppleIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-zinc-400">Format</span>
              <span className="font-semibold text-white">{availableFormats}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-zinc-400">License Type</span>
              <span className="font-semibold text-white">{licenseType}</span>
            </div>
          </div>

          {/* 6. Footer Actions: Only show editions link if presets/addons actually exist */}
          {hasAddons && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('addons')
                const el = document.getElementById('addons-section')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full text-center text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 py-1 transition-colors cursor-pointer"
            >
              <span>See All Editions and Add-Ons</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          )}

          {/* Share & Report Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleShare}
              className="h-11 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#2c2c2c] text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <Link
              href="/contact"
              prefetch={true}
              className="h-11 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#2c2c2c] text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-zinc-400" />
              <span>Report</span>
            </Link>
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
      {/* 6. 1:1 SEND GIFT MODAL POPUP (Temporarily Commented Out for Future Launch) */}
      {/* ========================================================================= */}
      <SendGiftModal isOpen={giftModalOpen} onClose={() => setGiftModalOpen(false)} product={product} />
    </div>
  )
}

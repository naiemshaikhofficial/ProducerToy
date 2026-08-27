'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Play,
  Pause,
  ShoppingBag,
  Check,
  ExternalLink,
  Share2,
  Flag,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Bookmark,
  ShoppingCart
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAudio } from '@/context/AudioContext'
import { useAuth } from '@/context/AuthContext'
import { ToywardsIcon } from '@/components/ui/ToywardsIcon'
import { ProductSpecsOverview, ProductSidebarBadge } from '@/components/ProductTypeSpecs'

function WindowsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <Image
      src="/icons8-windows-100.png"
      alt="Windows"
      width={24}
      height={24}
      className={`${className} object-contain inline-block`}
    />
  )
}

function AppleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <Image
      src="/icons8-apple-100.png"
      alt="macOS"
      width={24}
      height={24}
      className={`${className} object-contain inline-block`}
    />
  )
}

export function EpicProductDetailClient({ product }: { product: any }) {
  const router = useRouter()
  const { user } = useAuth()
  const { formatPrice, convertUsdToInr } = useCurrency()
  const { addItem, isInCart, openCheckout } = useCart()
  const { isWishlisted: checkWishlisted, toggleWishlist } = useWishlist()
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  const [activeTab, setActiveTab] = useState<'overview' | 'addons' | 'faq' | 'specs'>('overview')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [copied, setCopied] = useState(false)

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

    // Open Epic Games Checkout Modal in-place in front of the active product page
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
      videoId: ytVideoId
    })
  }

  const rawImages = [
    product.cover_image,
    ...dbExtraImages.filter((url: string) => url && url !== product.cover_image)
  ].filter(Boolean)

  if (rawImages.length === 0 && product.cover_image) {
    rawImages.push(product.cover_image)
  }

  rawImages.forEach((img: string) => {
    mediaItems.push({ type: 'image', url: img })
  })

  const activeMedia = mediaItems[selectedImageIndex] || mediaItems[0] || { type: 'image', url: product.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop' }

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
      case 'plugin': return 'VST Plugin'
      case 'sample_pack': return 'Sample Pack'
      case 'preset': return 'Synth Preset'
      case 'template': return 'DAW Template'
      default: return 'Audio Tool'
    }
  }

  const supportedDaws = product.supported_daws || 'FL Studio, Ableton Live, Logic Pro, Cubase, Studio One, Reaper'
  const availableFormats = product.vst_format || product.format || 'VST3, AU, AAX (64-Bit)'
  const deliveryMethod = product.delivery_method || 'Instant Encrypted Cloud Download'
  const publisherName = product.publisher || 'Producer Toy'
  const releaseYear = product.release_year || product.release_date || (product.created_at ? new Date(product.created_at).getFullYear().toString() : '2026')
  const licenseType = (() => {
    if (product.license_type) return product.license_type
    const type = (product.product_type || '').toLowerCase()
    const isFree = Number(product.price_usd) === 0

    if (type === 'plugin' || type === 'vst' || product.vst_format) {
      if (isFree) return 'Freeware (Free License)'
      return product.is_rent_to_own ? 'Rent-to-Own / Perpetual' : 'Lifetime Commercial License'
    }

    if (type === 'preset' || type === 'template') {
      return isFree ? 'Free Commercial License' : 'Commercial License'
    }

    return '100% Royalty Free'
  })()
  const developerName = product.brands?.name || product.brand || 'Producer Toy'

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

    if (type === 'bundle' || name.includes('bundle')) {
      return ['Complete Suite', '24-Bit / 44.1kHz WAV']
    }

    // Default: Sample Pack / Sound Kit / Drum Kit
    return ['24-Bit / 44.1kHz WAV']
  }

  const featurePills = getProductFeaturesList(product)

  const subCategoryList = product.subcategories?.name
    ? [product.subcategories.name]
    : Array.isArray(product.sub_category || product.subcategory || product.tags)
      ? (product.sub_category || product.subcategory || product.tags)
      : typeof (product.sub_category || product.subcategory || product.tags || product.categories?.name) === 'string'
        ? (product.sub_category || product.subcategory || product.tags || product.categories?.name).split(',')
        : ['Saturation']

  return (
    <div className="space-y-6 text-white max-w-[1240px] mx-auto font-sans">
      
      {/* 1. Title Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          {product.name}
        </h1>
      </div>

      {/* 2. Navigation Bar */}
      <div>
        <div className="flex items-center gap-8 text-sm font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'addons', label: 'Add-Ons' },
            { id: 'faq', label: 'FAQ' },
            { id: 'specs', label: 'Specs & Compatibility' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 relative transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main 2-Column Grid (Epic Games Store layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start pt-2">
        
        {/* ================= LEFT COLUMN (MAIN MEDIA & DETAILS) ================= */}
        <div className="lg:col-span-8 space-y-8 w-full">
          
          <div className="space-y-3 w-full">
            {/* Epic Main Media Showcase Container */}
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

              {product.demo_audio_url && activeMedia.type !== 'video' && (
                <button
                  onClick={handleAudition}
                  className="absolute bottom-4 right-4 bg-black/80 hover:bg-white hover:text-black text-white px-4 py-2.5 rounded-full backdrop-blur-md transition-all z-20 flex items-center gap-2 text-xs font-bold shadow-2xl border border-white/10 cursor-pointer"
                >
                  {isCurrentPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Audition</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      <span>Audition Demo</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Thumbnail Carousel Strip (Supports Video Trailers + Images) */}
            {mediaItems.length > 1 && (
              <div className="flex items-center gap-2 pt-1 w-full">
                <button
                  onClick={handlePrevThumb}
                  className="p-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous media"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 flex items-center gap-2.5 overflow-x-auto py-1">
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-24 sm:w-28 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer group ${
                        selectedImageIndex === idx
                          ? 'border-white shadow-lg scale-105'
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
                  onClick={handleNextThumb}
                  className="p-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Next media"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6 w-full">
            {product.short_description && (
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
                {product.short_description}
              </p>
            )}

            {/* Genres & Features Badges (Right below short description / tagline) */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1 pb-2">
                {/* Genres / Category Pills */}
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold text-zinc-400 block">Genres</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={
                        product.product_type === 'plugin'
                          ? '/store/plugins'
                          : product.product_type === 'sample_pack'
                          ? '/store/sounds'
                          : product.product_type === 'preset'
                          ? '/store/presets'
                          : '/store'
                      }
                      prefetch={true}
                      className="bg-[#202020] hover:bg-[#282828] hover:text-[#FC6301] text-zinc-200 border border-[#2a2a2a] text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {formattedType(product.product_type)}
                    </Link>
                    {subCategoryList.map((subCat: string, idx: number) => {
                      const catSlug = subCat.toLowerCase().trim().replace(/\s+/g, '-')
                      return (
                        <Link
                          key={idx}
                          href={`/store?cat=${encodeURIComponent(catSlug)}`}
                          prefetch={true}
                          className="bg-[#202020] hover:bg-[#282828] hover:text-[#FC6301] text-zinc-200 border border-[#2a2a2a] text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          {subCat.trim()}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Features / Specifications Pills */}
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold text-zinc-400 block">Features</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {featurePills.map((feat: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-[#202020] text-zinc-200 border border-[#2a2a2a] text-xs font-semibold px-3.5 py-1.5 rounded-lg"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'overview' && product.full_description && (
              <div className="space-y-3 pt-4">
                <h3 className="text-lg font-bold text-white">About {product.name}</h3>
                <div className="text-sm text-zinc-300 leading-relaxed space-y-4 whitespace-pre-line font-normal">
                  {product.full_description}
                </div>
              </div>
            )}

            {(activeTab === 'specs' || activeTab === 'overview') && (
              <ProductSpecsOverview product={product} />
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-white">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  <div className="bg-[#161616] border border-[#262626] p-4 rounded-xl space-y-1">
                    <h4 className="font-semibold text-white text-sm">How do I download my purchase?</h4>
                    <p className="text-xs text-zinc-400">Once purchased, your file is instantly available under &quot;My Purchases&quot; with direct high-speed download links.</p>
                  </div>
                  <div className="bg-[#161616] border border-[#262626] p-4 rounded-xl space-y-1">
                    <h4 className="font-semibold text-white text-sm">Are these sounds royalty-free?</h4>
                    <p className="text-xs text-zinc-400">Yes, 100% of products on Producer Toy Store are cleared for commercial use.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* ================= RIGHT COLUMN (STICKY SIDEBAR) ================= */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 space-y-3 w-full">
          
          {/* Direct Minimalist Prominent Brand Logo */}
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
            <span className="bg-[#222222] text-zinc-200 text-xs font-medium px-3 py-1 rounded-md inline-block">
              {formattedType(product.product_type)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              {Number(product.price_usd) === 0 ? (
                <span className="text-2xl sm:text-3xl font-extrabold text-white">FREE</span>
              ) : (
                <>
                  {product.original_price_usd && Number(product.original_price_usd) > Number(product.price_usd) && (
                    <>
                      <span className="text-xs bg-[#FA742B] text-white font-extrabold px-2 py-1 rounded text-[12px]">
                        -{Math.round(((Number(product.original_price_usd) - Number(product.price_usd)) / Number(product.original_price_usd)) * 100)}%
                      </span>
                      <span className="text-base text-zinc-500 line-through">
                        {formatPrice(product.original_price_inr, Number(product.original_price_usd))}
                      </span>
                    </>
                  )}
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {formatPrice(product.price_inr, product.price_usd)}
                  </span>
                </>
              )}
            </div>

            {/* Toywards Rewards Pill (Dual-Tone Orange & White) */}
            {Number(product.price_usd) > 0 && (
              <Link
                href="/features/toywards"
                target="_blank"
                className="inline-flex items-center gap-2 bg-[#26150b] hover:bg-[#321b0f] border border-[#4a2412] px-3.5 py-1.5 rounded-full text-xs select-none shadow-xs transition-colors group cursor-pointer"
                title="Learn more about Toywards"
              >
                <ToywardsIcon size={14} />
                <span className="text-zinc-300">
                  Earn <span className="text-[#FA742B] font-bold">Toywards Rewards</span> on this purchase
                </span>
              </Link>
            )}
          </div>

          <div className="space-y-2.5">
            {product.external_url ? (
              <a
                href={product.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FA742B] hover:bg-[#E05A18] text-white py-3.5 px-6 rounded-xl text-sm font-extrabold uppercase tracking-wide w-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FA742B]/20 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{product.button_text || 'Get'}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGetNow}
                  className="flex-1 py-3.5 px-6 text-sm font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer bg-[#FA742B] hover:bg-[#E05A18] text-white active:scale-[0.99]"
                >
                  <span>{product.button_text || 'Get'}</span>
                </button>

                <button
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

            {product.demo_audio_url && (
              <button
                onClick={handleAudition}
                className="w-full bg-[#222222] hover:bg-[#2a2a2a] text-white border border-[#333333] py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

            <button
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
              className={`w-full py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-rose-950/40 border-rose-600 text-rose-400'
                  : 'bg-[#222222] hover:bg-[#2a2a2a] border-[#333333] text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
              <span>{isSaved ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div
                title="Compatible with Windows"
                className="bg-[#1c1c1c] border border-[#2e2e2e] text-white py-3 px-4 rounded-xl flex items-center justify-center shadow-sm select-none"
              >
                <WindowsIcon className="w-5 h-5 text-zinc-200" />
              </div>

              <div
                title="Compatible with macOS"
                className="bg-[#1c1c1c] border border-[#2e2e2e] text-white py-3 px-4 rounded-xl flex items-center justify-center shadow-sm select-none"
              >
                <AppleIcon className="w-5 h-5 text-zinc-200" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 text-xs">
            <div className="flex items-center justify-between pb-1">
              <span className="text-zinc-400">Developer</span>
              {(product.brands?.slug || product.brand) ? (
                <Link
                  href={`/store/${product.brands?.slug || (product.brand ? product.brand.toLowerCase().replace(/\s+/g, '-') : '')}`}
                  prefetch={true}
                  className="font-semibold text-white hover:underline transition-colors"
                >
                  {developerName}
                </Link>
              ) : (
                <span className="font-semibold text-white">{developerName}</span>
              )}
            </div>

            <div className="flex items-center justify-between pb-1">
              <span className="text-zinc-400">Release Date</span>
              <span className="font-semibold text-white">{releaseYear}</span>
            </div>

            <div className="flex items-center justify-between pb-1">
              <span className="text-zinc-400">Platform</span>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#222222] text-zinc-200 rounded-md border border-[#333333] flex items-center justify-center" title="Windows">
                  <WindowsIcon className="w-4 h-4" />
                </span>
                <span className="p-1.5 bg-[#222222] text-zinc-200 rounded-md border border-[#333333] flex items-center justify-center" title="macOS">
                  <AppleIcon className="w-4 h-4" />
                </span>
              </div>
            </div>

            {Number(product.price_usd) > 0 && (
              <div className="flex items-center justify-between pb-1">
                <span className="text-zinc-400">Toywards</span>
                <Link
                  href="/features/toywards"
                  target="_blank"
                  className="font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Learn more about Toywards"
                >
                  <ToywardsIcon size={14} />
                  <span>Earn <span className="text-[#FA742B] font-bold">Toywards</span></span>
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between pb-1">
              <span className="text-zinc-400">License Type</span>
              <span className="font-semibold text-white">{licenseType}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleShare}
              className="w-full bg-[#161616] hover:bg-[#222222] border border-[#2a2a2a] text-zinc-300 hover:text-white py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}

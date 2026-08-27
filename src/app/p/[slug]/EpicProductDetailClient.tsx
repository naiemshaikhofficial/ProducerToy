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
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Laptop,
  Bookmark,
  ShoppingCart
} from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'
import { useAudio } from '@/context/AudioContext'
import { ToywardsIcon } from '@/components/ui/ToywardsIcon'
function WindowsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 88 88" fill="currentColor">
      <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L0 75.544l.033-29.41zm4.326-39.043L87.994 0v41.527l-47.998.376zm47.998 39.085v41.977l-47.998-6.758-.024-35.219z"/>
    </svg>
  )
}

function AppleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 170 170" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.07-3.69-3.03-7.6-7.85-11.73-14.46-7.84-12.44-13.62-26.7-17.34-42.79-3.72-16.09-5.58-31.5-5.58-46.24 0-17.51 4.34-32.32 13.02-44.43 8.68-12.11 19.8-18.3 33.37-18.57 5.08 0 10.45 1.25 16.11 3.75 5.66 2.5 9.77 3.75 12.33 3.75 2.12 0 6.29-1.28 12.51-3.84 6.22-2.56 11.45-3.8 15.68-3.74 12.12.53 22.39 5.37 30.82 14.51-10.97 6.64-16.32 15.82-16.05 27.53.27 11.71 5.92 21.05 16.96 28.02-4.12 11.97-9.76 23.47-16.92 34.5zm-30.82-114.73c0 7.37-2.76 14.42-8.28 21.15-5.52 6.73-12.22 10.8-20.1 12.21-.13-1.06-.2-1.99-.2-2.78 0-7.37 2.87-14.58 8.61-21.63 5.74-7.05 12.58-11.19 20.52-12.42.13 1.19.2 2.35.2 3.47z"/>
    </svg>
  )
}

export function EpicProductDetailClient({ product }: { product: any }) {
  const { formatPrice } = useCurrency()
  const { addItem, isInCart } = useCart()
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  const [activeTab, setActiveTab] = useState<'overview' | 'addons' | 'faq' | 'specs'>('overview')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [copied, setCopied] = useState(false)

  const isCurrentPlaying = currentTrack?.id === product.id && isPlaying
  const added = isInCart(product.id)

  // Real DB gallery images: if product has gallery_images or images array in DB, include them. Otherwise, ONLY 1 photo.
  const dbExtraImages: string[] = Array.isArray(product.gallery_images)
    ? product.gallery_images
    : Array.isArray(product.images)
    ? product.images
    : []

  const galleryImages = [
    product.cover_image,
    ...dbExtraImages.filter((url: string) => url && url !== product.cover_image)
  ].filter(Boolean)

  if (galleryImages.length === 0 && product.cover_image) {
    galleryImages.push(product.cover_image)
  }

  const activeImage = galleryImages[selectedImageIndex] || galleryImages[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop'

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
    setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const handleNextThumb = () => {
    setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
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

  // Dynamic DB fields with automatic fallback defaults if not filled in Supabase
  const supportedDaws = product.supported_daws || 'FL Studio, Ableton Live, Logic Pro, Cubase, Studio One, Reaper'
  const availableFormats = product.vst_format || product.format || 'VST3, AU, AAX (64-Bit)'
  const operatingSystem = product.operating_system || product.os || 'Windows 10/11 & macOS 11+ (Apple Silicon M1/M2 Native)'
  const deliveryMethod = product.delivery_method || 'Instant Encrypted Cloud Download'
  const publisherName = product.publisher || 'Producer Toy'
  const releaseYear = product.release_year || product.release_date || (product.created_at ? new Date(product.created_at).getFullYear().toString() : '2026')
  const platformName = product.platform || 'Windows / macOS'
  const licenseType = product.license_type || '100% Royalty Free'
  const developerName = product.brands?.name || product.brand || 'Slate Digital'
  const badgeFormat = availableFormats.split(',')[0]?.trim() || 'VST3'

  const subCategoryList = product.subcategories?.name
    ? [product.subcategories.name]
    : Array.isArray(product.sub_category || product.subcategory || product.tags)
      ? (product.sub_category || product.subcategory || product.tags)
      : typeof (product.sub_category || product.subcategory || product.tags || product.categories?.name) === 'string'
        ? (product.sub_category || product.subcategory || product.tags || product.categories?.name).split(',')
        : ['Saturation']

  return (
    <div className="space-y-6 text-white max-w-[1400px] mx-auto font-sans">
      
      {/* 1. Epic Games Product Title Header & Sub-Category Pill */}
      <div className="flex items-center gap-3.5 flex-wrap">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          {product.name}
        </h1>
        {subCategoryList.map((subCat: string, idx: number) => (
          <span
            key={idx}
            className="bg-[#202028] text-zinc-300 border border-[#2e2e3a] text-xs font-semibold px-3 py-1.5 rounded-md self-center"
          >
            {subCat.trim()}
          </span>
        ))}
      </div>

      {/* 2. Epic Games Sub-Navigation Bar (Overview, Add-Ons, FAQ, Specs) */}
      <div className="border-b border-[#24242c]">
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

      {/* 3. Main 2-Column Epic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">
        
        {/* ================= LEFT COLUMN (SHOWCASE) ================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Main Hero Showcase Media Viewer */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#101014] border border-[#202028] shadow-2xl flex items-center justify-center group">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                unoptimized
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.01]"
                priority
              />

              {/* Audio Audition Quick Overlay Button */}
              {product.demo_audio_url && (
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

            {/* Thumbnail Carousel Strip - Only show if > 1 image in DB */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handlePrevThumb}
                  className="p-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#262632] border border-[#282834] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 flex items-center gap-2.5 overflow-x-auto py-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-24 sm:w-28 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-white shadow-lg scale-105'
                          : 'border-[#24242e] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${idx + 1}`} fill unoptimized className="object-cover" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextThumb}
                  className="p-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#262632] border border-[#282834] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Product Tagline / Main Description (Frameless natural text) */}
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              {product.short_description || product.full_description || 'High-precision DSP processing and studio-grade sound quality designed for professional audio production.'}
            </p>

            {/* Detailed Description Section */}
            {activeTab === 'overview' && product.full_description && (
              <div className="space-y-3 pt-4 border-t border-[#202028]">
                <h3 className="text-lg font-bold text-white">About {product.name}</h3>
                <div className="text-sm text-zinc-300 leading-relaxed space-y-4 whitespace-pre-line font-normal">
                  {product.full_description}
                </div>
              </div>
            )}

            {/* Specs Tab Content */}
            {(activeTab === 'specs' || activeTab === 'overview') && (
              <div className="space-y-4 pt-4 border-t border-[#202028]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>System Requirements & Compatibility</span>
                </h3>

                <div className="bg-[#16161c] border border-[#262632] rounded-xl p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[#242430]">
                    <div>
                      <span className="text-zinc-400 block mb-1 font-medium">Supported DAWs</span>
                      <span className="text-white font-semibold">{supportedDaws}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block mb-1 font-medium">Available Formats</span>
                      <span className="text-white font-semibold">{availableFormats}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-zinc-400 block mb-1.5 font-medium">Operating System</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="p-2 bg-[#202028] text-blue-400 rounded-lg border border-[#2c2c38] flex items-center justify-center" title="Windows Supported">
                          <WindowsIcon className="w-4.5 h-4.5" />
                        </span>
                        <span className="p-2 bg-[#202028] text-zinc-200 rounded-lg border border-[#2c2c38] flex items-center justify-center" title="macOS Supported">
                          <AppleIcon className="w-4.5 h-4.5" />
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-400 block mb-1 font-medium">Delivery Method</span>
                      <span className="text-white font-semibold">{deliveryMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Tab Content */}
            {activeTab === 'faq' && (
              <div className="space-y-4 pt-4 border-t border-[#202028]">
                <h3 className="text-lg font-bold text-white">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  <div className="bg-[#16161c] border border-[#262632] p-4 rounded-xl space-y-1">
                    <h4 className="font-semibold text-white text-sm">How do I download my purchase?</h4>
                    <p className="text-xs text-zinc-400">Once purchased, your file is instantly available under &quot;My Purchases&quot; with direct high-speed download links.</p>
                  </div>
                  <div className="bg-[#16161c] border border-[#262632] p-4 rounded-xl space-y-1">
                    <h4 className="font-semibold text-white text-sm">Are these sounds royalty-free?</h4>
                    <p className="text-xs text-zinc-400">Yes, 100% of products on Producer Toy Store are cleared for commercial use.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* ================= RIGHT COLUMN (EPIC GAMES STICKY SIDEBAR) ================= */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-5">
          
          {/* Main Cover Art Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#16161c] border border-[#242432] shadow-xl flex items-center justify-center p-3">
            <Image
              src={product.cover_image}
              alt={product.name}
              fill
              unoptimized
              className="object-contain p-2"
            />
          </div>

          {/* Age Rating / Compatibility Badge Box (Matching Epic IARC Box) */}
          <div className="border border-[#282834] bg-[#16161c] p-3.5 rounded-xl flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#22222c] border border-[#30303e] rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
              {badgeFormat}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Universal Studio Standard</span>
              <span className="text-[11px] text-zinc-400 block">64-Bit DAW Compatible • Direct Delivery</span>
            </div>
          </div>

          {/* Base Product Type Tag */}
          <div>
            <span className="bg-[#202028] text-zinc-200 text-xs font-medium px-3 py-1 rounded-md inline-block">
              {formattedType(product.product_type)}
            </span>
          </div>

          {/* Price Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {product.price_usd === 0 ? (
                <span className="text-2xl sm:text-3xl font-extrabold text-[#00ff88]">FREE</span>
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {formatPrice(undefined, product.price_usd)}
                </span>
              )}
            </div>

            {/* Toywards Rewards Pill (Dual-Tone Orange & White) */}
            {product.price_usd > 0 && (
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

          {/* Action Buttons (Buy Now + Cart Icon + Wishlist) */}
          <div className="space-y-2.5">
            {product.external_url ? (
              <a
                href={product.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FA742B] hover:bg-[#E05A18] text-white py-3.5 px-6 rounded-xl text-sm font-bold uppercase tracking-wide w-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FA742B]/20 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{product.button_text || `GET ON ${developerName.toUpperCase()}`}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addItem(product)}
                  disabled={added}
                  className={`flex-1 py-3.5 px-6 text-sm font-bold uppercase tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    added
                      ? 'bg-zinc-800 text-zinc-400 cursor-default'
                      : 'bg-[#FA742B] hover:bg-[#E05A18] text-white shadow-[#FA742B]/20'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>In Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{(product.price_usd === 0 || product.price_inr === 0) ? 'Get Now' : 'Buy Now'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => addItem(product)}
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

            {/* Audition Demo Button */}
            {product.demo_audio_url && (
              <button
                onClick={handleAudition}
                className="w-full bg-[#202028] hover:bg-[#2a2a34] text-white border border-[#2e2e3a] py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`w-full py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-950/40 border-rose-600 text-rose-400'
                  : 'bg-[#202028] hover:bg-[#2a2a34] border-[#2e2e3a] text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
              <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>

            {/* Separate Windows & macOS Static Compatibility Badges */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div
                title="Compatible with Windows"
                className="bg-[#1c1c26] border border-[#2a2a3a] text-white py-3 px-4 rounded-xl flex items-center justify-center shadow-sm select-none"
              >
                <WindowsIcon className="w-5 h-5 text-zinc-200" />
              </div>

              <div
                title="Compatible with macOS"
                className="bg-[#1c1c26] border border-[#2a2a3a] text-white py-3 px-4 rounded-xl flex items-center justify-center shadow-sm select-none"
              >
                <AppleIcon className="w-5 h-5 text-zinc-200" />
              </div>
            </div>
          </div>

          {/* Key Specifications Grid (Exact Epic Key-Value Specs) */}
          <div className="space-y-3 pt-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#202028] pb-2.5">
              <span className="text-zinc-400">Developer</span>
              {(product.brands?.slug || product.brand) ? (
                <Link
                  href={`/store/${product.brands?.slug || (product.brand ? product.brand.toLowerCase().replace(/\s+/g, '-') : '')}`}
                  className="font-semibold text-white hover:underline transition-colors"
                >
                  {developerName}
                </Link>
              ) : (
                <span className="font-semibold text-white">{developerName}</span>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-[#202028] pb-2.5">
              <span className="text-zinc-400">Publisher</span>
              <span className="font-semibold text-white">{publisherName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#202028] pb-2.5">
              <span className="text-zinc-400">Release Date</span>
              <span className="font-semibold text-white">{releaseYear}</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#202028] pb-2.5">
              <span className="text-zinc-400">Platform</span>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#202028] text-blue-400 rounded-md border border-[#2c2c38] flex items-center justify-center" title="Windows">
                  <WindowsIcon className="w-4 h-4" />
                </span>
                <span className="p-1.5 bg-[#202028] text-zinc-200 rounded-md border border-[#2c2c38] flex items-center justify-center" title="macOS">
                  <AppleIcon className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-[#202028] pb-2.5">
              <span className="text-zinc-400">License Type</span>
              <span className="font-semibold text-emerald-400">{licenseType}</span>
            </div>
          </div>

          {/* Share & Report Footer Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleShare}
              className="flex-1 bg-[#16161c] hover:bg-[#202028] border border-[#242430] text-zinc-300 hover:text-white py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              className="flex-1 bg-[#16161c] hover:bg-[#202028] border border-[#242430] text-zinc-300 hover:text-white py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}

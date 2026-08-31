'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Play, Pause, Bookmark, ShoppingBag, Check } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useAudio } from '@/context/AudioContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { getCdnImageUrl } from '@/lib/cdn'

export interface Product {
  id: string
  name: string
  slug: string
  brand: string
  brand_id?: string
  category_slugs?: string[]
  product_subcategories?: Array<{
    subcategories?: {
      id?: string
      name?: string
      slug?: string
    } | null
  }> | null
  brands?: {
    id: string
    name: string
    slug: string
    logo_url?: string | null
  } | null
  subcategories?: {
    id?: string
    name: string
    slug?: string
  } | null
  subcategory_name?: string
  sub_category?: string | string[]
  subcategory?: string | string[]
  tags?: string | string[]
  product_type: 'plugin' | 'sample_pack' | 'preset' | 'template' | string
  price_inr?: number
  price_usd: number
  original_price_inr?: number | null
  original_price_usd?: number | null
  cover_image: string
  demo_audio_url?: string
  vst_format?: string
  short_description?: string
  external_url?: string
  button_text?: string
  is_featured?: boolean
  is_coming_soon?: boolean
  release_date?: string | null
  created_at?: string | null
}

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const { formatPrice, convertUsdToInr } = useCurrency()
  const { currentTrack, isPlaying, playTrack } = useAudio()
  const { addItem, isInCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [isCartAdded, setIsCartAdded] = useState(false)

  const isSaved = isWishlisted(product.id)
  const isCurrentPlaying = currentTrack?.id === product.id && isPlaying
  const added = isInCart(product.id) || isCartAdded

  const brandName = product.brands?.name || product.brand || 'Producer Toy'
  const brandSlug = product.brands?.slug || (product.brand ? product.brand.toLowerCase().trim().replace(/\s+/g, '-') : 'producer-toy')

  const priceUsd = Number(product.price_usd) || 0
  const priceInr = product.price_inr ? Number(product.price_inr) : convertUsdToInr(priceUsd)
  const originalPriceInr = product.original_price_usd ? convertUsdToInr(Number(product.original_price_usd)) : undefined

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/store?brand=${brandSlug}`)
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: brandName,
      product_type: product.product_type,
      price_inr: priceInr,
      price_usd: priceUsd,
      original_price_inr: originalPriceInr,
      original_price_usd: product.original_price_usd ? Number(product.original_price_usd) : undefined,
      cover_image: product.cover_image,
      demo_audio_url: product.demo_audio_url,
      vst_format: product.vst_format,
      short_description: product.short_description,
      is_featured: product.is_featured,
    })
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price_inr: priceInr,
      price_usd: priceUsd,
      cover_image: product.cover_image,
      product_type: product.product_type,
      brand: product.brands?.name || product.brand || 'Producer Toy',
    })
    setIsCartAdded(true)
  }

  const subCategoryLabel = (() => {
    // 1. If product_subcategories junction array exists from Supabase dropdown selection
    if (Array.isArray(product.product_subcategories) && product.product_subcategories.length > 0) {
      const names = product.product_subcategories
        .map(ps => ps.subcategories?.name)
        .filter(Boolean) as string[]
      if (names.length > 0) return names.slice(0, 3).join(' • ')
    }

    // 2. If category_slugs array exists
    if (Array.isArray(product.category_slugs) && product.category_slugs.length > 0) {
      const specific = product.category_slugs.filter(s => s !== 'effects' && s !== 'plugin')
      const itemsToUse = specific.length > 0 ? specific : product.category_slugs
      return itemsToUse.slice(0, 3).map(s => s.replace('-', ' ')).join(' • ')
    }

    if (product.subcategories?.name) return product.subcategories.name
    if (product.subcategory_name) return product.subcategory_name

    const sub = product.sub_category || product.subcategory || product.tags
    if (Array.isArray(sub) && sub.length > 0) {
      return sub.slice(0, 3).join(' • ')
    }
    if (typeof sub === 'string' && sub.trim()) {
      return sub.split(',').map(s => s.trim()).slice(0, 3).join(' • ')
    }

    return product.product_type ? product.product_type.replace('_', ' ') : 'AUDIO TOOL'
  })()

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.demo_audio_url) return

    playTrack({
      id: product.id,
      name: product.name,
      brand: product.brands?.name || product.brand || 'Producer Toy',
      audioUrl: product.demo_audio_url,
      coverImage: product.cover_image,
    })
  }

  const isFree = Number(product.price_usd) === 0
  const originalPrice = product.original_price_usd && Number(product.original_price_usd) > Number(product.price_usd)
    ? Number(product.original_price_usd)
    : 0

  const discountPercent = originalPrice > 0 && Number(product.price_usd) > 0
    ? Math.round(((originalPrice - Number(product.price_usd)) / originalPrice) * 100)
    : 0

  return (
    <Link
      href={`/product/${product.slug}`}
      prefetch={true}
      className="group flex flex-col cursor-pointer select-none"
      title={`${product.name} by ${brandName}`}
    >
      {/* 3:4 Tall Epic Games Store Poster Card */}
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#181818] border border-[#222222] shadow-md mb-3.5 sm:mb-4">
        <Image
          src={getCdnImageUrl(product.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop', { width: 600 })}
          alt={`${product.name} by ${brandName} - ${product.product_type ? product.product_type.replace('_', ' ') : 'Audio Plugin'}`}
          title={`${product.name} - ${brandName}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:brightness-110 transition-all duration-200 ease-out"
        />
        
        {/* Minimal Epic Games Store Light Glow Overlay on Hover */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        
        {/* Wishlist Bookmark Button (Top Right Glass Badge) */}
        <button 
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
          className={`absolute top-2.5 sm:top-3 right-2.5 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/20 z-10 ${
            isSaved
              ? 'bg-white text-black opacity-100 shadow-md'
              : 'bg-black/75 text-white/90 hover:text-white hover:bg-white hover:text-black opacity-100 sm:opacity-0 group-hover:opacity-100 shadow-sm'
          }`}
          title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
        >
          <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Audio Audition Play Button Overlay */}
        {product.demo_audio_url && (
          <button
            type="button"
            onClick={handlePlayToggle}
            className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-black/85 hover:bg-white hover:text-black text-white rounded-full backdrop-blur-md opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all z-20 shadow-xl active:scale-95 border border-white/20"
            aria-label={isCurrentPlaying ? "Pause audio preview" : "Preview sound demo"}
            title={isCurrentPlaying ? "Pause preview" : "Play preview"}
          >
            {isCurrentPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>
        )}
      </div>

      {/* Content Details Below Card (Exact Minimalist Epic Games Store Layout) */}
      <div className="flex flex-col gap-1.5 px-0.5">
        {/* Subcategory / Tag */}
        <span className="text-xs font-semibold text-zinc-400 capitalize line-clamp-1">
          {subCategoryLabel}
        </span>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-normal line-clamp-1 group-hover:text-zinc-200 transition-colors">
          {product.name}
        </h3>

        {/* Brand Name */}
        <span className="text-xs text-zinc-400 font-medium line-clamp-1 z-20">
          by{' '}
          <button
            type="button"
            onClick={handleBrandClick}
            className="text-zinc-300 font-semibold hover:text-[#FC6301] transition-colors cursor-pointer inline-block"
          >
            {brandName}
          </button>
        </span>

        {/* Price Row */}
        <div className="flex items-center gap-2 mt-1 pt-0.5">
          {product.is_coming_soon ? (
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {product.release_date ? `Available ${product.release_date}` : 'Coming Soon'}
            </span>
          ) : isFree ? (
            <span className="text-sm font-bold text-white">Free</span>
          ) : (
            <>
              {discountPercent > 0 && (
                <span className="text-xs bg-[#FC6301] text-white font-extrabold px-1.5 py-0.5 rounded">
                  -{discountPercent}%
                </span>
              )}
              {originalPrice > 0 && (
                <span className="text-xs text-zinc-500 line-through">
                  {formatPrice(undefined, originalPrice)}
                </span>
              )}
              <span className="text-sm font-bold text-white">
                {formatPrice(undefined, product.price_usd)}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

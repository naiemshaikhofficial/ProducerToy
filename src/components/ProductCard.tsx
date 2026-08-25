'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Play, Pause, Bookmark, ShoppingBag, Check } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useAudio } from '@/context/AudioContext'
import { useCart } from '@/context/CartContext'
import { toggleWishlistAction } from '@/actions/wishlistActions'
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
  original_price_usd?: number | null
  cover_image: string
  demo_audio_url?: string
  vst_format?: string
  short_description?: string
  external_url?: string
  button_text?: string
  is_featured?: boolean
}

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const { currentTrack, isPlaying, playTrack } = useAudio()
  const { addItem, isInCart } = useCart()
  const [isSaved, setIsSaved] = useState(false)
  const [isCartAdded, setIsCartAdded] = useState(false)

  const isCurrentPlaying = currentTrack?.id === product.id && isPlaying
  const added = isInCart(product.id) || isCartAdded

  const brandName = product.brands?.name || product.brand || 'Producer Toy'
  const brandSlug = product.brands?.slug || (product.brand ? product.brand.toLowerCase().trim().replace(/\s+/g, '-') : 'producer-toy')

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/store?brand=${brandSlug}`)
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Optimistic UI update immediately for instant 0ms feedback
    setIsSaved(prev => !prev)
    await toggleWishlistAction(product.id)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price_inr: product.price_inr || Math.round(product.price_usd * 85),
      price_usd: product.price_usd,
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
    >
      {/* 3:4 Tall Epic Games Store Poster Card */}
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#181818] border border-[#222222] shadow-md mb-2.5">
        <Image
          src={getCdnImageUrl(product.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop', { width: 600 })}
          alt={product.name}
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
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/10 z-10 ${
            isSaved
              ? 'bg-white text-black opacity-100 scale-105'
              : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100'
          }`}
          title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Audio Audition Play Button Overlay */}
        {product.demo_audio_url && (
          <button
            type="button"
            onClick={handlePlayToggle}
            className="absolute bottom-3 right-3 bg-black/80 hover:bg-white hover:text-black text-white p-2.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 shadow-xl transform hover:scale-110 border border-white/10"
            aria-label="Audition audio"
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
      <div className="flex flex-col gap-0.5 px-0.5">
        {/* Subcategory / Tag */}
        <span className="text-[11px] sm:text-xs font-medium text-zinc-400 capitalize line-clamp-1">
          {subCategoryLabel}
        </span>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-zinc-200 transition-colors">
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
        <div className="flex items-center gap-2 mt-1">
          {isFree ? (
            <span className="text-sm font-bold text-white">Free</span>
          ) : (
            <>
              {discountPercent > 0 && (
                <span className="text-[11px] bg-[#FC6301] text-white font-extrabold px-1.5 py-0.5 rounded">
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

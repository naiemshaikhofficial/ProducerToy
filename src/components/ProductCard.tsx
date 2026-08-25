'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Pause, Bookmark } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useAudio } from '@/context/AudioContext'

export interface Product {
  id: string
  name: string
  slug: string
  brand: string
  brand_id?: string
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
  cover_image: string
  demo_audio_url?: string
  vst_format?: string
  short_description?: string
  external_url?: string
  button_text?: string
  is_featured?: boolean
}

export function ProductCard({ product }: { product: Product }) {
  const { formatPrice } = useCurrency()
  const { currentTrack, isPlaying, playTrack } = useAudio()

  const isCurrentPlaying = currentTrack?.id === product.id && isPlaying

  const subCategoryLabel = (() => {
    if (product.subcategories?.name) return product.subcategories.name
    if (product.subcategory_name) return product.subcategory_name

    const sub = product.sub_category || product.subcategory || product.tags
    if (Array.isArray(sub) && sub.length > 0) return sub[0]
    if (typeof sub === 'string' && sub.trim()) return sub.split(',')[0].trim()

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

  const isFree = product.price_usd === 0 || product.price_inr === 0

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col cursor-pointer select-none"
    >
      {/* 3:4 Tall Epic Games Store Poster Card */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#181818] border border-[#222222] shadow-lg mb-3">
        <Image
          src={product.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop'}
          alt={product.name}
          fill
          unoptimized
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Wishlist Bookmark Button */}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white/70 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10"
          title="Save to Wishlist"
        >
          <Bookmark className="w-4 h-4" />
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

      {/* Content Details Below Card (Exact Epic Games Store Layout) */}
      <div className="flex flex-col gap-1 px-0.5">
        {/* Subcategory Tag */}
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider line-clamp-1">
          {subCategoryLabel}
        </span>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-white/80 transition-colors">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-center gap-2 mt-1">
          {isFree ? (
            <span className="text-sm font-semibold text-white">Free</span>
          ) : (
            <>
              <span className="text-xs bg-[#FF5500] text-white font-extrabold px-1.5 py-0.5 rounded text-[11px]">
                -50%
              </span>
              <span className="text-xs text-zinc-500 line-through">
                {formatPrice((product.price_inr || 999) * 2, (product.price_usd || 12.99) * 2)}
              </span>
              <span className="text-sm font-semibold text-white">
                {formatPrice(product.price_inr, product.price_usd)}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

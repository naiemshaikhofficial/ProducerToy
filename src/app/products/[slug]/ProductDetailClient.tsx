'use client'

import React from 'react'
import { Play, Pause, ShoppingBag, Check, ExternalLink } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'
import { useAudio } from '@/context/AudioContext'

export function ProductDetailClient({ product }: { product: any }) {
  const { formatPrice } = useCurrency()
  const { addItem, isInCart } = useCart()
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio()

  const isCurrentPlaying = currentTrack?.id === product.id && isPlaying
  const added = isInCart(product.id)

  const handleAudition = () => {
    if (!product.demo_audio_url) return

    if (currentTrack?.id === product.id) {
      togglePlay()
    } else {
      playTrack({
        id: product.id,
        name: product.name,
        brand: product.brand,
        audioUrl: product.demo_audio_url,
        coverImage: product.cover_image,
      })
    }
  }

  return (
    <div className="space-y-4">
      
      {/* Price Banner */}
      <div className="flex items-baseline justify-between p-4 bg-[#141418] border border-[#24242e] rounded-xl">
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">License Price</span>
        <span className="text-2xl font-mono font-black text-white">
          {product.price_usd === 0 ? (
            <span className="text-[#00ff88] font-extrabold">FREE</span>
          ) : (
            formatPrice(undefined, product.price_usd)
          )}
        </span>
      </div>

      {/* Audition & Add to Cart / External Redirect Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {product.demo_audio_url && (
          <button
            onClick={handleAudition}
            className="bg-[#24242e] hover:bg-[#2e2e3a] text-white py-3.5 px-6 rounded-xl text-sm font-bold uppercase flex-1 flex items-center justify-center gap-2 transition-colors border border-[#343442]"
          >
            {isCurrentPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause Audition</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Audition Demo</span>
              </>
            )}
          </button>
        )}

        {product.external_url ? (
          <a
            href={product.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#00e5ff] hover:bg-[#33ebff] text-black py-3.5 px-6 rounded-xl text-sm font-black uppercase flex-1 flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/40"
          >
            <ExternalLink className="w-5 h-5" />
            <span>{product.button_text || `GET ON ${product.brand?.toUpperCase() || 'PARTNER SITE'}`}</span>
          </a>
        ) : (
          <button
            onClick={() => addItem(product)}
            disabled={added}
            className={`py-3.5 px-6 text-sm font-black uppercase rounded-xl flex-1 flex items-center justify-center gap-2 transition-all ${
              added ? 'bg-zinc-800 text-zinc-400 cursor-default' : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  )
}

'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

interface CheckoutUpsellsProps {
  upsellProducts: any[]
  formatPrice: (inr?: number, usd?: number) => string
}

export function CheckoutUpsells({ upsellProducts, formatPrice }: CheckoutUpsellsProps) {
  if (!upsellProducts || upsellProducts.length === 0) return null

  return (
    <div className="bg-[#181818] border border-[#282828] rounded-2xl p-5 space-y-3.5 shadow-xl">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-[#FC6301]" />
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
          Frequently Added By Producers
        </h4>
      </div>

      <div className="space-y-2.5">
        {upsellProducts.map((prod) => (
          <div
            key={prod.id}
            className="flex items-center justify-between gap-3 p-2.5 bg-[#202020] border border-[#2a2a2a] rounded-xl hover:border-[#383838] transition-all"
          >
            <div className="relative w-11 h-11 bg-[#181818] border border-[#2c2c2c] rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={prod.cover_image || '/placeholder.jpg'}
                alt={prod.name}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-white truncate">{prod.name}</h5>
              <span className="text-[10px] font-extrabold text-[#FC6301]">
                {formatPrice(prod.price_inr, prod.price_usd)}
              </span>
            </div>

            <Link
              href={`/product/${prod.slug}`}
              className="p-2 bg-[#282828] hover:bg-[#FC6301] text-white rounded-lg transition-all"
              title="View Product"
            >
              <ArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

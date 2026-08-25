'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CheckoutUpsellsProps {
  upsellProducts: any[]
  formatPrice: (inr?: number, usd?: number) => string
}

export function CheckoutUpsells({ upsellProducts, formatPrice }: CheckoutUpsellsProps) {
  if (!upsellProducts || upsellProducts.length === 0) return null

  return (
    <div className="bg-[#141414] border border-[#222222] rounded-xl p-4 sm:p-5 space-y-3">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
        You May Also Like
      </h4>

      <div className="divide-y divide-[#202020]">
        {upsellProducts.map((prod) => (
          <div
            key={prod.id}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="relative w-9 h-9 bg-[#1c1c1c] border border-[#282828] rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={prod.cover_image || '/placeholder.jpg'}
                alt={prod.name}
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-medium text-zinc-200 truncate">{prod.name}</h5>
              <span className="text-[10px] text-zinc-400">
                {formatPrice(prod.price_inr, prod.price_usd)}
              </span>
            </div>

            <Link
              href={`/product/${prod.slug}`}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
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

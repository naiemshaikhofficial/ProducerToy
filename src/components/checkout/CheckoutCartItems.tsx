'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { CartItem } from '@/context/CartContext'

interface CheckoutCartItemsProps {
  items: CartItem[]
  removeItem: (id: string) => void
  formatPrice: (inr?: number, usd?: number) => string
}

export function CheckoutCartItems({ items, removeItem, formatPrice }: CheckoutCartItemsProps) {
  return (
    <div className="bg-[#141414] border border-[#222222] rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#222222] pb-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
          Order Items ({items.length})
        </h2>
        <Link
          href="/store"
          className="text-[11px] text-zinc-400 hover:text-white transition-colors"
        >
          + Add more
        </Link>
      </div>

      <div className="divide-y divide-[#202020]">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0 group"
          >
            <div className="relative w-12 h-12 bg-[#1c1c1c] border border-[#282828] rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.cover_image || '/placeholder.jpg'}
                alt={item.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs text-zinc-100 truncate">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                <span className="capitalize">{item.product_type?.replace('_', ' ') || 'Plugin'}</span>
                {item.brand && (
                  <>
                    <span>&bull;</span>
                    <span className="truncate">{item.brand}</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right flex items-center gap-3 flex-shrink-0">
              <span className="font-bold text-xs text-white">
                {formatPrice(item.price_inr, item.price_usd)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-zinc-400 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                title="Remove item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

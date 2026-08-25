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
    <div className="bg-[#181818] border border-[#282828] rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#282828] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-4 bg-[#FC6301] rounded-sm" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
            Items in Order ({items.length})
          </h2>
        </div>
        <Link
          href="/store"
          className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-[#FC6301] transition-colors"
        >
          + Add More Sounds
        </Link>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3.5 bg-[#202020] border border-[#2a2a2a] rounded-xl group hover:border-[#383838] transition-all"
          >
            <div className="relative w-14 h-14 bg-[#181818] border border-[#2e2e2e] rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.cover_image || '/placeholder.jpg'}
                alt={item.name}
                fill
                sizes="56px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-white truncate group-hover:text-[#FC6301] transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 bg-[#181818] px-2 py-0.5 rounded border border-[#2c2c2c]">
                  {item.product_type || 'Sound Pack'}
                </span>
                {item.brand && (
                  <span className="text-[10px] font-medium text-zinc-500 truncate">
                    {item.brand}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right flex items-center gap-4 flex-shrink-0">
              <span className="font-extrabold text-sm text-white">
                {formatPrice(item.price_inr, item.price_usd)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-[#282828] transition-all cursor-pointer"
                title="Remove item"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

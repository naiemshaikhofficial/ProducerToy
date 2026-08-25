'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, Sparkles } from 'lucide-react'

export function CheckoutEmptyCart() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-20 text-center">
      <div className="w-full max-w-md bg-[#181818] border border-[#282828] rounded-2xl p-8 sm:p-10 shadow-2xl space-y-5 flex flex-col items-center">
        <div className="w-16 h-16 bg-[#222222] border border-[#333333] rounded-2xl flex items-center justify-center text-zinc-400">
          <ShoppingBag size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Your Cart is Empty</h2>
          <p className="text-xs text-zinc-400">
            No plugins, sample packs, or presets detected in your shopping bag.
          </p>
        </div>
        <div className="pt-2 w-full">
          <Link
            href="/store"
            prefetch={true}
            className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3.5 px-6 rounded-xl inline-flex items-center justify-center gap-2 uppercase tracking-wider transition-all text-center cursor-pointer active:scale-[0.99]"
          >
            <Sparkles size={14} />
            <span>Browse Store Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

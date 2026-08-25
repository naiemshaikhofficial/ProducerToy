'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export function CheckoutEmptyCart() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-sm bg-[#141414] border border-[#222222] rounded-xl p-8 space-y-4 flex flex-col items-center">
        <div className="w-12 h-12 bg-[#1a1a1a] border border-[#262626] rounded-xl flex items-center justify-center text-zinc-400">
          <ShoppingBag size={22} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">Your Cart is Empty</h2>
          <p className="text-xs text-zinc-500">
            You don&apos;t have any items in your bag yet.
          </p>
        </div>
        <div className="pt-2 w-full">
          <Link
            href="/store"
            prefetch={true}
            className="w-full h-10 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg inline-flex items-center justify-center uppercase tracking-wider transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  )
}

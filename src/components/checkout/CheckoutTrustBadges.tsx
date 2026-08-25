'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldCheck, Zap, DownloadCloud } from 'lucide-react'

export function CheckoutTrustBadges() {
  return (
    <div className="bg-[#141414] border border-[#222222] rounded-xl p-4 sm:p-5 space-y-3.5">
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2.5 text-zinc-300">
          <Zap size={13} className="text-zinc-400 flex-shrink-0" />
          <span>Instant direct download &amp; vault license sync</span>
        </div>
        <div className="flex items-center gap-2.5 text-zinc-300">
          <ShieldCheck size={13} className="text-zinc-400 flex-shrink-0" />
          <span>100% Royalty-Free clearance for commercial use</span>
        </div>
        <div className="flex items-center gap-2.5 text-zinc-300">
          <DownloadCloud size={13} className="text-zinc-400 flex-shrink-0" />
          <span>Lifetime access across all your DAW systems</span>
        </div>
      </div>

      <div className="pt-3 border-t border-[#222222] flex items-center justify-between text-[10px] text-zinc-500">
        <div className="flex items-center gap-1.5 font-medium">
          <span>Accepted:</span>
          <span className="text-zinc-400">UPI</span>
          <span>&bull;</span>
          <span className="text-zinc-400">Cards</span>
          <span>&bull;</span>
          <span className="text-zinc-400">NetBanking</span>
        </div>

        <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
          Need Help?
        </Link>
      </div>
    </div>
  )
}

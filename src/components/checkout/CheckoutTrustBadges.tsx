'use client'

import React from 'react'
import Link from 'next/link'
import { Zap, ShieldCheck, Lock, HelpCircle, ArrowRight } from 'lucide-react'

export function CheckoutTrustBadges() {
  return (
    <div className="space-y-4">
      {/* 1. Value Proposition Highlights */}
      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-[#282828] pb-3">
          <div className="w-2 h-4 bg-white rounded-sm" />
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
            Why Shop on ProducerToy?
          </h4>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#202020] border border-[#2a2a2a] rounded-lg text-white">
              <Zap size={15} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Instant Vault Delivery</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                Direct high-speed downloads &amp; license keys generated immediately after checkout.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#202020] border border-[#2a2a2a] rounded-lg text-white">
              <ShieldCheck size={15} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">100% Royalty-Free Clearance</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                Commercial license included for streaming, Spotify, YouTube, broadcast, and beats.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#202020] border border-[#2a2a2a] rounded-lg text-white">
              <Lock size={15} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Lifetime Vault Access</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                Re-download anytime from your private Library Vault across all your studio machines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Secure Payment Badges */}
      <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 text-center space-y-2 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
          Guaranteed Safe &amp; Secure Payment
        </span>
        <div className="flex items-center justify-center gap-2 text-[10px] font-extrabold uppercase text-zinc-400">
          <span className="bg-[#202020] px-2.5 py-1 rounded border border-[#2a2a2a]">UPI</span>
          <span className="bg-[#202020] px-2.5 py-1 rounded border border-[#2a2a2a]">VISA</span>
          <span className="bg-[#202020] px-2.5 py-1 rounded border border-[#2a2a2a]">MASTERCARD</span>
          <span className="bg-[#202020] px-2.5 py-1 rounded border border-[#2a2a2a]">NETBANKING</span>
        </div>
      </div>

      {/* 3. Help Support Box */}
      <Link
        href="/contact"
        className="bg-[#181818] border border-[#282828] hover:border-[#383838] rounded-2xl p-4 flex items-center justify-between group transition-all block"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#202020] border border-[#2c2c2c] rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
            <HelpCircle size={17} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Need Help with Order?</h4>
            <p className="text-[10px] text-zinc-400">Contact our 24/7 technical crew</p>
          </div>
        </div>
        <ArrowRight size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
      </Link>
    </div>
  )
}

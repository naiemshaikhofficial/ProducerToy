'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { PartyPopper, CheckCircle2 } from 'lucide-react'

// --- CONFETTI CELEBRATION EFFECT (PRODUCERTOY PALETTE) ---
const ConfettiEffect = () => {
  const [pieces, setPieces] = useState<
    {
      id: number
      left: string
      top: string
      size: string
      color: string
      delay: string
      tx: string
      ty: string
      rot: string
    }[]
  >([])

  useEffect(() => {
    const colors = ['#FC6301', '#FF8A00', '#10B981', '#FFFFFF', '#6366F1', '#38BDF8']
    const newPieces = Array.from({ length: 100 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2
      const velocity = Math.random() * 300 + 150
      const tx = `${Math.cos(angle) * velocity}px`
      const ty = `${Math.sin(angle) * velocity + 400}px`
      const size = `${Math.random() * 8 + 5}px`
      return {
        id: i,
        left: '50%',
        top: '35%',
        size,
        color: colors[i % colors.length],
        delay: `${Math.random() * 0.15}s`,
        tx,
        ty,
        rot: `${Math.random() * 720}deg`,
      }
    })
    setPieces(newPieces)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-confetti-burst"
          style={
            {
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animationDelay: p.delay,
              '--tx': p.tx,
              '--ty': p.ty,
              '--rot': p.rot,
            } as any
          }
        />
      ))}
      <style>{`
        @keyframes confettiBurst {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: translate(calc(-50% + var(--tx) * 0.4), calc(-50% + var(--ty) * 0.2)) scale(1.2) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.4) rotate(var(--rot));
            opacity: 0;
          }
        }
        .animate-confetti-burst {
          animation: confettiBurst 2.5s cubic-bezier(0.1, 0.8, 0.25, 1) forwards;
        }
      `}</style>
    </div>
  )
}

interface CheckoutSuccessViewProps {
  email?: string
}

export function CheckoutSuccessView({ email }: CheckoutSuccessViewProps) {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center space-y-8 text-center px-4 relative z-10 py-16">
      <ConfettiEffect />

      <div className="relative mb-2 flex items-center justify-center">
        {/* Animated Glow Backdrop */}
        <div className="absolute w-36 h-36 bg-[#FC6301]/15 rounded-full blur-2xl animate-pulse" />
        <div className="absolute w-28 h-28 bg-emerald-500/10 rounded-full blur-xl animate-pulse delay-100" />

        {/* Celebration Badges */}
        <div className="relative w-24 h-24 bg-[#181818] border-2 border-[#282828] rounded-2xl flex items-center justify-center text-[#FC6301] shadow-2xl shadow-[#FC6301]/20">
          <PartyPopper size={44} className="animate-bounce" />
          <div className="absolute -top-2.5 -right-2.5 bg-[#FC6301] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shadow-md">
            PAID
          </div>
        </div>
      </div>

      <div className="space-y-3 max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 size={14} />
          <span>Order Confirmed &amp; Authorized</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Payment <span className="text-[#FC6301]">Successful!</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Your plugins, sound packs, and VST license keys have been permanently attached to your private vault.
        </p>
      </div>

      {/* Invoice & Vault Sync Card */}
      <div className="max-w-md w-full p-6 sm:p-8 bg-[#181818] border border-[#282828] rounded-2xl shadow-xl text-left space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#282828] pb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            License &amp; Vault Delivery
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            Synced Instantly
          </span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          An order confirmation receipt and download authorization details have been dispatched to{' '}
          <strong className="text-white font-bold">{email || 'your delivery email'}</strong>.
        </p>

        <div className="pt-2 border-t border-[#282828]">
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            ℹ️ You can permanently access and download all your software, sound packs, presets, and serial keys inside your{' '}
            <Link href="/library" className="text-[#FC6301] hover:underline font-bold">
              Library Vault
            </Link>{' '}
            at any time.
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
        <Link
          href="/library"
          prefetch={true}
          className="w-full bg-[#FC6301] hover:bg-[#E05800] text-white font-extrabold text-xs py-4 px-6 rounded-xl uppercase tracking-wider transition-all text-center shadow-lg shadow-[#FC6301]/25 active:scale-[0.99]"
        >
          Go to Library Vault
        </Link>
        <Link
          href="/store"
          prefetch={true}
          className="w-full bg-[#202020] hover:bg-[#2a2a2a] text-white font-bold text-xs py-4 px-6 rounded-xl border border-[#333333] uppercase tracking-wider transition-all text-center"
        >
          Continue Browsing
        </Link>
      </div>

      <p className="text-[11px] text-zinc-500">
        Need assistance? Reach our engineering team at{' '}
        <a href="mailto:support@producertoy.com" className="text-zinc-400 hover:text-white underline">
          support@producertoy.com
        </a>
      </p>
    </div>
  )
}

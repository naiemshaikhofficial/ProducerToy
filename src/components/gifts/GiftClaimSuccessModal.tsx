'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2,
  Gift,
  ArrowRight,
  X,
  Sparkles,
  Download,
  FolderLock,
  MessageSquareQuote
} from 'lucide-react'
import { GiftRecord } from '@/actions/giftActions'

interface GiftClaimSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  gift: GiftRecord | null
  userEmail?: string
}

export function GiftClaimSuccessModal({
  isOpen,
  onClose,
  gift,
  userEmail,
}: GiftClaimSuccessModalProps) {
  // Freeze background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalBodyOverflow
        document.documentElement.style.overflow = originalHtmlOverflow
      }
    }
  }, [isOpen])

  if (!isOpen || !gift) return null

  const senderName = gift.sender_name || gift.sender_email?.split('@')[0] || 'A fellow producer'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 font-sans touch-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#262626] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-10 flex flex-col max-h-[88dvh] sm:max-h-[90vh]">
        {/* Top Close Button ✕ */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-zinc-400 hover:text-white transition-colors cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto overscroll-contain touch-pan-y p-5 sm:p-8 space-y-6 text-center flex-1 min-h-0 [scrollbar-width:thin] [scrollbar-color:#383838_transparent] [-webkit-overflow-scrolling:touch]">
          {/* Glowing Animated Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl shadow-white/5">
                <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-bounce-subtle" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#141414]">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Thank You! Gift Claimed
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Your gift license and digital files are ready. This product is now permanently linked to your ProducerToy account.
            </p>
          </div>

          {/* Product Summary Card */}
          <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 text-left space-y-4">
            <div className="flex items-center gap-3.5">
              {gift.cover_image ? (
                <div className="w-14 h-18 sm:w-16 sm:h-20 bg-[#121212] rounded-xl overflow-hidden relative flex-shrink-0 border border-[#2c2c2c]">
                  <Image
                    src={gift.cover_image}
                    alt={gift.product_name || 'Gift Product'}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-18 sm:w-16 sm:h-20 bg-[#1e1e1e] rounded-xl flex items-center justify-center text-zinc-400 border border-[#2c2c2c] flex-shrink-0">
                  <Gift className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-1">
                <span className="inline-block bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/20">
                  Gift Unlocked
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {gift.product_name}
                </h3>
                <p className="text-xs text-zinc-400">
                  Gift from <span className="text-white font-medium">{senderName}</span>
                </p>
              </div>
            </div>

            {/* Sender Note / Message */}
            {gift.message && (
              <div className="bg-[#121212] border border-[#222222] rounded-xl p-3 flex items-start gap-2.5 text-xs text-zinc-300">
                <MessageSquareQuote className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div className="italic">&ldquo;{gift.message}&rdquo;</div>
              </div>
            )}

            {/* Details Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-[#242424] text-[11px] text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Claim Code</span>
                <span className="font-mono text-zinc-200 font-bold">{gift.claim_code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Attached Account</span>
                <span className="text-zinc-200 truncate max-w-[200px]">{userEmail || gift.recipient_email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vault Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for Download
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <Link
              href="/library"
              prefetch={true}
              onClick={onClose}
              className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-white/5 active:scale-[0.99]"
            >
              <Download className="w-4 h-4" />
              <span>Go to Library & Downloads</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/store"
              prefetch={true}
              onClick={onClose}
              className="w-full h-11 bg-[#1c1c1c] hover:bg-[#252525] text-zinc-300 hover:text-white font-medium text-xs uppercase tracking-wider rounded-xl border border-[#2c2c2c] inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              Continue Shopping
            </Link>
          </div>

          <p className="text-[11px] text-zinc-500 pt-1">
            Need help with your gift? Contact{' '}
            <a href="mailto:support@producertoy.com" className="text-zinc-400 hover:text-white underline">
              support@producertoy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

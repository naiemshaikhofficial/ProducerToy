'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, X, Gift } from 'lucide-react'

interface CheckoutSuccessViewProps {
  email?: string
  hasGifts?: boolean
  giftRecipientEmail?: string
  hasSelfItems?: boolean
  onClose?: () => void
}

export function CheckoutSuccessView({
  email,
  hasGifts,
  giftRecipientEmail,
  hasSelfItems,
  onClose,
}: CheckoutSuccessViewProps) {
  const isGiftOnly = hasGifts && !hasSelfItems

  return (
    <div className="relative w-full min-h-[70vh] sm:min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 sm:py-16 text-center space-y-6 max-w-lg mx-auto select-none">
      {/* Top-Right Fixed Cut Icon ✕ (Exact Match) */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <Link
            href="/store"
            prefetch={true}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            title="Close and return to store"
            aria-label="Close and return to store"
          >
            <X className="w-5 h-5" />
          </Link>
        )}
      </div>

      <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white">
        {hasGifts ? <Gift size={28} className="text-[#FA742B]" /> : <CheckCircle2 size={28} />}
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {hasGifts ? (isGiftOnly ? 'Gift Sent Successfully!' : 'Order & Gift Confirmed') : 'Payment Confirmed'}
        </h1>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          {hasGifts ? (
            <>
              Your gift has been dispatched to{' '}
              <span className="text-white font-semibold">{giftRecipientEmail || 'the recipient'}</span>.
              {hasSelfItems ? ' Your personal licenses are ready in your Library.' : ' You can track delivery anytime in Gifts.'}
            </>
          ) : (
            <>
              Your digital licenses and downloads have been attached to your account and sent to{' '}
              <span className="text-white font-medium">{email || 'your email'}</span>.
            </>
          )}
        </p>
      </div>

      <div className="w-full p-4 bg-[#141414] border border-[#222222] rounded-xl text-left text-xs space-y-2">
        <div className="flex items-center justify-between text-zinc-400">
          <span>License Delivery</span>
          <span className="text-white font-medium">
            {hasGifts ? (isGiftOnly ? 'Dispatched to Recipient' : 'Instant Vault Sync & Gift Dispatch') : 'Instant Vault Sync'}
          </span>
        </div>
        <div className="flex items-center justify-between text-zinc-400">
          <span>Status</span>
          <span className="text-emerald-400 font-medium">Completed</span>
        </div>
        {hasGifts && giftRecipientEmail && (
          <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-[#222222]">
            <span>Gift Recipient</span>
            <span className="text-zinc-200 font-mono">{giftRecipientEmail}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        {isGiftOnly ? (
          <Link
            href="/gifts"
            prefetch={true}
            onClick={onClose}
            className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
          >
            <span>View Sent Gifts</span>
            <ArrowRight size={14} />
          </Link>
        ) : (
          <Link
            href="/library"
            prefetch={true}
            onClick={onClose}
            className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
          >
            <span>Open Library Vault</span>
            <ArrowRight size={14} />
          </Link>
        )}
        <Link
          href="/store"
          prefetch={true}
          onClick={onClose}
          className="w-full h-11 bg-[#181818] hover:bg-[#202020] text-zinc-300 hover:text-white font-medium text-xs rounded-lg border border-[#282828] uppercase tracking-wider inline-flex items-center justify-center transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

      <p className="text-[11px] text-zinc-500">
        Questions? Contact us at{' '}
        <a href="mailto:support@producertoy.com" className="text-zinc-400 hover:text-white underline">
          support@producertoy.com
        </a>
      </p>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, ExternalLink, FileText, ArrowRight, Check } from 'lucide-react'
import { CartItem } from '@/context/CartContext'
import { savePostPurchaseEmailShareConsentAction } from '@/actions/checkoutActions'

interface CheckoutSuccessViewProps {
  email?: string
  hasGifts?: boolean
  giftRecipientEmail?: string
  hasSelfItems?: boolean
  onClose?: () => void
  items?: CartItem[]
  orderNumber?: string
  sellerName?: string
}

export function CheckoutSuccessView({
  email,
  hasGifts,
  giftRecipientEmail,
  hasSelfItems,
  onClose,
  items,
  orderNumber,
  sellerName,
}: CheckoutSuccessViewProps) {
  const router = useRouter()
  const isGiftOnly = hasGifts && !hasSelfItems

  const [stage, setStage] = useState<'all_yours' | 'final_step'>('all_yours')
  const [shareConsentAgreed, setShareConsentAgreed] = useState(false)
  const [shareConsentSaved, setShareConsentSaved] = useState(false)

  const primaryItem = items?.[0]
  const resolvedSellerName = primaryItem?.brand || sellerName || 'the developer'

  // Automatic transition from wide "It's all yours" screen to "FINAL STEP" after 2.4s
  useEffect(() => {
    if (stage === 'all_yours') {
      const timer = setTimeout(() => {
        setStage('final_step')
      }, 2400)
      return () => clearTimeout(timer)
    }
  }, [stage])

  const handleToggleShareConsent = async (checked: boolean) => {
    setShareConsentAgreed(checked)
    if (primaryItem?.id) {
      savePostPurchaseEmailShareConsentAction({
        orderNumber,
        productId: primaryItem.id,
        sellerName: resolvedSellerName,
        consented: checked,
      }).catch(() => {})
      setShareConsentSaved(checked)
    }
  }

  // --------------------------------------------------------------------------
  // STAGE 1: Big Wide Screen ("It's all yours" - 1:1 Epic Games Store Layout)
  // --------------------------------------------------------------------------
  if (stage === 'all_yours') {
    return (
      <div
        onClick={() => setStage('final_step')}
        className="relative w-full max-w-[1040px] lg:max-w-[1080px] min-h-[540px] md:h-[620px] bg-[#141416] border border-[#242426] rounded-2xl md:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col items-center justify-center p-8 sm:p-12 text-center select-none cursor-pointer animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top-Right Fixed Close ✕ */}
        <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Centered Glowing Ring with Checkmark (Strictly NO BLUE - clean monochrome) */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-zinc-200/90 bg-[#1a1a1e] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.15)]">
            <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[3]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-[38px] font-black text-white tracking-tight mb-3">
          It&apos;s all yours
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-zinc-400 font-medium max-w-md leading-relaxed mb-6">
          Thanks for your purchase! Your receipt is on its way to your email.
        </p>

        {/* Skip / Direct Navigation */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setStage('final_step')
          }}
          className="text-[12px] text-zinc-400 hover:text-white font-medium underline underline-offset-4 transition-colors cursor-pointer"
        >
          Continue to Final Step &rarr;
        </button>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // STAGE 2: Exact 1:1 "FINAL STEP" Box (Epic Games Store Final Step)
  // --------------------------------------------------------------------------
  return (
    <div className="relative w-full max-w-[500px] mx-auto bg-[#18181b] border border-[#2c2c32] rounded-2xl p-6 sm:p-8 text-left select-none text-white shadow-2xl animate-in zoom-in-95 duration-200">
      {/* Top-Right Fixed Close ✕ */}
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
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Subtitle: FINAL STEP */}
      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
        FINAL STEP
      </div>

      {/* Title */}
      <h2 className="text-[21px] sm:text-[23px] font-black text-white tracking-tight mb-2">
        Open your Library?
      </h2>

      {/* Description */}
      <p className="text-[12.5px] text-zinc-300 leading-relaxed mb-6">
        {hasGifts && isGiftOnly ? (
          <>
            Your gift has been dispatched to{' '}
            <strong className="text-white font-semibold">{giftRecipientEmail || 'the recipient'}</strong>. You can track delivery anytime in Gifts.
          </>
        ) : (
          <>
            Your license has been added to your account. To access your downloads, manage activations, and explore presets, visit your ProducerToy Library.
          </>
        )}
      </p>

      {/* Two Action Buttons (Exact 1:1 Epic Games Store Layout, NO BLUE - charcoal black!) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full mb-5">
        {isGiftOnly ? (
          <Link
            href="/gifts"
            onClick={onClose}
            className="w-full h-11 bg-[#242426] hover:bg-[#2c2c30] active:scale-[0.99] text-white font-bold text-[13px] rounded-md border border-[#38383e] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Sent Gifts</span>
            <ArrowRight size={14} />
          </Link>
        ) : (
          <>
            {/* Primary: Open Library (Charcoal black, NO BLUE!) */}
            <Link
              href="/library"
              onClick={onClose}
              className="w-full sm:flex-1 h-11 bg-[#242426] hover:bg-[#2c2c30] active:scale-[0.99] text-white font-bold text-[13px] rounded-md border border-[#38383e] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open Library</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
            </Link>

            {/* Secondary: Stay on Store */}
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 h-11 bg-[#18181a] hover:bg-[#222226] active:scale-[0.99] text-zinc-200 hover:text-white font-semibold text-[13px] rounded-md border border-[#2e2e32] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Stay on Store</span>
            </button>
          </>
        )}
      </div>

      {/* Share email with creator checkbox */}
      {!isGiftOnly && (
        <div className="pt-2 pb-1 border-t border-[#222222]">
          <div className="flex items-start gap-2.5 pt-2 text-left">
            <input
              type="checkbox"
              id="share-email-creator"
              checked={shareConsentAgreed}
              onChange={(e) => handleToggleShareConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded bg-[#181818] border border-[#383838] text-white accent-white cursor-pointer shrink-0"
            />
            <label
              htmlFor="share-email-creator"
              className="text-[11.5px] text-zinc-300 leading-snug cursor-pointer select-none"
            >
              Share your email with <strong className="text-white font-bold">{resolvedSellerName}</strong> to get updates and offers in line with their{' '}
              <Link href="/privacy" target="_blank" className="text-zinc-300 hover:text-white underline font-medium inline-flex items-center gap-0.5">
                Privacy Policy <ExternalLink size={10} className="inline ml-0.5 opacity-70" />
              </Link>
            </label>
          </div>
          {shareConsentSaved && (
            <p className="text-[10.5px] text-zinc-400 pl-6.5 pt-1 font-medium">
              Preference saved for {resolvedSellerName} updates.
            </p>
          )}
        </div>
      )}

      {/* Receipt & Secondary Navigation */}
      <div className="pt-4 mt-2 border-t border-[#222222] flex items-center justify-between text-xs text-zinc-400">
        {orderNumber ? (
          <Link
            href={`/account?tab=orders&highlight=${orderNumber}`}
            onClick={onClose}
            className="hover:text-white underline underline-offset-2 flex items-center gap-1.5 transition-colors font-medium text-[11.5px]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Receipt (#{orderNumber})</span>
          </Link>
        ) : (
          <Link
            href="/account?tab=orders"
            onClick={onClose}
            className="hover:text-white underline underline-offset-2 flex items-center gap-1.5 transition-colors font-medium text-[11.5px]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Receipt &amp; Orders</span>
          </Link>
        )}

        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-[11.5px] font-medium"
        >
          Continue to Store
        </button>
      </div>
    </div>
  )
}

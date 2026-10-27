'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Download, ExternalLink, FileText, ArrowRight } from 'lucide-react'
import { CartItem } from '@/context/CartContext'
import { getSecureDownloadUrlAction } from '@/actions/downloadActions'
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

  const [downloadLoading, setDownloadLoading] = useState(false)
  const [shareConsentAgreed, setShareConsentAgreed] = useState(false)
  const [shareConsentSaved, setShareConsentSaved] = useState(false)

  const primaryItem = items?.[0]
  const resolvedSellerName = sellerName || 'the developer'

  const handleDownloadInstaller = async () => {
    if (!primaryItem?.id) {
      router.push('/library')
      onClose?.()
      return
    }

    setDownloadLoading(true)
    try {
      const res = await getSecureDownloadUrlAction(primaryItem.id, 'windows')
      if (res.success && res.downloadUrl) {
        window.open(res.downloadUrl, '_blank')
      } else {
        router.push('/library')
        onClose?.()
      }
    } catch {
      router.push('/library')
      onClose?.()
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleToggleShareConsent = async (checked: boolean) => {
    setShareConsentAgreed(checked)
    if (checked && primaryItem?.id) {
      savePostPurchaseEmailShareConsentAction({
        orderNumber,
        productId: primaryItem.id,
        sellerName: resolvedSellerName,
        consented: true,
      }).catch(() => {})
      setShareConsentSaved(true)
    }
  }

  return (
    <div className="relative w-full max-w-lg mx-auto bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 text-left select-none text-white shadow-2xl animate-in zoom-in-95 duration-200">
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

      {/* Two Action Buttons (Exact 1:1 Epic Games Store Layout) */}
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
            {/* Primary: Open Library */}
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

      {/* Share email with creator checkbox (Screenshot 2 "reciiept sahre wala") */}
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
            <p className="text-[10.5px] text-emerald-400 pl-6.5 pt-1 font-medium">
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

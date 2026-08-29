'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  Search,
  Calendar,
  ChevronDown,
  HelpCircle,
  AlertCircle
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { validateGiftEligibilityAction } from '@/actions/giftActions'

// Windows & Apple SVG Icons
const WindowsIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.802" />
  </svg>
)

const AppleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-.99 1.72-.88 2.76 1.01.08 2-.51 2.61-1.26z" />
  </svg>
)

interface SendGiftModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    slug: string
    cover_image: string
    price_usd: number | string
    price_inr?: number | string
    brand?: string
    product_type?: string
  }
  onProceedToCheckout?: (giftData: {
    recipientEmail: string
    recipientName?: string
    message: string
    sendDate: string
  }) => void
}

const PRESET_MESSAGES = [
  'Enjoy the gift!',
  'Create something amazing!',
  'Time to celebrate!',
  'Have fun!',
  'Happy Birthday!',
  'Custom message...',
]

export function SendGiftModal({
  isOpen,
  onClose,
  product,
  onProceedToCheckout,
}: SendGiftModalProps) {
  const { addItem, openCheckout } = useCart()
  const { formatPrice } = useCurrency()
  const { user } = useAuth()

  const [recipientEmail, setRecipientEmail] = useState('')
  const [selectedMessage, setSelectedMessage] = useState('')
  const [customMessageText, setCustomMessageText] = useState('')
  const [isMessageDropdownOpen, setIsMessageDropdownOpen] = useState(false)
  const [sendDate, setSendDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [emailError, setEmailError] = useState('')
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)

  // Freeze background scrolling completely when modal is open
  useEffect(() => {
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

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setEmailError('')
      setSelectedMessage('Enjoy the gift!')
      setCustomMessageText('')
      setIsMessageDropdownOpen(false)
      setIsCheckingEligibility(false)
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email.trim())
  }

  const handleEmailChange = (val: string) => {
    setRecipientEmail(val)
    if (emailError) setEmailError('')
  }

  const handleClearEmail = () => {
    setRecipientEmail('')
    setEmailError('')
  }

  const handleSelectMessage = (msg: string) => {
    setSelectedMessage(msg)
    setIsMessageDropdownOpen(false)
  }

  const handleGoToCheckout = async () => {
    const trimmed = recipientEmail.trim()
    if (!trimmed) {
      setEmailError('Please enter a valid recipient email address.')
      return
    }
    if (!validateEmail(trimmed)) {
      setEmailError('Please enter a valid email format (e.g. producer@example.com).')
      return
    }
    const isFree = Number(product.price_usd || 0) <= 0 && Number(product.price_inr || 0) <= 0
    if (isFree) {
      setEmailError('Free items cannot be gifted. Anyone can claim and download this free product directly from the store.')
      return
    }

    if (user?.email && trimmed.toLowerCase() === user.email.toLowerCase()) {
      setEmailError('You cannot gift a product to your own account email.')
      return
    }

    setIsCheckingEligibility(true)
    setEmailError('')

    try {
      const check = await validateGiftEligibilityAction({
        productId: product.id,
        recipientEmail: trimmed,
        senderEmail: user?.email,
      })

      if (!check.allowed) {
        setEmailError(check.reason || 'Cannot send gift to this email.')
        setIsCheckingEligibility(false)
        return
      }
    } catch (err: any) {
      console.warn('Eligibility check note:', err)
    }

    setIsCheckingEligibility(false)

    const finalMessage =
      selectedMessage === 'Custom message...'
        ? customMessageText.trim() || 'Enjoy the gift!'
        : selectedMessage || 'Enjoy the gift!'

    const giftPayload = {
      recipientEmail: trimmed,
      message: finalMessage,
      sendDate: sendDate || new Date().toISOString().split('T')[0],
    }

    const giftItem = {
      ...product,
      is_gift: true,
      gift_recipient_email: trimmed,
      gift_message: finalMessage,
      gift_send_date: giftPayload.sendDate,
    }

    // Add item with gift metadata to cart
    addItem(giftItem, false)

    // Save active gift checkout session to localStorage
    try {
      const pendingGifts = JSON.parse(localStorage.getItem('pt_pending_gifts') || '[]')
      pendingGifts.push({
        id: `gift-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        coverImage: product.cover_image,
        senderEmail: user?.email || 'Anonymous Producer',
        recipientEmail: trimmed,
        message: finalMessage,
        sendDate: giftPayload.sendDate,
        priceUsd: product.price_usd,
        priceInr: product.price_inr,
        createdAt: new Date().toISOString(),
        status: 'pending_payment',
      })
      localStorage.setItem('pt_pending_gifts', JSON.stringify(pendingGifts))
    } catch {}

    if (onProceedToCheckout) {
      onProceedToCheckout(giftPayload)
    }

    onClose()
    openCheckout(giftItem)
  }

  const isFormValid = validateEmail(recipientEmail.trim())

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 font-sans touch-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card (1:1 Exact Match with PC & Mobile Screenshots) */}
      <div className="relative z-10 w-full max-w-[480px] md:max-w-[760px] lg:max-w-[800px] bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl sm:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[88dvh] sm:max-h-[92vh]">
        
        {/* Scrollable Container (Grid on Desktop, Stack on Mobile) */}
        <div className="overflow-y-auto overscroll-contain touch-pan-y p-5 sm:p-7 md:p-8 flex-1 min-h-0 [scrollbar-width:thin] [scrollbar-color:#383838_transparent] [-webkit-overflow-scrolling:touch]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
            
            {/* ================= LEFT COLUMN: TITLE & FORM INPUTS ================= */}
            <div className="space-y-5">
              
              {/* Header Title */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Send gift
                </h2>
                {/* Mobile close button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Field 1: Who's it for? */}
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold text-white">
                  <div className="flex items-center gap-1">
                    <span>Who&apos;s it for?</span>
                    <span className="text-white">*</span>
                  </div>
                  
                  {/* Tooltip trigger */}
                  <button
                    type="button"
                    onMouseEnter={() => setIsTooltipOpen(true)}
                    onMouseLeave={() => setIsTooltipOpen(false)}
                    onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                    className="text-zinc-400 hover:text-white cursor-pointer relative"
                    aria-label="Help"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tooltip Popup */}
                {isTooltipOpen && (
                  <div className="absolute right-0 -top-12 z-30 bg-[#282828] text-zinc-200 text-[11px] px-3 py-2 rounded-lg border border-[#3e3e3e] shadow-xl max-w-xs animate-in fade-in duration-150 leading-relaxed">
                    Send digital sound packs and plugins directly to any producer&apos;s email.
                  </div>
                )}

                {/* Search Input Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="Search for a display name"
                    className={`w-full bg-[#141414] text-white text-xs sm:text-sm pl-10 pr-9 h-[44px] rounded-xl border transition-colors outline-none placeholder:text-zinc-500 ${
                      emailError
                        ? 'border-red-500/80 focus:border-red-500'
                        : 'border-[#333333] focus:border-zinc-400'
                    }`}
                  />
                  {recipientEmail ? (
                    <button
                      type="button"
                      onClick={handleClearEmail}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>

                {emailError && (
                  <div className="text-[11px] text-red-400 flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              {/* Field 2: Add a message */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-xs sm:text-[13px] font-bold text-white">
                  <span>Add a message</span>
                  <span className="text-white">*</span>
                </div>

                {/* Message Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMessageDropdownOpen(!isMessageDropdownOpen)}
                    className="w-full bg-[#141414] border border-[#333333] hover:border-[#444444] text-white text-xs sm:text-sm px-4 h-[44px] rounded-xl flex items-center justify-between cursor-pointer transition-colors text-left"
                  >
                    <span className={`truncate ${!selectedMessage ? 'text-zinc-500' : 'text-white'}`}>
                      {selectedMessage || 'Select a message'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform ${
                        isMessageDropdownOpen ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Options */}
                  {isMessageDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsMessageDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#181818] border border-[#333333] rounded-xl shadow-2xl overflow-hidden z-30 animate-in fade-in duration-100 divide-y divide-[#282828]">
                        {PRESET_MESSAGES.map((msg) => (
                          <button
                            key={msg}
                            type="button"
                            onClick={() => handleSelectMessage(msg)}
                            className={`w-full text-left px-4 py-3 text-xs sm:text-sm transition-colors cursor-pointer ${
                              selectedMessage === msg
                                ? 'bg-[#2a2a2a] text-white font-bold'
                                : 'text-zinc-300 hover:bg-[#222222] hover:text-white'
                            }`}
                          >
                            {msg}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Custom Note input if 'Custom message...' selected */}
                {selectedMessage === 'Custom message...' && (
                  <textarea
                    rows={2}
                    value={customMessageText}
                    onChange={(e) => setCustomMessageText(e.target.value)}
                    placeholder="Type your personal note to recipient..."
                    className="w-full bg-[#141414] text-white text-xs p-3 rounded-xl border border-[#333333] focus:border-zinc-400 outline-none mt-2"
                  />
                )}
              </div>

              {/* Field 3: When shall we send the gift? */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-xs sm:text-[13px] font-bold text-white">
                  <span>When shall we send the gift?</span>
                  <span className="text-white">*</span>
                </div>

                <div className="relative">
                  <input
                    type="date"
                    value={sendDate}
                    onChange={(e) => setSendDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#141414] border border-[#333333] focus:border-zinc-400 text-white text-xs sm:text-sm px-4 h-[44px] rounded-xl outline-none"
                  />
                  <Calendar className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <p className="text-[12px] text-zinc-400 leading-tight pt-0.5">
                  They&apos;ll receive the gift immediately
                </p>
              </div>

            </div>

            {/* ================= RIGHT COLUMN: PRODUCT CARD ================= */}
            <div className="bg-[#141414] border border-[#282828] rounded-2xl p-4 space-y-3.5 shadow-inner">
              
              {/* Artwork Banner (Landscape 16:9) */}
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#101010]">
                <Image
                  src={product.cover_image || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              {/* Product Title & Platform Icon */}
              <div className="flex items-start justify-between gap-3 pt-0.5">
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight leading-snug">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 text-zinc-400 shrink-0 pt-0.5">
                  <WindowsIcon className="w-4 h-4" />
                  <AppleIcon className="w-4 h-4" />
                </div>
              </div>

              {/* Price */}
              <div className="text-base sm:text-lg font-bold text-white">
                {formatPrice(
                  product.price_inr ? Number(product.price_inr) : undefined,
                  Number(product.price_usd) || 0
                )}
              </div>

              {/* License / Format Badge */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#222222] border border-[#333333] flex items-center justify-center text-[10px] font-black text-white shrink-0">
                  100%
                </div>
                <span className="text-xs font-bold text-zinc-300">
                  Royalty-Free Commercial License
                </span>
              </div>

              {/* Refund Disclaimer */}
              <p className="text-[11.5px] text-zinc-400 leading-relaxed pt-2 border-t border-[#222222]">
                Gifted sound tools and plugins can&apos;t be refunded unless the recipient declines the gift.
              </p>

            </div>

          </div>

        </div>

        {/* Modal Bottom Fixed Actions (Exact Match with Screenshot) */}
        <div className="px-5 sm:px-7 py-4 bg-[#181818] border-t border-[#2a2a2a] flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-3 rounded-xl bg-transparent hover:bg-zinc-800 border border-zinc-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGoToCheckout}
            disabled={!isFormValid || isCheckingEligibility}
            className={`px-8 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 text-center ${
              isFormValid && !isCheckingEligibility
                ? 'bg-white hover:bg-zinc-200 text-black cursor-pointer shadow-lg active:scale-95'
                : 'bg-[#282828] text-zinc-600 cursor-not-allowed'
            }`}
          >
            {isCheckingEligibility ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-white animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <span>Go to checkout</span>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

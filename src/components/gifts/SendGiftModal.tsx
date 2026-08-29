'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  Search,
  Calendar,
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  Gift,
  AlertCircle
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { validateGiftEligibilityAction } from '@/actions/giftActions'

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

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setEmailError('')
      setSelectedMessage('Enjoy the gift!')
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card (Exact Screenshot 1 & 2 1:1 Layout) */}
      <div className="relative z-10 w-full max-w-[820px] bg-[#141414] border border-[#242424] rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Top Header Row */}
        <div className="px-6 py-5 border-b border-[#202020] flex items-center justify-between">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Send gift</span>
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Grid on Desktop, Stack on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#202020]">
          
          {/* ================= LEFT FORM COLUMN (7 cols) ================= */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
            
            {/* Field 1: Who's it for? */}
            <div className="space-y-2 relative">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <span>Who&apos;s it for?</span>
                <span className="text-[#FA742B]">*</span>
                
                {/* Tooltip trigger */}
                <button
                  type="button"
                  onMouseEnter={() => setIsTooltipOpen(true)}
                  onMouseLeave={() => setIsTooltipOpen(false)}
                  onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                  className="text-zinc-400 hover:text-white cursor-pointer ml-1 relative"
                  aria-label="Info"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tooltip bubble (Screenshot 1 Match) */}
              {isTooltipOpen && (
                <div className="absolute left-0 -top-12 z-30 bg-[#242424] text-zinc-200 text-[11px] px-3.5 py-2 rounded-lg border border-[#383838] shadow-xl max-w-xs animate-in fade-in duration-150 leading-relaxed">
                  Send digital gifts directly to any verified producer email address.
                </div>
              )}

              {/* Recipient Email Input Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter recipient's registered email"
                  className={`w-full bg-[#1c1c1c] text-white text-xs sm:text-sm pl-10 pr-9 h-[44px] rounded-xl border transition-colors outline-none placeholder:text-zinc-400 ${
                    emailError
                      ? 'border-red-500/80 focus:border-red-500'
                      : 'border-[#2c2c2c] focus:border-[#FA742B]'
                  }`}
                />
                {recipientEmail && (
                  <button
                    type="button"
                    onClick={handleClearEmail}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
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
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs font-bold text-white">
                <span>Add a message</span>
                <span className="text-[#FA742B]">*</span>
              </div>

              {/* Custom Message Dropdown Selector (Screenshot 2 Match) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMessageDropdownOpen(!isMessageDropdownOpen)}
                  className="w-full bg-[#1c1c1c] border border-[#2c2c2c] hover:border-[#383838] text-white text-xs sm:text-sm px-4 h-[44px] rounded-xl flex items-center justify-between cursor-pointer transition-colors text-left"
                >
                  <span className="truncate">
                    {selectedMessage || 'Select a message'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform ${
                      isMessageDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Options List */}
                {isMessageDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsMessageDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#181818] border border-[#2c2c2c] rounded-xl shadow-2xl overflow-hidden z-30 animate-in fade-in duration-100 divide-y divide-[#222222]">
                      {PRESET_MESSAGES.map((msg) => (
                        <button
                          key={msg}
                          type="button"
                          onClick={() => handleSelectMessage(msg)}
                          className={`w-full text-left px-4 py-3 text-xs sm:text-sm transition-colors cursor-pointer ${
                            selectedMessage === msg
                              ? 'bg-[#252525] text-white font-bold'
                              : 'text-zinc-300 hover:bg-[#202020] hover:text-white'
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
                  className="w-full bg-[#1c1c1c] text-white text-xs p-3 rounded-xl border border-[#2c2c2c] focus:border-[#FA742B] outline-none mt-2"
                />
              )}
            </div>

            {/* Field 3: When shall we send the gift? */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs font-bold text-white">
                <span>When shall we send the gift?</span>
                <span className="text-[#FA742B]">*</span>
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={sendDate}
                  onChange={(e) => setSendDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#1c1c1c] border border-[#2c2c2c] focus:border-[#FA742B] text-white text-xs sm:text-sm px-4 h-[44px] rounded-xl outline-none"
                />
                <Calendar className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <p className="text-[11px] text-zinc-400 leading-tight">
                They&apos;ll receive the gift immediately
              </p>
            </div>

          </div>

          {/* ================= RIGHT PREVIEW COLUMN (5 cols) ================= */}
          <div className="md:col-span-5 p-6 sm:p-8 bg-[#161616] flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              {/* Product Artwork (16:9) */}
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#282828] bg-[#121212] shadow-inner">
                <Image
                  src={product.cover_image || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              {/* Product Title & Price */}
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                  {product.name}
                </h3>
                <div className="text-lg font-black text-white">
                  {formatPrice(
                    product.price_inr ? Number(product.price_inr) : undefined,
                    Number(product.price_usd) || 0
                  )}
                </div>
              </div>

              {/* License Badge Box */}
              <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 flex items-center gap-2.5">
                <span className="inline-flex items-center font-black bg-[#FA742B] text-black px-1.5 py-0.5 rounded text-[10px] uppercase">
                  100%
                </span>
                <span className="text-xs font-bold text-zinc-200">
                  Royalty-Free Commercial License
                </span>
              </div>
            </div>

            {/* Disclaimer Text at Bottom (Exact Screenshot 1 & 2 Match) */}
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Gifted sound tools can&apos;t be refunded unless the recipient declines the gift.
            </p>

          </div>

        </div>

        {/* Modal Footer Controls (Cancel + Go to checkout) */}
        <div className="px-6 py-4 bg-[#121212] border-t border-[#202020] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#202020] hover:bg-[#282828] text-zinc-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGoToCheckout}
            disabled={!isFormValid || isCheckingEligibility}
            className={`px-7 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
              isFormValid && !isCheckingEligibility
                ? 'bg-[#FA742B] hover:bg-[#E05A18] text-white active:scale-95 shadow-[#FA742B]/25'
                : 'bg-[#222222] text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isCheckingEligibility ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-white animate-spin" />
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

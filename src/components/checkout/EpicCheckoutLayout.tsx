'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  X,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Gift
} from 'lucide-react'
import { LogoIcon } from '@/components/Logo'
import { ToywardsIcon } from '@/components/ui/ToywardsIcon'
import { CartItem } from '@/context/CartContext'
import { BillingDetails, PaymentStatus } from './types'
import { CheckoutBillingForm } from './CheckoutBillingForm'
import { PayPalPaymentButton } from './PayPalPaymentButton'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'

interface EpicCheckoutLayoutProps {
  items: CartItem[]
  removeItem: (id: string) => void
  user: any
  billingDetails: BillingDetails
  onBillingChange: (field: keyof BillingDetails, value: string) => void
  formErrors: Record<string, string>
  newsletterOptIn: boolean
  setNewsletterOptIn: (val: boolean) => void
  countryOptions: { value: string; label: string }[]
  currencySymbol: string
  currentSubtotal: number
  finalTotal: number
  isIndia: boolean
  coupon: string
  setCoupon: (val: string) => void
  onApplyCoupon: () => void
  couponLoading: boolean
  couponError: string
  couponSuccessMsg: string
  availableRewards?: number
  useRewards?: boolean
  onToggleRewards?: (val: boolean) => void
  rewardDiscountAmount?: number
  onRazorpayCheckout: () => void
  onFreeCheckout: () => void
  onPayPalSuccess: (orderNumber?: string) => void
  onPayPalError: (msg: string) => void
  onPayPalProcessing: () => void
  loading: boolean
  paymentStatus: PaymentStatus
  formatPrice: (inr?: number, usd?: number) => string
  onClose?: () => void
}

export function EpicCheckoutLayout({
  items,
  removeItem,
  user,
  billingDetails,
  onBillingChange,
  formErrors,
  newsletterOptIn,
  setNewsletterOptIn,
  countryOptions,
  currencySymbol,
  currentSubtotal,
  finalTotal,
  isIndia,
  coupon,
  setCoupon,
  onApplyCoupon,
  couponLoading,
  couponError,
  couponSuccessMsg,
  availableRewards = 0,
  useRewards = false,
  onToggleRewards,
  rewardDiscountAmount = 0,
  onRazorpayCheckout,
  onFreeCheckout,
  onPayPalSuccess,
  onPayPalError,
  onPayPalProcessing,
  loading,
  paymentStatus,
  formatPrice,
  onClose,
}: EpicCheckoutLayoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'paypal' | 'gpay' | 'upi'>(() => isIndia ? 'upi' : 'paypal')
  const [showAllMethods, setShowAllMethods] = useState(false)
  const [isBillingOpen, setIsBillingOpen] = useState(false)
  const [isCreatorCodeOpen, setIsCreatorCodeOpen] = useState(false)
  const [isRewardsExpanded, setIsRewardsExpanded] = useState(false)
  const [isMultiItemsExpanded, setIsMultiItemsExpanded] = useState(false)
  const [giftRefundAgreed, setGiftRefundAgreed] = useState(true)
  const hasGiftItems = items.some((i) => i.is_gift || i.gift_recipient_email)

  // Auto-expand billing if there are form errors
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      setIsBillingOpen(true)
    }
  }, [formErrors])

  // Sync selected payment method with region / currency
  useEffect(() => {
    if (isIndia && selectedMethod === 'paypal') {
      setSelectedMethod('upi')
    } else if (!isIndia && selectedMethod === 'upi') {
      setSelectedMethod('paypal')
    }
  }, [isIndia])

  const hasGifts = items.some((i) => i.is_gift || i.gift_recipient_email)
  const isFree = finalTotal <= 0 && !hasGifts
  const rewardsAmount = (finalTotal * 0.05).toFixed(2)
  const vatAmount = (finalTotal * 18) / 118
  const discountAmount = Math.max(0, currentSubtotal - finalTotal - rewardDiscountAmount)

  // Derive User Display Name and Initial (Guest vs Authenticated)
  const isGuest = !user
  const displayName = user
    ? user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.display_name ||
      (user.email ? user.email.split('@')[0] : 'User')
    : (billingDetails.fullName?.trim() || 'Guest')

  const initialLetter = user
    ? (displayName ? displayName[0].toUpperCase() : 'U')
    : (billingDetails.fullName?.trim() ? billingDetails.fullName.trim()[0].toUpperCase() : 'G')

  const handlePayClick = () => {
    if (isFree) {
      onFreeCheckout()
      return
    }
    if (selectedMethod === 'paypal') {
      return
    }
    // Razorpay (Cards, UPI, GPay, NetBanking)
    onRazorpayCheckout()
  }

  const primaryItem = items[0] || {
    id: 'item',
    name: 'Selected Product',
    price_inr: 0,
    price_usd: 0,
    cover_image: '/placeholder.jpg'
  }

  return (
    <div className="w-full max-w-[1080px] lg:max-w-[1120px] h-full md:h-screen md:max-h-screen bg-[#141414] border-x border-[#242424] rounded-none md:rounded-xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden relative select-none font-sans flex flex-col">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE LAYOUT (< md) - EXACT 1:1 EPIC GAMES STORE MOBILE CHECKOUT     */}
      {/* ========================================================================= */}
      <div className="flex md:hidden flex-col h-full overflow-y-auto relative bg-[#141414] text-white">
        
        {/* Sticky Mobile Header */}
        <div className="sticky top-0 z-30 h-14 bg-[#141414] border-b border-[#222222] px-4 flex items-center justify-between flex-shrink-0">
          {/* User Initial Circle / Guest Badge (Left) */}
          {user ? (
            <div className="w-7 h-7 rounded-full bg-[#242424] border border-[#383838] text-white flex items-center justify-center text-xs font-bold shadow-xs" title={displayName}>
              {initialLetter}
            </div>
          ) : (
            <Link
              href="/auth?next=/checkout"
              className="text-[11px] font-bold text-zinc-300 hover:text-white hover:underline"
              title="Sign in for faster checkout"
            >
              Sign In
            </Link>
          )}

          {/* Logo & Checkout (Center) */}
          <div className="flex items-center gap-2">
            <LogoIcon size={18} />
            <h1 className="text-[15px] font-bold text-white tracking-wide">
              Checkout
            </h1>
          </div>

          {/* Close Button ✕ (Right) */}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
              title="Close checkout"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <Link
              href="/store"
              prefetch={true}
              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
              title="Close checkout"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Sticky Product Summary Strip (Directly below Header) */}
        <div className="sticky top-14 z-20 bg-[#202020] border-b border-[#282828] px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
            {/* Thumbnail Poster */}
            <div className="relative w-7 h-9 bg-[#141414] border border-[#333333] rounded-[3px] overflow-hidden flex-shrink-0">
              <Image
                src={primaryItem.cover_image || '/placeholder.jpg'}
                alt={primaryItem.name}
                fill
                sizes="28px"
                className="object-cover"
              />
            </div>

            {/* Product Name */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[13px] text-white truncate block">
                  {primaryItem.name}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsMultiItemsExpanded(!isMultiItemsExpanded)}
                    className="text-[10px] font-bold bg-[#282828] text-zinc-300 border border-[#383838] px-1.5 py-0.5 rounded shrink-0 cursor-pointer"
                  >
                    +{items.length - 1} more
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="font-bold text-[13.5px] text-white whitespace-nowrap">
            {currencySymbol}{currentSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Expandable Multi-items Accordion Tray */}
        {isMultiItemsExpanded && items.length > 1 && (
          <div className="bg-[#181818] border-b border-[#2c2c2c] px-4 py-3 space-y-2.5 animate-in slide-in-from-top-2 duration-150 flex-shrink-0">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Cart Items ({items.length})
            </div>
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1 border-b border-[#222222] last:border-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                  <div className="relative w-6 h-7 bg-[#141414] border border-[#2a2a2a] rounded-[2px] overflow-hidden flex-shrink-0">
                    <Image src={item.cover_image || '/placeholder.jpg'} alt={item.name} fill sizes="24px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-zinc-200 font-semibold truncate block">{item.name}</span>
                    <span className="text-[10px] text-zinc-400 truncate block">{item.brand || 'Producer Toy'}</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-white whitespace-nowrap">
                  {currencySymbol}{(isIndia ? item.price_inr : item.price_usd).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scrollable Checkout Content Area */}
        <div className="flex-1 px-4 py-5 space-y-4">
          
          {/* Section Heading: Payment Details */}
          <div>
            <h2 className="text-[19px] font-black text-white tracking-tight">
              Payment Details
            </h2>
          </div>

          {/* Toywards Rewards Balance Box */}
          <div className="bg-[#202020] border border-[#2c2c2c] rounded-xl p-3.5 transition-all">
            <button
              type="button"
              onClick={() => setIsRewardsExpanded(!isRewardsExpanded)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#282828] border border-[#383838] flex items-center justify-center flex-shrink-0">
                  <ToywardsIcon size={14} />
                </div>
                <span className="text-[14px] font-bold text-white">Toywards</span>
                {availableRewards > 0 && (
                  <span className="text-[10.5px] font-bold bg-[#282828] text-zinc-300 border border-[#383838] px-2 py-0.5 rounded-full">
                    {currencySymbol}{isIndia ? Math.round(availableRewards * 95) : availableRewards.toFixed(2)} Available
                  </span>
                )}
              </div>
              <ChevronDown
                size={16}
                className={`text-zinc-400 transition-transform duration-200 ${isRewardsExpanded ? 'rotate-180 text-white' : ''}`}
              />
            </button>

            {isRewardsExpanded && (
              <div className="mt-3 pt-3 border-t border-[#2a2a2a] text-[12.5px] text-zinc-400 space-y-2.5 animate-in fade-in duration-150">
                {hasGifts ? (
                  <div className="bg-[#181818] p-3 rounded-lg border border-[#303030] text-[12px] text-zinc-400 leading-relaxed">
                    Toywards rewards balance cannot be redeemed for gift purchases. All gifts require verified direct payment.
                  </div>
                ) : availableRewards > 0 ? (
                  <div className="space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer bg-[#181818] hover:bg-[#222222] p-2.5 rounded-lg border border-[#303030] transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(useRewards)}
                        onChange={(e) => onToggleRewards && onToggleRewards(e.target.checked)}
                        className="mt-0.5 accent-white w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">
                          Apply Toywards Balance ({currencySymbol}{isIndia ? Math.round(availableRewards * 95) : availableRewards.toFixed(2)})
                        </span>
                        <p className="text-[11px] text-zinc-400 leading-tight">
                          Deduct rewards directly from your order total. Can be combined with sales and creator coupons.
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-zinc-300 text-xs">
                      Earn up to 20% cashback with Toywards on this purchase. Credited upon payment.
                    </p>
                    <Link
                      href="/features/toywards"
                      target="_blank"
                      className="inline-block text-[11.5px] text-zinc-300 hover:text-white hover:underline font-bold"
                    >
                      Learn more
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Methods Card Container */}
          {!isFree && (
            <div className="bg-[#202020] border border-[#2c2c2c] rounded-xl divide-y divide-[#2c2c2c] overflow-hidden">
              
              {/* Option 1: Credit Card / Debit Card */}
              <label
                onClick={() => setSelectedMethod('card')}
                className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                  selectedMethod === 'card' ? 'bg-[#252525]' : 'hover:bg-[#222222]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-5.5 rounded bg-[#2a2a2a] border border-[#383838] flex items-center justify-center">
                    <CreditCard size={15} className="text-zinc-300" />
                  </div>
                  <span className="text-[13.5px] font-semibold text-white">
                    Credit Card / Debit ...
                  </span>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedMethod === 'card'
                    ? 'border-white bg-white'
                    : 'border-[#555555] bg-transparent'
                }`}>
                  {selectedMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
              </label>

              {/* Option 2: PayPal */}
              <label
                onClick={() => setSelectedMethod('paypal')}
                className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                  selectedMethod === 'paypal' ? 'bg-[#252525]' : 'hover:bg-[#222222]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-5.5 flex items-center justify-center">
                    <img
                      src="/payment-logos/paypal.svg"
                      alt="PayPal"
                      className="h-4 object-contain"
                    />
                  </div>
                  <span className="text-[13.5px] font-semibold text-white">
                    PayPal
                  </span>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedMethod === 'paypal'
                    ? 'border-white bg-white'
                    : 'border-[#555555] bg-transparent'
                }`}>
                  {selectedMethod === 'paypal' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
              </label>

              {/* Option 3: Google Pay */}
              <label
                onClick={() => setSelectedMethod('gpay')}
                className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                  selectedMethod === 'gpay' ? 'bg-[#252525]' : 'hover:bg-[#222222]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-5.5 flex items-center justify-center">
                    <img
                      src="/payment-logos/gpay.svg"
                      alt="Google Pay"
                      className="h-4 object-contain"
                    />
                  </div>
                  <span className="text-[13.5px] font-semibold text-white">
                    Google Pay
                  </span>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedMethod === 'gpay'
                    ? 'border-white bg-white'
                    : 'border-[#555555] bg-transparent'
                }`}>
                  {selectedMethod === 'gpay' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
              </label>

              {/* Option 4: UPI (For India users) */}
              {isIndia && (
                <label
                  onClick={() => setSelectedMethod('upi')}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    selectedMethod === 'upi' ? 'bg-[#252525]' : 'hover:bg-[#222222]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5.5 flex items-center justify-center">
                      <img
                        src="/payment-logos/upi.svg"
                        alt="UPI"
                        className="h-3.5 object-contain"
                      />
                    </div>
                    <span className="text-[13.5px] font-semibold text-white">
                      UPI (PhonePe, Paytm, BHIM)
                    </span>
                  </div>

                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedMethod === 'upi'
                      ? 'border-white bg-white'
                      : 'border-[#555555] bg-transparent'
                  }`}>
                    {selectedMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </label>
              )}

              {/* Expanded methods if opened */}
              {showAllMethods && (
                <div className="p-3.5 bg-[#181818] space-y-2 text-[12.5px] text-zinc-400 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 flex-wrap">
                    <img src="/payment-logos/rupay.svg" alt="RuPay" className="h-3.5" />
                    <img src="/payment-logos/visa.svg" alt="Visa" className="h-3.5" />
                    <img src="/payment-logos/mastercard.svg" alt="Mastercard" className="h-3.5" />
                    <img src="/payment-logos/amex.svg" alt="Amex" className="h-3.5" />
                    <span className="text-[11px] text-zinc-400 font-medium">• NetBanking &amp; Wallets supported</span>
                  </div>
                </div>
              )}

              {/* All payment methods accordion toggle */}
              <button
                type="button"
                onClick={() => setShowAllMethods(!showAllMethods)}
                className="w-full flex items-center justify-between p-3.5 text-[13px] font-bold text-zinc-300 hover:text-white cursor-pointer select-none"
              >
                <span>{showAllMethods ? 'Show fewer payment methods' : 'All payment methods'}</span>
                <ChevronDown
                  size={16}
                  className={`text-zinc-400 transition-transform duration-200 ${showAllMethods ? 'rotate-180 text-white' : ''}`}
                />
              </button>
            </div>
          )}

          {/* + Creator Code Button */}
          <div>
            {!isCreatorCodeOpen ? (
              <button
                type="button"
                onClick={() => setIsCreatorCodeOpen(true)}
                className="h-9 px-3.5 bg-[#222222] hover:bg-[#2a2a2a] border border-[#303030] text-zinc-200 text-[12.5px] font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} className="text-zinc-400" />
                <span>Creator Code</span>
              </button>
            ) : (
              <div className="space-y-2 bg-[#202020] border border-[#2c2c2c] p-3 rounded-xl animate-in fade-in duration-150">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER CREATOR CODE"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    className="flex-1 h-9 bg-[#141414] border border-[#333333] text-white text-xs px-3 rounded-lg outline-none uppercase font-bold placeholder:text-zinc-500 focus:border-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={onApplyCoupon}
                    disabled={couponLoading || !coupon.trim()}
                    className="px-4 h-9 bg-white hover:bg-zinc-200 text-black text-xs font-black rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {couponLoading ? <ButtonSpinner size={12} variant="dark" /> : 'Apply'}
                  </button>
                </div>

                {couponError && (
                  <div className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
                    <AlertCircle size={13} />
                    <span>{couponError}</span>
                  </div>
                )}
                {couponSuccessMsg && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 size={13} />
                    <span>{couponSuccessMsg}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Billing Address Accordion Drawer */}
          <div className="bg-[#202020] border border-[#2c2c2c] rounded-xl p-3.5">
            <button
              type="button"
              onClick={() => setIsBillingOpen(!isBillingOpen)}
              className="w-full flex items-center justify-between text-[13px] font-bold text-zinc-300 hover:text-white cursor-pointer select-none"
            >
              <span>Billing Address &amp; Delivery Details</span>
              <ChevronDown
                size={16}
                className={`text-zinc-400 transition-transform duration-200 ${isBillingOpen ? 'rotate-180 text-white' : ''}`}
              />
            </button>

            {isBillingOpen && (
              <div className="mt-3 pt-3 border-t border-[#2a2a2a] animate-in fade-in duration-150">
                <CheckoutBillingForm
                  billingDetails={billingDetails}
                  onBillingChange={onBillingChange}
                  formErrors={formErrors}
                  newsletterOptIn={newsletterOptIn}
                  setNewsletterOptIn={setNewsletterOptIn}
                  countryOptions={countryOptions}
                />
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-1.5 pt-2 text-[13px]">
            <div className="flex justify-between items-center text-zinc-300 font-normal">
              <span>Subtotal</span>
              <span className="font-semibold text-white">
                {currencySymbol}{currentSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* VAT included (18%) */}
            <div className="flex justify-between items-center text-zinc-400 text-xs">
              <span>VAT included (18%)</span>
              <span>
                {currencySymbol}{vatAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Regular / Coupon Discount */}
            {discountAmount > 0.01 && (
              <div className="flex justify-between items-center text-emerald-400 font-medium text-xs">
                <span>{coupon ? `Coupon Discount (${coupon})` : 'Sale Discount'}</span>
                <span className="font-semibold">
                  -{currencySymbol}{discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Toywards Applied Discount */}
            {rewardDiscountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-400 font-medium text-xs animate-in fade-in">
                <span className="flex items-center gap-1.5">
                  <ToywardsIcon size={13} />
                  <span>Toywards Applied</span>
                </span>
                <span className="font-semibold">
                  -{currencySymbol}{rewardDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Total Row */}
            <div className="border-t border-[#2c2c2c] pt-3 mt-3 flex justify-between items-baseline">
              <span className="text-[17px] font-bold text-white">Total</span>
              <span className="text-[24px] font-black text-white tracking-tight">
                {currencySymbol}{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Toywards Rewards Pill Badge (Minimalist Neutral Theme) */}
          {!isFree && (
            <div>
              <div className="inline-flex items-center gap-2 bg-[#1c1c1c] border border-[#2a2a2a] px-3.5 py-2 rounded-lg text-[12.5px] select-none w-fit shadow-xs">
                <ToywardsIcon size={15} />
                <span className="text-zinc-300 font-medium">
                  Get <strong className="text-white font-bold">{currencySymbol}{rewardsAmount}</strong> in <span className="text-white font-bold">Toywards</span>.
                </span>
              </div>
            </div>
          )}

          {/* Gift Refund Policy Agreement Checkbox */}
          {hasGiftItems && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#1c1c1c] border border-[#2c2c2c]">
              <input
                type="checkbox"
                id="mobile-gift-refund-agree"
                checked={giftRefundAgreed}
                onChange={(e) => setGiftRefundAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded bg-[#242424] border-[#383838] text-white focus:ring-0 accent-white cursor-pointer shrink-0"
              />
              <label htmlFor="mobile-gift-refund-agree" className="text-[11.5px] text-zinc-300 leading-snug cursor-pointer select-none">
                If my gift is rejected by the recipient, I understand that ProducerToy will refund my purchase. If the refund to my original payment method cannot be completed, I authorize ProducerToy to issue the refund to my account balance instead, and I agree to the <Link href="/purchase-policy" target="_blank" className="text-zinc-300 hover:text-white underline font-bold">Purchase Terms</Link>.
              </label>
            </div>
          )}

          {/* Main Action Button (Pay Now) */}
          <div className="pt-2">
            {selectedMethod === 'paypal' && !isFree ? (
              user?.id ? (
                <PayPalPaymentButton
                  finalTotalUsd={finalTotal}
                  items={items}
                  couponCode={coupon}
                  userId={user.id}
                  billingDetails={billingDetails}
                  onSuccess={onPayPalSuccess}
                  onError={onPayPalError}
                  onProcessing={onPayPalProcessing}
                />
              ) : (
                <Link
                  href="/auth?next=/checkout"
                  className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center cursor-pointer"
                >
                  Sign In to Pay with PayPal
                </Link>
              )
            ) : (
              <button
                type="button"
                onClick={handlePayClick}
                disabled={loading || paymentStatus === 'processing' || (hasGiftItems && !giftRefundAgreed)}
                className="w-full h-12 bg-white hover:bg-zinc-200 active:scale-[0.99] text-black font-black uppercase text-xs tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center cursor-pointer disabled:bg-[#282828] disabled:text-[#666666] disabled:cursor-not-allowed"
              >
                {loading || paymentStatus === 'processing' ? (
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <div className="w-full h-full rounded-full border-2 border-black/20" />
                    <div className="absolute inset-0 w-full h-full rounded-full border-2 border-transparent border-t-black animate-spin duration-700 ease-linear" />
                  </div>
                ) : (
                  <span>
                    {hasGiftItems
                      ? isFree
                        ? 'Send Gift'
                        : 'Pay and Send Gift'
                      : isFree
                      ? 'Claim Free Download'
                      : 'Pay Now'}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Legal & Compliance Disclaimers */}
          <div className="pt-1 space-y-2 text-[11px] text-zinc-400 leading-relaxed select-none pb-6">
            <p>
              By selecting &lsquo;{hasGiftItems ? (isFree ? 'Send Gift' : 'Pay and Send Gift') : (isFree ? 'Claim Free Download' : 'Pay Now')}&rsquo;, you certify that you are over 18, are authorized to use this payment method, and agree to the{' '}
              <Link href="/eula" target="_blank" className="text-zinc-400 hover:text-white underline font-medium">
                End User License Agreement
              </Link>.
            </p>
            <p>
              You are paying for a digital license for this product; for terms, see{' '}
              <Link href="/purchase-policy" target="_blank" className="text-zinc-400 hover:text-white underline font-medium">
                purchase policy
              </Link>.
            </p>
          </div>

        </div>

      </div>


      {/* ========================================================================= */}
      {/* 2. DESKTOP LAYOUT (>= md) - 2-COLUMN SPLIT WITH ORANGE ACCENTS           */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-row h-full w-full overflow-hidden relative">
        
        {/* Top-Right Fixed Close ✕ */}
        <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-50">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title="Close checkout"
              aria-label="Close checkout"
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

        {/* LEFT COLUMN: ORDER SUMMARY */}
        <div className="w-[420px] lg:w-[440px] flex-shrink-0 bg-[#1a1a1a] p-8 lg:p-10 flex flex-col justify-between border-r border-[#242424] overflow-y-auto">
          <div className="space-y-8">
            {/* Top Logo + Checkout Title */}
            <div className="flex items-center gap-3">
              <LogoIcon size={28} />
              <h1 className="text-[19px] font-black text-white tracking-wide">
                Checkout
              </h1>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4 pt-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 group">
                  <div className="relative w-[64px] h-[86px] bg-[#141414] border border-[#282828] rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                    <Image
                      src={item.cover_image || '/placeholder.jpg'}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="font-semibold text-[14.5px] text-white line-clamp-2 leading-snug">
                      {item.name}
                    </h3>

                    {/* Gift Tag Badge */}
                    {item.is_gift && (
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-[#282828] border border-[#383838] text-zinc-200 text-[10.5px] font-bold px-2 py-0.5 rounded-full">
                          <Gift size={11} className="text-zinc-400" />
                          <span>Gift</span>
                        </span>
                        {item.gift_recipient_email && (
                          <span className="text-[11px] text-zinc-300 font-medium truncate max-w-[200px]">
                            to: {item.gift_recipient_email}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1.5 text-[12px] text-zinc-400">
                      <span className="truncate">{item.brand || 'Producer Toy'}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer ml-auto"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 pt-6 border-t border-[#262626] text-[13px]">
              <div className="flex justify-between items-center text-zinc-400 font-normal">
                <span>Subtotal</span>
                <span className="text-zinc-200 font-semibold">
                  {currencySymbol}{currentSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* VAT included (18%) */}
              <div className="flex justify-between items-center text-zinc-500 text-xs">
                <span>VAT included (18%)</span>
                <span>
                  {currencySymbol}{vatAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Regular / Coupon Discount */}
              {discountAmount > 0.01 && (
                <div className="flex justify-between items-center text-emerald-400 font-medium">
                  <span>{coupon ? `Coupon Discount (${coupon})` : 'Sale Discount'}</span>
                  <span className="font-semibold">
                    -{currencySymbol}{discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Toywards Applied Discount */}
              {rewardDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-medium animate-in fade-in">
                  <span className="flex items-center gap-1.5">
                    <ToywardsIcon size={13} />
                    <span>Toywards Applied</span>
                  </span>
                  <span className="font-semibold">
                    -{currencySymbol}{rewardDiscountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Total Price Row */}
              <div className="flex justify-between items-baseline pt-4 border-t border-[#262626]">
                <span className="text-[16px] font-bold text-white">Total</span>
                <span className="text-[28px] font-black text-white tracking-tight">
                  {currencySymbol}{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Toywards Rewards Pill Badge */}
            {!isFree && (
              <div className="inline-flex items-center gap-2 bg-[#1c1c1c] border border-[#2a2a2a] px-3.5 py-1.5 rounded-full text-[12.5px] select-none w-fit shadow-xs">
                <ToywardsIcon size={15} />
                <span className="text-zinc-300 font-medium">
                  Get <strong className="text-white font-bold">{currencySymbol}{rewardsAmount}</strong> in <span className="text-white font-bold">Toywards</span>.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PAYMENT DETAILS & ACTIONS */}
        <div className="flex-1 bg-[#141414] p-8 lg:p-10 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-6">
            {/* Top User Avatar & Name / Guest Indicator */}
            {user ? (
              <div className="flex items-center gap-2.5 text-[13px] font-normal text-zinc-300 pr-8">
                <div className="w-6 h-6 rounded-full bg-[#242424] border border-[#333333] text-white flex items-center justify-center text-[11px] font-bold">
                  {initialLetter}
                </div>
                <span className="truncate max-w-[220px]">{displayName}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[12.5px] font-normal text-zinc-400 pr-8">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#242424] border border-[#333333] text-zinc-400 flex items-center justify-center text-[10px] font-bold">
                    G
                  </div>
                  <span>Guest Checkout</span>
                </div>
                <Link
                  href="/auth?next=/checkout"
                  className="text-zinc-300 hover:text-white text-xs font-bold underline transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Section Title */}
            <div>
              <h2 className="text-[23px] font-black text-white tracking-tight">
                Payment Details
              </h2>
            </div>

            {/* Toywards Box */}
            <div className="bg-[#1c1c1c] border border-[#282828] rounded-xl p-3.5 transition-all">
              <button
                type="button"
                onClick={() => setIsRewardsExpanded(!isRewardsExpanded)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ToywardsIcon size={18} />
                  <span className="text-[13.5px] font-bold text-white">Toywards</span>
                  {availableRewards > 0 && (
                    <span className="text-[10.5px] font-bold bg-[#282828] text-zinc-300 border border-[#383838] px-2 py-0.5 rounded-full">
                      {currencySymbol}{isIndia ? Math.round(availableRewards * 95) : availableRewards.toFixed(2)} Available
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-zinc-400 transition-transform duration-200 ${isRewardsExpanded ? 'rotate-180 text-white' : ''}`}
                />
              </button>

              {isRewardsExpanded && (
                <div className="mt-3 pt-3 border-t border-[#262626] text-[12.5px] text-zinc-400 space-y-2.5 animate-in fade-in duration-150">
                  {availableRewards > 0 ? (
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer bg-[#222222] hover:bg-[#262626] p-2.5 rounded-lg border border-[#333333] transition-colors select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(useRewards)}
                          onChange={(e) => onToggleRewards && onToggleRewards(e.target.checked)}
                          className="mt-0.5 accent-white w-4 h-4 rounded cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">
                            Apply Toywards Balance ({currencySymbol}{isIndia ? Math.round(availableRewards * 95) : availableRewards.toFixed(2)})
                          </span>
                          <p className="text-[11px] text-zinc-400 leading-tight">
                            Deduct rewards directly from your order total. Can be combined with sales and creator coupons.
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-zinc-300">
                        Earn up to 20% cashback with Toywards on this purchase. Credited upon payment.
                      </p>
                      <Link
                        href="/features/toywards"
                        target="_blank"
                        className="inline-block text-[11.5px] text-zinc-300 hover:text-white hover:underline font-bold"
                      >
                        Learn more
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Methods Group Box */}
            {!isFree && (
              <div className="space-y-2">
                <div className="bg-[#181818] border border-[#282828] rounded-xl divide-y divide-[#222222] overflow-hidden">
                  
                  {/* Option: UPI */}
                  {isIndia && (
                    <label
                      onClick={() => setSelectedMethod('upi')}
                      className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                        selectedMethod === 'upi' ? 'bg-[#222222]' : 'hover:bg-[#1d1d1d]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-5 flex items-center justify-center">
                          <img
                            src="/payment-logos/upi.svg"
                            alt="UPI"
                            className="h-3.5 object-contain"
                          />
                        </div>
                        <span className="text-[13.5px] font-semibold text-white">
                          UPI (Google Pay, PhonePe, Paytm, BHIM)
                        </span>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        selectedMethod === 'upi'
                          ? 'border-white bg-white'
                          : 'border-[#404040] bg-transparent'
                      }`}>
                        {selectedMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </label>
                  )}

                  {/* Option: PayPal (International) */}
                  {!isIndia && (
                    <label
                      onClick={() => setSelectedMethod('paypal')}
                      className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                        selectedMethod === 'paypal' ? 'bg-[#222222]' : 'hover:bg-[#1d1d1d]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-5 flex items-center justify-center">
                          <img
                            src="/payment-logos/paypal.svg"
                            alt="PayPal"
                            className="h-3.5 object-contain"
                          />
                        </div>
                        <span className="text-[13.5px] font-semibold text-white">
                          PayPal (International Instant Checkout)
                        </span>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        selectedMethod === 'paypal'
                          ? 'border-white bg-white'
                          : 'border-[#404040] bg-transparent'
                      }`}>
                        {selectedMethod === 'paypal' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </label>
                  )}

                  {/* Option: Credit Card / Debit Card */}
                  <label
                    onClick={() => setSelectedMethod('card')}
                    className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                      selectedMethod === 'card' ? 'bg-[#222222]' : 'hover:bg-[#1d1d1d]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-5 rounded bg-[#242424] border border-[#333333] flex items-center justify-center">
                        <CreditCard size={14} className="text-zinc-300" />
                      </div>
                      <span className="text-[13.5px] font-semibold text-white">
                        {isIndia ? 'Credit Card / Debit Card (RuPay, Visa, Master)' : 'International Credit / Debit Card'}
                      </span>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      selectedMethod === 'card'
                        ? 'border-white bg-white'
                        : 'border-[#404040] bg-transparent'
                    }`}>
                      {selectedMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </label>

                  {/* Option: Google Pay */}
                  <label
                    onClick={() => setSelectedMethod('gpay')}
                    className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                      selectedMethod === 'gpay' ? 'bg-[#222222]' : 'hover:bg-[#1d1d1d]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-5 flex items-center justify-center">
                        <img
                          src="/payment-logos/gpay.svg"
                          alt="Google Pay"
                          className="h-3.5 object-contain"
                        />
                      </div>
                      <span className="text-[13.5px] font-semibold text-white">
                        Google Pay
                      </span>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      selectedMethod === 'gpay'
                        ? 'border-white bg-white'
                        : 'border-[#404040] bg-transparent'
                    }`}>
                      {selectedMethod === 'gpay' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </label>

                  {/* PayPal option for India (Secondary) */}
                  {isIndia && (
                    <label
                      onClick={() => setSelectedMethod('paypal')}
                      className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                        selectedMethod === 'paypal' ? 'bg-[#222222]' : 'hover:bg-[#1d1d1d]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-5 flex items-center justify-center">
                          <img
                            src="/payment-logos/paypal.svg"
                            alt="PayPal"
                            className="h-3.5 object-contain"
                          />
                        </div>
                        <span className="text-[13.5px] font-semibold text-white">
                          PayPal
                        </span>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        selectedMethod === 'paypal'
                          ? 'border-white bg-white'
                          : 'border-[#404040] bg-transparent'
                      }`}>
                        {selectedMethod === 'paypal' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </label>
                  )}

                  {/* Expanded methods */}
                  {showAllMethods && (
                    <div className="p-3.5 bg-[#141414] space-y-2 text-[12.5px] text-zinc-400 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2">
                        <img src="/payment-logos/rupay.svg" alt="RuPay" className="h-3.5" />
                        <img src="/payment-logos/visa.svg" alt="Visa" className="h-3.5" />
                        <img src="/payment-logos/mastercard.svg" alt="Mastercard" className="h-3.5" />
                        <img src="/payment-logos/amex.svg" alt="Amex" className="h-3.5" />
                        <span className="text-[10.5px] text-zinc-500 font-medium">• NetBanking &amp; Wallets</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* All payment methods accordion toggle */}
                <button
                  type="button"
                  onClick={() => setShowAllMethods(!showAllMethods)}
                  className="inline-flex items-center gap-1 text-[12.5px] font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer py-1"
                >
                  <span>{showAllMethods ? 'Show less' : 'All payment methods'}</span>
                  {showAllMethods ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            )}

            {/* + Creator Code Button */}
            <div>
              {!isCreatorCodeOpen ? (
                <button
                  type="button"
                  onClick={() => setIsCreatorCodeOpen(true)}
                  className="h-9 px-4 bg-[#222222] hover:bg-[#2a2a2a] border border-[#303030] text-white text-[12.5px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Creator Code</span>
                </button>
              ) : (
                <div className="space-y-2 bg-[#181818] border border-[#282828] p-2.5 rounded-xl animate-in fade-in duration-150">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CREATOR CODE"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      className="flex-1 h-8 bg-[#121212] border border-[#282828] text-white text-xs px-3 rounded-md outline-none uppercase font-semibold placeholder:text-zinc-500 focus:border-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={onApplyCoupon}
                      disabled={couponLoading || !coupon.trim()}
                      className="px-3.5 h-8 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-md transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {couponLoading ? <ButtonSpinner size={12} variant="dark" /> : 'Apply'}
                    </button>
                  </div>

                  {couponError && (
                    <div className="text-[10.5px] text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} />
                      <span>{couponError}</span>
                    </div>
                  )}
                  {couponSuccessMsg && (
                    <div className="text-[10.5px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 size={12} />
                      <span>{couponSuccessMsg}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Billing Address Drawer */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsBillingOpen(!isBillingOpen)}
                className="w-full flex items-center justify-between text-[12.5px] font-semibold text-zinc-400 hover:text-white py-1 cursor-pointer select-none"
              >
                <span>Billing Address &amp; Delivery Details</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${isBillingOpen ? 'rotate-180 text-white' : ''}`}
                />
              </button>

              {isBillingOpen && (
                <div className="mt-2.5 animate-in fade-in duration-150">
                  <CheckoutBillingForm
                    billingDetails={billingDetails}
                    onBillingChange={onBillingChange}
                    formErrors={formErrors}
                    newsletterOptIn={newsletterOptIn}
                    setNewsletterOptIn={setNewsletterOptIn}
                    countryOptions={countryOptions}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="pt-4 space-y-3">
            {/* Gift Refund Policy Agreement Checkbox */}
            {hasGiftItems && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#181818] border border-[#262626]">
                <input
                  type="checkbox"
                  id="gift-refund-agree"
                  checked={giftRefundAgreed}
                  onChange={(e) => setGiftRefundAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-[#202020] border-[#383838] text-white focus:ring-0 accent-white cursor-pointer shrink-0"
                />
                <label htmlFor="gift-refund-agree" className="text-[11.5px] text-zinc-300 leading-snug cursor-pointer select-none">
                  If my gift is rejected by the recipient, I understand that ProducerToy will refund my purchase. If the refund to my original payment method cannot be completed, I authorize ProducerToy to issue the refund to my account balance instead, and I agree to the <Link href="/purchase-policy" target="_blank" className="text-zinc-300 hover:text-white underline font-bold">Purchase Terms</Link>.
                </label>
              </div>
            )}

            {/* PayPal or Direct Pay Now */}
            {selectedMethod === 'paypal' && !isFree ? (
              user?.id ? (
                <PayPalPaymentButton
                  finalTotalUsd={finalTotal}
                  items={items}
                  couponCode={coupon}
                  userId={user.id}
                  billingDetails={billingDetails}
                  onSuccess={onPayPalSuccess}
                  onError={onPayPalError}
                  onProcessing={onPayPalProcessing}
                />
              ) : (
                <Link
                  href="/auth?next=/checkout"
                  className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center cursor-pointer"
                >
                  Sign In to Pay with PayPal
                </Link>
              )
            ) : (
              <button
                type="button"
                onClick={handlePayClick}
                disabled={loading || paymentStatus === 'processing' || (hasGiftItems && !giftRefundAgreed)}
                className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {loading || paymentStatus === 'processing' ? (
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <div className="w-full h-full rounded-full border-2 border-black/20" />
                    <div className="absolute inset-0 w-full h-full rounded-full border-2 border-transparent border-t-black animate-spin duration-700 ease-linear" />
                  </div>
                ) : (
                  <span>
                    {hasGiftItems
                      ? isFree
                        ? 'Send Gift'
                        : 'Pay and Send Gift'
                      : isFree
                      ? 'Claim Free Download'
                      : 'Pay Now'}
                  </span>
                )}
              </button>
            )}

            {/* Legal & Compliance Disclaimer */}
            <p className="text-[10px] text-zinc-400 leading-relaxed select-none">
              By selecting &lsquo;{hasGiftItems ? (isFree ? 'Send Gift' : 'Pay and Send Gift') : (isFree ? 'Claim Free Download' : 'Pay Now')}&rsquo;, you certify that you are over 18, are authorized to use this payment method, and agree to the{' '}
              <Link href="/eula" target="_blank" className="text-zinc-400 hover:text-white underline font-medium">
                End User License Agreement
              </Link>. You are paying for a digital license for this product; for terms, see{' '}
              <Link href="/purchase-policy" target="_blank" className="text-zinc-400 hover:text-white underline font-medium">
                purchase policy
              </Link>.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}

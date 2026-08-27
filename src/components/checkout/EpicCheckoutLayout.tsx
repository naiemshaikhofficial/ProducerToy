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
  Trash2
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
  const [isBillingOpen, setIsBillingOpen] = useState(true)
  const [isCreatorCodeOpen, setIsCreatorCodeOpen] = useState(false)
  const [isRewardsExpanded, setIsRewardsExpanded] = useState(false)

  // Sync selected payment method with region / currency
  useEffect(() => {
    if (isIndia && selectedMethod === 'paypal') {
      setSelectedMethod('upi')
    } else if (!isIndia && selectedMethod === 'upi') {
      setSelectedMethod('paypal')
    }
  }, [isIndia])

  const isFree = finalTotal <= 0
  const rewardsAmount = (finalTotal * 0.05).toFixed(2)

  // Derive User Display Name and Initial
  const displayName = user
    ? user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      billingDetails.fullName ||
      (user.email ? user.email.split('@')[0] : 'Producer')
    : billingDetails.fullName || 'Naiem Shaikh'
  const initialLetter = displayName ? displayName[0].toUpperCase() : 'N'

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

  return (
    <div className="w-full max-w-[1080px] lg:max-w-[1120px] h-screen max-h-screen bg-[#141414] border-x border-[#242424] rounded-none shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col md:flex-row overflow-hidden relative select-none font-sans">
      
      {/* Top-Right Fixed/Sticky Cut Icon ✕ (Exact 1:1 Epic Games Match) */}
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

      {/* ========================================================================= */}
      {/* LEFT COLUMN: ORDER SUMMARY (Pure Matte Blackish-Gray #1a1a1a)             */}
      {/* ========================================================================= */}
      <div className="w-full md:w-[420px] lg:w-[440px] flex-shrink-0 bg-[#1a1a1a] p-8 lg:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#242424] overflow-y-auto">
        
        <div className="space-y-8">
          {/* Top Logo + Checkout Title */}
          <div className="flex items-center gap-3">
            <LogoIcon size={28} />
            <h1 className="text-[19px] font-black text-white tracking-wide">
              Checkout
            </h1>
          </div>

          {/* Cart Items List with 3:4 Poster Art */}
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
                {currencySymbol}{currentSubtotal.toFixed(2)}
              </span>
            </div>

            {/* Regular / Coupon Discount */}
            {currentSubtotal - finalTotal - rewardDiscountAmount > 0.01 && (
              <div className="flex justify-between items-center text-[#FA742B] font-medium">
                <span>{coupon ? `Coupon Discount (${coupon})` : 'Sale Discount'}</span>
                <span className="font-semibold">
                  -{currencySymbol}{(currentSubtotal - finalTotal - rewardDiscountAmount).toFixed(2)}
                </span>
              </div>
            )}

            {/* Toywards Applied Discount */}
            {rewardDiscountAmount > 0 && (
              <div className="flex justify-between items-center text-[#FA742B] font-medium animate-in fade-in">
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
                {currencySymbol}{finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Toywards Rewards Pill Badge (Dual-Tone Orange & White) */}
          {!isFree && (
            <div className="inline-flex items-center gap-2 bg-[#26150b] border border-[#4a2412] px-3.5 py-1.5 rounded-full text-[12.5px] select-none w-fit shadow-xs">
              <ToywardsIcon size={15} />
              <span className="text-zinc-200 font-medium">
                Get <strong className="text-white font-bold">{currencySymbol}{rewardsAmount}</strong> in <span className="text-[#FA742B] font-bold">Toywards</span>.
              </span>
            </div>
          )}
        </div>
      </div>


      {/* ========================================================================= */}
      {/* RIGHT COLUMN: PAYMENT DETAILS & ACTIONS (Pure Blackish-Gray #141414)      */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-[#141414] p-8 lg:p-10 flex flex-col justify-between overflow-y-auto space-y-6">
        
        <div className="space-y-6">
          {/* Top User Avatar & Name (Exact 1:1 Epic Games Match) */}
          <div className="flex items-center gap-2.5 text-[13px] font-normal text-zinc-300 pr-8">
            <div className="w-6 h-6 rounded-full bg-[#242424] border border-[#333333] text-white flex items-center justify-center text-[11px] font-bold">
              {initialLetter}
            </div>
            <span className="truncate max-w-[220px]">{displayName}</span>
          </div>

          {/* Section Title */}
          <div>
            <h2 className="text-[23px] font-black text-white tracking-tight">
              Payment Details
            </h2>
          </div>

          {/* Toywards Box (Exact Match & Interactive Apply) */}
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
                  <span className="text-[10.5px] font-bold bg-[#26150b] text-[#FA742B] border border-[#4a2412] px-2 py-0.5 rounded-full">
                    {currencySymbol}{isIndia ? Math.round(availableRewards * 95) : availableRewards.toFixed(2)} Available
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[12.5px] text-zinc-400">
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isRewardsExpanded ? 'rotate-180 text-white' : ''}`}
                />
              </div>
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
                        className="mt-0.5 accent-[#FA742B] w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">
                          Apply Toywards Balance ({currencySymbol}{isIndia ? Math.round(availableRewards * 95) : availableRewards.toFixed(2)})
                        </span>
                        <p className="text-[11px] text-zinc-400 leading-tight">
                          Deduct rewards directly from your order total. Can be combined with sales and coupons per EULA Section 11.
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-zinc-300">
                      Earn 5% (up to 20%) cashback with Toywards on this purchase. Credited to your account upon payment.
                    </p>
                    <Link
                      href="/features/toywards"
                      target="_blank"
                      className="inline-block text-[11.5px] text-[#FA742B] hover:underline font-medium"
                    >
                      Learn more
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Methods Group Box (Exact 1:1 Blackish-Gray Layout) */}
          {!isFree && (
            <div className="space-y-2">
              <div className="bg-[#181818] border border-[#282828] rounded-xl divide-y divide-[#222222] overflow-hidden">
                
                {/* Option: UPI (Shown first for India) */}
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

                {/* Option: PayPal (Shown first for International, or 4th for India) */}
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

                {/* Expanded methods if opened */}
                {showAllMethods && (
                  <div className="p-3.5 bg-[#141414] space-y-2 text-[12.5px] text-zinc-400 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <img src="/payment-logos/rupay.svg" alt="RuPay" className="h-3.5" />
                      <img src="/payment-logos/visa.svg" alt="Visa" className="h-3.5" />
                      <img src="/payment-logos/mastercard.svg" alt="Mastercard" className="h-3.5" />
                      <img src="/payment-logos/amex.svg" alt="Amex" className="h-3.5" />
                      <span className="text-[10.5px] text-zinc-500 font-medium">• NetBanking & Wallets</span>
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

          {/* + Creator Code Button (Exact Screenshot Match) */}
          <div>
            {!isCreatorCodeOpen ? (
              <button
                type="button"
                onClick={() => setIsCreatorCodeOpen(true)}
                className="h-9 px-4 bg-[#222222] hover:bg-[#2a2a2a] border border-[#303030] text-white text-[12.5px] font-semibold rounded-[6px] flex items-center gap-1.5 transition-colors cursor-pointer"
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

        {/* Bottom Action Area (Pay Now Button + Compliance Text) */}
        <div className="pt-4 space-y-3">
          
          {/* If International PayPal is explicitly selected */}
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
                className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-[6px] transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                Sign In to Pay with PayPal
              </Link>
            )
          ) : (
            /* Direct Pay Now / Claim Free Button (Solid White Monochrome, No Blue) */
            <button
              type="button"
              onClick={handlePayClick}
              disabled={loading || paymentStatus === 'processing'}
              className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-[6px] transition-all shadow-md flex items-center justify-center cursor-pointer disabled:opacity-60 active:scale-[0.99]"
            >
              {loading || paymentStatus === 'processing' ? (
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-2 border-black/20" />
                  <div className="absolute inset-0 w-full h-full rounded-full border-2 border-transparent border-t-[#FA742B] animate-spin duration-700 ease-linear" />
                </div>
              ) : (
                <span>
                  {isFree ? 'Claim Free Download' : 'Pay Now'}
                </span>
              )}
            </button>
          )}

          {/* Legal & Compliance Disclaimer (Exact 1:1 Match) */}
          <p className="text-[10px] text-zinc-400 leading-relaxed select-none">
            By selecting &lsquo;Pay Now&rsquo;, you certify that you are over 18, are authorized to use this payment method, and agree to the{' '}
            <Link href="/eula" target="_blank" className="text-zinc-200 hover:underline">
              End User License Agreement
            </Link>. You are paying for a digital license for this product; for terms, see{' '}
            <Link href="/purchase-policy" target="_blank" className="text-zinc-200 hover:underline">
              purchase policy
            </Link>.
          </p>
        </div>

      </div>

    </div>
  )
}

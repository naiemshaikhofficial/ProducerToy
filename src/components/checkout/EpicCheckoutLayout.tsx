'use client'

import React, { useState } from 'react'
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
  Lock,
  Trash2
} from 'lucide-react'
import { LogoIcon } from '@/components/Logo'
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
  onRazorpayCheckout: () => void
  onFreeCheckout: () => void
  onPayPalSuccess: () => void
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
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'paypal' | 'gpay' | 'upi'>('upi')
  const [showAllMethods, setShowAllMethods] = useState(false)
  const [isBillingOpen, setIsBillingOpen] = useState(false)
  const [isCreatorCodeOpen, setIsCreatorCodeOpen] = useState(false)
  const [isRewardsExpanded, setIsRewardsExpanded] = useState(false)

  const isFree = finalTotal <= 0
  const rewardsAmount = (finalTotal * 0.05).toFixed(2)
  const taxAmount = (finalTotal * 0.18 / 1.18).toFixed(2)

  // Derive User Display Name and Initial
  const displayName = user
    ? user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      billingDetails.fullName ||
      (user.email ? user.email.split('@')[0] : 'Producer')
    : billingDetails.fullName || 'Producer Toy'
  const initialLetter = displayName ? displayName[0].toUpperCase() : 'P'

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
    <div className="w-full max-w-[880px] max-h-[90vh] bg-[#141414] border border-[#262626] rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col md:flex-row overflow-hidden relative">
      
      {/* ========================================================================= */}
      {/* LEFT COLUMN: ORDER SUMMARY & PRODUCT DETAILS (md:w-[340px])                */}
      {/* ========================================================================= */}
      <div className="w-full md:w-[340px] flex-shrink-0 bg-[#121212] p-5 sm:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#202020] overflow-y-auto max-h-[35vh] md:max-h-[90vh]">
        
        <div className="space-y-5">
          {/* Top Logo + Checkout Title (Exact Epic Games Screenshot Match) */}
          <div className="flex items-center gap-2">
            <LogoIcon size={24} />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Checkout
            </h1>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 group">
                <div className="relative w-12 h-12 bg-[#1c1c1c] border border-[#282828] rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.cover_image || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs text-zinc-100 line-clamp-2 leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                    <span className="truncate">{item.brand || 'Producer Toy'}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer ml-auto"
                        title="Remove item"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 pt-3 border-t border-[#1e1e1e] text-xs">
            <div className="flex justify-between items-center text-zinc-400">
              <span>Subtotal</span>
              <span className="text-zinc-200 font-medium">
                {currencySymbol}{currentSubtotal.toFixed(2)}
              </span>
            </div>

            {!isFree && (
              <div className="flex justify-between items-center text-zinc-400">
                <span>VAT included (18%)</span>
                <span className="text-zinc-200 font-medium">
                  {currencySymbol}{taxAmount}
                </span>
              </div>
            )}

            {/* Total Price Row */}
            <div className="flex justify-between items-baseline pt-2.5 border-t border-[#1e1e1e]">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-white tracking-tight">
                {currencySymbol}{finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Producer Rewards Green Badge */}
          {!isFree && (
            <div className="inline-flex items-center gap-2 bg-[#0d2a20] border border-[#14532d]/60 text-[#34d399] px-3 py-1.5 rounded-xl text-[11px] font-semibold select-none w-full">
              <Sparkles size={13} className="text-[#34d399] flex-shrink-0" />
              <span>Get {currencySymbol}{rewardsAmount} in Producer Rewards.</span>
            </div>
          )}
        </div>

        {/* Bottom Secure Vault Guarantee */}
        <div className="pt-4 mt-4 border-t border-[#1e1e1e] text-[10px] text-zinc-500 flex items-center gap-1.5">
          <Lock size={12} className="text-zinc-500 flex-shrink-0" />
          <span>Instant vault delivery • 256-bit SSL</span>
        </div>
      </div>


      {/* ========================================================================= */}
      {/* RIGHT COLUMN: PAYMENT DETAILS & ACTIONS (Scrollable flex-1)                */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-[#141414] p-5 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[65vh] md:max-h-[90vh] space-y-5">
        
        <div className="space-y-5">
          {/* Top User Info & Close Button (Exact Screenshot Match) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <div className="w-5 h-5 rounded-full bg-[#242424] border border-[#383838] text-white flex items-center justify-center text-[10px] font-bold">
                {initialLetter}
              </div>
              <span className="truncate max-w-[180px]">{displayName}</span>
            </div>

            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Close checkout"
              >
                <X size={18} />
              </button>
            ) : (
              <Link
                href="/store"
                prefetch={true}
                className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Close and return to store"
              >
                <X size={18} />
              </Link>
            )}
          </div>

          {/* Section Title */}
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Payment Details
            </h2>
          </div>

          {/* Epic Rewards Expandable Pill Box */}
          <div className="bg-[#181818] border border-[#242424] rounded-xl p-3 transition-all">
            <button
              type="button"
              onClick={() => setIsRewardsExpanded(!isRewardsExpanded)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#0d2a20] border border-[#14532d] flex items-center justify-center text-[#34d399]">
                  <Sparkles size={10} />
                </div>
                <span className="text-xs font-bold text-white">Producer Rewards</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <span>{isRewardsExpanded ? 'Show less' : 'View balance'}</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${isRewardsExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isRewardsExpanded && (
              <div className="mt-2.5 pt-2.5 border-t border-[#202020] text-xs text-zinc-400 space-y-1 animate-in fade-in duration-150">
                <div className="flex justify-between">
                  <span>Available Balance:</span>
                  <span className="font-bold text-white">{currencySymbol}0.00</span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Earn 5% back on this order to redeem on future purchases.
                </p>
              </div>
            )}
          </div>

          {/* Payment Method Radio Selector (Exact Epic Games Store Layout) */}
          {!isFree && (
            <div className="space-y-2">
              <div className="bg-[#161616] border border-[#242424] rounded-xl divide-y divide-[#202020] overflow-hidden">
                
                {/* Option 1: Credit Card / Debit Card */}
                <label
                  onClick={() => setSelectedMethod('card')}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    selectedMethod === 'card' ? 'bg-[#1b1b1b]' : 'hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-5 rounded bg-[#202020] border border-[#333333] flex items-center justify-center">
                      <CreditCard size={13} className="text-zinc-300" />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      Credit Card / Debit Card
                    </span>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    selectedMethod === 'card'
                      ? 'border-white bg-white'
                      : 'border-[#444444] bg-transparent'
                  }`}>
                    {selectedMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </label>

                {/* Option 2: PayPal */}
                <label
                  onClick={() => setSelectedMethod('paypal')}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    selectedMethod === 'paypal' ? 'bg-[#1b1b1b]' : 'hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-5 flex items-center justify-center">
                      <img
                        src="/payment-logos/paypal.svg"
                        alt="PayPal"
                        className="h-3.5 object-contain"
                      />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      PayPal
                    </span>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    selectedMethod === 'paypal'
                      ? 'border-white bg-white'
                      : 'border-[#444444] bg-transparent'
                  }`}>
                    {selectedMethod === 'paypal' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </label>

                {/* Option 3: Google Pay */}
                <label
                  onClick={() => setSelectedMethod('gpay')}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    selectedMethod === 'gpay' ? 'bg-[#1b1b1b]' : 'hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-5 flex items-center justify-center">
                      <img
                        src="/payment-logos/gpay.svg"
                        alt="Google Pay"
                        className="h-3.5 object-contain"
                      />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      Google Pay
                    </span>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    selectedMethod === 'gpay'
                      ? 'border-white bg-white'
                      : 'border-[#444444] bg-transparent'
                  }`}>
                    {selectedMethod === 'gpay' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </label>

                {/* Option 4: UPI (When in India or expanded) */}
                {(isIndia || showAllMethods) && (
                  <label
                    onClick={() => setSelectedMethod('upi')}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      selectedMethod === 'upi' ? 'bg-[#1b1b1b]' : 'hover:bg-[#181818]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-5 flex items-center justify-center">
                        <img
                          src="/payment-logos/upi.svg"
                          alt="UPI"
                          className="h-3.5 object-contain"
                        />
                      </div>
                      <span className="text-xs font-semibold text-white">
                        UPI (PhonePe, Google Pay, Paytm)
                      </span>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      selectedMethod === 'upi'
                        ? 'border-white bg-white'
                        : 'border-[#444444] bg-transparent'
                    }`}>
                      {selectedMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </label>
                )}

                {/* Expanded All payment methods */}
                {showAllMethods && (
                  <div className="p-3 bg-[#131313] space-y-2 text-xs text-zinc-400 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <img src="/payment-logos/rupay.svg" alt="RuPay" className="h-3.5" />
                      <img src="/payment-logos/visa.svg" alt="Visa" className="h-3.5" />
                      <img src="/payment-logos/mastercard.svg" alt="Mastercard" className="h-3.5" />
                      <img src="/payment-logos/amex.svg" alt="Amex" className="h-3.5" />
                      <span className="text-[10px] text-zinc-500 font-medium">• NetBanking & Wallets</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Show less / Show more toggle button (Exact Epic Games Screenshot) */}
              <button
                type="button"
                onClick={() => setShowAllMethods(!showAllMethods)}
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer py-1"
              >
                <span>{showAllMethods ? 'Show less' : 'All payment methods'}</span>
                {showAllMethods ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          )}

          {/* Creator / Promo Code Button */}
          <div>
            {!isCreatorCodeOpen ? (
              <button
                type="button"
                onClick={() => setIsCreatorCodeOpen(true)}
                className="h-9 px-3.5 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Creator Code</span>
              </button>
            ) : (
              <div className="space-y-2 bg-[#181818] border border-[#262626] p-2.5 rounded-xl animate-in fade-in duration-150">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER CREATOR CODE"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    className="flex-1 h-8 bg-[#141414] border border-[#282828] text-white text-xs px-3 rounded-lg outline-none uppercase font-semibold placeholder:text-zinc-500 focus:border-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={onApplyCoupon}
                    disabled={couponLoading || !coupon.trim()}
                    className="px-3.5 h-8 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {couponLoading ? <ButtonSpinner size={12} variant="dark" /> : 'Apply'}
                  </button>
                </div>

                {couponError && (
                  <div className="text-[10px] text-red-400 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} />
                    <span>{couponError}</span>
                  </div>
                )}
                {couponSuccessMsg && (
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
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
              className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-white py-1 cursor-pointer select-none"
            >
              <span>Billing Address &amp; Delivery Details</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${isBillingOpen ? 'rotate-180' : ''}`}
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
        <div className="pt-4 space-y-2.5">
          
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
                className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                Sign In to Pay with PayPal
              </Link>
            )
          ) : (
            /* Direct Pay Now / Claim Free Button (Solid White, No Blue) */
            <button
              type="button"
              onClick={handlePayClick}
              disabled={loading || paymentStatus === 'processing'}
              className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-bold uppercase text-xs tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <ButtonSpinner size={15} variant="dark" />
                  <span>Processing Order...</span>
                </div>
              ) : (
                <span>
                  {isFree ? 'Claim Free Download' : 'Pay Now'}
                </span>
              )}
            </button>
          )}

          {/* Legal & Compliance Disclaimer (Exact Epic Games Match) */}
          <p className="text-[9.5px] text-zinc-500 leading-relaxed select-none">
            By selecting &lsquo;Pay Now&rsquo;, you certify that you are over 18, are authorized to use this payment method, and agree to the{' '}
            <Link href="/terms" className="text-zinc-400 hover:underline">
              End User License Agreement
            </Link>. You are paying for a digital license for this product; for terms, see{' '}
            <Link href="/terms" className="text-zinc-400 hover:underline">
              purchase policy
            </Link>.
          </p>
        </div>

      </div>

    </div>
  )
}

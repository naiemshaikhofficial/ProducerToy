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
  const [isBillingOpen, setIsBillingOpen] = useState(true)
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
    <div className="w-full max-w-[1080px] lg:max-w-[1120px] h-screen max-h-screen bg-[#141416] border-x border-[#26262a] rounded-none shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col md:flex-row overflow-hidden relative select-none font-sans">
      
      {/* ========================================================================= */}
      {/* LEFT COLUMN: ORDER SUMMARY (Wide 420px - 440px)                           */}
      {/* ========================================================================= */}
      <div className="w-full md:w-[420px] lg:w-[440px] flex-shrink-0 bg-[#18181c] p-8 lg:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#222226] overflow-y-auto">
        
        <div className="space-y-7">
          {/* Top Logo + Checkout Title */}
          <div className="flex items-center gap-3">
            <LogoIcon size={28} />
            <h1 className="text-[18px] font-black text-white tracking-wide">
              Checkout
            </h1>
          </div>

          {/* Cart Items List with 3:4 Poster Art */}
          <div className="space-y-4 pt-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3.5 group">
                <div className="relative w-[60px] h-[80px] bg-[#1c1c20] border border-[#2a2a30] rounded-md overflow-hidden flex-shrink-0 shadow-md">
                  <Image
                    src={item.cover_image || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    sizes="60px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="font-semibold text-[14px] text-white line-clamp-2 leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11.5px] text-zinc-400">
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
          <div className="space-y-2.5 pt-6 border-t border-[#242428] text-[13px]">
            <div className="flex justify-between items-center text-zinc-400 font-normal">
              <span>Subtotal</span>
              <span className="text-zinc-200 font-semibold">
                {currencySymbol}{currentSubtotal.toFixed(2)}
              </span>
            </div>

            {!isFree && (
              <div className="flex justify-between items-center text-zinc-400 font-normal">
                <span>VAT included (18%)</span>
                <span className="text-zinc-200 font-semibold">
                  {currencySymbol}{taxAmount}
                </span>
              </div>
            )}

            {/* Total Price Row */}
            <div className="flex justify-between items-baseline pt-3.5 border-t border-[#242428]">
              <span className="text-[16px] font-bold text-white">Total</span>
              <span className="text-[26px] font-black text-white tracking-tight">
                {currencySymbol}{finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Producer Rewards Green Badge (Exact 1:1 Pill) */}
          {!isFree && (
            <div className="inline-flex items-center gap-2 bg-[#0e2c22] border border-[#1b5e46] text-[#2ed8a7] px-3.5 py-2 rounded-xl text-[11.5px] font-semibold select-none w-full shadow-sm">
              <div className="w-3.5 h-3.5 rounded-full bg-[#1b5e46] flex items-center justify-center text-[#2ed8a7] flex-shrink-0">
                <Sparkles size={10} />
              </div>
              <span>Get {currencySymbol}{rewardsAmount} in Producer Rewards.</span>
            </div>
          )}
        </div>
      </div>


      {/* ========================================================================= */}
      {/* RIGHT COLUMN: PAYMENT DETAILS & ACTIONS (Exact 1:1 Width: 500px)          */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-[#141416] p-8 flex flex-col justify-between overflow-y-auto space-y-6">
        
        <div className="space-y-6">
          {/* Top User Avatar & Close ✕ Button (Exact Match) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[12.5px] font-semibold text-zinc-300">
              <div className="w-5 h-5 rounded-full bg-[#26262a] border border-[#38383e] text-white flex items-center justify-center text-[10.5px] font-bold">
                {initialLetter}
              </div>
              <span className="truncate max-w-[200px]">{displayName}</span>
            </div>

            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Close checkout"
              >
                <X size={19} />
              </button>
            ) : (
              <Link
                href="/store"
                prefetch={true}
                className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Close and return to store"
              >
                <X size={19} />
              </Link>
            )}
          </div>

          {/* Section Title */}
          <div>
            <h2 className="text-[22px] font-black text-white tracking-tight">
              Payment Details
            </h2>
          </div>

          {/* Producer Rewards Box (Exact Match) */}
          <div className="bg-[#1e1e22] border border-[#2c2c30] rounded-xl p-3.5 transition-all">
            <button
              type="button"
              onClick={() => setIsRewardsExpanded(!isRewardsExpanded)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#0e2c22] border border-[#1b5e46] flex items-center justify-center text-[#2ed8a7]">
                  <Sparkles size={11} />
                </div>
                <span className="text-[13.5px] font-bold text-white">Producer Rewards</span>
              </div>
              <div className="flex items-center gap-1 text-[12.5px] text-zinc-400">
                <span>{isRewardsExpanded ? 'Show less' : ''}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isRewardsExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isRewardsExpanded && (
              <div className="mt-2.5 pt-2.5 border-t border-[#2a2a2e] text-[12.5px] text-zinc-400 space-y-1 animate-in fade-in duration-150">
                <div className="flex justify-between">
                  <span>Available Balance:</span>
                  <span className="font-bold text-white">{currencySymbol}0.00</span>
                </div>
                <p className="text-[10.5px] text-zinc-500">
                  Earn 5% back on this order to redeem on future purchases.
                </p>
              </div>
            )}
          </div>

          {/* Payment Methods Group Box (Exact 1:1 Screenshot Layout) */}
          {!isFree && (
            <div className="space-y-2">
              <div className="bg-[#18181c] border border-[#2a2a2e] rounded-xl divide-y divide-[#242428] overflow-hidden">
                
                {/* Option 1: Credit Card / Debit Card */}
                <label
                  onClick={() => setSelectedMethod('card')}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    selectedMethod === 'card' ? 'bg-[#202026]' : 'hover:bg-[#1c1c20]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 rounded bg-[#26262a] border border-[#36363c] flex items-center justify-center">
                      <CreditCard size={14} className="text-zinc-300" />
                    </div>
                    <span className="text-[13.5px] font-semibold text-white">
                      Credit Card / Debit Card
                    </span>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    selectedMethod === 'card'
                      ? 'border-white bg-white'
                      : 'border-[#44444a] bg-transparent'
                  }`}>
                    {selectedMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </label>

                {/* Option 2: PayPal */}
                <label
                  onClick={() => setSelectedMethod('paypal')}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    selectedMethod === 'paypal' ? 'bg-[#202026]' : 'hover:bg-[#1c1c20]'
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
                      : 'border-[#44444a] bg-transparent'
                  }`}>
                    {selectedMethod === 'paypal' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </label>

                {/* Option 3: Google Pay */}
                <label
                  onClick={() => setSelectedMethod('gpay')}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    selectedMethod === 'gpay' ? 'bg-[#202026]' : 'hover:bg-[#1c1c20]'
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
                      : 'border-[#44444a] bg-transparent'
                  }`}>
                    {selectedMethod === 'gpay' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </label>

                {/* Option 4: UPI (Always in list matching exact Screenshot) */}
                <label
                  onClick={() => setSelectedMethod('upi')}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    selectedMethod === 'upi' ? 'bg-[#202026]' : 'hover:bg-[#1c1c20]'
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
                      UPI
                    </span>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    selectedMethod === 'upi'
                      ? 'border-white bg-white'
                      : 'border-[#44444a] bg-transparent'
                  }`}>
                    {selectedMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </label>

                {/* Expanded methods if opened */}
                {showAllMethods && (
                  <div className="p-3.5 bg-[#141418] space-y-2 text-[12.5px] text-zinc-400 animate-in fade-in duration-150">
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
                className="h-9 px-4 bg-[#242428] hover:bg-[#2e2e34] border border-[#303036] text-white text-[12.5px] font-semibold rounded-[6px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Creator Code</span>
              </button>
            ) : (
              <div className="space-y-2 bg-[#1c1c20] border border-[#2a2a30] p-2.5 rounded-xl animate-in fade-in duration-150">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER CREATOR CODE"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    className="flex-1 h-8 bg-[#141416] border border-[#2c2c30] text-white text-xs px-3 rounded-md outline-none uppercase font-semibold placeholder:text-zinc-500 focus:border-zinc-400"
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
              className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-[6px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
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

          {/* Legal & Compliance Disclaimer (Exact 1:1 Screenshot Match) */}
          <p className="text-[10px] text-zinc-400 leading-relaxed select-none">
            By selecting &lsquo;Pay Now&rsquo;, you certify that you are over 18, are authorized to use this payment method, and agree to the{' '}
            <Link href="/terms" className="text-zinc-200 hover:underline">
              End User License Agreement
            </Link>. You are paying for a digital license for this product; for terms, see{' '}
            <Link href="/terms" className="text-zinc-200 hover:underline">
              purchase policy
            </Link>.
          </p>
        </div>

      </div>

    </div>
  )
}

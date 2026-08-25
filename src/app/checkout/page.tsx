'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import countryList from 'react-select-country-list'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { validateCouponAction } from '@/actions/couponActions'
import { processCheckoutAction } from '@/actions/checkoutActions'
import {
  BillingDetails,
  PaymentStatus,
  CheckoutCartItems,
  CheckoutBillingForm,
  CheckoutOrderSummary,
  CheckoutTrustBadges,
  CheckoutUpsells,
  CheckoutSuccessView,
  CheckoutEmptyCart,
} from '@/components/checkout'

export default function CheckoutPage() {
  const countryOptions = useMemo(() => countryList().getData(), [])
  const { items, removeItem, clearCart, setIsCartOpen } = useCart()
  const { formatPrice, currency } = useCurrency()
  const { user } = useAuth()
  const supabase = createClient()

  // Close sidebar drawer on mount
  useEffect(() => {
    if (setIsCartOpen) {
      setIsCartOpen(false)
    }
  }, [setIsCartOpen])

  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Coupon state
  const [coupon, setCoupon] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  // Newsletter preference
  const [newsletterOptIn, setNewsletterOptIn] = useState(true)

  // Upsell recommended products
  const [upsellProducts, setUpsellProducts] = useState<any[]>([])

  // Billing form state
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // 1. Auto-Load User Data & Billing Details from Supabase & localStorage
  useEffect(() => {
    const ensureE164 = (phone: any) => {
      if (!phone || phone === '0' || phone === 0) return ''
      let str = String(phone).trim()
      if (str.startsWith('+')) return str

      const digits = str.replace(/\D/g, '')
      if (!digits) return ''

      // 10 digits -> India (+91)
      if (digits.length === 10) return `+91${digits}`

      // 12 digits starting with 91 -> (+91)
      if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`

      if (str.startsWith('0') && digits.length === 11) {
        if (str.startsWith('07')) return `+44${digits.slice(1)}`
        return `+${digits}`
      }

      if (digits.length > 10 && !str.startsWith('0')) return `+${digits}`

      return str
    }

    const loadData = async () => {
      // Step A: Fetch Supabase authenticated user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (currentUser) {
        // Try fetching saved profile from user_accounts table first
        try {
          const { data: account } = await supabase
            .from('user_accounts')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle()

          if (account && account.address_line1) {
            const dbDetails = {
              fullName: account.full_name || '',
              email: account.email || currentUser.email || '',
              phone: ensureE164(account.phone_number || ''),
              address: account.address_line1 || '',
              city: account.city || '',
              state: account.state || '',
              zip: account.postal_code || '',
              country: account.country || 'India',
            }
            setBillingDetails(dbDetails)
            localStorage.setItem('pt_billing_details', JSON.stringify(dbDetails))
            if (account.newsletter !== undefined && account.newsletter !== null) {
              setNewsletterOptIn(Boolean(account.newsletter))
            }
            return
          }
        } catch (dbErr) {
          console.warn('user_accounts fetch note:', dbErr)
        }
      }

      // Step B: Load from localStorage if available
      try {
        const saved = localStorage.getItem('pt_billing_details')
        if (saved) {
          const parsed = JSON.parse(saved)
          setBillingDetails((prev) => ({
            ...prev,
            ...parsed,
            phone: ensureE164(parsed.phone),
            country: parsed.country || 'India',
          }))
          return
        }
      } catch (e) {
        console.warn('Could not read saved billing details:', e)
      }

      // Step C: Fallback to Auth user metadata
      if (currentUser) {
        const meta = currentUser.user_metadata || {}
        const clean = (val: any) => (val === '0' || val === 0 ? '' : val || '')

        setBillingDetails((prev) => ({
          fullName: prev.fullName || clean(meta.full_name) || clean(meta.name) || '',
          email: prev.email || currentUser.email || '',
          phone: prev.phone || ensureE164(clean(meta.phone)),
          address: prev.address || clean(meta.address),
          city: prev.city || clean(meta.city),
          state: prev.state || clean(meta.state),
          zip: prev.zip || clean(meta.zip) || clean(meta.postal_code),
          country: prev.country || clean(meta.country) || 'India',
        }))
      }
    }

    loadData()
  }, [supabase])

  // 2. Fetch Upsell / Recommended Products
  useEffect(() => {
    const fetchUpsells = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, price_usd, price_inr, cover_image, product_type, brand')
          .eq('is_active', true)
          .limit(6)

        if (!error && data) {
          const filtered = data
            .filter((p: any) => !items.some((item) => item.id === p.id))
            .slice(0, 3)
          setUpsellProducts(filtered)
        }
      } catch (err) {
        console.warn('Upsell fetch failed:', err)
      }
    }

    if (items.length > 0) {
      fetchUpsells()
    }
  }, [items, supabase])

  // Handle Billing Input Change
  const handleBillingChange = (field: keyof BillingDetails, value: string) => {
    const updated = { ...billingDetails, [field]: value }
    setBillingDetails(updated)

    try {
      localStorage.setItem('pt_billing_details', JSON.stringify(updated))
    } catch {
      // Local storage fallback
    }

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Validate Required Form Fields
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!billingDetails.fullName.trim()) {
      errors.fullName = 'Full Name is required'
    }

    if (!billingDetails.email.trim()) {
      errors.email = 'Delivery email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingDetails.email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    if (!billingDetails.phone) {
      errors.phone = 'Phone number is required'
    } else if (billingDetails.phone.length < 6) {
      errors.phone = 'Enter a valid phone number'
    }

    if (!billingDetails.address.trim()) {
      errors.address = 'Street address is required'
    }

    if (!billingDetails.city.trim()) {
      errors.city = 'City is required'
    }

    if (!billingDetails.state.trim()) {
      errors.state = 'State / Province is required'
    }

    const cleanZip = billingDetails.zip.trim()
    if (!cleanZip) {
      errors.zip = 'Pincode / Postal code is required'
    } else if (cleanZip.length < 3) {
      errors.zip = 'Enter a valid postal code'
    }

    if (!billingDetails.country) {
      errors.country = 'Country is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Calculations
  const rawSubtotalInr = items.reduce((sum, item) => sum + Number(item.price_inr || 0), 0)
  const rawSubtotalUsd = items.reduce(
    (sum, item) => sum + Number(item.price_usd || item.price_inr / 85),
    0
  )

  const isUsd = currency === 'USD'
  const currentSubtotal = isUsd ? rawSubtotalUsd : rawSubtotalInr
  const currencySymbol = isUsd ? '$' : '₹'

  // Bundle discount (10% on 3+ items)
  const bundleDiscountPercent = items.length >= 3 ? 10 : 0
  const effectiveDiscountPercent = Math.max(discountPercent, bundleDiscountPercent)

  const discountAmount =
    effectiveDiscountPercent > 0
      ? Math.round((currentSubtotal * effectiveDiscountPercent) / 100 * 100) / 100
      : 0
  const finalTotal = Math.max(0, currentSubtotal - discountAmount)

  // Handle Apply Coupon
  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return
    setCouponLoading(true)
    setCouponError('')
    setCouponSuccessMsg('')

    try {
      const res = await validateCouponAction(coupon)
      if (res.success && res.discountPercent > 0) {
        setDiscountPercent(res.discountPercent)
        setCouponSuccessMsg(res.message || `Coupon applied! ${res.discountPercent}% OFF`)
        setCouponError('')
      } else {
        setCouponError(res.message || 'Invalid or expired coupon code.')
        setDiscountPercent(0)
        setCouponSuccessMsg('')
      }
    } catch {
      setCouponError('Failed to validate coupon. Please try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  // Handle Checkout Execution
  const handleCheckout = async () => {
    if (items.length === 0) return

    if (!validateForm()) {
      const billingSection = document.getElementById('billing-details-section')
      if (billingSection) {
        billingSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }

    setLoading(true)
    setErrorMsg('')
    setPaymentStatus('processing')

    try {
      const res = await processCheckoutAction(
        items.map((item) => ({
          id: item.id,
          name: item.name,
          price_inr: item.price_inr,
          price_usd: item.price_usd,
          product_type: item.product_type,
        })),
        billingDetails.email || user?.email || '',
        user?.id,
        {
          fullName: billingDetails.fullName,
          phone: billingDetails.phone,
          address: billingDetails.address,
          city: billingDetails.city,
          state: billingDetails.state,
          zip: billingDetails.zip,
          country: billingDetails.country,
        },
        {
          couponCode: coupon,
          discountAmount: discountAmount,
          currency: isUsd ? 'USD' : 'INR',
          newsletterOptIn: newsletterOptIn,
        }
      )

      if (!res.success || res.error) {
        throw new Error(res.error || 'Checkout failed. Please try again.')
      }

      if (user) {
        try {
          await supabase.auth.updateUser({
            data: {
              full_name: billingDetails.fullName,
              phone: billingDetails.phone,
              address: billingDetails.address,
              city: billingDetails.city,
              state: billingDetails.state,
              zip: billingDetails.zip,
              country: billingDetails.country,
              newsletter_opt_in: newsletterOptIn,
            },
          })
        } catch (metaErr) {
          console.warn('Metadata client sync notice:', metaErr)
        }
      }

      clearCart()
      setPaymentStatus('success')
    } catch (err: any) {
      console.error('Checkout error:', err)
      setErrorMsg(err.message || 'Payment processing failed. Please try again.')
      setPaymentStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  // Success Confirmation Screen
  if (paymentStatus === 'success') {
    return <CheckoutSuccessView email={billingDetails.email || user?.email} />
  }

  // Empty Cart Screen
  if (items.length === 0) {
    return <CheckoutEmptyCart />
  }

  return (
    <div className="w-full min-h-screen bg-[#121212] text-white py-8 sm:py-12 select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Navigation & Guarantee Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/store"
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Store Catalog</span>
          </Link>

          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <ShieldCheck size={13} className="text-white" />
            <span>256-Bit SSL Encrypted &bull; Instant Digital Access</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Secure Checkout
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Pro Audio Software &bull; Sample Libraries &bull; Direct Authorizations
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-[#2a1818] border border-red-500/30 text-red-300 p-4 text-xs rounded-xl flex items-center justify-between shadow-lg">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white font-bold ml-4">
              &times;
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT COLUMN: CART ITEMS & BILLING FORM ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Account Status Card */}
            {!user ? (
              <div className="bg-[#181818] border border-[#282828] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-white block">
                    Have a ProducerToy Account?
                  </span>
                  <span className="text-xs text-zinc-400 leading-relaxed block">
                    Sign in to automatically link purchases and serial keys to your profile.
                  </span>
                </div>
                <Link
                  href="/auth?next=/checkout"
                  prefetch={true}
                  className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all flex-shrink-0 shadow-md cursor-pointer"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>
                    Logged in as <strong className="text-white font-bold">{user.email}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-[#222222] px-2.5 py-1 rounded-full border border-[#2e2e2e]">
                  Linked Account
                </span>
              </div>
            )}

            {/* Cart Items List Component */}
            <CheckoutCartItems
              items={items}
              removeItem={removeItem}
              formatPrice={formatPrice}
            />

            {/* Billing Details Form Component */}
            <CheckoutBillingForm
              billingDetails={billingDetails}
              onBillingChange={handleBillingChange}
              formErrors={formErrors}
              newsletterOptIn={newsletterOptIn}
              setNewsletterOptIn={setNewsletterOptIn}
              countryOptions={countryOptions}
            />
          </div>

          {/* ================= RIGHT COLUMN: ORDER SUMMARY & TRUST ================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Order Summary Component */}
            <CheckoutOrderSummary
              itemCount={items.length}
              currentSubtotal={currentSubtotal}
              rawSubtotalInr={rawSubtotalInr}
              rawSubtotalUsd={rawSubtotalUsd}
              bundleDiscountPercent={bundleDiscountPercent}
              discountPercent={discountPercent}
              finalTotal={finalTotal}
              currencySymbol={currencySymbol}
              coupon={coupon}
              setCoupon={setCoupon}
              onApplyCoupon={handleApplyCoupon}
              couponLoading={couponLoading}
              couponError={couponError}
              couponSuccessMsg={couponSuccessMsg}
              onCheckout={handleCheckout}
              loading={loading}
              paymentStatus={paymentStatus}
              formatPrice={formatPrice}
            />

            {/* Trust Badges & Guarantees */}
            <CheckoutTrustBadges />

            {/* Frequently Bought Together / Upsells */}
            <CheckoutUpsells
              upsellProducts={upsellProducts}
              formatPrice={formatPrice}
            />
          </div>
        </div>

        {/* Global Phone Input Styling */}
        <style jsx global>{`
          .phone-input-pt .PhoneInputInput {
            background: transparent !important;
            border: none !important;
            outline: none !important;
            color: #ffffff !important;
            font-size: 0.75rem !important;
            font-weight: 500 !important;
            width: 100% !important;
          }
          .phone-input-pt .PhoneInputCountry {
            margin-right: 0.5rem !important;
          }
          .phone-input-pt .PhoneInputCountrySelect {
            background: #181818 !important;
            color: #ffffff !important;
          }
        `}</style>
      </div>
    </div>
  )
}

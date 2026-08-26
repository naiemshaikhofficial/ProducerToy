'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { COUNTRIES } from '@/components/checkout/countries'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { validateCouponAction } from '@/actions/couponActions'
import { processCheckoutOrderAction } from '@/actions/checkoutActions'
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
  const countryOptions = COUNTRIES
  const router = useRouter()
  const { items, removeItem, clearCart, setIsCartOpen } = useCart()
  const { formatPrice, currency, setCurrency, exchangeRate, convertUsdToInr, convertInrToUsd } = useCurrency()
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
    country: '',
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
        // Fetch saved profile from unified profiles table
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle()

          if (profile) {
            const nameParts = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
            const fullName = profile.full_name || nameParts || profile.display_name || ''

            const dbDetails: BillingDetails = {
              fullName: fullName || '',
              email: profile.email || currentUser.email || '',
              phone: ensureE164(profile.phone_number || profile.phone || ''),
              address: profile.address_line1 || profile.address || '',
              address2: profile.address_line2 || profile.address2 || '',
              city: profile.city || '',
              state: profile.state || profile.region || '',
              zip: profile.postal_code || profile.zip || '',
              country: profile.country || '',
            }
            setBillingDetails(dbDetails)
            if (profile.country?.toUpperCase() === 'INDIA') setCurrency('INR')
            else if (profile.country) setCurrency('USD')

            localStorage.setItem('pt_billing_details', JSON.stringify(dbDetails))
            if (profile.newsletter !== undefined && profile.newsletter !== null) {
              setNewsletterOptIn(Boolean(profile.newsletter))
            }
            return
          }
        } catch (dbErr) {
          console.warn('profiles fetch note:', dbErr)
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
            country: parsed.country || '',
          }))
          if (parsed.country === 'India') setCurrency('INR')
          else if (parsed.country) setCurrency('USD')
          return
        }
      } catch (e) {
        console.warn('Could not read saved billing details:', e)
      }

      // Step C: Fallback to Auth user metadata
      if (currentUser) {
        const meta = currentUser.user_metadata || {}
        const clean = (val: any) => (val === '0' || val === 0 ? '' : val || '')

        const metaCountry = clean(meta.country)
        const metaName = clean(meta.full_name) || clean(meta.name) || clean(meta.display_name)
        setBillingDetails((prev) => ({
          fullName: prev.fullName || metaName || '',
          email: prev.email || currentUser.email || '',
          phone: prev.phone || ensureE164(clean(meta.phone) || clean(meta.phone_number)),
          address: prev.address || clean(meta.address) || clean(meta.address_line1),
          address2: prev.address2 || clean(meta.address2) || clean(meta.address_line2),
          city: prev.city || clean(meta.city),
          state: prev.state || clean(meta.state) || clean(meta.region),
          zip: prev.zip || clean(meta.zip) || clean(meta.postal_code),
          country: prev.country || metaCountry || '',
        }))
        if (metaCountry === 'India') setCurrency('INR')
        else if (metaCountry) setCurrency('USD')
      }
    }

    loadData()
  }, [supabase, setCurrency])

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

  // Handle Billing Input Change (and auto-switch currency if country changes)
  const handleBillingChange = (field: keyof BillingDetails, value: string) => {
    const updated = { ...billingDetails, [field]: value }
    setBillingDetails(updated)

    if (field === 'country') {
      if (value === 'India') {
        setCurrency('INR')
      } else if (value) {
        setCurrency('USD')
      }
    }

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
      errors.country = 'Please select your country'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Calculations with Real-Time Conversion
  const isIndia = billingDetails.country === 'India' || (!billingDetails.country && currency === 'INR')

  const rawSubtotalUsd = items.reduce((sum, item) => sum + Number(item.price_usd || (item.price_inr ? item.price_inr / exchangeRate : 0)), 0)
  const rawSubtotalInr = Math.round(rawSubtotalUsd * exchangeRate)

  const currentSubtotal = isIndia ? rawSubtotalInr : rawSubtotalUsd
  const currencySymbol = isIndia ? '₹' : '$'

  // Bundle discount (10% on 3+ items)
  const bundleDiscountPercent = items.length >= 3 ? 10 : 0
  const effectiveDiscountPercent = Math.max(discountPercent, bundleDiscountPercent)

  const discountAmount =
    effectiveDiscountPercent > 0
      ? isIndia
        ? Math.round((currentSubtotal * effectiveDiscountPercent) / 100)
        : Math.round((currentSubtotal * effectiveDiscountPercent) / 100 * 100) / 100
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

  // Helper: Load Razorpay SDK
  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window === 'undefined') return resolve(false)
      if ((window as any).Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // --- 1. HANDLE FREE CHECKOUT (Direct High-Speed Server Action) ---
  const handleFreeCheckout = async () => {
    if (!user) {
      router.push('/auth?next=/checkout')
      return
    }

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
      const res = await processCheckoutOrderAction(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          slug: i.slug,
          price_usd: Number(i.price_usd || 0),
          price_inr: Number(i.price_inr || 0),
          product_type: i.product_type,
        })),
        billingDetails,
        user.email || billingDetails.email,
        user.id,
        {
          couponCode: coupon,
          currency: currency,
        }
      )

      if (res.success) {
        clearCart()
        setPaymentStatus('success')
      } else {
        setErrorMsg(res.error || 'Failed to claim free download')
        setPaymentStatus('idle')
      }
    } catch (err: any) {
      setErrorMsg('Error during free checkout processing')
      setPaymentStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  // --- 2. HANDLE RAZORPAY CHECKOUT (INDIA / INR) ---
  const handleRazorpayCheckout = async () => {
    if (!user) {
      router.push('/auth?next=/checkout')
      return
    }

    if (!validateForm()) {
      const billingSection = document.getElementById('billing-details-section')
      if (billingSection) {
        billingSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }

    setLoading(true)
    setErrorMsg('')

    const sdkLoaded = await loadRazorpay()
    if (!sdkLoaded) {
      setErrorMsg('Failed to load Razorpay payment gateway SDK.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            slug: i.slug,
            price_usd: i.price_usd,
            price_inr: i.price_inr,
            product_type: i.product_type,
          })),
          couponCode: coupon,
        }),
      })

      const order = await res.json()
      if (order.error) throw new Error(order.error)

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!keyId) throw new Error('Razorpay Key ID is missing')

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'ProducerToy',
        description: `Order for ${items.length} ${items.length === 1 ? 'item' : 'items'}`,
        order_id: order.id,
        image: '/favicon.ico',
        prefill: {
          name: billingDetails.fullName,
          email: billingDetails.email || user.email,
          contact: billingDetails.phone,
        },
        theme: {
          color: '#121212',
        },
        handler: async function (response: any) {
          setPaymentStatus('processing')
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                items: items.map((i) => ({
                  id: i.id,
                  name: i.name,
                  slug: i.slug,
                  price_usd: i.price_usd,
                  price_inr: i.price_inr,
                  product_type: i.product_type,
                })),
                userId: user.id,
                billingDetails: billingDetails,
                couponCode: coupon,
              }),
            })

            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              clearCart()
              setPaymentStatus('success')
            } else {
              setErrorMsg(verifyData.error || 'Payment verification failed.')
              setPaymentStatus('idle')
            }
          } catch (err: any) {
            setErrorMsg('Error verifying payment on server.')
            setPaymentStatus('idle')
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      console.error('Razorpay Error:', err)
      setErrorMsg(err.message || 'Payment initiation failed')
      setLoading(false)
    }
  }

  // --- 3. HANDLE PAYPAL CHECKOUT (INTERNATIONAL / USD) ---
  const handlePayPalSuccess = () => {
    clearCart()
    setPaymentStatus('success')
  }

  const handlePayPalError = (msg: string) => {
    setErrorMsg(msg)
    setPaymentStatus('idle')
    setLoading(false)
  }

  const handlePayPalProcessing = () => {
    if (!user) {
      router.push('/auth?next=/checkout')
      return
    }
    if (!validateForm()) {
      const billingSection = document.getElementById('billing-details-section')
      if (billingSection) {
        billingSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      throw new Error('Please fill in required billing details')
    }
    setPaymentStatus('processing')
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
    <div className="w-full min-h-screen bg-[#101010] text-white py-8 sm:py-12 select-none">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/store"
            prefetch={true}
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck size={13} className="text-zinc-400" />
            <span>256-Bit SSL Encrypted • Instant Delivery</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-0.5 border-b border-[#202020] pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-zinc-500">
            {isIndia
              ? 'India Orders • Razorpay UPI, NetBanking & Cards'
              : 'International Orders • PayPal & Global Cards in USD'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-[#241515] border border-red-500/20 text-red-300 px-4 py-3 text-xs rounded-xl flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white font-bold ml-4">
              &times;
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: CART ITEMS & BILLING FORM ================= */}
          <div className="lg:col-span-7 space-y-5">
            {/* Account Status Card */}
            {!user ? (
              <div className="bg-[#141414] border border-[#222222] rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">
                    Already have an account?
                  </span>
                  <span className="text-[11px] text-zinc-500 block">
                    Sign in to link licenses automatically
                  </span>
                </div>
                <Link
                  href="/auth?next=/checkout"
                  prefetch={true}
                  className="bg-[#222222] hover:bg-[#2a2a2a] text-white border border-[#303030] text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="bg-[#141414] border border-[#222222] rounded-xl px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  Signed in as <strong className="text-zinc-200">{user.email}</strong>
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  Verified Account
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
          <div className="lg:col-span-5 space-y-5">
            {/* Order Summary Component with Location-Based Gateways */}
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
              onRazorpayCheckout={handleRazorpayCheckout}
              onFreeCheckout={handleFreeCheckout}
              onPayPalSuccess={handlePayPalSuccess}
              onPayPalError={handlePayPalError}
              onPayPalProcessing={handlePayPalProcessing}
              loading={loading}
              paymentStatus={paymentStatus}
              formatPrice={formatPrice}
              isIndia={isIndia}
              billingDetails={billingDetails}
              items={items}
              userId={user?.id}
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

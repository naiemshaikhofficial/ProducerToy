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
import { saveBillingAddressAction } from '@/actions/accountActions'
import {
  BillingDetails,
  PaymentStatus,
  CheckoutSuccessView,
  CheckoutEmptyCart,
  EpicCheckoutLayout,
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
      let loadedFullName = ''
      let loadedEmail = ''
      let loadedPhone = ''
      let loadedAddress = ''
      let loadedAddress2 = ''
      let loadedCity = ''
      let loadedState = ''
      let loadedZip = ''
      let loadedCountry = ''

      // Step A: Fetch Supabase authenticated user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (currentUser) {
        loadedEmail = currentUser.email || ''
        // Fetch saved profile from unified profiles table
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle()

          if (profile) {
            const nameParts = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
            loadedFullName = profile.full_name || nameParts || profile.display_name || ''
            loadedEmail = profile.email || currentUser.email || ''
            loadedPhone = profile.phone_number || profile.phone || ''
            loadedAddress = profile.address_line1 || profile.address || ''
            loadedAddress2 = profile.address_line2 || profile.address2 || ''
            loadedCity = profile.city || ''
            loadedState = profile.state || profile.region || ''
            loadedZip = profile.postal_code || profile.zip || ''
            loadedCountry = profile.country || ''

            if (profile.newsletter !== undefined && profile.newsletter !== null) {
              setNewsletterOptIn(Boolean(profile.newsletter))
            }
          }
        } catch (dbErr) {
          console.warn('profiles fetch note:', dbErr)
        }

        // Fallback from Auth user metadata
        const meta = currentUser.user_metadata || {}
        const clean = (val: any) => (val === '0' || val === 0 ? '' : val || '')
        if (!loadedFullName) loadedFullName = clean(meta.full_name) || clean(meta.name) || clean(meta.display_name)
        if (!loadedPhone) loadedPhone = clean(meta.phone) || clean(meta.phone_number)
        if (!loadedAddress) loadedAddress = clean(meta.address) || clean(meta.address_line1)
        if (!loadedAddress2) loadedAddress2 = clean(meta.address2) || clean(meta.address_line2)
        if (!loadedCity) loadedCity = clean(meta.city)
        if (!loadedState) loadedState = clean(meta.state) || clean(meta.region)
        if (!loadedZip) loadedZip = clean(meta.zip) || clean(meta.postal_code)
        if (!loadedCountry) loadedCountry = clean(meta.country)
      }

      // Step B: Fallback from localStorage
      try {
        const saved = localStorage.getItem('pt_billing_details')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (!loadedFullName) loadedFullName = parsed.fullName || ''
          if (!loadedEmail && parsed.email) loadedEmail = parsed.email || ''
          if (!loadedPhone) loadedPhone = parsed.phone || ''
          if (!loadedAddress) loadedAddress = parsed.address || ''
          if (!loadedAddress2) loadedAddress2 = parsed.address2 || ''
          if (!loadedCity) loadedCity = parsed.city || ''
          if (!loadedState) loadedState = parsed.state || ''
          if (!loadedZip) loadedZip = parsed.zip || ''
          if (!loadedCountry) loadedCountry = parsed.country || ''
        }
      } catch (e) {
        console.warn('Could not read saved billing details:', e)
      }

      const finalDetails: BillingDetails = {
        fullName: loadedFullName,
        email: loadedEmail,
        phone: ensureE164(loadedPhone),
        address: loadedAddress,
        address2: loadedAddress2,
        city: loadedCity,
        state: loadedState,
        zip: loadedZip,
        country: loadedCountry,
      }

      setBillingDetails(finalDetails)
      if (finalDetails.country?.toUpperCase() === 'INDIA') setCurrency('INR')
      else if (finalDetails.country) setCurrency('USD')

      localStorage.setItem('pt_billing_details', JSON.stringify(finalDetails))
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

  // Handle Billing Input Change (and auto-switch currency if country changes & sync to Supabase profile)
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

    // Auto-save to Supabase profiles table
    if (user?.id) {
      saveBillingAddressAction(user.id, updated).catch((e) => {
        console.warn('Background profile sync note:', e)
      })
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
      // Save billing address to Supabase profile
      await saveBillingAddressAction(user.id, billingDetails).catch(() => {})

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

    // Save billing address to Supabase profile
    await saveBillingAddressAction(user.id, billingDetails).catch(() => {})

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

    // Save billing address to Supabase profile
    saveBillingAddressAction(user.id, billingDetails).catch(() => {})

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
    <div className="w-full min-h-screen bg-[#0e0e0e] text-white py-6 sm:py-10 px-4 sm:px-6 select-none flex flex-col items-center justify-center">
      {/* Error Notification */}
      {errorMsg && (
        <div className="max-w-[1020px] w-full mb-4 bg-[#241515] border border-red-500/20 text-red-300 px-4 py-3 text-xs rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white font-bold ml-4">
            &times;
          </button>
        </div>
      )}

      {/* Exact Epic Games Store Checkout Container */}
      <EpicCheckoutLayout
        items={items}
        removeItem={removeItem}
        user={user}
        billingDetails={billingDetails}
        onBillingChange={handleBillingChange}
        formErrors={formErrors}
        newsletterOptIn={newsletterOptIn}
        setNewsletterOptIn={setNewsletterOptIn}
        countryOptions={countryOptions}
        currencySymbol={currencySymbol}
        currentSubtotal={currentSubtotal}
        finalTotal={finalTotal}
        isIndia={isIndia}
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
      />
    </div>
  )
}

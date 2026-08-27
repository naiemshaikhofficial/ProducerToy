'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { validateCouponAction } from '@/actions/couponActions'
import { processCheckoutOrderAction } from '@/actions/checkoutActions'
import { saveBillingAddressAction } from '@/actions/accountActions'
import { COUNTRIES } from './countries'
import { BillingDetails, PaymentStatus } from './types'
import { EpicCheckoutLayout } from './EpicCheckoutLayout'
import { CheckoutSuccessView } from './CheckoutSuccessView'

declare global {
  interface Window {
    Razorpay?: any
  }
}

export function GlobalCheckoutModal() {
  const router = useRouter()
  const { items, removeItem, clearCart, isCheckoutOpen, setIsCheckoutOpen, closeCheckout } = useCart()
  const { formatPrice, currency, setCurrency, exchangeRate, convertUsdToInr, convertInrToUsd } = useCurrency()
  const { user } = useAuth()
  const supabase = createClient()

  const countryOptions = COUNTRIES

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

  // Auto-load profile & billing data on mount or open
  useEffect(() => {
    if (!isCheckoutOpen) return

    const ensureE164 = (phone: any) => {
      if (!phone || phone === '0' || phone === 0) return ''
      let str = String(phone).trim()
      if (str.startsWith('+')) return str
      const digits = str.replace(/\D/g, '')
      if (!digits) return ''
      if (digits.length === 10) return `+91${digits}`
      if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
      return `+${digits}`
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

      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (currentUser) {
        loadedEmail = currentUser.email || ''
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
        } catch {}

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
      } catch {}

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
    }

    loadData()
  }, [isCheckoutOpen, supabase, setCurrency])

  // Freeze background scrolling completely when modal is open
  useEffect(() => {
    if (isCheckoutOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isCheckoutOpen])

  if (!isCheckoutOpen || items.length === 0) return null

  // Cart Price Calculations (100% Synchronized with live exchangeRate & formatPrice)
  const rawSubtotalUsd = items.reduce((acc, i) => acc + (Number(i.price_usd) || 0), 0)
  const rawSubtotalInr = items.reduce((acc, i) => {
    if (i.price_inr && Number(i.price_inr) > 0) return acc + Number(i.price_inr)
    return acc + Math.round((Number(i.price_usd) || 0) * (exchangeRate || 95.0))
  }, 0)
  const isIndia = currency === 'INR' || billingDetails.country?.toUpperCase() === 'INDIA'
  const currencySymbol = currency === 'INR' ? '₹' : '$'
  const currentSubtotal = currency === 'INR' ? rawSubtotalInr : rawSubtotalUsd

  const bundleDiscountPercent = items.length >= 3 ? 15 : items.length === 2 ? 10 : 0
  const activeDiscountPercent = Math.max(discountPercent, bundleDiscountPercent)
  const finalTotal = Math.max(0, currentSubtotal * (1 - activeDiscountPercent / 100))

  const handleBillingChange = (field: keyof BillingDetails, value: string) => {
    setBillingDetails((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'country') {
        if (value.toUpperCase() === 'INDIA') setCurrency('INR')
        else setCurrency('USD')
      }
      return updated
    })
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!billingDetails.fullName.trim()) errors.fullName = 'Required'
    if (!billingDetails.email.trim() || !billingDetails.email.includes('@')) errors.email = 'Valid email required'
    if (!billingDetails.phone.trim()) errors.phone = 'Required'
    if (!billingDetails.address.trim()) errors.address = 'Required'
    if (!billingDetails.city.trim()) errors.city = 'Required'
    if (!billingDetails.zip.trim()) errors.zip = 'Required'
    if (!billingDetails.country.trim()) errors.country = 'Required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return
    setCouponLoading(true)
    setCouponError('')
    setCouponSuccessMsg('')

    try {
      const res = await validateCouponAction(coupon.trim().toUpperCase())
      if (res.success && res.discountPercent) {
        setDiscountPercent(res.discountPercent)
        setCouponSuccessMsg(`Coupon applied: ${res.discountPercent}% OFF!`)
      } else {
        setCouponError(res.message || 'Invalid coupon code')
      }
    } catch {
      setCouponError('Failed to apply coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleFreeCheckout = async () => {
    if (!validateForm()) return
    setLoading(true)
    setErrorMsg('')
    setPaymentStatus('processing')
    try {
      if (user?.id) {
        await saveBillingAddressAction(user.id, billingDetails).catch(() => {})
      }
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
        user?.email || billingDetails.email,
        user?.id,
        {
          couponCode: coupon,
          currency: currency,
        }
      )
      if (res.success) {
        clearCart()
        setPaymentStatus('success')
      } else {
        setErrorMsg(res.error || 'Failed to claim product')
        setPaymentStatus('idle')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Checkout failed')
      setPaymentStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  const handleRazorpayCheckout = async () => {
    if (!validateForm()) return
    setLoading(true)
    setErrorMsg('')

    try {
      if (user?.id) {
        saveBillingAddressAction(user.id, billingDetails).catch(() => {})
      }

      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      const orderInitRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          currency: currency === 'INR' ? 'INR' : 'USD',
          items,
          billingDetails,
        }),
      })

      const orderData = await orderInitRes.json()
      if (!orderData.orderId) {
        throw new Error(orderData.error || 'Failed to initialize payment gateway')
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ProducerToy',
        description: `Purchase of ${items.length} sound & plugin items`,
        order_id: orderData.orderId,
        prefill: {
          name: billingDetails.fullName,
          email: billingDetails.email,
          contact: billingDetails.phone,
        },
        theme: { color: '#000000' },
        handler: async (response: any) => {
          setPaymentStatus('processing')
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items,
                billingDetails,
                couponCode: coupon,
                newsletterOptIn,
                currency,
                totalAmount: finalTotal,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              clearCart()
              setPaymentStatus('success')
            } else {
              setErrorMsg(verifyData.error || 'Payment verification failed')
              setPaymentStatus('idle')
            }
          } catch (verErr: any) {
            setErrorMsg(verErr.message || 'Payment verification error')
            setPaymentStatus('idle')
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to open Razorpay checkout')
    } finally {
      setLoading(false)
    }
  }

  const handlePayPalSuccess = () => {
    clearCart()
    setPaymentStatus('success')
  }

  const handlePayPalError = (msg: string) => {
    setErrorMsg(msg)
    setPaymentStatus('idle')
  }

  const handlePayPalProcessing = () => {
    if (!validateForm()) {
      throw new Error('Please fill in required billing details')
    }
    if (user?.id) {
      saveBillingAddressAction(user.id, billingDetails).catch(() => {})
    }
    setPaymentStatus('processing')
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-[2px] flex items-center justify-center select-none overflow-hidden animate-in fade-in duration-150">
      <div className="relative z-10 w-full max-w-[1080px] lg:max-w-[1120px] h-full max-h-screen flex flex-col items-center justify-center">
        {/* Error Notification */}
        {errorMsg && (
          <div className="w-full mb-2 bg-[#241515] border border-red-500/20 text-red-300 px-4 py-2 text-xs rounded-lg flex items-center justify-between shadow-lg">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white font-bold ml-4">
              &times;
            </button>
          </div>
        )}

        {paymentStatus === 'success' ? (
          <div className="relative w-full max-w-lg bg-[#141414] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <CheckoutSuccessView email={billingDetails.email || user?.email} onClose={closeCheckout} />
          </div>
        ) : (
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
            onClose={closeCheckout}
          />
        )}
      </div>
    </div>
  )
}

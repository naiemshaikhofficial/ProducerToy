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
import {
  processCheckoutOrderAction,
  createRazorpayOrderAction,
  verifyRazorpayPaymentAction,
} from '@/actions/checkoutActions'
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

  // Toywards Loyalty Rewards state
  const [availableRewards, setAvailableRewards] = useState(0)
  const [useRewards, setUseRewards] = useState(false)

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

            if (profile.reward_balance !== undefined && profile.reward_balance !== null) {
              setAvailableRewards(Number(profile.reward_balance || 0))
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
          if (currentUser) {
            if (!loadedFullName) loadedFullName = parsed.fullName || ''
            if (!loadedEmail && parsed.email) loadedEmail = parsed.email || ''
          }
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
          .select('id, name, slug, price_usd, price_inr, cover_image, product_type, brands(name)')
          .eq('is_active', true)
          .limit(6)

        if (!error && data) {
          const filtered = data
            .filter((p: any) => !items.some((item) => item.id === p.id))
            .slice(0, 3)
            .map((p: any) => {
              const brandName = Array.isArray(p.brands)
                ? p.brands[0]?.name
                : p.brands?.name || p.brand || 'Producer Toy'
              return {
                ...p,
                brand: brandName,
              }
            })
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

  const rawSubtotalUsd = items.reduce((sum, item) => sum + (Number(item.price_usd) || 0), 0)
  const rawSubtotalInr = items.reduce((sum, item) => {
    if (item.price_inr && Number(item.price_inr) > 0) return sum + Number(item.price_inr)
    return sum + Math.round((Number(item.price_usd) || 0) * (exchangeRate || 95.0))
  }, 0)

  const currentSubtotal = isIndia ? rawSubtotalInr : rawSubtotalUsd
  const currencySymbol = isIndia ? '₹' : '$'

  const discountAmount =
    discountPercent > 0
      ? isIndia
        ? Math.round((currentSubtotal * discountPercent) / 100)
        : Math.round((currentSubtotal * discountPercent) / 100 * 100) / 100
      : 0

  const amountAfterCoupon = Math.max(0, currentSubtotal - discountAmount)
  const liveExchange = exchangeRate || 95.0
  const availableRewardsInCurrentCurrency = isIndia
    ? Math.round(availableRewards * liveExchange)
    : availableRewards

  const rewardDiscountAmount = useRewards
    ? Math.min(amountAfterCoupon, availableRewardsInCurrentCurrency)
    : 0

  const finalTotal = Math.max(0, amountAfterCoupon - rewardDiscountAmount)
  const rewardAmountUsedUsd = isIndia
    ? Math.round((rewardDiscountAmount / liveExchange) * 100) / 100
    : rewardDiscountAmount

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

  const [lastGiftInfo, setLastGiftInfo] = useState<{
    hasGifts: boolean
    giftRecipientEmail: string
    hasSelfItems: boolean
  } | null>(null)

  const recordCompletedGifts = (orderItems: any[]) => {
    try {
      const giftItems = orderItems.filter((i) => i.is_gift || i.gift_recipient_email)
      if (giftItems.length > 0) {
        const existingGifts = JSON.parse(localStorage.getItem('pt_user_gifts') || '[]')
        giftItems.forEach((item) => {
          const giftId = `gift-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
          const claimCode = `PT-GIFT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
          existingGifts.unshift({
            id: giftId,
            productId: item.id,
            productName: item.name,
            productSlug: item.slug,
            coverImage: item.cover_image,
            senderEmail: user?.email || billingDetails.email || 'Producer',
            recipientEmail: item.gift_recipient_email || 'recipient@example.com',
            message: item.gift_message || 'Enjoy the gift!',
            sendDate: item.gift_send_date || new Date().toISOString().split('T')[0],
            priceUsd: item.price_usd,
            priceInr: item.price_inr,
            createdAt: new Date().toISOString(),
            status: 'unopened',
            claimCode: claimCode,
          })
        })
        localStorage.setItem('pt_user_gifts', JSON.stringify(existingGifts))
        localStorage.removeItem('pt_pending_gifts')
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'))
        }
      }
    } catch (e) {
      console.error('Error recording gift order:', e)
    }
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

      const hasGifts = items.some((i) => i.is_gift || i.gift_recipient_email)
      const hasSelfItems = items.some((i) => !i.is_gift && !i.gift_recipient_email)
      const giftRecipientEmail = items.find((i) => i.is_gift || i.gift_recipient_email)?.gift_recipient_email || ''
      setLastGiftInfo({ hasGifts, giftRecipientEmail, hasSelfItems })

      const res = await processCheckoutOrderAction(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          slug: i.slug,
          price_usd: Number(i.price_usd || 0),
          price_inr: Number(i.price_inr || 0),
          product_type: i.product_type,
          is_gift: Boolean(i.is_gift),
          gift_recipient_email: i.gift_recipient_email || '',
          gift_message: i.gift_message || '',
          gift_send_date: i.gift_send_date || '',
        })),
        billingDetails,
        user.email || billingDetails.email,
        user.id,
        {
          couponCode: coupon,
          currency: currency,
          applyRewards: useRewards,
          rewardAmountUsed: rewardAmountUsedUsd,
        }
      )

      if (res.success) {
        recordCompletedGifts(items)
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
      const orderRes = await createRazorpayOrderAction(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          slug: i.slug,
          price_usd: i.price_usd,
          price_inr: i.price_inr,
          product_type: i.product_type,
          is_gift: Boolean(i.is_gift),
          gift_recipient_email: i.gift_recipient_email || '',
          gift_message: i.gift_message || '',
          gift_send_date: i.gift_send_date || '',
        })),
        coupon,
        {
          applyRewards: useRewards,
          rewardAmountUsed: rewardAmountUsedUsd,
        }
      )

      if (!orderRes.success || !orderRes.orderId) {
        throw new Error(orderRes.error || 'Failed to initialize Razorpay payment order')
      }

      const keyId = orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!keyId) throw new Error('Razorpay Key ID is missing')

      const options = {
        key: keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'ProducerToy',
        description: `Order for ${items.length} ${items.length === 1 ? 'item' : 'items'}`,
        order_id: orderRes.orderId,
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
            const hasGifts = items.some((i) => i.is_gift || i.gift_recipient_email)
            const hasSelfItems = items.some((i) => !i.is_gift && !i.gift_recipient_email)
            const giftRecipientEmail = items.find((i) => i.is_gift || i.gift_recipient_email)?.gift_recipient_email || ''
            setLastGiftInfo({ hasGifts, giftRecipientEmail, hasSelfItems })

            const verifyRes = await verifyRazorpayPaymentAction({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: items.map((i) => ({
                id: i.id,
                name: i.name,
                slug: i.slug,
                price_usd: i.price_usd,
                price_inr: i.price_inr,
                product_type: i.product_type,
                is_gift: Boolean(i.is_gift),
                gift_recipient_email: i.gift_recipient_email || '',
                gift_message: i.gift_message || '',
                gift_send_date: i.gift_send_date || '',
              })),
              userId: user.id,
              billingDetails: billingDetails,
              couponCode: coupon,
              applyRewards: useRewards,
              rewardAmountUsed: rewardAmountUsedUsd,
            })

            if (verifyRes.success) {
              recordCompletedGifts(items)
              clearCart()
              setPaymentStatus('success')
            } else {
              setErrorMsg(verifyRes.error || 'Payment verification failed.')
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
    const hasGifts = items.some((i) => i.is_gift || i.gift_recipient_email)
    const hasSelfItems = items.some((i) => !i.is_gift && !i.gift_recipient_email)
    const giftRecipientEmail = items.find((i) => i.is_gift || i.gift_recipient_email)?.gift_recipient_email || ''
    setLastGiftInfo({ hasGifts, giftRecipientEmail, hasSelfItems })

    recordCompletedGifts(items)
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
    return (
      <div className="fixed inset-0 z-50 bg-[#0e0e0e] text-white overflow-y-auto py-6 sm:py-10 px-4 sm:px-6 select-none flex flex-col items-center justify-center">
        <div className="relative w-full max-w-lg bg-[#141414] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <CheckoutSuccessView
            email={billingDetails.email || user?.email}
            hasGifts={lastGiftInfo?.hasGifts}
            giftRecipientEmail={lastGiftInfo?.giftRecipientEmail}
            hasSelfItems={lastGiftInfo?.hasSelfItems}
            onClose={() => router.push('/store')}
          />
        </div>
      </div>
    )
  }

  // Empty Cart Screen
  if (items.length === 0) {
    return <CheckoutEmptyCart />
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0e0e] text-white overflow-y-auto p-0 sm:py-6 sm:px-6 select-none flex flex-col items-center justify-center">
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
        availableRewards={availableRewards}
        useRewards={useRewards}
        onToggleRewards={setUseRewards}
        rewardDiscountAmount={rewardDiscountAmount}
        onRazorpayCheckout={handleRazorpayCheckout}
        onFreeCheckout={handleFreeCheckout}
        onPayPalSuccess={handlePayPalSuccess}
        onPayPalError={handlePayPalError}
        onPayPalProcessing={handlePayPalProcessing}
        loading={loading}
        paymentStatus={paymentStatus}
        formatPrice={formatPrice}
        onClose={() => router.back()}
      />
    </div>
  )
}


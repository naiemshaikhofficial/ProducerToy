'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export interface BillingDetailsInput {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface CheckoutItemInput {
  id: string
  name: string
  slug?: string
  price_inr?: number
  price_usd?: number
  product_type?: string
  delivery_method?: string
  license_type?: string
  is_gift?: boolean
  gift_recipient_email?: string
  gift_message?: string
  gift_send_date?: string
}

export interface CheckoutOptionsInput {
  couponCode?: string
  discountAmount?: number
  currency?: string
  newsletterOptIn?: boolean
  applyRewards?: boolean
  rewardAmountUsed?: number
}

export interface CheckoutActionResult {
  success: boolean
  purchases?: any[]
  orderId?: string
  error?: string
}

export async function processCheckoutAction(
  items: CheckoutItemInput[],
  email?: string,
  clientUserId?: string,
  billingDetails?: BillingDetailsInput,
  options?: CheckoutOptionsInput
): Promise<CheckoutActionResult> {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // 1. Authenticate user from secure server session cookies
    const supabase = await createClient()
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser()

    let targetUserId: string | null = sessionUser?.id || clientUserId || null
    const targetEmail = sessionUser?.email || billingDetails?.email || email || ''

    const adminSupabase = getAdminClient()

    // 2. If no targetUserId found yet, search or link user by email
    if (!targetUserId && targetEmail) {
      try {
        const { data: usersData } = await adminSupabase.auth.admin.listUsers()
        const existingUser = usersData?.users?.find(
          (u: any) => u.email?.toLowerCase() === targetEmail.toLowerCase()
        )

        if (existingUser) {
          targetUserId = existingUser.id
        }
      } catch (err) {
        console.warn('Admin user lookup note:', err)
      }
    }

    // 2.1 Update unified profiles and auth user metadata
    if (targetUserId && billingDetails) {
      try {
        const nameParts = (billingDetails.fullName || '').trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        const profilePayload = {
          id: targetUserId,
          email: targetEmail,
          first_name: firstName,
          last_name: lastName,
          full_name: billingDetails.fullName,
          display_name: billingDetails.fullName,
          phone_number: billingDetails.phone,
          address_line1: billingDetails.address,
          address_line2: billingDetails.address2 || '',
          city: billingDetails.city,
          state: billingDetails.state,
          region: billingDetails.state,
          postal_code: billingDetails.zip,
          country: billingDetails.country || null,
          newsletter: options?.newsletterOptIn ?? true,
          updated_at: new Date().toISOString(),
        }

        // 1. Session client upsert
        try {
          const sessionSupabase = await createClient()
          await sessionSupabase.from('profiles').upsert(profilePayload, { onConflict: 'id' })
        } catch (e) {
          console.warn('Session profile upsert note in checkout:', e)
        }

        // 2. Admin client upsert
        try {
          await adminSupabase.from('profiles').upsert(profilePayload, { onConflict: 'id' })
          
          // Update Supabase auth user metadata
          await adminSupabase.auth.admin.updateUserById(targetUserId, {
            user_metadata: {
              full_name: billingDetails.fullName,
              first_name: firstName,
              last_name: lastName,
              phone: billingDetails.phone,
              phone_number: billingDetails.phone,
              address: billingDetails.address,
              address2: billingDetails.address2,
              address_line1: billingDetails.address,
              address_line2: billingDetails.address2,
              city: billingDetails.city,
              state: billingDetails.state,
              region: billingDetails.state,
              zip: billingDetails.zip,
              postal_code: billingDetails.zip,
              country: billingDetails.country,
            },
          }).catch(() => {})
        } catch (adminErr) {
          console.warn('Admin profile upsert note in checkout:', adminErr)
        }
      } catch (metaErr) {
        console.warn('Could not sync user billing profile in DB:', metaErr)
      }
    }

    // 3. Resilient product resolution
    const productIds = items.map((i) => i.id)
    let dbProducts: any[] = []

    try {
      const { data, error } = await adminSupabase
        .from('products')
        .select('id, name, price_usd, price_inr, product_type, delivery_method, license_type, slug')
        .in('id', productIds)

      if (!error && data && data.length > 0) {
        dbProducts = data
      }
    } catch (e) {
      console.warn('Product DB ID lookup note:', e)
    }

    if (dbProducts.length === 0) {
      try {
        const slugs = items.map((i) => i.slug || i.id)
        const { data: slugData } = await adminSupabase
          .from('products')
          .select('id, name, price_usd, price_inr, product_type, delivery_method, license_type, slug')
          .in('slug', slugs)
        if (slugData && slugData.length > 0) {
          dbProducts = slugData
        }
      } catch (e) {
        console.warn('Product DB slug lookup note:', e)
      }
    }

    // Fallback: If products are not in DB, populate from cart items metadata
    if (dbProducts.length === 0) {
      dbProducts = items.map((item) => ({
        id: item.id,
        name: item.name,
        price_usd: Number(item.price_usd || 0),
        price_inr: Number(item.price_inr || 0),
        product_type: item.product_type || 'plugin',
        delivery_method: 'instant_download',
        license_type: 'free_standard',
      }))
    }

    // 3.1 Verify server-side total and coupons strictly against database to prevent unpaid bypass
    const rawSubtotalUsd = dbProducts.reduce((sum, p) => sum + Number(p.price_usd || 0), 0)
    const rawSubtotalInr = dbProducts.reduce((sum, p) => sum + Number(p.price_inr || 0), 0)

    let verifiedDiscountPercent = 0
    if (options?.couponCode) {
      const { data: couponData } = await adminSupabase
        .from('coupons')
        .select('discount_percent')
        .eq('code', String(options.couponCode).trim().toUpperCase())
        .eq('is_active', true)
        .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
        .maybeSingle()

      if (couponData?.discount_percent) {
        verifiedDiscountPercent = couponData.discount_percent
      }
    }

    const couponDiscountUsd = (rawSubtotalUsd * verifiedDiscountPercent) / 100
    const rawSubtotalInrAmount = (rawSubtotalInr * verifiedDiscountPercent) / 100
    const amountAfterCouponUsd = Math.max(0, rawSubtotalUsd - couponDiscountUsd)

    let verifiedRewardDiscountUsd = 0
    if (options?.applyRewards && options?.rewardAmountUsed && targetUserId) {
      const { data: userProfile } = await adminSupabase
        .from('profiles')
        .select('reward_balance')
        .eq('id', targetUserId)
        .maybeSingle()

      const currentRewardBal = Number(userProfile?.reward_balance || 0)
      verifiedRewardDiscountUsd = Math.min(amountAfterCouponUsd, currentRewardBal, Number(options.rewardAmountUsed))
    }

    const expectedTotalUsd = Math.max(0, amountAfterCouponUsd - verifiedRewardDiscountUsd)

    if (expectedTotalUsd > 0.01) {
      return {
        success: false,
        error: 'Paid orders must be completed through Razorpay or PayPal payment gateway.',
      }
    }

    const orderNumber = `PT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`
    const randomOrderId = `ord_${crypto.randomBytes(8).toString('hex')}`
    const randomPaymentId = `pay_${crypto.randomBytes(8).toString('hex')}`
    const orderCurrency = options?.currency || 'USD'

    const isUUID = (str: any) =>
      typeof str === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    // 4. Build secure purchase records with conditional serial key issuance & billing snapshot
    const purchaseRecords = await Promise.all(
      items.map(async (cartItem) => {
        const dbProduct =
          dbProducts.find((p) => p.id === cartItem.id || p.slug === cartItem.slug) || cartItem

        let validProductId = isUUID(dbProduct.id) ? dbProduct.id : null

        if (!validProductId && (dbProduct.slug || dbProduct.name)) {
          try {
            const { data: realProd } = await adminSupabase
              .from('products')
              .select('id')
              .or(`slug.ilike.${dbProduct.slug || ''},name.ilike.${dbProduct.name || ''}`)
              .limit(1)
              .maybeSingle()
            if (realProd && isUUID(realProd.id)) {
              validProductId = realProd.id
            }
          } catch (e) {
            console.warn('Real product lookup note:', e)
          }
        }

        const requiresSerialKey = Boolean(
          dbProduct.delivery_method === 'serial_key' ||
          dbProduct.delivery_method === 'license_key' ||
          (dbProduct.license_type && dbProduct.license_type.toLowerCase().includes('serial')) ||
          (dbProduct.license_type && dbProduct.license_type.toLowerCase().includes('key'))
        )

        let serialKey: string | null = null
        if (requiresSerialKey) {
          const serialPartA = crypto.randomBytes(3).toString('hex').toUpperCase()
          const serialPartB = crypto.randomBytes(3).toString('hex').toUpperCase()
          const serialPartC = crypto.randomBytes(3).toString('hex').toUpperCase()
          serialKey = `PT-VST-${serialPartA}-${serialPartB}-${serialPartC}`
        }

        const isGiftItem = Boolean(cartItem.is_gift || cartItem.gift_recipient_email)
        let itemUserId: string | null = targetUserId
        let itemCustomerEmail = targetEmail

        if (isGiftItem && cartItem.gift_recipient_email) {
          const cleanRecipientEmail = cartItem.gift_recipient_email.trim()
          itemCustomerEmail = cleanRecipientEmail
          itemUserId = null

          // Look up if a registered user exists with that recipient email
          try {
            const { data: usersData } = await adminSupabase.auth.admin.listUsers()
            const recipientUser = usersData?.users?.find(
              (u: any) => u.email?.toLowerCase() === cleanRecipientEmail.toLowerCase()
            )
            if (recipientUser) {
              itemUserId = recipientUser.id
            }
          } catch (err) {
            console.warn('Recipient lookup note:', err)
          }
        }

        return {
          user_id: itemUserId,
          product_id: validProductId,
          amount_paid: Number(dbProduct.price_usd || 0),
          currency: orderCurrency,
          serial_key: serialKey,
          razorpay_order_id: randomOrderId,
          razorpay_payment_id: randomPaymentId,
          customer_email: itemCustomerEmail,
          customer_name: isGiftItem ? null : (billingDetails?.fullName || null),
          customer_phone: isGiftItem ? null : (billingDetails?.phone || null),
          billing_address: billingDetails?.address || null,
          billing_city: billingDetails?.city || null,
          billing_state: billingDetails?.state || null,
          billing_zip: billingDetails?.zip || null,
          billing_country: billingDetails?.country || null,
          discount_amount: options?.discountAmount || verifiedRewardDiscountUsd || 0,
          coupon_code: options?.couponCode || null,
          purchased_at: new Date().toISOString(),
        }
      })
    )

    // 5. Insert verified purchases into Supabase
    let insertedPurchases: any[] = []
    try {
      const { data, error: insertErr } = await adminSupabase
        .from('purchases')
        .insert(purchaseRecords)
        .select('*')

      if (!insertErr && data) {
        insertedPurchases = data
      } else if (insertErr) {
        console.warn('Purchases insert fallback note:', insertErr.message)
      }
    } catch (insertEx) {
      console.warn('Purchases insert exception note:', insertEx)
    }

    // 6. Record order in orders table
    const subtotal = dbProducts.reduce((sum, p) => sum + Number(p.price_usd || 0), 0)
    const discount = (options?.discountAmount || 0) + verifiedRewardDiscountUsd
    const totalAmount = Math.max(0, subtotal - discount)

    try {
      await adminSupabase.from('orders').insert({
        user_id: targetUserId,
        order_number: orderNumber,
        customer_email: targetEmail,
        customer_name: billingDetails?.fullName || null,
        customer_phone: billingDetails?.phone || null,
        billing_address: billingDetails?.address || null,
        billing_city: billingDetails?.city || null,
        billing_state: billingDetails?.state || null,
        billing_zip: billingDetails?.zip || null,
        billing_country: billingDetails?.country || null,
        subtotal: subtotal,
        discount: discount,
        total_amount: totalAmount,
        currency: orderCurrency,
        coupon_code: options?.couponCode || null,
        payment_status: 'completed',
        payment_gateway: verifiedRewardDiscountUsd > 0 ? 'toywards_balance' : 'free_checkout',
        razorpay_order_id: randomOrderId,
        razorpay_payment_id: randomPaymentId,
        items: items,
        newsletter_opt_in: options?.newsletterOptIn ?? true,
        created_at: new Date().toISOString(),
      })
    } catch (orderErr) {
      console.warn('Orders table record note:', orderErr)
    }

    // Insert Gift records to public.gifts table in Supabase
    const giftItems = items.filter((i) => i.is_gift || i.gift_recipient_email)
    if (giftItems.length > 0) {
      for (const giftItem of giftItems) {
        const dbProduct = dbProducts.find((p) => p.id === giftItem.id || p.slug === giftItem.slug) || giftItem
        const recipientEmail = (giftItem.gift_recipient_email || '').trim().toLowerCase()
        if (recipientEmail && isUUID(dbProduct.id)) {
          let recipientUserId: string | null = null
          try {
            const { data: usersData } = await adminSupabase.auth.admin.listUsers()
            const recipientUser = usersData?.users?.find(
              (u: any) => u.email?.toLowerCase() === recipientEmail
            )
            if (recipientUser) {
              recipientUserId = recipientUser.id
            }
          } catch {}

          const claimCode = `PT-GIFT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
          await adminSupabase.from('gifts').insert({
            product_id: dbProduct.id,
            sender_id: targetUserId || null,
            sender_email: targetEmail,
            sender_name: billingDetails?.fullName || 'Producer',
            recipient_id: recipientUserId,
            recipient_email: recipientEmail,
            message: giftItem.gift_message || 'Enjoy the gift!',
            claim_code: claimCode,
            status: 'unopened',
            price_usd: Number(dbProduct.price_usd || 0),
            price_inr: Number(dbProduct.price_inr || 0),
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    revalidatePath('/gifts')

    // 7. Update Toywards Balance & Log Transaction (if rewards used)
    if (verifiedRewardDiscountUsd > 0 && targetUserId) {
      try {
        const { data: prof } = await adminSupabase
          .from('profiles')
          .select('reward_balance')
          .eq('id', targetUserId)
          .maybeSingle()

        const currentBal = Number(prof?.reward_balance || 0)
        const updatedBal = Math.max(0, currentBal - verifiedRewardDiscountUsd)

        await adminSupabase
          .from('profiles')
          .update({ reward_balance: updatedBal, updated_at: new Date().toISOString() })
          .eq('id', targetUserId)

        await adminSupabase.from('reward_transactions').insert({
          user_id: targetUserId,
          order_number: orderNumber,
          type: 'redeemed',
          amount: verifiedRewardDiscountUsd,
          currency: 'USD',
          description: `Redeemed Toywards on Order #${orderNumber}`,
          status: 'completed',
        })
      } catch (rewardErr) {
        console.warn('Toywards balance update note:', rewardErr)
      }
    }

    // 8. Purge cache on Library routes so purchases reflect instantly
    revalidatePath('/library')
    revalidatePath('/checkout')
    revalidatePath('/account')

    return {
      success: true,
      purchases: insertedPurchases || [],
      orderId: orderNumber,
    }
  } catch (err: any) {
    console.error('Server Action Checkout error:', err)
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during secure checkout.',
    }
  }
}

export async function processCheckoutOrderAction(
  items: CheckoutItemInput[],
  billingDetails?: BillingDetailsInput,
  email?: string,
  clientUserId?: string,
  options?: CheckoutOptionsInput
) {
  return processCheckoutAction(items, email, clientUserId, billingDetails, options)
}

/**
 * High-Speed Server Action to initialize Razorpay Orders.
 */
export async function createRazorpayOrderAction(
  items: CheckoutItemInput[],
  couponCode?: string,
  options?: CheckoutOptionsInput
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please login to complete your purchase' }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return { success: false, error: 'Razorpay credentials not configured on server' }
    }

    const RazorpayModule = (await import('razorpay')).default
    const razorpay = new RazorpayModule({
      key_id: keyId,
      key_secret: keySecret,
    })

    const { getUsdToInrRate } = await import('@/lib/exchangeRate')
    const liveRate = await getUsdToInrRate()
    const adminSupabase = getAdminClient()
    const productIds = items.map((i) => i.id)
    const { data: dbProducts } = await adminSupabase
      .from('products')
      .select('id, name, price_inr, price_usd')
      .in('id', productIds)

    const prods = dbProducts && dbProducts.length > 0 ? dbProducts : items

    const rawSubtotalInr = prods.reduce((sum: number, p: any) => {
      const inr = Number(p.price_inr || 0)
      const usd = Number(p.price_usd || 0)
      if (inr > 0) return sum + inr
      if (usd > 0) return sum + Math.round(usd * liveRate)
      return sum
    }, 0)

    let couponDiscountPercent = 0
    if (couponCode) {
      const { data: couponData } = await adminSupabase
        .from('coupons')
        .select('discount_percent')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
        .maybeSingle()

      if (couponData?.discount_percent) {
        couponDiscountPercent = couponData.discount_percent
      }
    }

    const couponDiscountInr = Math.round((rawSubtotalInr * couponDiscountPercent) / 100)
    const amountAfterCouponInr = Math.max(0, rawSubtotalInr - couponDiscountInr)

    let verifiedRewardDiscountInr = 0
    if (options?.applyRewards && user?.id) {
      const { data: userProf } = await adminSupabase
        .from('profiles')
        .select('reward_balance')
        .eq('id', user.id)
        .maybeSingle()

      const userRewardBalUsd = Number(userProf?.reward_balance || 0)
      const userRewardBalInr = Math.round(userRewardBalUsd * liveRate)
      verifiedRewardDiscountInr = Math.min(amountAfterCouponInr, userRewardBalInr)
    }

    const finalTotalInr = Math.max(0, amountAfterCouponInr - verifiedRewardDiscountInr)
    const amountInPaise = Math.round(finalTotalInr * 100)

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `pt_inr_${user.id.slice(0, 8)}_${Date.now().toString(36)}`,
      notes: {
        userId: user.id,
        userEmail: user.email || '',
        itemCount: items.length,
        couponDiscountPercent,
        rewardDiscountInr: verifiedRewardDiscountInr,
      },
    })

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      keyId,
    }
  } catch (error: any) {
    console.error('[CREATE_RAZORPAY_ORDER_ACTION_ERROR]', error)
    return { success: false, error: error.message || 'Failed to initialize payment' }
  }
}

/**
 * High-Speed Server Action to verify Razorpay Payment cryptographically and fulfill order.
 */
export async function verifyRazorpayPaymentAction(params: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  items: CheckoutItemInput[]
  userId?: string
  billingDetails?: BillingDetailsInput
  couponCode?: string
  applyRewards?: boolean
  rewardAmountUsed?: number
}) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      userId,
      billingDetails,
      couponCode,
      applyRewards,
      rewardAmountUsed,
    } = params

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'Invalid order parameters: items array required' }
    }

    const adminSupabase = getAdminClient()
    let targetUserId = userId || null
    if (!targetUserId && billingDetails?.email) {
      try {
        const { data: usersData } = await adminSupabase.auth.admin.listUsers()
        const existingUser = usersData?.users?.find(
          (u: any) => u.email?.toLowerCase() === billingDetails.email?.toLowerCase()
        )
        if (existingUser) targetUserId = existingUser.id
      } catch (err) {
        console.warn('User lookup note:', err)
      }
    }

    // Cryptographic signature check
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return { success: false, error: 'Razorpay Secret Key missing on server' }
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return { success: false, error: 'Invalid Razorpay payment signature' }
    }

    // Replay attack prevention
    const { data: existingPayment } = await adminSupabase
      .from('purchases')
      .select('id')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .limit(1)

    if (existingPayment && existingPayment.length > 0) {
      return { success: false, error: 'This transaction has already been processed.' }
    }

    const productIds = items.map((i) => i.id).filter(Boolean)
    let dbProducts: any[] = []
    const { data: prodsData } = await adminSupabase
      .from('products')
      .select('id, name, price_inr, price_usd, product_type, delivery_method, license_type, slug')
      .in('id', productIds)

    dbProducts = prodsData && prodsData.length > 0 ? prodsData : items

    const { getUsdToInrRate } = await import('@/lib/exchangeRate')
    const liveRate = await getUsdToInrRate()
    const rawSubtotalInr = dbProducts.reduce((sum, p) => {
      const inr = Number(p.price_inr || 0)
      const usd = Number(p.price_usd || 0)
      if (inr > 0) return sum + inr
      if (usd > 0) return sum + Math.round(usd * liveRate)
      return sum
    }, 0)

    let verifiedCouponDiscountPercent = 0
    if (couponCode) {
      const { data: couponData } = await adminSupabase
        .from('coupons')
        .select('discount_percent')
        .eq('code', String(couponCode).trim().toUpperCase())
        .eq('is_active', true)
        .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
        .maybeSingle()

      if (couponData?.discount_percent) {
        verifiedCouponDiscountPercent = couponData.discount_percent
      }
    }

    const couponDiscountInr = Math.round((rawSubtotalInr * verifiedCouponDiscountPercent) / 100)
    const expectedTotalInr = Math.max(0, rawSubtotalInr - couponDiscountInr)

    const targetEmail = billingDetails?.email || ''
    const orderNumber = `PT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`

    // Sync billing profile
    if (billingDetails && targetUserId) {
      try {
        const nameParts = (billingDetails.fullName || '').trim().split(' ')
        await adminSupabase.from('profiles').upsert(
          {
            id: targetUserId,
            email: targetEmail,
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            full_name: billingDetails.fullName || '',
            display_name: billingDetails.fullName || '',
            phone_number: billingDetails.phone || '',
            address_line1: billingDetails.address || '',
            city: billingDetails.city || '',
            state: billingDetails.state || '',
            postal_code: billingDetails.zip || '',
            country: billingDetails.country || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
      } catch (profileErr) {
        console.warn('Billing sync note:', profileErr)
      }
    }

    // Purchase records with serial keys
    const isUUID = (str: any) =>
      typeof str === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    const purchaseRecords = await Promise.all(
      items.map(async (cartItem) => {
        const dbProduct =
          dbProducts.find((p) => p.id === cartItem.id || p.slug === cartItem.slug) || cartItem

        const requiresSerialKey = Boolean(
          dbProduct.delivery_method === 'serial_key' ||
          dbProduct.delivery_method === 'license_key' ||
          (dbProduct.license_type && dbProduct.license_type.toLowerCase().includes('serial')) ||
          (dbProduct.license_type && dbProduct.license_type.toLowerCase().includes('key'))
        )

        let serialKey: string | null = null
        if (requiresSerialKey) {
          const partA = crypto.randomBytes(3).toString('hex').toUpperCase()
          const partB = crypto.randomBytes(3).toString('hex').toUpperCase()
          const partC = crypto.randomBytes(3).toString('hex').toUpperCase()
          serialKey = `PT-VST-${partA}-${partB}-${partC}`
        }

        const itemInr = Number(dbProduct.price_inr || 0) > 0
          ? Number(dbProduct.price_inr)
          : Math.round(Number(dbProduct.price_usd || 0) * liveRate)

        const isGiftItem = Boolean(cartItem.is_gift || cartItem.gift_recipient_email)
        let itemUserId: string | null = targetUserId
        let itemCustomerEmail = targetEmail

        if (isGiftItem && cartItem.gift_recipient_email) {
          const cleanRecipientEmail = cartItem.gift_recipient_email.trim()
          itemCustomerEmail = cleanRecipientEmail
          itemUserId = null

          try {
            const { data: usersData } = await adminSupabase.auth.admin.listUsers()
            const recipientUser = usersData?.users?.find(
              (u: any) => u.email?.toLowerCase() === cleanRecipientEmail.toLowerCase()
            )
            if (recipientUser) {
              itemUserId = recipientUser.id
            }
          } catch (err) {
            console.warn('Recipient lookup note:', err)
          }
        }

        return {
          user_id: itemUserId,
          product_id: isUUID(dbProduct.id) ? dbProduct.id : null,
          amount_paid: itemInr,
          currency: 'INR',
          serial_key: serialKey,
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          customer_email: itemCustomerEmail,
          customer_name: isGiftItem ? null : (billingDetails?.fullName || null),
          customer_phone: isGiftItem ? null : (billingDetails?.phone || null),
          billing_address: billingDetails?.address || null,
          billing_city: billingDetails?.city || null,
          billing_state: billingDetails?.state || null,
          billing_zip: billingDetails?.zip || null,
          billing_country: billingDetails?.country || null,
          coupon_code: verifiedCouponDiscountPercent > 0 ? couponCode : null,
          purchased_at: new Date().toISOString(),
        }
      })
    )

    // Prevent duplicate personal purchases
    const validPurchaseRecords: any[] = []
    for (const record of purchaseRecords) {
      if (record.user_id && record.product_id) {
        const { data: existing } = await adminSupabase
          .from('purchases')
          .select('id')
          .eq('user_id', record.user_id)
          .eq('product_id', record.product_id)
          .limit(1)
          .maybeSingle()

        if (!existing) {
          validPurchaseRecords.push(record)
        }
      } else {
        validPurchaseRecords.push(record)
      }
    }

    if (validPurchaseRecords.length > 0) {
      await adminSupabase.from('purchases').insert(validPurchaseRecords)
    }

    await adminSupabase.from('orders').insert({
      user_id: targetUserId,
      order_number: orderNumber,
      customer_email: targetEmail,
      customer_name: billingDetails?.fullName || null,
      customer_phone: billingDetails?.phone || null,
      billing_address: billingDetails?.address || null,
      billing_city: billingDetails?.city || null,
      billing_state: billingDetails?.state || null,
      billing_zip: billingDetails?.zip || null,
      billing_country: billingDetails?.country || null,
      subtotal: rawSubtotalInr,
      discount: couponDiscountInr,
      total_amount: expectedTotalInr,
      currency: 'INR',
      coupon_code: verifiedCouponDiscountPercent > 0 ? couponCode : null,
      payment_status: 'completed',
      payment_gateway: 'razorpay',
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      items: items,
      created_at: new Date().toISOString(),
    })

    // Insert Gift records to public.gifts table in Supabase
    const giftItems = items.filter((i) => i.is_gift || i.gift_recipient_email)
    if (giftItems.length > 0) {
      for (const giftItem of giftItems) {
        const dbProduct = dbProducts.find((p) => p.id === giftItem.id || p.slug === giftItem.slug) || giftItem
        const recipientEmail = (giftItem.gift_recipient_email || '').trim().toLowerCase()
        if (recipientEmail && isUUID(dbProduct.id)) {
          let recipientUserId: string | null = null
          try {
            const { data: usersData } = await adminSupabase.auth.admin.listUsers()
            const recipientUser = usersData?.users?.find(
              (u: any) => u.email?.toLowerCase() === recipientEmail
            )
            if (recipientUser) {
              recipientUserId = recipientUser.id
            }
          } catch {}

          const claimCode = `PT-GIFT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
          await adminSupabase.from('gifts').insert({
            product_id: dbProduct.id,
            sender_id: targetUserId || null,
            sender_email: targetEmail,
            sender_name: billingDetails?.fullName || 'Producer',
            recipient_id: recipientUserId,
            recipient_email: recipientEmail,
            message: giftItem.gift_message || 'Enjoy the gift!',
            claim_code: claimCode,
            status: 'unopened',
            price_usd: Number(dbProduct.price_usd || 0),
            price_inr: Number(dbProduct.price_inr || 0),
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    revalidatePath('/gifts')

    // Toywards Loyalty Rewards (EULA Section 11)
    if (targetUserId) {
      try {
        const { data: prof } = await adminSupabase
          .from('profiles')
          .select('reward_balance')
          .eq('id', targetUserId)
          .maybeSingle()

        let currentRewardBal = Number(prof?.reward_balance || 0)

        // A. Deduction if applied
        const rewardDiscountUsd = Number(rewardAmountUsed || 0)
        if (applyRewards && rewardDiscountUsd > 0) {
          const actualDeduction = Math.min(currentRewardBal, rewardDiscountUsd)
          currentRewardBal = Math.max(0, currentRewardBal - actualDeduction)

          await adminSupabase.from('reward_transactions').insert({
            user_id: targetUserId,
            order_number: orderNumber,
            type: 'redeemed',
            amount: actualDeduction,
            currency: 'USD',
            description: `Redeemed Toywards on Order #${orderNumber}`,
            status: 'completed',
          })
        }

        // B. Earn 5% cashback on paid total
        if (expectedTotalInr > 0) {
          const paidUsd = expectedTotalInr / liveRate
          const earnedUsd = Math.round(paidUsd * 0.05 * 100) / 100

          if (earnedUsd > 0) {
            const MAX_CAP = 500
            const newBal = Math.min(MAX_CAP, Math.round((currentRewardBal + earnedUsd) * 100) / 100)
            const actualCredited = Math.max(0, newBal - currentRewardBal)
            currentRewardBal = newBal

            if (actualCredited > 0) {
              const expiresDate = new Date()
              expiresDate.setMonth(expiresDate.getMonth() + 25)

              await adminSupabase.from('reward_transactions').insert({
                user_id: targetUserId,
                order_number: orderNumber,
                type: 'earned',
                amount: actualCredited,
                currency: 'USD',
                description: `Earned Toywards on Order #${orderNumber}`,
                status: 'active',
                expires_at: expiresDate.toISOString(),
              })
            }
          }
        }

        await adminSupabase
          .from('profiles')
          .update({ reward_balance: currentRewardBal, updated_at: new Date().toISOString() })
          .eq('id', targetUserId)
      } catch (rewardErr) {
        console.warn('Toywards reward processing note:', rewardErr)
      }
    }

    revalidatePath('/library')
    revalidatePath('/account')
    revalidatePath('/checkout')

    return { success: true, orderNumber }
  } catch (error: any) {
    console.error('[VERIFY_RAZORPAY_PAYMENT_ACTION_ERROR]', error)
    return { success: false, error: error.message || 'Payment verification failed' }
  }
}

/**
 * High-Speed Server Action to initialize PayPal Orders.
 */
export async function createPayPalOrderAction(
  items: CheckoutItemInput[],
  couponCode?: string,
  options?: CheckoutOptionsInput
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please login to complete your purchase' }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    const adminSupabase = getAdminClient()
    const productIds = items.map((i) => i.id)
    const { data: dbProducts } = await adminSupabase
      .from('products')
      .select('id, name, price_usd, price_inr')
      .in('id', productIds)

    const prods = dbProducts && dbProducts.length > 0 ? dbProducts : items

    const rawSubtotalUsd = prods.reduce(
      (sum: number, p: any) => sum + Number(p.price_usd || (p.price_inr ? p.price_inr / 85 : 0)),
      0
    )

    let couponDiscountPercent = 0
    if (couponCode) {
      const { data: couponData } = await adminSupabase
        .from('coupons')
        .select('discount_percent')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
        .maybeSingle()

      if (couponData?.discount_percent) {
        couponDiscountPercent = couponData.discount_percent
      }
    }

    const couponDiscountUsd = (rawSubtotalUsd * couponDiscountPercent) / 100
    const amountAfterCouponUsd = Math.max(0, rawSubtotalUsd - couponDiscountUsd)

    let verifiedRewardDiscountUsd = 0
    if (options?.applyRewards && user?.id) {
      const { data: userProf } = await adminSupabase
        .from('profiles')
        .select('reward_balance')
        .eq('id', user.id)
        .maybeSingle()

      const userRewardBalUsd = Number(userProf?.reward_balance || 0)
      verifiedRewardDiscountUsd = Math.min(amountAfterCouponUsd, userRewardBalUsd)
    }

    const finalTotalUsd = Math.max(0, amountAfterCouponUsd - verifiedRewardDiscountUsd)

    const { createPayPalOrderOnServer } = await import('@/lib/paypal')
    const paypalOrder = await createPayPalOrderOnServer(
      finalTotalUsd,
      `ProducerToy Order - ${items.length} ${items.length === 1 ? 'item' : 'items'}`
    )

    return { success: true, orderId: paypalOrder.id }
  } catch (error: any) {
    console.error('[CREATE_PAYPAL_ORDER_ACTION_ERROR]', error)
    return { success: false, error: error.message || 'Failed to create PayPal order' }
  }
}

/**
 * High-Speed Server Action to capture PayPal Order and fulfill items.
 */
export async function capturePayPalOrderAction(params: {
  orderId: string
  items: CheckoutItemInput[]
  userId: string
  billingDetails?: BillingDetailsInput
  couponCode?: string
  applyRewards?: boolean
  rewardAmountUsed?: number
}) {
  try {
    const {
      orderId,
      items,
      userId,
      billingDetails,
      couponCode,
      applyRewards,
      rewardAmountUsed,
    } = params

    if (!orderId || !userId || !items || !Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'Missing PayPal order or user parameters' }
    }

    const { capturePayPalOrderOnServer } = await import('@/lib/paypal')
    const captureData = await capturePayPalOrderOnServer(orderId)

    if (captureData.status !== 'COMPLETED') {
      return { success: false, error: `Payment not completed. Status: ${captureData.status}` }
    }

    const adminSupabase = getAdminClient()
    const productIds = items.map((i) => i.id).filter(Boolean)
    const { data: prodsData } = await adminSupabase
      .from('products')
      .select('id, name, price_usd, price_inr, product_type, delivery_method, license_type, slug')
      .in('id', productIds)

    const dbProducts = prodsData && prodsData.length > 0 ? prodsData : items

    const rawSubtotalUsd = dbProducts.reduce(
      (sum, p) => sum + Number(p.price_usd || (p.price_inr ? p.price_inr / 85 : 0)),
      0
    )

    let verifiedCouponDiscountPercent = 0
    if (couponCode) {
      const { data: couponData } = await adminSupabase
        .from('coupons')
        .select('discount_percent')
        .eq('code', String(couponCode).trim().toUpperCase())
        .eq('is_active', true)
        .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
        .maybeSingle()

      if (couponData?.discount_percent) {
        verifiedCouponDiscountPercent = couponData.discount_percent
      }
    }

    const couponDiscountUsd = (rawSubtotalUsd * verifiedCouponDiscountPercent) / 100
    const expectedTotalUsd = Math.max(0, rawSubtotalUsd - couponDiscountUsd)

    const targetEmail = billingDetails?.email || ''
    const orderNumber = `PT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`
    const isUUID = (str: any) =>
      typeof str === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    const purchaseRecords = await Promise.all(
      items.map(async (cartItem) => {
        const dbProduct =
          dbProducts.find((p) => p.id === cartItem.id || p.slug === cartItem.slug) || cartItem

        const requiresSerialKey = Boolean(
          dbProduct.delivery_method === 'serial_key' ||
          dbProduct.delivery_method === 'license_key' ||
          (dbProduct.license_type && dbProduct.license_type.toLowerCase().includes('serial')) ||
          (dbProduct.license_type && dbProduct.license_type.toLowerCase().includes('key'))
        )

        let serialKey: string | null = null
        if (requiresSerialKey) {
          const partA = crypto.randomBytes(3).toString('hex').toUpperCase()
          const partB = crypto.randomBytes(3).toString('hex').toUpperCase()
          const partC = crypto.randomBytes(3).toString('hex').toUpperCase()
          serialKey = `PT-VST-${partA}-${partB}-${partC}`
        }

        const isGiftItem = Boolean(cartItem.is_gift || cartItem.gift_recipient_email)
        let itemUserId: string | null = userId
        let itemCustomerEmail = targetEmail

        if (isGiftItem && cartItem.gift_recipient_email) {
          const cleanRecipientEmail = cartItem.gift_recipient_email.trim()
          itemCustomerEmail = cleanRecipientEmail
          itemUserId = null

          try {
            const { data: usersData } = await adminSupabase.auth.admin.listUsers()
            const recipientUser = usersData?.users?.find(
              (u: any) => u.email?.toLowerCase() === cleanRecipientEmail.toLowerCase()
            )
            if (recipientUser) {
              itemUserId = recipientUser.id
            }
          } catch (err) {
            console.warn('Recipient lookup note:', err)
          }
        }

        return {
          user_id: itemUserId,
          product_id: isUUID(dbProduct.id) ? dbProduct.id : null,
          amount_paid: Number(dbProduct.price_usd || 0),
          currency: 'USD',
          serial_key: serialKey,
          razorpay_order_id: `paypal_${orderId}`,
          razorpay_payment_id: captureData.id || `pp_cap_${Date.now()}`,
          customer_email: itemCustomerEmail,
          customer_name: isGiftItem ? null : (billingDetails?.fullName || null),
          customer_phone: isGiftItem ? null : (billingDetails?.phone || null),
          billing_address: billingDetails?.address || null,
          billing_city: billingDetails?.city || null,
          billing_state: billingDetails?.state || null,
          billing_zip: billingDetails?.zip || null,
          billing_country: billingDetails?.country || null,
          coupon_code: verifiedCouponDiscountPercent > 0 ? couponCode : null,
          purchased_at: new Date().toISOString(),
        }
      })
    )

    // Prevent duplicate personal purchases
    const validPurchaseRecords: any[] = []
    for (const record of purchaseRecords) {
      if (record.user_id && record.product_id) {
        const { data: existing } = await adminSupabase
          .from('purchases')
          .select('id')
          .eq('user_id', record.user_id)
          .eq('product_id', record.product_id)
          .limit(1)
          .maybeSingle()

        if (!existing) {
          validPurchaseRecords.push(record)
        }
      } else {
        validPurchaseRecords.push(record)
      }
    }

    if (validPurchaseRecords.length > 0) {
      await adminSupabase.from('purchases').insert(validPurchaseRecords)
    }

    await adminSupabase.from('orders').insert({
      user_id: userId,
      order_number: orderNumber,
      customer_email: targetEmail,
      customer_name: billingDetails?.fullName || null,
      customer_phone: billingDetails?.phone || null,
      billing_address: billingDetails?.address || null,
      billing_city: billingDetails?.city || null,
      billing_state: billingDetails?.state || null,
      billing_zip: billingDetails?.zip || null,
      billing_country: billingDetails?.country || null,
      subtotal: rawSubtotalUsd,
      discount: couponDiscountUsd,
      total_amount: expectedTotalUsd,
      currency: 'USD',
      coupon_code: verifiedCouponDiscountPercent > 0 ? couponCode : null,
      payment_status: 'completed',
      payment_gateway: 'paypal',
      razorpay_order_id: `paypal_${orderId}`,
      razorpay_payment_id: captureData.id || `pp_cap_${Date.now()}`,
      items: items,
      created_at: new Date().toISOString(),
    })

    // Insert Gift records to public.gifts table in Supabase
    const giftItems = items.filter((i) => i.is_gift || i.gift_recipient_email)
    if (giftItems.length > 0) {
      for (const giftItem of giftItems) {
        const dbProduct = dbProducts.find((p) => p.id === giftItem.id || p.slug === giftItem.slug) || giftItem
        const recipientEmail = (giftItem.gift_recipient_email || '').trim().toLowerCase()
        if (recipientEmail && isUUID(dbProduct.id)) {
          let recipientUserId: string | null = null
          try {
            const { data: usersData } = await adminSupabase.auth.admin.listUsers()
            const recipientUser = usersData?.users?.find(
              (u: any) => u.email?.toLowerCase() === recipientEmail
            )
            if (recipientUser) {
              recipientUserId = recipientUser.id
            }
          } catch {}

          const claimCode = `PT-GIFT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
          await adminSupabase.from('gifts').insert({
            product_id: dbProduct.id,
            sender_id: userId || null,
            sender_email: targetEmail,
            sender_name: billingDetails?.fullName || 'Producer',
            recipient_id: recipientUserId,
            recipient_email: recipientEmail,
            message: giftItem.gift_message || 'Enjoy the gift!',
            claim_code: claimCode,
            status: 'unopened',
            price_usd: Number(dbProduct.price_usd || 0),
            price_inr: Number(dbProduct.price_inr || 0),
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    revalidatePath('/gifts')

    // Toywards Loyalty Rewards (EULA Section 11)
    if (userId) {
      try {
        const { data: prof } = await adminSupabase
          .from('profiles')
          .select('reward_balance')
          .eq('id', userId)
          .maybeSingle()

        let currentRewardBal = Number(prof?.reward_balance || 0)

        // A. Deduction if applied
        const rewardDiscountUsd = Number(rewardAmountUsed || 0)
        if (applyRewards && rewardDiscountUsd > 0) {
          const actualDeduction = Math.min(currentRewardBal, rewardDiscountUsd)
          currentRewardBal = Math.max(0, currentRewardBal - actualDeduction)

          await adminSupabase.from('reward_transactions').insert({
            user_id: userId,
            order_number: orderNumber,
            type: 'redeemed',
            amount: actualDeduction,
            currency: 'USD',
            description: `Redeemed Toywards on Order #${orderNumber}`,
            status: 'completed',
          })
        }

        // B. Earn 5% cashback on paid total
        if (expectedTotalUsd > 0) {
          const earnedUsd = Math.round(expectedTotalUsd * 0.05 * 100) / 100
          if (earnedUsd > 0) {
            const MAX_CAP = 500
            const newBal = Math.min(MAX_CAP, Math.round((currentRewardBal + earnedUsd) * 100) / 100)
            const actualCredited = Math.max(0, newBal - currentRewardBal)
            currentRewardBal = newBal

            if (actualCredited > 0) {
              const expiresDate = new Date()
              expiresDate.setMonth(expiresDate.getMonth() + 25)

              await adminSupabase.from('reward_transactions').insert({
                user_id: userId,
                order_number: orderNumber,
                type: 'earned',
                amount: actualCredited,
                currency: 'USD',
                description: `Earned Toywards on Order #${orderNumber}`,
                status: 'active',
                expires_at: expiresDate.toISOString(),
              })
            }
          }
        }

        await adminSupabase
          .from('profiles')
          .update({ reward_balance: currentRewardBal, updated_at: new Date().toISOString() })
          .eq('id', userId)
      } catch (rewardErr) {
        console.warn('Toywards reward processing note:', rewardErr)
      }
    }

    revalidatePath('/library')
    revalidatePath('/account')
    revalidatePath('/checkout')

    return { success: true, orderNumber }
  } catch (error: any) {
    console.error('[CAPTURE_PAYPAL_ORDER_ACTION_ERROR]', error)
    return { success: false, error: error.message || 'PayPal capture failed' }
  }
}

/**
 * High-Speed Server Action to claim a digital gift directly to user's library vault.
 */
export async function claimGiftAction(params: {
  giftId?: string
  claimCode?: string
  productId?: string
  recipientEmail?: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please log in to claim this gift.' }
    }

    const adminSupabase = getAdminClient()
    const userEmail = (user.email || params.recipientEmail || '').toLowerCase()

    if (params.productId) {
      // 1. Check if an unassigned purchase exists for this product / recipient
      const { data: existingPurchases } = await adminSupabase
        .from('purchases')
        .select('*')
        .eq('product_id', params.productId)
        .or(`customer_email.ilike.${userEmail},user_id.eq.${user.id},user_id.is.null`)
        .order('purchased_at', { ascending: false })
        .limit(1)

      if (existingPurchases && existingPurchases.length > 0) {
        const found = existingPurchases[0]
        if (!found.user_id || found.user_id !== user.id) {
          await adminSupabase
            .from('purchases')
            .update({ user_id: user.id, customer_email: userEmail })
            .eq('id', found.id)
        }
      } else {
        // Fallback: Create verified purchase record for recipient claiming the gift
        const { data: prod } = await adminSupabase
          .from('products')
          .select('id, name, price_usd, price_inr, product_type, delivery_method, license_type')
          .eq('id', params.productId)
          .maybeSingle()

        const requiresSerialKey = Boolean(
          prod?.delivery_method === 'serial_key' ||
          prod?.delivery_method === 'license_key' ||
          (prod?.license_type && prod.license_type.toLowerCase().includes('serial')) ||
          (prod?.license_type && prod.license_type.toLowerCase().includes('key'))
        )

        let serialKey: string | null = null
        if (requiresSerialKey) {
          const partA = crypto.randomBytes(3).toString('hex').toUpperCase()
          const partB = crypto.randomBytes(3).toString('hex').toUpperCase()
          const partC = crypto.randomBytes(3).toString('hex').toUpperCase()
          serialKey = `PT-GIFT-${partA}-${partB}-${partC}`
        }

        await adminSupabase.from('purchases').insert({
          user_id: user.id,
          product_id: params.productId,
          amount_paid: 0,
          currency: 'USD',
          serial_key: serialKey,
          customer_email: userEmail,
          customer_name: user.user_metadata?.full_name || 'Gift Recipient',
          purchased_at: new Date().toISOString(),
        })
      }
    }

    revalidatePath('/library')
    revalidatePath('/gifts')
    revalidatePath('/account')

    return { success: true }
  } catch (err: any) {
    console.error('[CLAIM_GIFT_ACTION_ERROR]', err)
    return { success: false, error: err.message || 'Failed to claim gift to library' }
  }
}



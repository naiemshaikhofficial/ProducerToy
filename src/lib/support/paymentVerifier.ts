import path from 'path'
import fs from 'fs'

export interface LiveGatewayVerificationResult {
  verified: boolean
  gateway: 'Razorpay' | 'PayPal' | 'Cashfree' | 'Database'
  paymentId?: string
  orderId?: string
  status: 'captured' | 'failed' | 'pending' | 'not_found'
  amount?: number
  currency?: string
  email?: string
  contact?: string
  method?: string
  notes?: Record<string, any>
  createdAt?: string
  errorReason?: string
}

export function getRazorpayCredentials(): { keyId: string | null; keySecret: string | null } {
  let keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null
  let keySecret = process.env.RAZORPAY_KEY_SECRET || null

  if (!keyId || !keySecret) {
    for (const file of ['.env.local', '.env']) {
      try {
        const envPath = path.resolve(process.cwd(), file)
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8')
          const mKey = content.match(/^\s*(?:RAZORPAY_KEY_ID|NEXT_PUBLIC_RAZORPAY_KEY_ID)\s*=\s*(.+)/m)
          if (mKey && mKey[1] && !keyId) keyId = mKey[1].trim().replace(/^['"]|['"]$/g, '')
          const mSec = content.match(/^\s*RAZORPAY_KEY_SECRET\s*=\s*(.+)/m)
          if (mSec && mSec[1] && !keySecret) keySecret = mSec[1].trim().replace(/^['"]|['"]$/g, '')
        }
      } catch (err) {
        console.warn(`[getRazorpayCredentials] Error reading ${file}:`, err)
      }
    }
  }

  return { keyId, keySecret }
}

export function getPayPalCredentials(): { clientId: string | null; clientSecret: string | null; baseUrl: string } {
  let clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || null
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET || null

  if (!clientId || !clientSecret) {
    for (const file of ['.env.local', '.env']) {
      try {
        const envPath = path.resolve(process.cwd(), file)
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8')
          const mId = content.match(/^\s*(?:NEXT_PUBLIC_PAYPAL_CLIENT_ID|PAYPAL_CLIENT_ID)\s*=\s*(.+)/m)
          if (mId && mId[1] && !clientId) clientId = mId[1].trim().replace(/^['"]|['"]$/g, '')
          const mSec = content.match(/^\s*PAYPAL_CLIENT_SECRET\s*=\s*(.+)/m)
          if (mSec && mSec[1] && !clientSecret) clientSecret = mSec[1].trim().replace(/^['"]|['"]$/g, '')
        }
      } catch (err) {
        console.warn(`[getPayPalCredentials] Error reading ${file}:`, err)
      }
    }
  }

  const isLive = clientId ? (!clientId.startsWith('sb-') && !clientId.includes('sandbox')) : true
  const baseUrl = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

  return { clientId, clientSecret, baseUrl }
}

export function getCashfreeCredentials(): { appId: string | null; secretKey: string | null; apiVersion: string; baseUrl: string } {
  let appId = process.env.CASHFREE_APP_ID || null
  let secretKey = process.env.CASHFREE_SECRET_KEY || null
  let apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01'
  let env = process.env.CASHFREE_ENV || 'production'

  if (!appId || !secretKey) {
    for (const file of ['.env.local', '.env']) {
      try {
        const envPath = path.resolve(process.cwd(), file)
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8')
          const mApp = content.match(/^\s*CASHFREE_APP_ID\s*=\s*(.+)/m)
          if (mApp && mApp[1] && !appId) appId = mApp[1].trim().replace(/^['"]|['"]$/g, '')
          const mSec = content.match(/^\s*CASHFREE_SECRET_KEY\s*=\s*(.+)/m)
          if (mSec && mSec[1] && !secretKey) secretKey = mSec[1].trim().replace(/^['"]|['"]$/g, '')
          const mVer = content.match(/^\s*CASHFREE_API_VERSION\s*=\s*(.+)/m)
          if (mVer && mVer[1]) apiVersion = mVer[1].trim().replace(/^['"]|['"]$/g, '')
          const mEnv = content.match(/^\s*CASHFREE_ENV\s*=\s*(.+)/m)
          if (mEnv && mEnv[1]) env = mEnv[1].trim().replace(/^['"]|['"]$/g, '')
        }
      } catch (err) {
        console.warn(`[getCashfreeCredentials] Error reading ${file}:`, err)
      }
    }
  }

  const baseUrl = env === 'sandbox' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg'
  return { appId, secretKey, apiVersion, baseUrl }
}

export async function verifyRazorpayDirect(
  paymentId: string | null,
  email: string | null
): Promise<LiveGatewayVerificationResult | null> {
  const { keyId, keySecret } = getRazorpayCredentials()
  if (!keyId || !keySecret) return null

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const rzpHeaders = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  }

  if (paymentId && (paymentId.startsWith('pay_') || paymentId.length >= 14)) {
    try {
      const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: rzpHeaders,
        cache: 'no-store',
      })
      if (res.ok) {
        const p = await res.json()
        return {
          verified: p.status === 'captured',
          gateway: 'Razorpay',
          paymentId: p.id,
          orderId: p.order_id || undefined,
          status: p.status === 'captured' ? 'captured' : p.status === 'failed' ? 'failed' : 'pending',
          amount: p.amount ? p.amount / 100 : 0,
          currency: p.currency || 'USD',
          email: p.email || undefined,
          contact: p.contact || undefined,
          method: p.method || undefined,
          notes: p.notes || {},
          createdAt: p.created_at ? new Date(p.created_at * 1000).toISOString() : undefined,
          errorReason: p.error_description || p.error_reason || undefined,
        }
      }
    } catch (err) {
      console.warn('[verifyRazorpayDirect] Direct lookup error:', err)
    }
  }

  if (email) {
    try {
      const res = await fetch(`https://api.razorpay.com/v1/payments?count=15`, {
        headers: rzpHeaders,
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        const items = data.items || []
        const cleanEmail = email.toLowerCase().trim()
        const matched = items.find(
          (p: any) =>
            p.email && p.email.toLowerCase().trim() === cleanEmail && p.status === 'captured'
        )
        if (matched) {
          return {
            verified: true,
            gateway: 'Razorpay',
            paymentId: matched.id,
            orderId: matched.order_id || undefined,
            status: 'captured',
            amount: matched.amount ? matched.amount / 100 : 0,
            currency: matched.currency || 'USD',
            email: matched.email || undefined,
            contact: matched.contact || undefined,
            method: matched.method || undefined,
            notes: matched.notes || {},
            createdAt: matched.created_at ? new Date(matched.created_at * 1000).toISOString() : undefined,
          }
        }
        const failedMatch = items.find(
          (p: any) =>
            p.email && p.email.toLowerCase().trim() === cleanEmail && p.status === 'failed'
        )
        if (failedMatch) {
          return {
            verified: false,
            gateway: 'Razorpay',
            paymentId: failedMatch.id,
            status: 'failed',
            amount: failedMatch.amount ? failedMatch.amount / 100 : 0,
            currency: failedMatch.currency || 'USD',
            email: failedMatch.email || undefined,
            errorReason: failedMatch.error_description || failedMatch.error_reason || 'Bank or payment network declined',
          }
        }
      }
    } catch (err) {
      console.warn('[verifyRazorpayDirect] Email search error:', err)
    }
  }

  return null
}

export async function verifyPayPalDirect(
  paymentIdOrOrderId: string | null,
  email: string | null
): Promise<LiveGatewayVerificationResult | null> {
  const { clientId, clientSecret, baseUrl } = getPayPalCredentials()
  if (!clientId || !clientSecret) return null

  let accessToken: string | null = null
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      accessToken = data.access_token
    }
  } catch (err) {
    console.warn('[verifyPayPalDirect] OAuth Token error:', err)
  }

  if (!accessToken) return null

  const ppHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }

  if (paymentIdOrOrderId) {
    const cleanId = paymentIdOrOrderId.trim()
    try {
      const res = await fetch(`${baseUrl}/v2/checkout/orders/${cleanId}`, {
        headers: ppHeaders,
        cache: 'no-store',
      })
      if (res.ok) {
        const order = await res.json()
        const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
        const payerEmail = order.payer?.email_address
        const status = order.status
        const isCaptured = status === 'COMPLETED' || capture?.status === 'COMPLETED'
        const amountVal = Number(capture?.amount?.value || order.purchase_units?.[0]?.amount?.value || 0)
        const currencyVal = capture?.amount?.currency_code || order.purchase_units?.[0]?.amount?.currency_code || 'USD'

        return {
          verified: isCaptured,
          gateway: 'PayPal',
          paymentId: capture?.id || cleanId,
          orderId: order.id,
          status: isCaptured ? 'captured' : status === 'VOIDED' ? 'failed' : 'pending',
          amount: amountVal,
          currency: currencyVal,
          email: payerEmail || undefined,
          createdAt: order.create_time || undefined,
        }
      }
    } catch (err) {
      console.warn('[verifyPayPalDirect] Order lookup error:', err)
    }

    try {
      const res = await fetch(`${baseUrl}/v2/payments/captures/${cleanId}`, {
        headers: ppHeaders,
        cache: 'no-store',
      })
      if (res.ok) {
        const cap = await res.json()
        const isCaptured = cap.status === 'COMPLETED'
        return {
          verified: isCaptured,
          gateway: 'PayPal',
          paymentId: cap.id,
          status: isCaptured ? 'captured' : cap.status === 'DECLINED' ? 'failed' : 'pending',
          amount: Number(cap.amount?.value || 0),
          currency: cap.amount?.currency_code || 'USD',
          createdAt: cap.create_time || undefined,
        }
      }
    } catch (err) {
      console.warn('[verifyPayPalDirect] Capture lookup error:', err)
    }
  }

  return null
}

export async function verifyCashfreeDirect(
  orderIdOrPaymentId: string | null,
  email: string | null
): Promise<LiveGatewayVerificationResult | null> {
  const { appId, secretKey, apiVersion, baseUrl } = getCashfreeCredentials()
  if (!appId || !secretKey) return null

  const cfHeaders = {
    'x-client-id': appId,
    'x-client-secret': secretKey,
    'x-api-version': apiVersion,
    'Content-Type': 'application/json',
  }

  if (orderIdOrPaymentId) {
    const cleanId = orderIdOrPaymentId.trim()
    try {
      const res = await fetch(`${baseUrl}/orders/${cleanId}`, {
        headers: cfHeaders,
        cache: 'no-store',
      })
      if (res.ok) {
        const order = await res.json()
        const isPaid = order.order_status === 'PAID'
        const isFailed = order.order_status === 'EXPIRED' || order.order_status === 'TERMINATED'

        return {
          verified: isPaid,
          gateway: 'Cashfree',
          orderId: order.order_id,
          paymentId: order.cf_order_id ? String(order.cf_order_id) : undefined,
          status: isPaid ? 'captured' : isFailed ? 'failed' : 'pending',
          amount: Number(order.order_amount || 0),
          currency: order.order_currency || 'INR',
          email: order.customer_details?.customer_email || undefined,
          contact: order.customer_details?.customer_phone || undefined,
          createdAt: order.created_at || undefined,
        }
      }
    } catch (err) {
      console.warn('[verifyCashfreeDirect] Order lookup error:', err)
    }
  }

  return null
}

export async function verifyMultiGatewayDirect(
  paymentOrOrderId: string | null,
  email: string | null,
  rawQuery?: string
): Promise<LiveGatewayVerificationResult | null> {
  const id = paymentOrOrderId?.trim() || null
  const cleanEmail = email?.trim() || null
  const q = (rawQuery || '').toLowerCase()

  if (id) {
    if (id.startsWith('pay_')) {
      const rzpRes = await verifyRazorpayDirect(id, cleanEmail)
      if (rzpRes) return rzpRes
    }
    if (id.startsWith('PAYID-') || /^[0-9A-Z]{17}$/.test(id)) {
      const ppRes = await verifyPayPalDirect(id, cleanEmail)
      if (ppRes) return ppRes
    }
    if (/^cf_|^CF_|order_/i.test(id)) {
      const cfRes = await verifyCashfreeDirect(id, cleanEmail)
      if (cfRes) return cfRes
    }
  }

  if (q.includes('paypal')) {
    const pp = await verifyPayPalDirect(id, cleanEmail)
    if (pp) return pp
  }
  if (q.includes('cashfree')) {
    const cf = await verifyCashfreeDirect(id, cleanEmail)
    if (cf) return cf
  }
  if (q.includes('razorpay')) {
    const rzp = await verifyRazorpayDirect(id, cleanEmail)
    if (rzp) return rzp
  }

  if (id) {
    const [rzpRes, ppRes, cfRes] = await Promise.allSettled([
      verifyRazorpayDirect(id, cleanEmail),
      verifyPayPalDirect(id, cleanEmail),
      verifyCashfreeDirect(id, cleanEmail),
    ])

    if (rzpRes.status === 'fulfilled' && rzpRes.value) return rzpRes.value
    if (ppRes.status === 'fulfilled' && ppRes.value) return ppRes.value
    if (cfRes.status === 'fulfilled' && cfRes.value) return cfRes.value
  } else if (cleanEmail) {
    const rzpRes = await verifyRazorpayDirect(null, cleanEmail)
    if (rzpRes) return rzpRes
  }

  return null
}

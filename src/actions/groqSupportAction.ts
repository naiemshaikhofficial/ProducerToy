'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { signDownloadToken } from '@/lib/security'
import fs from 'fs'
import path from 'path'

function getGroqApiKey(): string | null {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    return process.env.GROQ_API_KEY.trim()
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const match = content.match(/GROQ_API_KEY\s*=\s*(.+)/)
      if (match && match[1]) {
        const val = match[1].trim().replace(/^['"]|['"]$/g, '')
        process.env.GROQ_API_KEY = val
        return val
      }
    }
  } catch (err) {
    console.warn('[getGroqApiKey] Error reading .env.local:', err)
  }
  return null
}

function ensureSupabaseAdminEnv() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const mUrl = content.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)/)
      if (mUrl && mUrl[1]) process.env.NEXT_PUBLIC_SUPABASE_URL = mUrl[1].trim().replace(/^['"]|['"]$/g, '')
      const mKey = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.+)/)
      if (mKey && mKey[1]) process.env.SUPABASE_SERVICE_ROLE_KEY = mKey[1].trim().replace(/^['"]|['"]$/g, '')
    }
  } catch (err) {
    console.warn('[ensureSupabaseAdminEnv] Error reading .env.local:', err)
  }
}

function getRazorpayCredentials(): { keyId: string | null; keySecret: string | null } {
  let keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null
  let keySecret = process.env.RAZORPAY_KEY_SECRET || null

  if (!keyId || !keySecret) {
    try {
      const envPath = path.resolve(process.cwd(), '.env.local')
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        const mKey = content.match(/(?:RAZORPAY_KEY_ID|NEXT_PUBLIC_RAZORPAY_KEY_ID)\s*=\s*(.+)/)
        if (mKey && mKey[1]) keyId = mKey[1].trim().replace(/^['"]|['"]$/g, '')
        const mSec = content.match(/RAZORPAY_KEY_SECRET\s*=\s*(.+)/)
        if (mSec && mSec[1]) keySecret = mSec[1].trim().replace(/^['"]|['"]$/g, '')
      }
    } catch (err) {
      console.warn('[getRazorpayCredentials] Error reading .env.local:', err)
    }
  }

  return { keyId, keySecret }
}

interface RazorpayVerificationResult {
  verified: boolean
  paymentId?: string
  status?: string
  amount?: number
  currency?: string
  email?: string
  contact?: string
  method?: string
  notes?: Record<string, any>
  createdAt?: string
  errorReason?: string
}

async function verifyRazorpayDirect(
  paymentId: string | null,
  email: string | null
): Promise<RazorpayVerificationResult | null> {
  const { keyId, keySecret } = getRazorpayCredentials()
  if (!keyId || !keySecret) return null

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const rzpHeaders = {
    Authorization: `Basic ${basicAuth}`,
    'Content-Type': 'application/json',
  }

  // 1. Direct Lookup by Payment ID (pay_...)
  if (paymentId) {
    try {
      const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: rzpHeaders,
        cache: 'no-store',
      })
      if (res.ok) {
        const p = await res.json()
        return {
          verified: p.status === 'captured',
          paymentId: p.id,
          status: p.status,
          amount: p.amount ? p.amount / 100 : 0,
          currency: p.currency || 'INR',
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

  // 2. Lookup recent payments by Email if customer reports missing purchase
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
            paymentId: matched.id,
            status: matched.status,
            amount: matched.amount ? matched.amount / 100 : 0,
            currency: matched.currency || 'INR',
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
            paymentId: failedMatch.id,
            status: failedMatch.status,
            amount: failedMatch.amount ? failedMatch.amount / 100 : 0,
            currency: failedMatch.currency || 'INR',
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

export interface RecommendedProduct {
  id: string
  name: string
  slug: string
  cover_image: string
  price_usd: number
  original_price_usd?: number | null
  product_type: string
  short_description?: string | null
}

export interface ComingSoonProduct {
  id: string
  name: string
  slug: string
  cover_image: string
  price_usd: number
  release_date?: string | null
  short_description?: string | null
}

export interface VerifiedDownload {
  productId: string
  productName: string
  productSlug: string
  coverImage?: string
  downloadUrl: string
  productType: string
  fileSize?: string
  orderNumber?: string
  isProvisioned?: boolean
}

export interface VerifiedOrderItem {
  id: string
  name: string
  price: number
  product_type?: string
  cover_image?: string
}

export interface VerifiedOrder {
  orderNumber: string
  date: string
  amount: number
  currency: string
  status: string
  gateway?: string
  paymentId?: string
  items: VerifiedOrderItem[]
  customerEmail?: string
  customerName?: string
  billingAddress?: string | null
  billingCity?: string | null
  billingState?: string | null
  billingZip?: string | null
  billingCountry?: string | null
}

interface ChatMessageInput {
  role: 'user' | 'assistant'
  content: string
}

export interface GroqResponse {
  success: boolean
  answer?: string
  error?: string
  recommendedProducts?: RecommendedProduct[]
  verifiedDownload?: VerifiedDownload | null
  verifiedOrder?: VerifiedOrder | null
  comingSoonProduct?: ComingSoonProduct | null
  canEscalateToTicket?: boolean
  isPolicyViolation?: boolean
  shouldTerminateChat?: boolean
  hasTroubleshootingSolution?: boolean
}

export interface ClientUserInfo {
  id?: string
  email?: string
  name?: string
}

export async function askGroqSupportAction(
  query: string,
  history: ChatMessageInput[] = [],
  clientUser?: ClientUserInfo,
  currentStrikes: number = 0
): Promise<GroqResponse> {
  try {
    ensureSupabaseAdminEnv()
    const apiKey = getGroqApiKey()

  if (!apiKey) {
    return {
      success: false,
      error: 'Support service currently unavailable.',
    }
  }

  const adminSupabase = getAdminClient()

  // 1. Determine Current User Session (Check client auth context first, then cookies)
  let currentUser: any = null
  let userEmail: string | null = clientUser?.email ? clientUser.email.toLowerCase().trim() : null
  let userId: string | null = clientUser?.id || null
  let userName: string = clientUser?.name || 'Producer'

  if (!userId || !userEmail) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        currentUser = user
        userId = userId || user.id
        userEmail = userEmail || (user.email ? user.email.toLowerCase().trim() : null)
        userName = userName !== 'Producer' ? userName : (user.user_metadata?.full_name || user.email?.split('@')[0] || 'Producer')
      }
    } catch (authErr) {
      console.warn('[askGroqSupportAction] Auth check notice:', authErr)
    }
  }

  // 2. Extract potential entities from query or chat history (Order IDs, Payment IDs, emails)
  const fullTextToScan = `${query} ${history.map((h) => h.content).join(' ')}`
  const orderNumberMatch = fullTextToScan.match(/\bPT-ORD-[A-Za-z0-9_-]+\b/i) || fullTextToScan.match(/\bORD-[A-Za-z0-9_-]+\b/i)
  const paymentIdMatch = fullTextToScan.match(/\bpay_[A-Za-z0-9]+\b/i)
  const emailMatch = fullTextToScan.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i)

  const scannedOrderNumber = orderNumberMatch ? orderNumberMatch[0].toUpperCase() : null
  const scannedPaymentId = paymentIdMatch ? paymentIdMatch[0] : null
  const scannedEmail = emailMatch ? emailMatch[0].toLowerCase().trim() : null

  const targetEmail = userEmail || scannedEmail

  // 3. Fetch Live Products Catalog from Supabase (Full specs + is_coming_soon)
  let liveInventoryList = ''
  let allProducts: any[] = []

  try {
    const { data: dbProducts } = await adminSupabase
      .from('products')
      .select('id, name, slug, cover_image, price_usd, original_price_usd, product_type, short_description, bpm, vst_format, file_size, is_coming_soon, release_date')
      .eq('is_active', true)
      .limit(60)

    if (dbProducts && dbProducts.length > 0) {
      allProducts = dbProducts
      liveInventoryList = dbProducts
        .map((p) => {
          const price = p.price_usd ? `$${p.price_usd}` : 'Free'
          const desc = p.short_description ? ` - ${p.short_description}` : ''
          const bpmInfo = (p.bpm && !p.is_coming_soon) ? ` [${p.bpm} BPM]` : (p.is_coming_soon ? ' [BPM: NOT YET ANNOUNCED - IN AUDIO MASTERING]' : '')
          const sizeInfo = p.file_size ? ` [${p.file_size}]` : ''
          const statusInfo = p.is_coming_soon ? ' [STATUS: COMING SOON - NOT YET RELEASED / CANNOT BE PURCHASED YET]' : ' [STATUS: AVAILABLE FOR INSTANT PURCHASE]'
          return `- [${p.name}](/p/${p.slug}) (${price}, ${p.product_type})${statusInfo}${bpmInfo}${sizeInfo}${desc}`
        })
        .join('\n')
    }
  } catch (dbErr) {
    console.warn('[askGroqSupportAction] Failed to query products from DB:', dbErr)
  }

  // 4. Fetch User Purchases and Orders with Admin Privileges
  let userPurchases: any[] = []
  let userOrders: any[] = []
  let matchedSpecificOrder: any = null

  try {
    // A. Query Purchases
    if (userId || targetEmail) {
      let pQuery = adminSupabase
        .from('purchases')
        .select('*, products(id, name, slug, cover_image, product_type, price_usd, download_url, download_url_win, download_url_mac)')

      if (userId) {
        pQuery = pQuery.eq('user_id', userId)
      } else if (targetEmail) {
        pQuery = pQuery.ilike('customer_email', targetEmail)
      }

      const { data: pData } = await pQuery.order('purchased_at', { ascending: false }).limit(20)
      if (pData) userPurchases = pData
    }

    // B. Query Orders
    let oQuery = adminSupabase.from('orders').select('*')
    if (userId && targetEmail) {
      oQuery = oQuery.or(`user_id.eq.${userId},customer_email.eq.${targetEmail}`)
    } else if (userId) {
      oQuery = oQuery.eq('user_id', userId)
    } else if (targetEmail) {
      oQuery = oQuery.ilike('customer_email', targetEmail)
    }

    if (userId || targetEmail) {
      const { data: oData } = await oQuery.order('created_at', { ascending: false }).limit(10)
      if (oData) userOrders = oData
    }

    // C. Search specifically if an explicit Order ID or Payment ID was provided
    if (scannedOrderNumber || scannedPaymentId) {
      let specificQuery = adminSupabase.from('orders').select('*')
      if (scannedOrderNumber && scannedPaymentId) {
        specificQuery = specificQuery.or(`order_number.ilike.${scannedOrderNumber},razorpay_payment_id.eq.${scannedPaymentId}`)
      } else if (scannedOrderNumber) {
        specificQuery = specificQuery.ilike('order_number', scannedOrderNumber)
      } else if (scannedPaymentId) {
        specificQuery = specificQuery.eq('razorpay_payment_id', scannedPaymentId)
      }

      const { data: specOrders } = await specificQuery.maybeSingle()
      if (specOrders) {
        matchedSpecificOrder = specOrders
        if (!userOrders.some((o) => o.id === specOrders.id)) {
          userOrders.unshift(specOrders)
        }
      }
    }
  } catch (adminErr) {
    console.warn('[askGroqSupportAction] Admin DB lookup error:', adminErr)
  }

  // 5. Intelligent Intent Analysis & Autonomous Administrative Operations
  let verifiedDownload: VerifiedDownload | null = null
  let verifiedOrder: VerifiedOrder | null = null
  let comingSoonProduct: ComingSoonProduct | null = null
  let canEscalateToTicket = false
  let adminActionResultNotes = ''

  const queryLower = query.toLowerCase()
  const isDownloadIssue =
    queryLower.includes('download') ||
    queryLower.includes('file nahi') ||
    queryLower.includes('broken') ||
    queryLower.includes('link') ||
    queryLower.includes('button') ||
    queryLower.includes('nahi mila') ||
    queryLower.includes('not getting') ||
    queryLower.includes('not received') ||
    queryLower.includes('kharida') ||
    queryLower.includes('bought') ||
    queryLower.includes('purchased')

  const isInvoiceIssue =
    queryLower.includes('invoice') ||
    queryLower.includes('receipt') ||
    queryLower.includes('bill') ||
    queryLower.includes('transaction') ||
    queryLower.includes('gst') ||
    queryLower.includes('tax') ||
    queryLower.includes('order details') ||
    queryLower.includes('order number')

  // Common generic words that should never trigger product matching
  const GENERIC_PRODUCT_WORDS = new Set([
    'pack', 'packs', 'sound', 'sounds', 'loop', 'loops', 'free', 'vst', 'vsts',
    'tool', 'tools', 'kit', 'kits', 'drum', 'drums', 'beat', 'beats', 'instrument',
    'instruments', 'sample', 'samples', 'audio', 'music', 'plugin', 'plugins',
    'master', 'like', 'product', 'products', 'item', 'items', 'what', 'dont', 'doesnt'
  ])

  // Find candidate product user is asking about across query AND recent conversation history
  const productSearchText = `${query} ${history.slice(-3).map((h) => h.content).join(' ')}`.toLowerCase()
  let candidateProduct: any = null
  for (const p of allProducts) {
    const nameLower = (p.name || '').toLowerCase()
    const slugLower = (p.slug || '').toLowerCase()

    // 1. Direct match on name or slug
    if (productSearchText.includes(nameLower) || productSearchText.includes(slugLower)) {
      candidateProduct = p
      break
    }

    // 2. Meaningful keyword matching (individual words of 4+ characters in product name, non-generic)
    const nameWords = nameLower
      .split(/\s+/)
      .filter((w: string) => w.length >= 4 && !GENERIC_PRODUCT_WORDS.has(w))
    if (nameWords.length > 0 && nameWords.some((w: string) => productSearchText.includes(w))) {
      candidateProduct = p
      break
    }
  }

  // A. Check Coming Soon Products (Works dynamically for ANY unreleased product in database)
  if (candidateProduct && candidateProduct.is_coming_soon) {
    comingSoonProduct = {
      id: candidateProduct.id,
      name: candidateProduct.name,
      slug: candidateProduct.slug,
      cover_image: candidateProduct.cover_image || '',
      price_usd: Number(candidateProduct.price_usd || 0),
      release_date: candidateProduct.release_date || null,
      short_description: candidateProduct.short_description || null,
    }

    const approxInr = Math.round((candidateProduct.price_usd || 19.99) * 86)

    adminActionResultNotes += `\n[ADMIN CATALOG NOTICE: PRODUCT IS COMING SOON]:
"${candidateProduct.name}" is marked as COMING SOON in our database. It has NOT been released yet and CANNOT be purchased right now.
EXACT INSTRUCTION:
- State clearly and respectfully that "${candidateProduct.name}" has not officially released yet; it is in final audio mastering and will drop very soon!
- If the user asked about price in INR (e.g. "indian rupees mai kitna hoga"), state the launch price: $${candidateProduct.price_usd} USD (approx ₹${approxInr} INR at ~₹85-87/USD, processed via Razorpay/UPI/Cards).
- That is why checkout / purchase button is not active yet.
- NEVER tell the user to add it to cart, proceed to checkout, or retry payment for a Coming Soon pack.
- Reassure them that a "Drop Alert / Notify Me" card has been generated right below this response so they can subscribe to get notified the second it drops!`
  }

  // B. Autonomous Download & Payment Verification Handler (for released products)
  else if (isDownloadIssue || (candidateProduct && !candidateProduct.is_coming_soon)) {
    const primaryOrder = matchedSpecificOrder || userOrders[0] || null

    if (!candidateProduct && primaryOrder && Array.isArray(primaryOrder.items) && primaryOrder.items.length > 0) {
      const firstItem = primaryOrder.items[0]
      candidateProduct = allProducts.find((p) => p.id === firstItem.id || p.slug === firstItem.slug) || {
        id: firstItem.id,
        name: firstItem.name,
        slug: firstItem.slug || 'product',
        product_type: firstItem.product_type || 'sample_pack',
        cover_image: firstItem.cover_image,
      }
    }

    if (candidateProduct && !candidateProduct.is_coming_soon) {
      let ownedPurchase = userPurchases.find(
        (pur) => pur.product_id === candidateProduct.id || pur.products?.slug === candidateProduct.slug
      )

      let orderHasProduct =
        primaryOrder &&
        (primaryOrder.payment_status === 'completed' || primaryOrder.payment_status === 'paid') &&
        (Array.isArray(primaryOrder.items) &&
          primaryOrder.items.some((it: any) => it.id === candidateProduct.id || it.name?.toLowerCase().includes(candidateProduct.name.toLowerCase())))

      const isFreeProduct = Number(candidateProduct.price_usd || 0) <= 0

      // If not found in DB, check live Razorpay payment gateway directly
      if (!ownedPurchase && !orderHasProduct && !isFreeProduct) {
        const rzpResult = await verifyRazorpayDirect(scannedPaymentId, targetEmail)
        if (rzpResult && rzpResult.verified) {
          try {
            await adminSupabase.from('purchases').insert({
              user_id: userId || 'verified-customer',
              product_id: candidateProduct.id,
              customer_email: targetEmail || rzpResult.email,
              amount_paid: rzpResult.amount || candidateProduct.price_usd || 0,
              currency: rzpResult.currency || 'INR',
              order_id: `PT-RZP-${(rzpResult.paymentId || 'DIRECT').slice(-8).toUpperCase()}`,
              razorpay_payment_id: rzpResult.paymentId || null,
              purchased_at: rzpResult.createdAt || new Date().toISOString(),
            })
            ownedPurchase = {
              product_id: candidateProduct.id,
              products: candidateProduct,
              amount_paid: rzpResult.amount,
              currency: rzpResult.currency,
              razorpay_payment_id: rzpResult.paymentId,
            }
            orderHasProduct = true
            adminActionResultNotes += `\n[LIVE RAZORPAY VERIFICATION SUCCESS]: Real payment confirmed directly on Razorpay gateway (Payment ID: ${rzpResult.paymentId}, Status: CAPTURED, Amount: ${rzpResult.currency} ${rzpResult.amount}). License has been activated in the database and secure download is generated below.`
          } catch (autoProvErr) {
            console.warn('[askGroqSupportAction] Live Razorpay auto-provision warning:', autoProvErr)
          }
        } else if (rzpResult && rzpResult.status === 'failed') {
          adminActionResultNotes += `\n[LIVE RAZORPAY RECORD - PAYMENT FAILED]: Real payment record found on Razorpay (Payment ID: ${rzpResult.paymentId}), but status is FAILED. Error reason: "${rzpResult.errorReason}". Explain honestly to the user that the bank transaction failed and no funds were credited to Producer Toy. If their bank debited money, it will auto-reverse within 3–5 business days.`
        }
      }

      if (ownedPurchase || orderHasProduct || isFreeProduct) {
        if (orderHasProduct && !ownedPurchase && (userId || primaryOrder?.user_id)) {
          try {
            await adminSupabase.from('purchases').insert({
              user_id: userId || primaryOrder.user_id,
              product_id: candidateProduct.id,
              customer_email: targetEmail || primaryOrder.customer_email,
              amount_paid: candidateProduct.price_usd || 0,
              currency: primaryOrder.currency || 'USD',
              order_id: primaryOrder.id || primaryOrder.order_number,
              razorpay_order_id: primaryOrder.razorpay_order_id || null,
              razorpay_payment_id: primaryOrder.razorpay_payment_id || null,
              purchased_at: new Date().toISOString(),
            })
          } catch (provErr) {
            console.warn('[askGroqSupportAction] Auto-provision warning:', provErr)
          }
        }

        const headerList = await headers()
        const rawIp =
          headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          headerList.get('x-real-ip') ||
          '127.0.0.1'

        const downloadToken = signDownloadToken(
          {
            uid: userId || primaryOrder?.user_id || 'verified-customer',
            pid: candidateProduct.id,
            type: candidateProduct.product_type || 'sample_pack',
            platform: 'all',
            ip: rawIp,
          },
          300
        )

        verifiedDownload = {
          productId: candidateProduct.id,
          productName: candidateProduct.name,
          productSlug: candidateProduct.slug,
          coverImage: candidateProduct.cover_image || '/images/products/placeholder.png',
          downloadUrl: `/api/download/${downloadToken}`,
          productType: candidateProduct.product_type || 'sample_pack',
          fileSize: candidateProduct.file_size || 'Studio Master Archive',
          orderNumber: primaryOrder?.order_number,
          isProvisioned: true,
        }

        if (!adminActionResultNotes.includes('[LIVE RAZORPAY VERIFICATION SUCCESS]')) {
          adminActionResultNotes += `\n[ADMIN VERIFICATION SUCCESS]: User purchase/payment confirmed for "${candidateProduct.name}". Fresh secure CDN download link generated: ${verifiedDownload.downloadUrl}. Inform the user that payment has been verified in the database, license is active, and they can click the direct Download button provided below.`
        }
      } else {
        if (primaryOrder && primaryOrder.payment_status !== 'completed') {
          adminActionResultNotes += `\n[ADMIN RECORD FOUND]: Order #${primaryOrder.order_number} has payment_status: "${primaryOrder.payment_status}". Payment was not completed. Explain politely that no money was settled, and if bank deducted funds, banks auto-reverse within 3-5 days.`
          canEscalateToTicket = true
        } else {
          adminActionResultNotes += `\n[ADMIN RECORD NOTICE - NO PAYMENT FOUND]: Checked both database and live Razorpay payment gateway for account "${targetEmail || 'user'}". No completed or captured payment was found. Ask the user for their exact Razorpay Payment ID (starts with pay_..., found in their UPI app or bank statement) so we can look it up directly. STRICT RULE: DO NOT fake payment confirmation, and DO NOT tell the user we added it to their account without a verified payment!`
          canEscalateToTicket = true
        }
      }
    }
  }

  // C. Autonomous Invoice & Transaction Handler
  if (isInvoiceIssue || scannedOrderNumber || scannedPaymentId) {
    const orderToUse = matchedSpecificOrder || userOrders[0] || null

    if (orderToUse) {
      const itemsList: VerifiedOrderItem[] = Array.isArray(orderToUse.items)
        ? orderToUse.items.map((it: any) => ({
            id: it.id,
            name: it.name,
            price: Number(it.price || 0),
            product_type: it.product_type,
            cover_image: it.cover_image,
          }))
        : []

      verifiedOrder = {
        orderNumber: orderToUse.order_number,
        date: orderToUse.created_at,
        amount: Number(orderToUse.total_amount || 0),
        currency: orderToUse.currency || 'USD',
        status: orderToUse.payment_status || 'completed',
        gateway: orderToUse.payment_gateway || 'Razorpay',
        paymentId: orderToUse.razorpay_payment_id || orderToUse.razorpay_order_id || orderToUse.id,
        items: itemsList,
        customerEmail: orderToUse.customer_email || targetEmail || undefined,
        customerName: orderToUse.customer_name || userName || 'Producer',
        billingAddress: orderToUse.billing_address,
        billingCity: orderToUse.billing_city,
        billingState: orderToUse.billing_state,
        billingZip: orderToUse.billing_zip,
        billingCountry: orderToUse.billing_country,
      }

      adminActionResultNotes += `\n[ADMIN INVOICE FOUND]: Official Order #${orderToUse.order_number} found. Date: ${new Date(orderToUse.created_at).toLocaleDateString()}, Total: ${orderToUse.currency || '$'}${orderToUse.total_amount}, Payment Status: ${orderToUse.payment_status}, Payment Gateway: ${orderToUse.payment_gateway}, Transaction ID: ${verifiedOrder.paymentId}. Provide exact summary and state that the official tax invoice is available right below.`
    } else {
      adminActionResultNotes += `\n[ADMIN NOTICE]: No orders found matching this inquiry. Politely ask the user for their Order ID or payment email, or let them know they can view transactions at [Billing & Transactions](/account?tab=transactions).`
      canEscalateToTicket = true
    }
  }

  // Build User Context String for LLM
  const isUserLoggedIn = Boolean(userEmail || userId)
  const userAccountSummary = `
USER SESSION & DATABASE STATUS:
- Logged-in User: ${isUserLoggedIn ? `YES (Logged in as ${userName} <${userEmail}>)` : 'Guest / Not Logged In'}
- Account Purchases: ${userPurchases.length > 0 ? `${userPurchases.length} items (${userPurchases.map((p) => p.products?.name || p.product_id).join(', ')})` : '0 purchases recorded'}
- Recent Orders: ${userOrders.length > 0 ? userOrders.map((o) => `[Order #${o.order_number} | Status: ${o.payment_status} | Amount: ${o.currency || '$'}${o.total_amount}]`).join(', ') : 'No recent orders recorded'}
${adminActionResultNotes}`

  // 6. Comprehensive System Prompt
  const systemPrompt = `You are the official "Producer Toy Technical Support Specialist", an expert audio engineer and senior administrative specialist for Producer Toy (producertoy.com) — the premier international marketplace for music producers and sound designers.

CRITICAL IDENTITY & PRIVACY RULES:
- You are exclusively the internal technical support specialist of Producer Toy with full administrative access to store records, orders, invoices, and cloud audio delivery systems.
- NEVER mention "Groq", "Llama", "Qwen", "OpenAI", "ChatGPT", "Meta", or any third-party AI provider or LLM under any circumstances.
- NEVER mention or output technical database IDs, internal UUIDs, or User IDs (e.g. any long hexadecimal string like 86e854f5...). Only refer to the user by their name (${userName}) or email (${userEmail}).
- DATA PROTECTION & CONFIDENTIALITY: Never disclose internal sales numbers, revenue stats, or backend analytics to users. If the user has 0 orders, state politely that no previous purchases were found under their account. NEVER output phrases like "many producers" or invent purchase statistics.
- ZERO FAKE CLAIMS & PAYMENT VERIFICATION: NEVER tell the user "we verified your payment and added it to your account" unless payment is genuinely confirmed and verified in our database or live Razorpay gateway! If no verified payment exists, politely ask them for their Razorpay Payment ID (starts with pay_...) so we can search the gateway directly.
- ACCURACY GUARANTEE: Never hallucinate BPM, sample counts, formats, or product availability not in the verified store inventory below.
- If asked who is answering or how you operate, respond that you are the official Producer Toy Technical Support Desk powered by Producer Toy's internal audio engineering knowledge base.
- Speak in a polite, highly knowledgeable, and human-like technical tone.

${userAccountSummary}

CRITICAL USER SESSION RULES:
${isUserLoggedIn ? `- The user IS ALREADY LOGGED IN as ${userName} (${userEmail}). NEVER tell them they are in guest mode, NEVER tell them to log in, and NEVER tell them to create an account.` : `- The user is currently browsing as a guest.`}

LIVE PRODUCER TOY STORE INVENTORY (QUERY RESULT FROM DATABASE):
${liveInventoryList || `- [Tabla Master's](/p/tabla-masters) ($19.99, sample_pack) [STATUS: COMING SOON - NOT YET RELEASED / CANNOT BE PURCHASED YET] [BPM: NOT YET ANNOUNCED - IN AUDIO MASTERING] - Authentic Indian tabla sample pack featuring professionally recorded dry & processed hits, loops, and rolls.
- [Sexy Drill](/p/sexy-drill) ($9.99, sample_pack) [STATUS: COMING SOON - NOT YET RELEASED / CANNOT BE PURCHASED YET] [BPM: NOT YET ANNOUNCED - IN AUDIO MASTERING] - Chart-topping UK & NY Drill drum kit, sliding 808s, and dark melody loops.`}

CRITICAL PLATFORM KNOWLEDGE:
1. SISTER COMPANIES (PRODUCER TOY & SAMPLESWALA):
   - Producer Toy (producertoy.com) and SamplesWala (sampleswala.com) are SISTER COMPANIES founded by the same core team!
   - SamplesWala is India's dedicated sound library platform specializing in Indian/Bollywood/Desi sample packs, acoustic instruments (Tabla, Dholak, Harmonium, Bansuri flute), vocal toolkits, and FL Studio templates in Indian Rupees (INR ₹).
   - Producer Toy is the premier international marketplace for global beatmakers and music producers, specializing in international sound libraries, VST plugins, mixing toolkits, and software in USD ($) and multi-currency.
   - If a user asks "what is SamplesWala", "SamplesWala kya hai", or asks about Indian instruments not on Producer Toy: proudly explain that SamplesWala is our sister platform, and direct them to [SamplesWala](https://sampleswala.com)!

2. CREATOR & DEVELOPER DISTRIBUTION PROGRAM (/distribute):
   - Creators, sound designers, and audio developers can distribute and sell their sound packs, plugins, presets, and MIDI kits on Producer Toy.
   - 88% Revenue Split: Creators keep 88% of all revenue generated from their products (the highest split in the audio industry). Zero upfront or listing fees.
   - Global Distribution: Products reach creators in 100+ countries with local currency pricing, multi-region CDN download infrastructure, and instant payouts.
   - License Protection: Automated license key generation, encrypted file hosting, and verified purchaser accounts.
   - What can be distributed: Sample Packs, Sound Kits, Drum Kits, VST Plugins & Audio FX, Synth Presets (Serum, Vital, Massive, Phase Plant), and MIDI/Melody Kits.
   - How to apply: Visit [Distribute on Producer Toy](/distribute) or apply directly at [Apply to Distribute](/contact?topic=distribute).

3. BRANDS & AUDIO DEVELOPERS (/manufacturers):
   - Producer Toy features over 200+ world-class audio plugin manufacturers and developers, including FabFilter, Arturia, IK Multimedia, Native Instruments, Brainworx, D16 Group, Devious Machines, Reveal Sound, Image Line, Slate Digital, Rob Papen, and many more.
   - Users can browse all manufacturer catalogs at [Manufacturers & Brands](/manufacturers).

4. COMING SOON PRODUCTS & STORE STATUS:
   - "Tabla Master's" and "Sexy Drill" are currently in our COMING SOON lineup in final audio mastering. They CANNOT be purchased yet; checkout is temporarily closed for them until their official release.
   - If asked why they cannot buy or checkout: state clearly that the pack is in final mastering and will drop very soon!
   - Drop Alert card is provided below so users can subscribe to be notified the second it drops.

5. CURRENCY & INR (INDIAN RUPEES) PRICING RULE:
   - Official store prices are listed in US Dollars (USD $).
   - When a user asks "indian rupees me kitna hoga", "INR price kya hai", or asks for Indian currency conversion:
     - Calculate the approximate INR equivalent using standard bank exchange rate (~₹85 to ₹87 per $1 USD). For example, $19.99 USD is approx ₹1,650 to ₹1,750 INR.
     - Explain that transactions are processed securely via Razorpay (supporting UPI, Google Pay, PhonePe, Paytm, Indian Debit/Credit Cards, NetBanking across all Indian banks) at checkout.
     - Check the product status: If the product is COMING SOON (like Tabla Master's or Sexy Drill), explicitly remind the user that it is in final mastering and checkout will open as soon as it launches!

6. GENUINE RULE FOR FREE PRODUCTS / FREE PLUGINS INQUIRIES:
   - Producer Toy currently does NOT have 100% free products or free VST plugins in the database/store catalog. All current sound releases are commercial master archives.
   - NEVER hallucinate free plugins. Politely invite them to explore our master releases at [Producer Toy Store](/store).

7. STRICT SCOPE & RELEVANCE:
   - Only answer queries related to music production, sound design, audio engineering, DAW setup, sample packs, VSTs, plugins, orders, licensing, distribution, and our sister company SamplesWala.

CRITICAL RULES FOR AUTONOMOUS ADMINISTRATIVE PROBLEM RESOLUTION:
1. When user asks about a missing file, broken link, or says "payment confirmed but file not received":
   - If [LIVE RAZORPAY VERIFICATION SUCCESS] or [ADMIN VERIFICATION SUCCESS] is reported in status:
     Celebrate and reassure the user! Let them know their payment has been verified directly via the live gateway/database, and their fresh secure download mirror is ready right below this message, plus permanently accessible in [Your Library](/library).
   - If [LIVE RAZORPAY RECORD - PAYMENT FAILED] or [ADMIN RECORD FOUND] with status failed/pending:
     Explain that the bank/gateway marked the transaction as incomplete. If their account was debited, the payment gateway or bank will automatically reverse the charge back to their source account within 3 to 5 business days.
   - If no payment is found:
     Politely explain that no verified payment was recorded on the database or payment gateway for this email. Ask for their Razorpay Payment ID (starts with pay_...) so we can search the gateway directly.
2. When user asks for an Invoice, Bill, or Transaction details:
   - If [ADMIN INVOICE FOUND] is reported:
     Break down the Order Number, Date, Total Amount, Gateway, and Items clearly. Mention that their official, printable International Tax Invoice is attached right below this message.
3. Navigation Links:
   - Mentioning downloads: [Your Library](/library)
   - Store catalog: [Producer Toy Store](/store)
   - Billing & receipts: [Billing & Transactions](/account?tab=transactions)
   - Account settings: [Account Settings](/account)
   - Refund terms: [Refund Policy](/refund-policy)
   - Loyalty rewards: [Toywards Rewards](/features/toywards)
   - Distribution: [Distribute on Producer Toy](/distribute)
   - Brands: [Brands & Manufacturers](/manufacturers)
   - Contact or human desk: [Support Desk](/support)

CRITICAL RULES FOR REFUND, RETURN, OR "DONT LIKE A PRODUCT" INQUIRIES:
- As per Producer Toy's official [Refund Policy](/refund-policy), digital downloads are irrevocable digital goods delivered immediately to the account upon checkout.
- Completed purchases are STRICTLY NON-REFUNDABLE for "change of mind" or subjective dislike once accessed or downloaded.
- Every product page includes playable high-fidelity audio demos so producers can audition before purchasing.
- Refunds or replacements are ONLY provided for verified technical corruptions that cannot be resolved or accidental duplicate purchases.

CRITICAL INAPPROPRIATE / ABUSIVE / VULGAR LANGUAGE & CODE OF CONDUCT:
- Detect abusive language, profanity, swearing, slurs, or dating solicitations in ANY regional language worldwide.
- Start response with [POLICY_VIOLATION].
- STRIKE LEVEL ${currentStrikes + 1} OF 4. Deliver warning in the exact same language and script (use Roman Hinglish if user typed in Latin letters).
- Strike 4: Output [TERMINATE_CHAT].

CRITICAL LANGUAGE MATCHING RULE:
- ALWAYS detect and respond in the EXACT same language and script the user communicates in:
  1. Hinglish (Roman Hindi, e.g. "kitna hoga", "sexy drill buy kyu nahi ho raha"): Always respond in natural, professional Hinglish using Roman letters! Never output Devanagari script if user typed in Roman letters!
  2. Hindi / Devanagari: Only respond in Devanagari if user typed in Devanagari!
  3. English: Respond in fluent, professional English.

CRITICAL FORMATTING INSTRUCTIONS:
- PROPORTIONAL ANSWERS:
  - If user gives a brief greeting or single short query: Reply in 1-3 direct, concise sentences. Do not dump lengthy essays.
  - If user reports an issue or multi-step question: Provide clear step-by-step resolution.
- NO RAW MARKDOWN TABLES: NEVER output raw markdown tables (| Column |). Use clean bold bullet points or numbered lists.
- NEVER use asterisks '*' or bullet dashes '-' at the start of lines.
- When providing instructions, ALWAYS format as clean numbered lists:
  1. **Step Name**: Explanation.
  2. **Step Name**: Explanation.
- Never use markdown heading tags like '###' or '##'.
- Write cleanly and elegantly with bold labels and regular text.`

  // Helper to scrub any accidental engine leaks or stray asterisks from answers
  const scrubBrandNames = (text: string) => {
    if (!text) return ''
    return text
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
      .replace(/^(?:thought|thinking|reasoning|scratchpad):\s*[\s\S]*?\n\n/gi, '')
      .replace(/^The user (?:says|asks|wants)[\s\S]*?(?:We must|So we can|Let's|Therefore|Recommendation:)[\s\S]*?\n\n/i, '')
      .replace(/\bgroq\b/gi, 'Producer Toy')
      .replace(/\bllama\s*3(\.\d+)?\b/gi, 'Producer Toy Support')
      .replace(/\bqwen(\s*\d+(\.\d+)?)?\b/gi, 'Producer Toy Support')
      .replace(/\bopenai\b/gi, 'Producer Toy')
      .replace(/\bchatgpt\b/gi, 'Producer Toy Assistant')
      .replace(/\(User ID:\s*[a-f0-9-]+\)/gi, '')
      .replace(/User ID:\s*[a-f0-9-]+/gi, '')
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '')
      .replace(/\s*\(\s*\d+\s*(?:verified\s+purchases?|downloads?|sales?|orders?|buyers?|community\s+downloads?)\s*\)/gi, '')
      .replace(/^#{1,4}\s+/gm, '') // Remove ### headings
      .replace(/^[\*\-]\s+/gm, '') // Remove stray * or - at start of lines
      .replace(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g, '[$1]($2)') // Strip stars around links
      .replace(/\[POLICY_VIOLATION\]/gi, '')
      .replace(/\[TERMINATE_CHAT\]/gi, '')
      .trim()
  }

  // Helper to extract recommended products from AI response and user query (Excludes Coming Soon products)
  const findMatchedProducts = (text: string): RecommendedProduct[] => {
    const result: RecommendedProduct[] = []
    const textLower = (text || '').toLowerCase()
    const qLower = (query || '').toLowerCase()

    if (allProducts && allProducts.length > 0) {
      for (const p of allProducts) {
        // Never put unreleased Coming Soon products in the purchase recommendation grid
        if (p.is_coming_soon) continue

        const nameLower = (p.name || '').toLowerCase()
        const slugLower = (p.slug || '').toLowerCase()
        const isMatched =
          textLower.includes(nameLower) ||
          textLower.includes(slugLower) ||
          qLower.includes(nameLower) ||
          qLower.includes(slugLower)

        if (isMatched && !result.some((r) => r.id === p.id)) {
          result.push({
            id: p.id,
            name: p.name,
            slug: p.slug,
            cover_image: p.cover_image || '',
            price_usd: Number(p.price_usd || 0),
            original_price_usd: p.original_price_usd ? Number(p.original_price_usd) : null,
            product_type: p.product_type || 'sample_pack',
            short_description: p.short_description || null,
          })
        }
      }
    }
    return result
  }

  const resolveComingSoon = (): ComingSoonProduct | null => {
    if (comingSoonProduct) return comingSoonProduct
    const queryText = (query || '').toLowerCase()
    for (const p of allProducts) {
      if (p.is_coming_soon) {
        const nameLower = (p.name || '').toLowerCase()
        const slugLower = (p.slug || '').toLowerCase()
        const nameWords = nameLower
          .split(/\s+/)
          .filter((w: string) => w.length >= 4 && !GENERIC_PRODUCT_WORDS.has(w))
        if (
          queryText.includes(nameLower) ||
          queryText.includes(slugLower) ||
          (nameWords.length > 0 && nameWords.some((w: string) => queryText.includes(w)))
        ) {
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            cover_image: p.cover_image || '',
            price_usd: Number(p.price_usd || 0),
            release_date: p.release_date || null,
            short_description: p.short_description || null,
          }
        }
      }
    }
    return null
  }

  // Dynamic Smart Token Sizing based on intent & complexity:
  const isComplexQuery =
    /\b(fail|failed|broken|corrupt|not working|urgent|problem|scam|fraud|money cut|refund|stuck|help me|issue|dhokha|paise kat gaye|latency|unzip|extract|download nahi|link nahi|can't download|cant download|deducted|receipt|invoice|bill|gateway|guide|step|how to|kaise|what about)\b/i.test(query)
  const isShortGreeting =
    /^(hi|hello|hey|ok|okay|thanks|thank you|shukriya|dhanyawad|bye|yo|sup|kya haal|cool|great)\b/i.test(query.trim())
  const isSimpleSingleQuestion =
    query.trim().length < 80 && !isComplexQuery && !query.includes('\n')

  let dynamicMaxTokens = 650
  if (isComplexQuery) {
    dynamicMaxTokens = 1400
  } else if (isShortGreeting && query.trim().length < 30) {
    dynamicMaxTokens = 200
  } else if (isSimpleSingleQuestion) {
    dynamicMaxTokens = 450
  }

  // Send up to last 6 messages (3 turns) for rich conversational context
  const compactHistory = history.slice(-6).map((h) => ({
    role: h.role,
    content: h.content.length > 400 ? h.content.slice(0, 400) + '...' : h.content,
  }))

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...compactHistory,
    { role: 'user', content: query },
  ]

  // Multi-Model Auto-Fallback & Token Optimization Hierarchy:
  // 1. Primary: 'qwen/qwen3.8-27b'
  // 2. High-IQ Reasoning Fallback: 'openai/gpt-oss-120b'
  // 3. High-Throughput Fallback: 'openai/gpt-oss-20b'
  // 4. Resilient Fallback: 'llama-3.3-70b-versatile'
  // 5. Ultrafast Fallback: 'llama-3.1-8b-instant'
  const modelsToTry = [
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ]

  let rawAnswer = ''

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: 0.3,
          max_tokens: dynamicMaxTokens,
          reasoning_format: 'hidden',
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const choice = data.choices?.[0]?.message
        // STRICT: Never fall back to reasoning/scratchpad! Only content is customer-facing.
        const candidate = (choice?.content || '').trim()
        if (candidate) {
          rawAnswer = candidate
          break
        }
      } else {
        console.warn(`[askGroqSupportAction] Model ${model} returned HTTP ${response.status}. Trying next fallback...`)
      }
    } catch (modelErr) {
      console.warn(`[askGroqSupportAction] Model ${model} error/timeout:`, modelErr)
    }
  }

  if (!rawAnswer) {
    return {
      success: false,
      error: 'Support desk is currently busy. Please try again.',
    }
  }

  const isPolicyViolation = rawAnswer.includes('[POLICY_VIOLATION]') || rawAnswer.includes('[TERMINATE_CHAT]')
  const shouldTerminateChat = (currentStrikes + 1 >= 4) || rawAnswer.includes('[TERMINATE_CHAT]')
  const cleanedAnswer = scrubBrandNames(
    rawAnswer
      .replace(/\[POLICY_VIOLATION\]/g, '')
      .replace(/\[TERMINATE_CHAT\]/g, '')
      .trim()
  )

  const isTroubleshootingProblemQuery =
    /\b(fail|failed|broken|corrupt|not working|crash|issue|problem|bug|stuck|latency|unzip|extract|download nahi|link nahi|can't download|cant download|deducted|kat gaye|refund|charge|crackling|buffer)\b/i.test(
      query
    )

  const containsResolutionFix =
    /\b(step \d|solution|reversal|auto-reverse|try these steps|follow these instructions|troubleshoot)\b/i.test(
      rawAnswer
    )

  const hasTroubleshootingSolution =
    !isPolicyViolation &&
    !isShortGreeting &&
    (canEscalateToTicket || (isTroubleshootingProblemQuery && containsResolutionFix))

  return {
    success: true,
    answer: cleanedAnswer,
    recommendedProducts: isPolicyViolation ? [] : findMatchedProducts(cleanedAnswer),
    verifiedDownload: isPolicyViolation ? null : verifiedDownload,
    verifiedOrder: isPolicyViolation ? null : verifiedOrder,
    comingSoonProduct: isPolicyViolation ? null : resolveComingSoon(),
    canEscalateToTicket: isPolicyViolation ? false : canEscalateToTicket,
    isPolicyViolation,
    shouldTerminateChat,
    hasTroubleshootingSolution,
  }
  } catch (error: any) {
    console.error('Support Action Exception:', error)
    return {
      success: false,
      error: 'Network error connecting to support desk.',
    }
  }
}

export async function subscribeDropAlertAction(
  email: string,
  productSlug: string,
  productName?: string
) {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' }
    }
    const admin = getAdminClient()
    try {
      await admin.from('drop_alerts').insert({
        email: email.trim().toLowerCase(),
        product_slug: productSlug,
        product_name: productName || productSlug,
        created_at: new Date().toISOString(),
      })
    } catch {
      // Graceful fallback if table is not configured
    }
    return {
      success: true,
      message: `You're on the VIP alert list! We'll email ${email} the moment ${productName || 'this pack'} drops.`,
    }
  } catch (err: any) {
    return { success: true, message: `Notification alert set for ${email}!` }
  }
}

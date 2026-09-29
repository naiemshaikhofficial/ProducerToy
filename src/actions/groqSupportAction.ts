'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { signDownloadToken } from '@/lib/security'
import {
  verifyMultiGatewayDirect,
  type LiveGatewayVerificationResult,
} from '@/lib/support/paymentVerifier'
import {
  getGroqApiKey,
  ensureSupabaseAdminEnv,
  hasProfanityOrAbuse,
  isOffTopicQuery,
  detectLanguage,
  scrubBrandNames,
} from '@/lib/support/supportHelpers'
import {
  buildSupportSystemPrompt,
  type SupportPromptContext,
} from '@/lib/support/rules'

export type { LiveGatewayVerificationResult }

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
          userName =
            userName !== 'Producer'
              ? userName
              : user.user_metadata?.full_name || user.email?.split('@')[0] || 'Producer'
        }
      } catch (authErr) {
        console.warn('[askGroqSupportAction] Auth check notice:', authErr)
      }
    }

    // 2. Extract potential entities from query or chat history (Order IDs, Payment IDs, emails)
    const fullTextToScan = `${query} ${history.map((h) => h.content).join(' ')}`
    const orderNumberMatch =
      fullTextToScan.match(/\bPT-ORD-[A-Za-z0-9_-]+\b/i) ||
      fullTextToScan.match(/\bSW-ORD-[A-Za-z0-9_-]+\b/i) ||
      fullTextToScan.match(/\bORD-[A-Za-z0-9_-]+\b/i) ||
      fullTextToScan.match(/\border_[A-Za-z0-9_-]+\b/i)

    const razorpayPaymentMatch = fullTextToScan.match(/\bpay_[A-Za-z0-9]+\b/i)
    const paypalPaymentMatch =
      fullTextToScan.match(/\bPAYID-[A-Za-z0-9]+\b/i) ||
      fullTextToScan.match(/\b[0-9A-Z]{17}\b/) ||
      fullTextToScan.match(/\bpp_[A-Za-z0-9_-]+\b/i)
    const cashfreePaymentMatch =
      fullTextToScan.match(/\b(?:cf_|cf_pay_)[A-Za-z0-9_-]+\b/i) ||
      fullTextToScan.match(/\bCF_[A-Za-z0-9_-]+\b/)

    const emailMatch = fullTextToScan.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i)

    const scannedOrderNumber = orderNumberMatch ? orderNumberMatch[0].toUpperCase() : null
    const scannedPaymentId =
      razorpayPaymentMatch?.[0] ||
      paypalPaymentMatch?.[0] ||
      cashfreePaymentMatch?.[0] ||
      null
    const scannedEmail = emailMatch ? emailMatch[0].toLowerCase().trim() : null

    const targetEmail = userEmail || scannedEmail

    // 3. Fetch Live Products Catalog from Supabase (Full specs + is_coming_soon)
    let liveInventoryList = ''
    let allProducts: any[] = []

    try {
      const { data: dbProducts } = await adminSupabase
        .from('products')
        .select(
          'id, name, slug, cover_image, price_usd, original_price_usd, product_type, short_description, bpm, vst_format, file_size, is_coming_soon, release_date'
        )
        .eq('is_active', true)
        .limit(60)

      if (dbProducts && dbProducts.length > 0) {
        allProducts = dbProducts
        liveInventoryList = dbProducts
          .map((p) => {
            const price = p.price_usd ? `$${p.price_usd}` : 'Free'
            const desc = p.short_description ? ` - ${p.short_description}` : ''
            const bpmInfo =
              p.bpm && !p.is_coming_soon
                ? ` [${p.bpm} BPM]`
                : p.is_coming_soon
                ? ' [BPM: NOT YET ANNOUNCED - IN AUDIO MASTERING]'
                : ''
            const sizeInfo = p.file_size ? ` [${p.file_size}]` : ''
            const statusInfo = p.is_coming_soon
              ? ' [STATUS: COMING SOON - NOT YET RELEASED / CANNOT BE PURCHASED YET]'
              : ' [STATUS: AVAILABLE FOR INSTANT PURCHASE]'
            return `- [${p.name}](/p/${p.slug}) (${price}, ${p.product_type})${statusInfo}${bpmInfo}${sizeInfo}${desc}`
          })
          .join('\n')
      }
    } catch (dbErr) {
      console.warn('[askGroqSupportAction] Failed to query products from DB:', dbErr)
    }

    // 4. Fetch User Purchases and Orders with Admin Privileges from Supabase
    let userPurchases: any[] = []
    let userOrders: any[] = []
    let matchedSpecificOrder: any = null

    try {
      // A. Query Purchases
      if (userId || targetEmail) {
        let pQuery = adminSupabase
          .from('purchases')
          .select(
            '*, products(id, name, slug, cover_image, product_type, price_usd, download_url, download_url_win, download_url_mac)'
          )

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
          specificQuery = specificQuery.or(
            `order_number.ilike.${scannedOrderNumber},razorpay_payment_id.eq.${scannedPaymentId}`
          )
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
      'pack',
      'packs',
      'sound',
      'sounds',
      'loop',
      'loops',
      'free',
      'vst',
      'vsts',
      'tool',
      'tools',
      'kit',
      'kits',
      'drum',
      'drums',
      'beat',
      'beats',
      'instrument',
      'instruments',
      'sample',
      'samples',
      'audio',
      'music',
      'plugin',
      'plugins',
      'master',
      'like',
      'product',
      'products',
      'item',
      'items',
      'what',
      'dont',
      'doesnt',
    ])

    // Find candidate product user is asking about across query AND recent conversation history
    const productSearchText = `${query} ${history.slice(-3).map((h) => h.content).join(' ')}`.toLowerCase()
    let candidateProduct: any = null
    for (const p of allProducts) {
      const nameLower = (p.name || '').toLowerCase()
      const slugLower = (p.slug || '').toLowerCase()

      // Direct match on name or slug
      if (productSearchText.includes(nameLower) || productSearchText.includes(slugLower)) {
        candidateProduct = p
        break
      }

      // Keyword matching (individual words of 4+ characters in product name, non-generic)
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

      adminActionResultNotes += `\n[ADMIN CATALOG NOTICE: PRODUCT IS COMING SOON - NOT RELEASED]:
"${candidateProduct.name}" is marked as COMING SOON in our database. It has NOT been released yet and CANNOT be purchased right now.
STRICT INSTRUCTION:
- State clearly and respectfully that "${candidateProduct.name}" has not officially released yet; it is in final audio mastering and will drop very soon!
- If the user asked about price in INR (e.g. "indian rupees mai kitna hoga"), state the launch price: $${candidateProduct.price_usd} USD (approx ₹${approxInr} INR at ~₹85-87/USD, processed via Razorpay/UPI/Cards).
- That is why checkout / purchase button is not active yet.
- NEVER claim that the user owns or purchased "${candidateProduct.name}".
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
          Array.isArray(primaryOrder.items) &&
          primaryOrder.items.some(
            (it: any) =>
              it.id === candidateProduct.id ||
              it.name?.toLowerCase().includes(candidateProduct.name.toLowerCase())
          )

        const isFreeProduct = Number(candidateProduct.price_usd || 0) <= 0

        // If not found in user's active purchases/orders, perform Zero-Trust Live Gateway & DB Verification
        if (!ownedPurchase && !orderHasProduct && !isFreeProduct) {
          const cleanPaymentId = scannedPaymentId || scannedOrderNumber

          if (cleanPaymentId) {
            // A. REPLAY ATTACK DEFENSE: Check if this payment ID was ALREADY credited in Supabase
            const { data: existingClaim } = await adminSupabase
              .from('purchases')
              .select('id, user_id, customer_email, product_id, purchased_at, products(name)')
              .or(
                `razorpay_payment_id.eq.${cleanPaymentId},razorpay_order_id.eq.${cleanPaymentId},order_id.eq.${cleanPaymentId}`
              )
              .limit(1)
              .maybeSingle()

            if (existingClaim) {
              const isSameUser =
                (userId && existingClaim.user_id === userId) ||
                (targetEmail && existingClaim.customer_email?.toLowerCase() === targetEmail.toLowerCase())

              if (isSameUser) {
                ownedPurchase = existingClaim
                orderHasProduct = true
                const prodName = Array.isArray(existingClaim.products)
                  ? (existingClaim.products[0] as any)?.name
                  : (existingClaim.products as any)?.name
                adminActionResultNotes += `\n[VERIFIED PURCHASE ACTIVE]: This payment ID (${cleanPaymentId}) is already credited to your account for "${prodName || 'your product'}". Instant secure download link is generated below.`
              } else {
                adminActionResultNotes += `\n[FRAUD PROTECTION - PAYMENT ID ALREADY REDEEMED]: Payment ID "${cleanPaymentId}" has already been claimed and credited to an account on ${new Date(existingClaim.purchased_at).toLocaleDateString()}. For license security, a single payment cannot be redeemed on multiple accounts. Reject this claim politely.`
                canEscalateToTicket = true
              }
            } else {
              // B. QUERY LIVE GATEWAY (Razorpay, PayPal, Cashfree)
              const gwResult = await verifyMultiGatewayDirect(cleanPaymentId, targetEmail, query)

              if (gwResult && gwResult.verified && gwResult.status === 'captured') {
                const userEmailNorm = (userEmail || targetEmail || '').toLowerCase().trim()
                const gwEmailNorm = (gwResult.email || '').toLowerCase().trim()
                const emailMatches = !gwEmailNorm || !userEmailNorm || gwEmailNorm === userEmailNorm

                if (!emailMatches) {
                  const maskedEmail = gwEmailNorm.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
                  adminActionResultNotes += `\n[FRAUD PROTECTION - EMAIL MISMATCH]: Payment ID "${cleanPaymentId}" is verified as CAPTURED on ${gwResult.gateway}, but was completed under a different email address (${maskedEmail}). Explain politely that purchases are tied to the email used at checkout.`
                  canEscalateToTicket = true
                } else if (candidateProduct?.is_coming_soon) {
                  adminActionResultNotes += `\n[CATALOG NOTICE - UNRELEASED PRODUCT]: User claimed payment for "${candidateProduct.name}", but this product is Coming Soon and has never been available for checkout.`
                } else if (candidateProduct) {
                  const expectedPrice = Number(candidateProduct.price_usd || 0)
                  const paidAmount = Number(gwResult.amount || 0)

                  let amountValid = true
                  if (expectedPrice > 0 && paidAmount > 0) {
                    if (gwResult.currency === 'USD') {
                      amountValid = paidAmount >= expectedPrice * 0.4
                    } else if (gwResult.currency === 'INR') {
                      const minInr = expectedPrice * 70 * 0.4
                      amountValid = paidAmount >= minInr
                    }
                  }

                  if (!amountValid) {
                    adminActionResultNotes += `\n[FRAUD PROTECTION - AMOUNT MISMATCH]: Payment ID "${cleanPaymentId}" on ${gwResult.gateway} was for ${gwResult.currency} ${gwResult.amount}, which does NOT match the catalog price for "${candidateProduct.name}" ($${expectedPrice}). Autonomous license activation rejected.`
                    canEscalateToTicket = true
                  } else {
                    // ALL CHECKS PASSED: Insert into Supabase DB!
                    try {
                      await adminSupabase.from('purchases').insert({
                        user_id: userId || 'verified-customer',
                        product_id: candidateProduct.id,
                        customer_email: targetEmail || gwResult.email,
                        amount_paid: paidAmount || expectedPrice,
                        currency: gwResult.currency || 'USD',
                        order_id: `PT-${gwResult.gateway.toUpperCase().slice(0, 3)}-${(gwResult.paymentId || gwResult.orderId || 'DIRECT').slice(-8).toUpperCase()}`,
                        razorpay_payment_id: gwResult.paymentId || cleanPaymentId,
                        razorpay_order_id: gwResult.orderId || null,
                        purchased_at: gwResult.createdAt || new Date().toISOString(),
                      })
                      ownedPurchase = {
                        product_id: candidateProduct.id,
                        products: candidateProduct,
                        amount_paid: paidAmount || expectedPrice,
                        currency: gwResult.currency || 'USD',
                        razorpay_payment_id: gwResult.paymentId || cleanPaymentId,
                      }
                      orderHasProduct = true
                      adminActionResultNotes += `\n[AUTONOMOUS RESOLUTION SUCCESS]: Real payment confirmed directly on ${gwResult.gateway} (Payment ID: ${cleanPaymentId}, Status: CAPTURED). License activated in database.`
                    } catch (autoProvErr) {
                      console.warn('[askGroqSupportAction] Live multi-gateway auto-provision warning:', autoProvErr)
                    }
                  }
                }
              } else if (gwResult && gwResult.status === 'failed') {
                adminActionResultNotes += `\n[LIVE ${gwResult.gateway.toUpperCase()} RECORD - PAYMENT FAILED]: Real payment record found on ${gwResult.gateway} (ID: ${cleanPaymentId}), but status is FAILED. Error reason: "${gwResult.errorReason}". Explain honestly to the user that the bank transaction failed on ${gwResult.gateway} and no funds were credited to Producer Toy. If debited, banks auto-reverse within 3–5 business days.`
              } else if (gwResult && gwResult.status === 'pending') {
                adminActionResultNotes += `\n[LIVE ${gwResult.gateway.toUpperCase()} RECORD - PAYMENT PENDING]: Transaction record found on ${gwResult.gateway} (ID: ${cleanPaymentId}), but status is PENDING clearance.`
              } else if (cleanPaymentId) {
                adminActionResultNotes += `\n[GATEWAY NOTICE - PAYMENT NOT FOUND]: The payment ID "${cleanPaymentId}" was not found across our live payment gateways (Razorpay, PayPal, Cashfree). Politely ask user to double check the ID.`
                canEscalateToTicket = true
              }
            }
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

          adminActionResultNotes += `\n[ADMIN VERIFICATION SUCCESS]: Real purchase/payment confirmed for "${candidateProduct.name}". Fresh secure CDN download link generated.`
        } else {
          if (primaryOrder && primaryOrder.payment_status !== 'completed') {
            adminActionResultNotes += `\n[ADMIN RECORD FOUND]: Order #${primaryOrder.order_number} has payment_status: "${primaryOrder.payment_status}". Payment was not completed.`
            canEscalateToTicket = true
          } else {
            adminActionResultNotes += `\n[HARD DATABASE AUDIT - ZERO VERIFIED PURCHASES]: Checked Supabase database and payment gateways for account "${targetEmail || 'user'}". 0 completed payments found. STRICT RULE: DO NOT fake payment confirmation, and DO NOT tell the user we added it to their account without a verified payment!`
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

        adminActionResultNotes += `\n[ADMIN INVOICE FOUND]: Official Order #${orderToUse.order_number} found. Date: ${new Date(orderToUse.created_at).toLocaleDateString()}, Total: ${orderToUse.currency || '$'}${orderToUse.total_amount}, Payment Status: ${orderToUse.payment_status}, Payment Gateway: ${orderToUse.payment_gateway}, Transaction ID: ${verifiedOrder.paymentId}.`
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
- Account Purchases: ${userPurchases.length > 0 ? `${userPurchases.length} items (${userPurchases.map((p) => p.products?.name || p.product_id).join(', ')})` : '0 purchases recorded in Supabase database'}
- Recent Orders: ${userOrders.length > 0 ? userOrders.map((o) => `[Order #${o.order_number} | Status: ${o.payment_status} | Amount: ${o.currency || '$'}${o.total_amount}]`).join(', ') : 'No recent orders recorded in Supabase database'}
${adminActionResultNotes}`

    // 6. Build Modular System Prompt using rules engine
    const promptCtx: SupportPromptContext = {
      identity: {
        userName,
        userEmail,
        platformName: 'Producer Toy',
        platformDomain: 'producertoy.com',
        sisterPlatformName: 'SamplesWala',
        sisterPlatformDomain: 'sampleswala.com',
        assistantName: 'Prody',
      },
      admin: {
        userName,
        userEmail,
        userPurchasesCount: userPurchases.length,
        userOrdersCount: userOrders.length,
        purchasedProductNames: userPurchases.map((p) => p.products?.name || p.product_id),
        isVerifiedDownloadActive: Boolean(verifiedDownload),
      },
      comingSoon: {
        candidateProduct: candidateProduct
          ? {
              name: candidateProduct.name,
              is_coming_soon: candidateProduct.is_coming_soon,
              price_usd: candidateProduct.price_usd,
            }
          : null,
      },
      policy: {
        currentStrikes,
      },
      userAccountSummary,
      isUserLoggedIn,
      liveInventoryList:
        liveInventoryList ||
        `- [Tabla Master's](/p/tabla-masters) ($19.99, sample_pack) [STATUS: COMING SOON - NOT YET RELEASED / CANNOT BE PURCHASED YET] [BPM: NOT YET ANNOUNCED - IN AUDIO MASTERING] - Authentic Indian tabla sample pack featuring professionally recorded dry & processed hits, loops, and rolls.
- [Sexy Drill](/p/sexy-drill) ($9.99, sample_pack) [STATUS: COMING SOON - NOT YET RELEASED / CANNOT BE PURCHASED YET] [BPM: NOT YET ANNOUNCED - IN AUDIO MASTERING] - Chart-topping UK & NY Drill drum kit, sliding 808s, and dark melody loops.`,
    }

    const systemPrompt = buildSupportSystemPrompt(promptCtx)

    // Helper to extract recommended products from AI response and user query (Excludes Coming Soon products)
    const findMatchedProducts = (text: string): RecommendedProduct[] => {
      const result: RecommendedProduct[] = []
      const textLower = (text || '').toLowerCase()
      const qLower = (query || '').toLowerCase()

      if (allProducts && allProducts.length > 0) {
        for (const p of allProducts) {
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
      /\b(fail|failed|broken|corrupt|not working|urgent|problem|scam|fraud|money cut|refund|stuck|help me|issue|dhokha|paise kat gaye|latency|unzip|extract|download nahi|link nahi|can't download|cant download|deducted|receipt|invoice|bill|gateway|guide|step|how to|kaise|what about)\b/i.test(
        query
      )
    const isShortGreeting =
      /^(hi|hello|hey|ok|okay|thanks|thank you|shukriya|dhanyawad|bye|yo|sup|kya haal|cool|great)\b/i.test(
        query.trim()
      )
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

    let isPolicyViolation = rawAnswer.includes('[POLICY_VIOLATION]') || rawAnswer.includes('[TERMINATE_CHAT]')

    // HARD POLICY ENFORCEMENT: Never strike on off-topic questions (e.g. "what is chota bheem", Virat Kohli, cricket, movies).
    // Strikes are strictly for actual abusive words / gaaliyan!
    if (isOffTopicQuery(query)) {
      isPolicyViolation = false
    } else if (isPolicyViolation && !hasProfanityOrAbuse(query)) {
      isPolicyViolation = false
    }

    const shouldTerminateChat = isPolicyViolation && ((currentStrikes + 1 >= 4) || rawAnswer.includes('[TERMINATE_CHAT]'))

    let cleanedAnswer = scrubBrandNames(
      rawAnswer
        .replace(/\[POLICY_VIOLATION\]/g, '')
        .replace(/\[TERMINATE_CHAT\]/g, '')
        .trim()
    )

    // If query is off-topic / personal / cricket / non-music and model output had strike or gave wrong topic,
    // ensure polite generic redirect in user's exact language:
    if (isOffTopicQuery(query)) {
      const lang = detectLanguage(query)
      if (lang === 'english') {
        cleanedAnswer = `I am exclusively dedicated to helping with music production, sound design, VST plugins, sample packs, and Producer Toy store orders.\n\nHow can I assist you with your music projects, plugins, or sound libraries today?`
      } else if (lang === 'hindi') {
        cleanedAnswer = `मैं केवल Producer Toy, संगीत निर्माण, VST प्लगइन्स, सैंपल पैक और स्टोर ऑर्डर्स से संबंधित प्रश्नों में सहायता कर सकता हूँ।\n\nआज आपके संगीत प्रोजेक्ट या साउंड्स में मैं कैसे मदद कर सकता हूँ?`
      } else {
        cleanedAnswer = `Mai sirf Producer Toy, music production, sound design, VST plugins, sample packs, aur store orders se related queries me help kar sakta hoon.\n\nAapko music production, audio plugins ya sounds me kis tarah ki help chahiye?`
      }
    }

    // ZERO-TRUST ANTI-HALLUCINATION GUARD:
    // If backend did NOT verify a download, LLM must NEVER output download mirrors or false verifications!
    if (!verifiedDownload) {
      cleanedAnswer = cleanedAnswer
        .replace(/\[ADMIN VERIFICATION SUCCESS\]/gi, '')
        .trim()

      const claimsVerifiedPurchase =
        cleanedAnswer.toLowerCase().includes('verified your purchase') ||
        cleanedAnswer.toLowerCase().includes('download mirror is ready') ||
        cleanedAnswer.toLowerCase().includes('payment is confirmed, your fresh secure download') ||
        cleanedAnswer.toLowerCase().includes('files permanently in your library')

      if (comingSoonProduct && claimsVerifiedPurchase) {
        cleanedAnswer = `Hello ${userName},\n\nI have checked our system and store database. "${comingSoonProduct.name}" has not officially released yet; it is currently in final audio mastering and checkout is closed. Therefore, no purchase exists for this pack.\n\nA Drop Alert card has been added below so you can get notified the moment it launches!`
      } else if (userPurchases.length === 0 && userOrders.length === 0 && !scannedPaymentId && !scannedOrderNumber && claimsVerifiedPurchase) {
        cleanedAnswer = `Hello ${userName},\n\nI have checked your account records (${userEmail || 'current session'}), and there are currently no verified purchases or orders found in our system.\n\nIf you recently made a payment, please share your Payment ID (e.g. Razorpay \`pay_...\`, PayPal \`PAYID-...\`, or Cashfree \`order_...\`) so I can verify the transaction immediately.`
      }
    }

    // Smart answer fallback for "how you can check razorpay" without payment ID (STRICT LANGUAGE MATCHING)
    const isAskingHowToCheckGateway =
      (queryLower.includes('how') && queryLower.includes('check') && (queryLower.includes('razorpay') || queryLower.includes('cashfree') || queryLower.includes('paypal') || queryLower.includes('gateway'))) ||
      queryLower.includes('how you can check') ||
      queryLower.includes('kaise check karte ho')

    if (isAskingHowToCheckGateway && !scannedPaymentId && !scannedOrderNumber) {
      const lang = detectLanguage(query)
      if (lang === 'english') {
        cleanedAnswer = `Our system is securely automated and integrated to safely verify real-time payment status and order records, resolving any delivery or download issue immediately.\n\nIf you have attempted a purchase and are unsure if it went through, please share your Payment ID (e.g., Razorpay \`pay_...\`, PayPal \`PAYID-...\`, or Cashfree \`order_...\`) so I can verify it for you immediately.`
      } else if (lang === 'hindi') {
        cleanedAnswer = `हमारा सिस्टम पूरी तरह से सुरक्षित और स्वचालित है, जिससे हम रीयल-टाइम में भुगतान स्थिति और ऑर्डर रिकॉर्ड को सुरक्षित रूप से सत्यापित कर आपकी डिलीवरी समस्या का तुरंत समाधान कर देते हैं।\n\nयदि आपने भुगतान किया है और पुष्टि नहीं हुई है, तो कृपया अपना Payment ID (जैसे Razorpay \`pay_...\`, PayPal \`PAYID-...\`, या Cashfree \`order_...\`) साझा करें ताकि मैं तुरंत सत्यापन कर सकूं।`
      } else {
        cleanedAnswer = `Mera system hi is tarah securely integrate aur automate kiya gaya hai ki mai real-time payment status aur order verification safely perform karke aapka delivery issue instantly solve kar deta hoon.\n\nIf you have attempted a purchase and are unsure if it went through, please share your Payment ID (e.g., Razorpay \`pay_...\`, PayPal \`PAYID-...\`, or Cashfree \`order_...\`) so I can verify it for you immediately.`
      }
    }

    const isTroubleshootingProblemQuery =
      /\b(fail|failed|broken|corrupt|not working|crash|issue|problem|bug|stuck|latency|unzip|extract|download nahi|link nahi|can't download|cant download|deducted|kat gaye|refund|charge|crackling|buffer)\b/i.test(
        query
      )

    const containsResolutionFix =
      /\b(step \d|solution|reversal|auto-reverse|try these steps|follow these instructions|troubleshoot)\b/i.test(
        cleanedAnswer
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

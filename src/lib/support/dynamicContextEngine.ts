import { getAdminClient } from '@/lib/supabase/admin'
import {
  verifyMultiGatewayDirect,
  type LiveGatewayVerificationResult,
} from './paymentVerifier'

export interface DynamicCatalogContext {
  allProducts: any[]
  activeProducts: any[]
  comingSoonProducts: any[]
  categories: any[]
  brands: any[]
  activeCoupons: any[]
  inventorySummaryText: string
}

export interface DynamicUserContext {
  isLoggedIn: boolean
  userId: string | null
  email: string | null
  name: string
  profile: any | null
  walletBalance: number
  rewardBalance: number
  country: string | null
  purchases: any[]
  orders: any[]
  completedOrders: any[]
  failedOrders: any[]
  pendingOrders: any[]
  wishlist: any[]
  deviceActivations: any[]
  gifts: any[]
  tickets: any[]
  ticketReplies: Array<{
    ticketNumber: string
    status: string
    subject: string
    createdAt: string
    agentName: string
    agentMessage: string
    agentReplyTime: string
  }>
  userAccountSummaryText: string
}

export interface DynamicGatewayAudit {
  recentGatewayAttempt: LiveGatewayVerificationResult | null
  gatewayAuditSummaryText: string
}

export interface LiveSupportDynamicContext {
  catalog: DynamicCatalogContext
  user: DynamicUserContext
  gatewayAudit: DynamicGatewayAudit
}

/**
 * Dynamically aggregates live catalog, user activity, orders (completed/failed/pending),
 * tickets, and payment gateway status from Supabase and live gateways with ZERO hardcoding.
 */
export async function getLiveSupportDynamicContext(params: {
  userId?: string | null
  userEmail?: string | null
  userName?: string
  query?: string
  history?: Array<{ role: string; content: string }>
}): Promise<LiveSupportDynamicContext> {
  const adminSupabase = getAdminClient()
  const queryText = (params.query || '').trim()
  const queryLower = queryText.toLowerCase()
  const historyText = (params.history || []).map((h) => h.content).join(' ')
  const fullTextToScan = `${queryText} ${historyText}`

  // 1. Scan for explicit entities if user provided any in conversation
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

  const targetEmail = params.userEmail?.toLowerCase().trim() || scannedEmail || null
  const targetUserId = params.userId || null
  const targetName = params.userName && params.userName !== 'Producer' ? params.userName : 'Producer'

  // 2. PARALLEL FETCH: Live Store Catalog & Global Promotions
  let allProducts: any[] = []
  let activeProducts: any[] = []
  let comingSoonProducts: any[] = []
  let categories: any[] = []
  let brands: any[] = []
  let activeCoupons: any[] = []

  try {
    const [prodRes, catRes, brandRes, couponRes] = await Promise.all([
      adminSupabase
        .from('products')
        .select(`
          id, name, slug, cover_image, price_usd, original_price_usd,
          product_type, short_description, full_description, bpm, vst_format,
          file_size, is_coming_soon, is_active, is_featured, release_date,
          supported_daws, operating_system, platform, license_type, brand_id, category_id
        `)
        .order('created_at', { ascending: false })
        .limit(100),
      adminSupabase
        .from('categories')
        .select('id, name, slug, description')
        .order('sort_order', { ascending: true }),
      adminSupabase
        .from('brands')
        .select('id, name, slug, description, website_url, country')
        .limit(50),
      adminSupabase
        .from('coupons')
        .select('id, code, discount_percent, discount_type, discount_amount_usd, is_active, expires_at')
        .eq('is_active', true)
        .limit(20),
    ])

    if (prodRes.data) {
      allProducts = prodRes.data
      activeProducts = allProducts.filter((p) => p.is_active && !p.is_coming_soon)
      comingSoonProducts = allProducts.filter((p) => p.is_coming_soon)
    }
    if (catRes.data) categories = catRes.data
    if (brandRes.data) brands = brandRes.data
    if (couponRes.data) {
      const now = new Date()
      activeCoupons = couponRes.data.filter((c) => !c.expires_at || new Date(c.expires_at) > now)
    }
  } catch (catalogErr) {
    console.warn('[dynamicContextEngine] Catalog fetch warning:', catalogErr)
  }

  // Synthesize Live Dynamic Catalog Inventory Summary
  const inventoryLines: string[] = []
  if (activeProducts.length > 0) {
    inventoryLines.push('AVAILABLE PRODUCTS IN LIVE STORE (READY FOR INSTANT CHECKOUT):')
    for (const p of activeProducts) {
      const price = p.price_usd && Number(p.price_usd) > 0 ? `$${p.price_usd}` : 'Free'
      const inrEstimate = p.price_usd ? ` (~₹${Math.round(Number(p.price_usd) * 86)} INR)` : ''
      const desc = p.short_description ? ` - ${p.short_description}` : ''
      const bpm = p.bpm ? ` [${p.bpm} BPM]` : ''
      const format = p.vst_format ? ` [${p.vst_format}]` : ''
      const size = p.file_size ? ` [${p.file_size}]` : ''
      inventoryLines.push(`- [${p.name}](/p/${p.slug}) (${price}${inrEstimate}, ${p.product_type}) [STATUS: ACTIVE]${bpm}${format}${size}${desc}`)
    }
  }

  if (comingSoonProducts.length > 0) {
    inventoryLines.push('\nUPCOMING / COMING SOON RELEASES (IN FINAL AUDIO MASTERING - NOT YET OPEN FOR CHECKOUT):')
    for (const p of comingSoonProducts) {
      const launchPrice = p.price_usd && Number(p.price_usd) > 0 ? `$${p.price_usd}` : 'TBD'
      const inrLaunch = p.price_usd ? ` (~₹${Math.round(Number(p.price_usd) * 86)} INR)` : ''
      const releaseDate = p.release_date ? ` [Target Release: ${p.release_date}]` : ' [Target Release: Coming Very Soon]'
      const desc = p.short_description ? ` - ${p.short_description}` : ''
      inventoryLines.push(`- [${p.name}](/p/${p.slug}) (Launch Price: ${launchPrice}${inrLaunch}, ${p.product_type}) [STATUS: COMING SOON - PRE-RELEASE]${releaseDate}${desc}`)
    }
  }

  if (categories.length > 0) {
    inventoryLines.push(`\nSTORE CATEGORIES: ${categories.map((c) => `${c.name} (/categories/${c.slug})`).join(', ')}`)
  }

  if (brands.length > 0) {
    inventoryLines.push(`FEATURED DEVELOPERS & BRANDS: ${brands.map((b) => b.name).join(', ')}`)
  }

  if (activeCoupons.length > 0) {
    inventoryLines.push(`\nACTIVE DISCOUNT COUPONS: ${activeCoupons.map((c) => `Code "${c.code}" (${c.discount_percent ? `${c.discount_percent}% OFF` : `$${c.discount_amount_usd} OFF`})`).join(', ')}`)
  }

  const inventorySummaryText = inventoryLines.join('\n') || 'Store catalog currently loading live from database.'

  // 3. PARALLEL FETCH: Live User Context (Profile, Orders, Purchases, Wishlist, Devices, Gifts, Tickets)
  let userProfile: any = null
  let userPurchases: any[] = []
  let userOrders: any[] = []
  let completedOrders: any[] = []
  let failedOrders: any[] = []
  let pendingOrders: any[] = []
  let userWishlist: any[] = []
  let userDeviceActivations: any[] = []
  let userGifts: any[] = []
  let userTickets: any[] = []
  let ticketReplies: DynamicUserContext['ticketReplies'] = []

  const isLoggedIn = Boolean(targetUserId || targetEmail)

  if (isLoggedIn) {
    try {
      // Build order query: matched by user_id OR email
      let oQuery = adminSupabase.from('orders').select('*')
      if (targetUserId && targetEmail) {
        oQuery = oQuery.or(`user_id.eq.${targetUserId},customer_email.ilike.${targetEmail}`)
      } else if (targetUserId) {
        oQuery = oQuery.eq('user_id', targetUserId)
      } else if (targetEmail) {
        oQuery = oQuery.ilike('customer_email', targetEmail)
      }

      // Build purchase query
      let pQuery = adminSupabase
        .from('purchases')
        .select('*, products(id, name, slug, cover_image, product_type, price_usd, download_url, download_url_win, download_url_mac)')
      if (targetUserId && targetEmail) {
        pQuery = pQuery.or(`user_id.eq.${targetUserId},customer_email.ilike.${targetEmail}`)
      } else if (targetUserId) {
        pQuery = pQuery.eq('user_id', targetUserId)
      } else if (targetEmail) {
        pQuery = pQuery.ilike('customer_email', targetEmail)
      }

      // Build profile query
      let profilePromise = targetUserId
        ? adminSupabase.from('profiles').select('*').eq('id', targetUserId).maybeSingle()
        : targetEmail
        ? adminSupabase.from('profiles').select('*').ilike('email', targetEmail).maybeSingle()
        : Promise.resolve({ data: null })

      // Build tickets query
      let tQuery = adminSupabase.from('support_tickets').select('*')
      if (scannedOrderNumber) {
        tQuery = tQuery.or(`order_id.ilike.${scannedOrderNumber},ticket_number.ilike.${scannedOrderNumber}`)
      } else if (targetUserId && targetEmail) {
        tQuery = tQuery.or(`user_id.eq.${targetUserId},email.ilike.${targetEmail}`)
      } else if (targetUserId) {
        tQuery = tQuery.eq('user_id', targetUserId)
      } else if (targetEmail) {
        tQuery = tQuery.ilike('email', targetEmail)
      }

      // Build wishlist & devices promises (require targetUserId if available)
      const wishlistPromise = targetUserId
        ? adminSupabase.from('wishlists').select('*, products(id, name, slug, price_usd)').eq('user_id', targetUserId).limit(15)
        : Promise.resolve({ data: [] })

      const devicesPromise = targetUserId
        ? adminSupabase.from('device_activations').select('*, products(name)').eq('user_id', targetUserId).limit(10)
        : Promise.resolve({ data: [] })

      const giftsPromise = targetEmail
        ? adminSupabase.from('gifts').select('*, products(name)').or(`sender_email.ilike.${targetEmail},recipient_email.ilike.${targetEmail}`).limit(10)
        : targetUserId
        ? adminSupabase.from('gifts').select('*, products(name)').or(`sender_id.eq.${targetUserId},recipient_id.eq.${targetUserId}`).limit(10)
        : Promise.resolve({ data: [] })

      const [ordersRes, purchasesRes, profileRes, ticketsRes, wishlistRes, devicesRes, giftsRes] =
        await Promise.all([
          oQuery.order('created_at', { ascending: false }).limit(20),
          pQuery.order('purchased_at', { ascending: false }).limit(25),
          profilePromise,
          tQuery.order('created_at', { ascending: false }).limit(10),
          wishlistPromise,
          devicesPromise,
          giftsPromise,
        ])

      if (profileRes?.data) userProfile = profileRes.data
      if (purchasesRes?.data) userPurchases = purchasesRes.data
      if (ordersRes?.data) {
        userOrders = ordersRes.data
        completedOrders = userOrders.filter(
          (o) => o.payment_status === 'completed' || o.payment_status === 'paid'
        )
        failedOrders = userOrders.filter(
          (o) =>
            o.payment_status === 'failed' ||
            o.payment_status === 'error' ||
            o.payment_status === 'declined' ||
            o.payment_status === 'cancelled'
        )
        pendingOrders = userOrders.filter(
          (o) => o.payment_status === 'pending' || o.payment_status === 'created'
        )
      }
      if (wishlistRes?.data) userWishlist = wishlistRes.data
      if (devicesRes?.data) userDeviceActivations = devicesRes.data
      if (giftsRes?.data) userGifts = giftsRes.data
      if (ticketsRes?.data) userTickets = ticketsRes.data

      // Fetch employee replies for found tickets
      if (userTickets.length > 0) {
        for (const t of userTickets) {
          const { data: msgs } = await adminSupabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', t.id)
            .order('created_at', { ascending: true })

          const agentReplies = (msgs || []).filter(
            (m: any) =>
              m.sender_type?.toUpperCase() === 'AGENT' ||
              m.sender_type?.toUpperCase() === 'STAFF' ||
              m.sender_type?.toUpperCase() === 'SUPPORT'
          )

          if (agentReplies.length > 0) {
            const latest = agentReplies[agentReplies.length - 1]
            ticketReplies.push({
              ticketNumber: t.ticket_number,
              status: t.status || 'OPEN',
              subject: t.subject || 'Support Ticket',
              createdAt: t.created_at,
              agentName: latest.sender_name || 'Senior Support Specialist',
              agentMessage: latest.message,
              agentReplyTime: latest.created_at,
            })
          }
        }
      }
    } catch (userContextErr) {
      console.warn('[dynamicContextEngine] User context fetch warning:', userContextErr)
    }
  }

  // 4. PROACTIVE LIVE GATEWAY AUDIT:
  // If user asks about payment issues, deduction, failure, missing download, or has recent payment activity,
  // query live payment gateways (Razorpay, PayPal, Cashfree) directly using targetEmail or scanned IDs.
  let recentGatewayAttempt: LiveGatewayVerificationResult | null = null
  let gatewayAuditSummaryText = ''

  const isPaymentInquiry =
    Boolean(scannedPaymentId || scannedOrderNumber) ||
    queryLower.includes('payment') ||
    queryLower.includes('fail') ||
    queryLower.includes('declined') ||
    queryLower.includes('paise') ||
    queryLower.includes('kat gaye') ||
    queryLower.includes('deducted') ||
    queryLower.includes('refund') ||
    queryLower.includes('download nahi') ||
    queryLower.includes('kharida') ||
    queryLower.includes('bought') ||
    queryLower.includes('purchased') ||
    queryLower.includes('order') ||
    queryLower.includes('razorpay') ||
    queryLower.includes('paypal') ||
    queryLower.includes('cashfree')

  if (isPaymentInquiry && (scannedPaymentId || targetEmail)) {
    try {
      const gwCheck = await verifyMultiGatewayDirect(
        scannedPaymentId || scannedOrderNumber,
        targetEmail,
        queryText
      )

      if (gwCheck) {
        recentGatewayAttempt = gwCheck
        if (gwCheck.status === 'failed') {
          gatewayAuditSummaryText = `[LIVE GATEWAY RECORD - REAL PAYMENT FAILED]:
A live transaction on ${gwCheck.gateway} was detected for account "${targetEmail || gwCheck.email}":
- Payment/Transaction ID: ${gwCheck.paymentId || 'N/A'}
- Amount: ${gwCheck.currency || '$'}${gwCheck.amount || 0}
- Gateway Status: FAILED / DECLINED
- Bank Failure Reason: "${gwCheck.errorReason || 'Bank or network declined'}"
- Date: ${gwCheck.createdAt ? new Date(gwCheck.createdAt).toLocaleString() : 'Recent'}
STRICT INSTRUCTION:
- Explain respectfully and clearly that this transaction failed at the bank/gateway level and NO funds were received or credited to Producer Toy.
- If money was debited from their account, reassure them that the banking system automatically reverses declined transactions back to source within 3–5 business days.`
        } else if (gwCheck.status === 'captured' && gwCheck.verified) {
          gatewayAuditSummaryText = `[LIVE GATEWAY RECORD - PAYMENT VERIFIED & CAPTURED]:
Real transaction confirmed on ${gwCheck.gateway}:
- Payment ID: ${gwCheck.paymentId}
- Amount: ${gwCheck.currency || '$'}${gwCheck.amount}
- Status: CAPTURED
- Customer Email: ${gwCheck.email || targetEmail}`
        } else if (gwCheck.status === 'pending') {
          gatewayAuditSummaryText = `[LIVE GATEWAY RECORD - TRANSACTION PENDING]:
A transaction of ${gwCheck.currency || '$'}${gwCheck.amount} on ${gwCheck.gateway} is currently PENDING bank clearance.`
        }
      }
    } catch (gwAuditErr) {
      console.warn('[dynamicContextEngine] Gateway live audit warning:', gwAuditErr)
    }
  }

  // 5. Synthesize Dynamic User Account Summary
  const summaryLines: string[] = []
  summaryLines.push(`USER SESSION & DYNAMIC DATABASE PROFILE:`)
  summaryLines.push(`- Account Status: ${isLoggedIn ? `LOGGED IN (${targetName} <${targetEmail || 'unknown'}>)` : 'GUEST / NOT LOGGED IN'}`)

  if (userProfile) {
    if (userProfile.wallet_balance !== undefined && Number(userProfile.wallet_balance) > 0) {
      summaryLines.push(`- User Wallet Balance: $${userProfile.wallet_balance}`)
    }
    if (userProfile.reward_balance !== undefined && Number(userProfile.reward_balance) > 0) {
      summaryLines.push(`- Toywards Reward Balance: $${userProfile.reward_balance}`)
    }
    if (userProfile.country) {
      summaryLines.push(`- Registered Country: ${userProfile.country}`)
    }
  }

  // Purchased items
  if (userPurchases.length > 0) {
    const pNames = userPurchases.map((p) => (p.products ? p.products.name : p.product_id)).join(', ')
    summaryLines.push(`- Verified Purchases (${userPurchases.length} items): ${pNames}`)
  } else {
    summaryLines.push(`- Verified Purchases: 0 items recorded in database`)
  }

  // Completed Orders
  if (completedOrders.length > 0) {
    const oSummary = completedOrders
      .slice(0, 5)
      .map((o) => `[Order #${o.order_number} | Paid: ${o.currency || '$'}${o.total_amount} via ${o.payment_gateway || 'Gateway'} on ${new Date(o.created_at).toLocaleDateString()}]`)
      .join(', ')
    summaryLines.push(`- Completed Orders (${completedOrders.length}): ${oSummary}`)
  } else {
    summaryLines.push(`- Completed Orders: 0 completed orders recorded`)
  }

  // Failed Orders (Crucial for user inquiry "mera payment fail hua")
  if (failedOrders.length > 0) {
    const fSummary = failedOrders
      .slice(0, 5)
      .map((o) => `[Order #${o.order_number} | Amount: ${o.currency || '$'}${o.total_amount} via ${o.payment_gateway || 'Gateway'} | Status: FAILED on ${new Date(o.created_at).toLocaleDateString()}]`)
      .join(', ')
    summaryLines.push(`- FAILED ORDER ATTEMPTS (${failedOrders.length}): ${fSummary}`)
  }

  // Pending Orders
  if (pendingOrders.length > 0) {
    const pSummary = pendingOrders
      .slice(0, 3)
      .map((o) => `[Order #${o.order_number} | Amount: ${o.currency || '$'}${o.total_amount} | Status: PENDING]`)
      .join(', ')
    summaryLines.push(`- Pending Orders (${pendingOrders.length}): ${pSummary}`)
  }

  // Active Device Activations
  if (userDeviceActivations.length > 0) {
    const dSummary = userDeviceActivations
      .map((d) => `"${d.device_name}" (${d.os || 'OS'}, Product: ${d.products?.name || 'Software'})`)
      .join(', ')
    summaryLines.push(`- Active Studio Device Seats (${userDeviceActivations.length}): ${dSummary}`)
  }

  // Wishlist
  if (userWishlist.length > 0) {
    const wSummary = userWishlist
      .map((w) => w.products?.name || 'Saved Item')
      .join(', ')
    summaryLines.push(`- Wishlist Saved Items (${userWishlist.length}): ${wSummary}`)
  }

  // Gifts
  if (userGifts.length > 0) {
    const gSummary = userGifts
      .map((g) => `[Gift for ${g.recipient_email}: ${g.products?.name || 'Item'} (Status: ${g.status})]`)
      .join(', ')
    summaryLines.push(`- Gift Transfers (${userGifts.length}): ${gSummary}`)
  }

  // Tickets & Staff Replies
  if (userTickets.length > 0) {
    summaryLines.push(`\nLIVE DATABASE SUPPORT TICKETS & EMPLOYEE REPLIES:`)
    for (const t of userTickets) {
      const emp = ticketReplies.find((r) => r.ticketNumber === t.ticket_number)
      const replyText = emp
        ? `  * EMPLOYEE / AUDIO DESK ANSWER (From ${emp.agentName} on ${new Date(emp.agentReplyTime).toLocaleDateString()}): "${emp.agentMessage}"`
        : `  * EMPLOYEE RESPONSE: No employee reply has been recorded yet. The ticket is currently ${t.status || 'OPEN'} and under active review by the senior audio engineering desk.`
      summaryLines.push(`- [Ticket #${t.ticket_number}] Subject: "${t.subject}" | Status: ${t.status || 'OPEN'} | Submitted: ${new Date(t.created_at).toLocaleDateString()}\n${replyText}`)
    }
  }

  if (gatewayAuditSummaryText) {
    summaryLines.push(`\n${gatewayAuditSummaryText}`)
  }

  const userAccountSummaryText = summaryLines.join('\n')

  return {
    catalog: {
      allProducts,
      activeProducts,
      comingSoonProducts,
      categories,
      brands,
      activeCoupons,
      inventorySummaryText,
    },
    user: {
      isLoggedIn,
      userId: targetUserId,
      email: targetEmail,
      name: targetName,
      profile: userProfile,
      walletBalance: Number(userProfile?.wallet_balance || 0),
      rewardBalance: Number(userProfile?.reward_balance || 0),
      country: userProfile?.country || null,
      purchases: userPurchases,
      orders: userOrders,
      completedOrders,
      failedOrders,
      pendingOrders,
      wishlist: userWishlist,
      deviceActivations: userDeviceActivations,
      gifts: userGifts,
      tickets: userTickets,
      ticketReplies,
      userAccountSummaryText,
    },
    gatewayAudit: {
      recentGatewayAttempt,
      gatewayAuditSummaryText,
    },
  }
}

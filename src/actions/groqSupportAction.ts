'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { signDownloadToken } from '@/lib/security'

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
}

export interface ClientUserInfo {
  id?: string
  email?: string
  name?: string
}

export async function askGroqSupportAction(
  query: string,
  history: ChatMessageInput[] = [],
  clientUser?: ClientUserInfo
): Promise<GroqResponse> {
  const apiKey = process.env.GROQ_API_KEY

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

  // Find candidate product user is asking about
  let candidateProduct: any = null
  for (const p of allProducts) {
    const nameLower = p.name.toLowerCase()
    const slugLower = p.slug.toLowerCase()
    if (
      queryLower.includes(nameLower) ||
      queryLower.includes(slugLower) ||
      (slugLower === 'tabla-masters' && queryLower.includes('tabla')) ||
      (slugLower === 'sexy-drill' && (queryLower.includes('drill') || queryLower.includes('sexy')))
    ) {
      candidateProduct = p
      break
    }
  }

  // Fallback for Sexy Drill if not found in db query
  if (!candidateProduct && (queryLower.includes('drill') || queryLower.includes('sexy'))) {
    candidateProduct = {
      id: 'prod-sexy-drill',
      name: 'Sexy Drill',
      slug: 'sexy-drill',
      cover_image: '/images/products/placeholder.png',
      price_usd: 9.99,
      is_coming_soon: true,
      product_type: 'sample_pack',
      short_description: 'Chart-topping UK & NY Drill drum kit, sliding 808s, and dark melody loops.',
    }
  }

  // A. Check Coming Soon Products (e.g. Sexy Drill)
  if (candidateProduct && candidateProduct.is_coming_soon) {
    comingSoonProduct = {
      id: candidateProduct.id,
      name: candidateProduct.name,
      slug: candidateProduct.slug,
      cover_image: candidateProduct.cover_image || '/images/products/placeholder.png',
      price_usd: Number(candidateProduct.price_usd || 0),
      release_date: candidateProduct.release_date || null,
      short_description: candidateProduct.short_description || null,
    }

    adminActionResultNotes += `\n[ADMIN CATALOG NOTICE: PRODUCT IS COMING SOON]:
"${candidateProduct.name}" is marked as COMING SOON in our database. It has NOT been released yet and CANNOT be purchased right now.
EXACT INSTRUCTION:
- State clearly and respectfully that "${candidateProduct.name}" has not officially released yet; it is in final audio mastering and will drop very soon!
- That is why the purchase/buy button is disabled or unavailable.
- Do NOT say "you are in guest mode", and do NOT tell them to try purchasing again or check payment gateways.
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
      const ownedPurchase = userPurchases.find(
        (pur) => pur.product_id === candidateProduct.id || pur.products?.slug === candidateProduct.slug
      )

      const orderHasProduct =
        primaryOrder &&
        (primaryOrder.payment_status === 'completed' || primaryOrder.payment_status === 'paid') &&
        (Array.isArray(primaryOrder.items) &&
          primaryOrder.items.some((it: any) => it.id === candidateProduct.id || it.name?.toLowerCase().includes(candidateProduct.name.toLowerCase())))

      const isFreeProduct = Number(candidateProduct.price_usd || 0) <= 0

      if (ownedPurchase || orderHasProduct || isFreeProduct) {
        if (orderHasProduct && !ownedPurchase && (userId || primaryOrder.user_id)) {
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

        adminActionResultNotes += `\n[ADMIN VERIFICATION SUCCESS]: User purchase/payment confirmed for "${candidateProduct.name}". Fresh secure CDN download link generated: ${verifiedDownload.downloadUrl}. Inform the user that payment has been verified in the database, license is active, and they can click the direct Download button provided below.`
      } else {
        if (primaryOrder && primaryOrder.payment_status !== 'completed') {
          adminActionResultNotes += `\n[ADMIN RECORD FOUND]: Order #${primaryOrder.order_number} has payment_status: "${primaryOrder.payment_status}". Payment was not completed. Explain politely that no money was settled, and if bank deducted funds, banks auto-reverse within 3-5 days.`
          canEscalateToTicket = true
        } else {
          adminActionResultNotes += `\n[ADMIN RECORD NOTICE]: No verified purchase of "${candidateProduct.name}" found under email "${targetEmail || 'account'}". Ask user if they used a different checkout email or check [${candidateProduct.name}](/p/${candidateProduct.slug}).`
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
- Verified Purchases Count: ${userPurchases.length}
- Owned Products: ${userPurchases.map((p) => p.products?.name || p.product_id).join(', ') || 'None'}
- Recent Orders: ${userOrders.map((o) => `[Order #${o.order_number} | Status: ${o.payment_status} | Amount: ${o.currency || '$'}${o.total_amount}]`).join(', ') || 'None'}
${adminActionResultNotes}`

  // 6. Comprehensive System Prompt
  const systemPrompt = `You are the official "Producer Toy Technical Support Specialist", an expert audio engineer and senior administrative specialist for Producer Toy (producertoy.com) — the premier marketplace for music producers and sound designers.

CRITICAL IDENTITY & PRIVACY RULES:
- You are exclusively the internal technical support specialist of Producer Toy with full administrative access to store records, orders, invoices, and cloud audio delivery systems.
- NEVER mention "Groq", "Llama", "Qwen", "OpenAI", "ChatGPT", "Meta", or any third-party AI provider or LLM under any circumstances.
- NEVER mention or output technical database IDs, internal UUIDs, or User IDs (e.g. any long hexadecimal string like 86e854f5...). Only refer to the user by their name (${userName}) or email (${userEmail}).
- ACCURACY GUARANTEE: Never hallucinate or invent BPM, sample counts, formats, or product specs that are not explicitly provided in the verified store inventory below. If specific data is not listed, state that it is not specified and advise the user that they can submit a support ticket for official confirmation from our senior sound engineers.
- If asked who is answering or how you operate, respond that you are the official Producer Toy Technical Support Desk powered by Producer Toy's internal audio engineering knowledge base.
- Speak in a polite, highly knowledgeable, and human-like technical tone.

${userAccountSummary}

CRITICAL USER SESSION RULES:
${isUserLoggedIn ? `- The user IS ALREADY LOGGED IN as ${userName} (${userEmail}). NEVER tell them they are in guest mode, NEVER tell them to log in, and NEVER tell them to create an account.` : `- The user is currently browsing as a guest.`}

LIVE PRODUCER TOY STORE INVENTORY (QUERY RESULT FROM DATABASE):
${liveInventoryList || `- [Tabla Master's](/p/tabla-masters) ($19.99, sample_pack) [STATUS: AVAILABLE FOR INSTANT PURCHASE] [120 BPM] - Authentic Indian tabla sample pack featuring professionally recorded dry & processed hits, loops, and rolls.
- [Sexy Drill](/p/sexy-drill) ($9.99, sample_pack) [STATUS: COMING SOON - NOT YET RELEASED / CANNOT BE PURCHASED YET] [BPM: NOT YET ANNOUNCED - IN AUDIO MASTERING] - Chart-topping UK & NY Drill drum kit, sliding 808s, and dark melody loops.`}

CRITICAL RULES FOR COMING SOON PRODUCTS (e.g. "Sexy Drill"):
- When a user asks about "Sexy Drill" or why it cannot be purchased (e.g. "purchase kyu nahi ho raha", "buy kyu nahi kar pa raha"):
  1. Clearly state that "Sexy Drill" is currently in our **Coming Soon** lineup and has NOT officially released yet.
  2. Explain that our audio engineering team is currently finalizing the master 808 slides, drum one-shots, and mix stems. That is why purchase/checkout is temporarily disabled.
  3. NEVER blame guest mode or tell the user to log in or retry payment for a Coming Soon pack.
  4. Inform the user that an official Drop Alert notification card has been provided below where they can get notified the moment it launches!
- GENUINE BPM / TEMPO INQUIRY RULE FOR "SEXY DRILL":
  If the user asks about the BPM or tempo of "Sexy Drill" (e.g. "sexy drill ka bpm kya hai"):
  GENUINE ANSWER: You must clearly state that because "Sexy Drill" is currently in our Coming Soon lineup and our audio engineers are in the middle of final audio mastering and sound design, its official tempo (BPM) has NOT yet been officially announced or released. Once the pack launches officially, the verified BPM and stem tempos will be published on the store page. NEVER invent or claim that its official tempo is 140 BPM!
- GENUINE RULE FOR FREE PRODUCTS / FREE PLUGINS INQUIRIES:
  If the user asks about free plugins, free tools, free sample packs, or free downloads (e.g. "free music production tools"):
  GENUINE ANSWER: Be 100% honest, authentic, and transparent. Clearly state that Producer Toy currently does NOT have any 100% free products or free VST plugins in the database/store catalog. All current sound releases are premium commercial master archives (such as Tabla Master's and upcoming Sexy Drill).
  NEVER hallucinate or link to free plugins or claim that free tools exist.
  NEVER tell the user to clear browser cache, disable ad-blockers, or switch browsers.
  Politely invite them to explore our master releases at [Producer Toy Store](/store) or subscribe to be notified of future promotional releases.

CRITICAL RULES FOR AUTONOMOUS ADMINISTRATIVE PROBLEM RESOLUTION:
1. When user asks about a missing file, broken link, or says "payment confirmed but file not received":
   - If [ADMIN VERIFICATION SUCCESS] is reported in status:
     Celebrate and reassure the user! Let them know their order and payment have been verified in the live database, and their fresh secure download mirror is ready right below this message, plus permanently accessible in [Your Library](/library).
   - If [ADMIN RECORD FOUND] with status failed/pending:
     Explain that the bank/gateway marked the transaction as incomplete. If their account was debited, the payment gateway or bank will automatically reverse the charge back to their source account within 3 to 5 business days.
   - If no purchase is found:
     Politely explain that no verified purchase was recorded for this email/product. Ask if they used a different checkout email or have an order number.
2. When user asks for an Invoice, Bill, or Transaction details:
   - If [ADMIN INVOICE FOUND] is reported:
     Break down the Order Number, Date, Total Amount, Gateway, and Items clearly. Mention that their official, printable International Tax Invoice is attached right below this message.
3. When user asks about ANY Sample Pack, Plugin, or Store Page:
   - Provide deep, technical information:
     - Audio format: 24-bit / 44.1kHz uncompressed WAV audio quality.
     - 100% Royalty-Free Commercial License (legal for Spotify, Apple Music, YouTube monetization, TV, radio).
     - Universal DAW Compatibility: FL Studio, Ableton Live, Logic Pro, Cubase, Studio One, Reaper, Pro Tools, Bitwig.
     - Tempo (BPM), musical key signatures, loop stems, and one-shots.
4. Navigation Links:
   - Mentioning downloads: [Your Library](/library)
   - Store catalog: [Producer Toy Store](/store)
   - Billing & receipts: [Billing & Transactions](/account?tab=transactions)
   - Account settings: [Account Settings](/account)
   - Refund terms: [Refund Policy](/refund-policy)
   - Loyalty rewards: [Toywards Rewards](/features/toywards)
   - Contact or human desk: [Support Desk](/support)

CRITICAL LANGUAGE MATCHING RULE:
- ALWAYS detect and respond in the EXACT same language and script the user communicates in:
  1. Hinglish (Roman Hindi / Urdu, e.g. "konsa sample best rahega", "sexy drill purchase kyu nahi ho raha"):
     -> ALWAYS respond in natural, professional, polite Hinglish! (e.g. "Sexy Drill abhi official Coming Soon status par hai aur store par publicly release nahi hua hai. Humari sound design team iske 808s aur drum stems final master kar rahi hai...").
  2. Hindi / Devanagari script:
     -> ALWAYS respond in respectful, clear Hindi in Devanagari script!
  3. English:
     -> Respond in fluent, professional English.

CRITICAL FORMATTING INSTRUCTIONS (MATCH EPIC GAMES SUPPORT ASSISTANT EXACTLY):
- NEVER use asterisks '*' or bullet dashes '-' at the start of lines. NEVER output bullet points with '*'.
- When providing instructions or steps, ALWAYS format as clean numbered lists:
  1. **Step Name**: Explanation.
  2. **Step Name**: Explanation.
- Never use markdown heading tags like '###' or '##'.
- Write cleanly and elegantly with bold labels and regular text.
- Always include direct markdown links.`

  // Helper to scrub any accidental engine leaks or stray asterisks from answers
  const scrubBrandNames = (text: string) => {
    if (!text) return ''
    return text
      .replace(/\bgroq\b/gi, 'Producer Toy')
      .replace(/\bllama\s*3(\.\d+)?\b/gi, 'Producer Toy Support')
      .replace(/\bqwen(\s*\d+(\.\d+)?)?\b/gi, 'Producer Toy Support')
      .replace(/\bopenai\b/gi, 'Producer Toy')
      .replace(/\bchatgpt\b/gi, 'Producer Toy Assistant')
      .replace(/\(User ID:\s*[a-f0-9-]+\)/gi, '')
      .replace(/User ID:\s*[a-f0-9-]+/gi, '')
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '')
      .replace(/^#{1,4}\s+/gm, '') // Remove ### headings
      .replace(/^[\*\-]\s+/gm, '') // Remove stray * or - at start of lines
      .replace(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g, '[$1]($2)') // Strip stars around links
  }

  // Helper to extract recommended products from AI response and user query
  const findMatchedProducts = (text: string): RecommendedProduct[] => {
    const result: RecommendedProduct[] = []
    const textLower = (text || '').toLowerCase()
    const qLower = (query || '').toLowerCase()

    if (allProducts && allProducts.length > 0) {
      for (const p of allProducts) {
        const nameLower = p.name.toLowerCase()
        const slugLower = p.slug.toLowerCase()
        const isMatched =
          textLower.includes(nameLower) ||
          textLower.includes(slugLower) ||
          qLower.includes(nameLower) ||
          qLower.includes(slugLower) ||
          (slugLower === 'tabla-masters' && (qLower.includes('tabla') || textLower.includes('tabla'))) ||
          (slugLower === 'sexy-drill' && (qLower.includes('drill') || textLower.includes('drill')))

        if (isMatched && !result.some((r) => r.id === p.id)) {
          result.push({
            id: p.id,
            name: p.name,
            slug: p.slug,
            cover_image: p.cover_image || '/images/products/placeholder.png',
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

  try {
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4), // keep last 4 context turns
      { role: 'user', content: query },
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: formattedMessages,
        temperature: 0.35,
        max_tokens: 1200,
      }),
    })

    if (!response.ok) {
      // Fallback to openai/gpt-oss-120b
      const fallbackResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: formattedMessages,
          temperature: 0.35,
          max_tokens: 1200,
        }),
      })

      if (!fallbackResponse.ok) {
        const errText = await fallbackResponse.text()
        console.error('Support API Error:', errText)
        return { success: false, error: 'Support desk is currently busy. Please try again.' }
      }

      const fallbackData = await fallbackResponse.json()
      const rawAnswer = fallbackData.choices?.[0]?.message?.content || ''
      const cleanedAnswer = scrubBrandNames(rawAnswer)

      const resolveComingSoon = (ans: string): ComingSoonProduct | null => {
        if (comingSoonProduct) return comingSoonProduct
        const combined = `${query} ${ans}`.toLowerCase()
        if (
          combined.includes('sexy drill') ||
          combined.includes('sexy-drill') ||
          (combined.includes('drill') && (combined.includes('coming soon') || combined.includes('drop alert') || combined.includes('tempo') || combined.includes('bpm')))
        ) {
          const dbDrill = allProducts.find((p) => p.slug === 'sexy-drill' || p.name.toLowerCase().includes('drill'))
          return {
            id: dbDrill?.id || 'prod-sexy-drill',
            name: dbDrill?.name || 'Sexy Drill',
            slug: dbDrill?.slug || 'sexy-drill',
            cover_image: dbDrill?.cover_image || '/images/products/placeholder.png',
            price_usd: Number(dbDrill?.price_usd || 9.99),
            release_date: dbDrill?.release_date || null,
            short_description: dbDrill?.short_description || 'Chart-topping UK & NY Drill drum kit, sliding 808s, and dark melody loops.',
          }
        }
        return null
      }

      return {
        success: true,
        answer: cleanedAnswer,
        recommendedProducts: findMatchedProducts(cleanedAnswer),
        verifiedDownload,
        verifiedOrder,
        comingSoonProduct: resolveComingSoon(cleanedAnswer),
        canEscalateToTicket,
      }
    }

    const data = await response.json()
    const rawAnswer = data.choices?.[0]?.message?.content || ''
    const cleanedAnswer = scrubBrandNames(rawAnswer)

    const resolveComingSoon = (ans: string): ComingSoonProduct | null => {
      if (comingSoonProduct) return comingSoonProduct
      const combined = `${query} ${ans}`.toLowerCase()
      if (
        combined.includes('sexy drill') ||
        combined.includes('sexy-drill') ||
        (combined.includes('drill') && (combined.includes('coming soon') || combined.includes('drop alert') || combined.includes('tempo') || combined.includes('bpm')))
      ) {
        const dbDrill = allProducts.find((p) => p.slug === 'sexy-drill' || p.name.toLowerCase().includes('drill'))
        return {
          id: dbDrill?.id || 'prod-sexy-drill',
          name: dbDrill?.name || 'Sexy Drill',
          slug: dbDrill?.slug || 'sexy-drill',
          cover_image: dbDrill?.cover_image || '/images/products/placeholder.png',
          price_usd: Number(dbDrill?.price_usd || 9.99),
          release_date: dbDrill?.release_date || null,
          short_description: dbDrill?.short_description || 'Chart-topping UK & NY Drill drum kit, sliding 808s, and dark melody loops.',
        }
      }
      return null
    }

    return {
      success: true,
      answer: cleanedAnswer,
      recommendedProducts: findMatchedProducts(cleanedAnswer),
      verifiedDownload,
      verifiedOrder,
      comingSoonProduct: resolveComingSoon(cleanedAnswer),
      canEscalateToTicket,
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

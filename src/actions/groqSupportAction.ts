'use server'

import { getAdminClient } from '@/lib/supabase/admin'

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

interface ChatMessageInput {
  role: 'user' | 'assistant'
  content: string
}

export interface GroqResponse {
  success: boolean
  answer?: string
  error?: string
  recommendedProducts?: RecommendedProduct[]
}

export async function askGroqSupportAction(
  query: string,
  history: ChatMessageInput[] = []
): Promise<GroqResponse> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'Support service currently unavailable.',
    }
  }

  // 1. Fetch live store inventory from Supabase DB to give real product recommendations
  let liveInventoryList = ''
  let allProducts: any[] = []
  try {
    const admin = getAdminClient()
    const { data: dbProducts } = await admin
      .from('products')
      .select('id, name, slug, cover_image, price_usd, original_price_usd, product_type, short_description')
      .eq('is_active', true)
      .limit(30)

    if (dbProducts && dbProducts.length > 0) {
      allProducts = dbProducts
      liveInventoryList = dbProducts
        .map((p) => {
          const price = p.price_usd ? `$${p.price_usd}` : 'Free'
          const desc = p.short_description ? ` - ${p.short_description}` : ''
          return `- [${p.name}](/p/${p.slug}) (${price}, ${p.product_type})${desc}`
        })
        .join('\n')
    }
  } catch (dbErr) {
    console.warn('[askGroqSupportAction] Failed to query products from DB:', dbErr)
  }

  const systemPrompt = `You are the official "Producer Toy Technical Support Specialist", an expert audio engineer and customer support specialist for Producer Toy (producertoy.com) — the premier marketplace for music producers and sound designers.

CRITICAL IDENTITY & BRAND RULES:
- You are exclusively the internal technical support specialist of Producer Toy.
- NEVER mention "Groq", "Llama", "Qwen", "OpenAI", "ChatGPT", "Meta", or any third-party AI provider, LLM, or model name under any circumstances.
- If asked who is answering or how you operate, respond that you are the official Producer Toy Technical Support Desk powered by Producer Toy's internal audio engineering knowledge base.
- Speak in a polite, highly knowledgeable, and human-like technical tone.

LIVE PRODUCER TOY STORE INVENTORY (QUERY RESULT FROM DATABASE):
${liveInventoryList || `- [Tabla Master's](/p/tabla-masters) ($19.99, sample_pack) - Authentic Indian tabla sample pack featuring professionally recorded dry & processed hits, loops, and rolls.
- [Sexy Drill](/p/sexy-drill) ($9.99, sample_pack) - Chart-topping UK & NY Drill drum kit, sliding 808s, and dark melody loops.`}

CRITICAL PRODUCT RECOMMENDATION RULES (NEVER GIVE GENERIC ANSWERS):
- When a user asks for ANY recommendation, sound, sample pack, or instrument (e.g. "any best sample pack for tabla?", "recommend me a sample pack", "drill", "drums", "percussion"):
  1. DO NOT give a generic answer saying "go search the store" or "I cannot make subjective recommendations".
  2. ALWAYS recommend the exact product available in the LIVE INVENTORY above:
     - For Tabla / Indian Percussion / World Beats: Enthusiastically recommend "[Tabla Master's](/p/tabla-masters)" ($19.99). Describe its authentic Indian tabla recordings, crisp tone, one-shots, and production-ready loops.
     - For Drill / Hip-Hop / 808s: Enthusiastically recommend "[Sexy Drill](/p/sexy-drill)" ($9.99).
     - For General recommendations: Recommend "[Tabla Master's](/p/tabla-masters)" and "[Sexy Drill](/p/sexy-drill)" and provide the store link: [Producer Toy Store](/store).
  3. ALWAYS include direct clickable markdown links [Product Name](/p/product-slug).
  4. Mention that all packs include a 100% royalty-free commercial license, and purchased downloads are available instantly in [Your Library](/library).

CRITICAL REDIRECT LINKS RULES (ALWAYS EMBED MARKDOWN LINKS IN YOUR ANSWERS):
- When mentioning where to download purchased items, license keys, or sample packs, ALWAYS include a clickable markdown link: [Your Library](/library).
- When mentioning free plugins: [Free VST Plugins](/free-vst-plugins).
- When mentioning browsing sounds, sample packs, or synth presets: [Producer Toy Store](/store).
- When mentioning invoices, receipts, or transactions: [Billing & Transactions](/account?tab=transactions).
- When mentioning account details: [Account Settings](/account).
- When mentioning technical support or raising a ticket: [Support Desk](/support).
- When mentioning refund policy: [Refund Policy](/refund-policy).
- If the user asks where they can download purchased samples (e.g. "from where I can download purchase sample"):
  Answer directly and clearly: "You can download all your purchased sample packs and plugins directly from [Your Library](/library). Once you log in, all your download mirrors and license keys are available there with 1-click."

Core Knowledge Base:
1. Downloads & Purchases:
   - All purchased sample packs, presets, and VST plugins are available instantly in [Your Library](/library) with fast Google Cloud CDN mirrors.
2. Free Products & Royalties:
   - Everything in [Free VST Plugins](/free-vst-plugins) is 100% free with no credit card required.
   - All sample packs, loops, and presets come with a 100% ROYALTY-FREE commercial license.
3. Orders & Tax Invoices:
   - Invoices and GST/VAT receipts can be downloaded from [Billing & Transactions](/account?tab=transactions).
4. DAW Troubleshooting:
   - FL Studio: Go to Options > Manage plugins. Verify "C:\\Program Files\\Common Files\\VST3", then click "Find installed plugins".
   - Ableton Live: Open Preferences > Plug-Ins. Hold ALT (Windows) or OPTION (Mac) and click "Rescan".
   - Logic Pro: Open Settings > Plug-in Manager > "Reset & Rescan Selection".

CRITICAL FORMATTING INSTRUCTIONS (MATCH EPIC GAMES SUPPORT ASSISTANT EXACTLY):
- NEVER use asterisks '*' or bullet dashes '-' at the start of lines. NEVER output bullet points with '*'.
- When providing instructions or steps, ALWAYS format as clean numbered lists:
  1. **Step Name**: Explanation.
  2. **Step Name**: Explanation.
- Never use markdown heading tags like '###' or '##'.
- Write cleanly and elegantly with bold labels and regular text, exactly like the Epic Games Support Assistant.
- Always include relevant direct markdown links for navigation.`

  // Helper to scrub any accidental engine leaks or stray asterisks from answers
  const scrubBrandNames = (text: string) => {
    if (!text) return ''
    return text
      .replace(/\bgroq\b/gi, 'Producer Toy')
      .replace(/\bllama\s*3(\.\d+)?\b/gi, 'Producer Toy Support')
      .replace(/\bqwen(\s*\d+(\.\d+)?)?\b/gi, 'Producer Toy Support')
      .replace(/\bopenai\b/gi, 'Producer Toy')
      .replace(/\bchatgpt\b/gi, 'Producer Toy Assistant')
      .replace(/^#{1,4}\s+/gm, '') // Remove ### headings
      .replace(/^[\*\-]\s+/gm, '') // Remove stray * or - at start of lines
  }

  // Helper to extract recommended products from AI response and user query
  const findMatchedProducts = (text: string): RecommendedProduct[] => {
    const result: RecommendedProduct[] = []
    const textLower = (text || '').toLowerCase()
    const queryLower = (query || '').toLowerCase()

    if (allProducts && allProducts.length > 0) {
      for (const p of allProducts) {
        const nameLower = p.name.toLowerCase()
        const slugLower = p.slug.toLowerCase()
        const isMatched =
          textLower.includes(nameLower) ||
          textLower.includes(slugLower) ||
          queryLower.includes(nameLower) ||
          queryLower.includes(slugLower) ||
          (slugLower === 'tabla-masters' && (queryLower.includes('tabla') || textLower.includes('tabla'))) ||
          (slugLower === 'sexy-drill' && (queryLower.includes('drill') || textLower.includes('drill')))

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
        temperature: 0.4,
        max_tokens: 500,
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
          temperature: 0.4,
          max_tokens: 500,
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

      return {
        success: true,
        answer: cleanedAnswer,
        recommendedProducts: findMatchedProducts(cleanedAnswer),
      }
    }

    const data = await response.json()
    const rawAnswer = data.choices?.[0]?.message?.content || ''
    const cleanedAnswer = scrubBrandNames(rawAnswer)

    return {
      success: true,
      answer: cleanedAnswer,
      recommendedProducts: findMatchedProducts(cleanedAnswer),
    }
  } catch (error: any) {
    console.error('Support Action Exception:', error)
    return {
      success: false,
      error: 'Network error connecting to support desk.',
    }
  }
}

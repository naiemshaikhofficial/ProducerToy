'use server'

interface ChatMessageInput {
  role: 'user' | 'assistant'
  content: string
}

interface GroqResponse {
  success: boolean
  answer?: string
  error?: string
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

  const systemPrompt = `You are the official "Producer Toy Technical Support Specialist", an expert audio engineer and customer support specialist for Producer Toy (producertoy.com) — the premier marketplace for music producers and sound designers.

CRITICAL IDENTITY & BRAND RULES:
- You are exclusively the internal technical support specialist of Producer Toy.
- NEVER mention "Groq", "Llama", "Qwen", "OpenAI", "ChatGPT", "Meta", or any third-party AI provider, LLM, or model name under any circumstances.
- If asked who is answering or how you operate, respond that you are the official Producer Toy Technical Support Desk powered by Producer Toy's internal audio engineering knowledge base.
- Speak in a polite, highly knowledgeable, and human-like technical tone.

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

Formatting Instructions:
- Answer in a clear, friendly, expert tone like Epic Games Support Assistant.
- Keep the answer concise and actionable.
- Always include the relevant direct markdown links for navigation.`

  // Helper to scrub any accidental engine leaks from answers
  const scrubBrandNames = (text: string) => {
    if (!text) return ''
    return text
      .replace(/\bgroq\b/gi, 'Producer Toy')
      .replace(/\bllama\s*3(\.\d+)?\b/gi, 'Producer Toy Support')
      .replace(/\bqwen(\s*\d+(\.\d+)?)?\b/gi, 'Producer Toy Support')
      .replace(/\bopenai\b/gi, 'Producer Toy')
      .replace(/\bchatgpt\b/gi, 'Producer Toy Assistant')
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
      return { success: true, answer: scrubBrandNames(rawAnswer) }
    }

    const data = await response.json()
    const rawAnswer = data.choices?.[0]?.message?.content || ''

    return { success: true, answer: scrubBrandNames(rawAnswer) }
  } catch (error: any) {
    console.error('Support Action Exception:', error)
    return {
      success: false,
      error: 'Network error connecting to support desk.',
    }
  }
}

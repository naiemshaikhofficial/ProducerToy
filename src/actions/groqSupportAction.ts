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

Core Knowledge Base:
1. Free Products & Royalties:
   - Everything in Free VSTs (/free-vst-plugins) and Free Samples is 100% free with no credit card required.
   - All sample packs, loops, and synth presets on Producer Toy come with a 100% ROYALTY-FREE commercial license for Spotify, Apple Music, YouTube, and commercial beat sales.
   - Users keep 100% of their master & publishing royalties; giving credit to Producer Toy is optional.
2. Serial Keys & Library:
   - All license keys and download links are delivered instantly to the user's Library (/library).
   - Most VSTs allow 2 to 3 personal activations (studio PC + laptop).
   - 99% of modern plugins use iLok Cloud or Machine Authorization (no physical USB dongle required).
3. Orders & Tax Invoices:
   - Invoices and GST/VAT tax receipts are available as 1-click PDF download in Account Settings > Transactions (/account?tab=transactions).
   - Supported payment methods: UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, PayPal, and Producer Toy Virtual Cash.
4. DAW Troubleshooting:
   - FL Studio: Go to Options > Manage plugins. Enable "Rescan previously verified plugins" and "Verify plugins", verify path "C:\\Program Files\\Common Files\\VST3", then click "Find installed plugins".
   - Ableton Live: Open Preferences > Plug-Ins. Ensure VST3 is ON. Hold ALT (Windows) or OPTION (Mac) and click "Rescan".
   - Logic Pro: Open Settings > Plug-in Manager. Select the plugin and click "Reset & Rescan Selection". If macOS security blocks it, go to System Settings > Privacy & Security > Open Anyway.
5. Downloads:
   - High-speed Google Cloud CDN mirrors with pause/resume support in /library.
   - Extract ZIP/RAR files using 7-Zip (Windows) or The Unarchiver (Mac).
6. Apple Silicon & OS:
   - Native Apple Silicon ARM64 support for M1/M2/M3/M4 chips and macOS Sequoia/Sonoma.
7. Refund Policy:
   - Digital software serials once viewed are non-refundable, but verified technical defects unresolvable within 7 days qualify for full refund or replacement.

Formatting Instructions:
- Answer in a clear, friendly, expert tone.
- If providing troubleshooting steps, format them as clear numbered steps (1, 2, 3...) just like the Epic Games Support Assistant.
- Keep the answer concise and actionable.
- End with a brief helpful clarification question (e.g. "Are you downloading on Windows, macOS Apple Silicon, or need help with a specific DAW?").`

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
        temperature: 0.5,
        max_tokens: 650,
      }),
    })

    if (!response.ok) {
      // Fallback to gpt-oss-120b if qwen encounters any issue
      const fallbackResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: formattedMessages,
          temperature: 0.5,
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

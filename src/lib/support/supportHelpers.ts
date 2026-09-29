import path from 'path'
import fs from 'fs'

export function getGroqApiKey(): string | null {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    return process.env.GROQ_API_KEY.trim()
  }
  for (const file of ['.env.local', '.env']) {
    try {
      const envPath = path.resolve(process.cwd(), file)
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        const match = content.match(/^\s*GROQ_API_KEY\s*=\s*(.+)/m)
        if (match && match[1]) {
          const val = match[1].trim().replace(/^['"]|['"]$/g, '')
          process.env.GROQ_API_KEY = val
          return val
        }
      }
    } catch (err) {
      console.warn(`[getGroqApiKey] Error reading ${file}:`, err)
    }
  }
  return null
}

export function ensureSupabaseAdminEnv() {
  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    try {
      const envPath = path.resolve(process.cwd(), file)
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        const mUrl = content.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)/m)
        if (mUrl && mUrl[1] && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          process.env.NEXT_PUBLIC_SUPABASE_URL = mUrl[1].trim().replace(/^['"]|['"]$/g, '')
        }
        const mKey = content.match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.+)/m)
        if (mKey && mKey[1] && !process.env.SUPABASE_SERVICE_ROLE_KEY && mKey[1].trim().length > 20) {
          process.env.SUPABASE_SERVICE_ROLE_KEY = mKey[1].trim().replace(/^['"]|['"]$/g, '')
        }
        const mAnon = content.match(/^\s*NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.+)/m)
        if (mAnon && mAnon[1] && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = mAnon[1].trim().replace(/^['"]|['"]$/g, '')
        }
      }
    } catch (err) {
      console.warn(`[ensureSupabaseAdminEnv] Error reading ${file}:`, err)
    }
  }
}

/**
 * Strict regex checker for real profanity / vulgarity / abusive slurs (gaaliyan).
 * Strikes MUST ONLY trigger when this returns true!
 */
export function hasProfanityOrAbuse(query: string): boolean {
  if (!query) return false
  const q = query.toLowerCase()

  // Common Hindi / Urdu / Hinglish abusive words & gaaliyan
  const desiGaaliPattern = /\b(bhenchod|bc|madarchod|mc|bhosdike|bhosadi|chutiya|chutiye|gandu|laude|lodu|chinal|randi|gaand|maderchod|harami|kamine|suar|kutte|saale|chod|chodo|lund|jhant|tatton)\b/i
  if (desiGaaliPattern.test(q)) return true

  // Standard English profanity & slurs
  const englishAbusePattern = /\b(fuck|fucking|fucker|shit|bitch|bastard|asshole|cunt|dick|pussy|slut|whore|motherfucker|faggot|nigger|retard)\b/i
  if (englishAbusePattern.test(q)) return true

  return false
}

/**
 * Detect language of user query: english, hindi, hinglish
 */
export function detectLanguage(query: string): 'english' | 'hindi' | 'hinglish' | 'other' {
  if (!query) return 'english'
  // Devanagari script detection
  if (/[\u0900-\u097F]/.test(query)) {
    return 'hindi'
  }
  const q = query.toLowerCase()
  const hinglishMarkers = /\b(kya|kyu|kaise|kitna|kitne|hai|hain|nahi|mila|hoga|batao|bataiye|kar|karo|raha|rahe|meri|mera|aap|tum|kaun|kab|apne|mujhe|hum|aur|ye|yeh|wo|woh|bhi|pe|par|ko|se|ne|mari|mara|kuch|sabko|baki|de)\b/i
  if (hinglishMarkers.test(q)) {
    return 'hinglish'
  }
  return 'english'
}

/**
 * Helper to identify off-topic questions (sports, cricket, celebrities, personal/private questions,
 * general knowledge, trivia) so we can give a polite redirect WITHOUT any policy strike.
 */
export function isOffTopicQuery(query: string): boolean {
  if (!query) return false
  const q = query.toLowerCase().trim()

  const offTopicKeywords = [
    // Sports & Cricket
    'virat',
    'kohli',
    'kolhi',
    'rohit',
    'sharma',
    'dhoni',
    'century',
    'centuries',
    'wicket',
    'wickets',
    'cricket',
    'ipl',
    'football',
    'messi',
    'ronaldo',
    'fifa',
    'match',
    'score',
    // Entertainment & Cartoons
    'chota bheem',
    'chhota bheem',
    'motu patlu',
    'shinchan',
    'doraemon',
    'cartoon',
    'movie',
    'cinema',
    'film',
    'actor',
    'actress',
    'celebrity',
    'bollywood',
    'hollywood',
    // Politics & General Knowledge
    'prime minister',
    'president',
    'modi',
    'politics',
    'election',
    'weather',
    'weather today',
    'capital of',
    'history of',
    'geography',
    'recipe',
    'cooking',
    'who won',
    // Personal & Private inquiries
    'girlfriend',
    'boyfriend',
    'marriage',
    'shadi',
    'salary',
    'income',
    'personal',
    'private',
    'where do you live',
    'kaha rehte ho',
    'tell me a joke',
  ]

  return offTopicKeywords.some((k) => q.includes(k))
}

export function scrubBrandNames(text: string): string {
  if (!text) return ''
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/^(?:thought|thinking|reasoning|scratchpad):\s*[\s\S]*?\n\n/gi, '')
    .replace(/^The user (?:says|asks|wants)[\s\S]*?(?:We must|So we can|Let's|Therefore|Recommendation:)[\s\S]*?\n\n/i, '')
    .replace(/\bgroq\b/gi, 'Prody')
    .replace(/\bllama\s*3(\.\d+)?\b/gi, 'Prody')
    .replace(/\bqwen(\s*\d+(\.\d+)?)?\b/gi, 'Prody')
    .replace(/\bopenai\b/gi, 'Producer Toy')
    .replace(/\bchatgpt\b/gi, 'Prody')
    .replace(/\(User ID:\s*[a-f0-9-]+\)/gi, '')
    .replace(/User ID:\s*[a-f0-9-]+/gi, '')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '')
    .replace(/\[POLICY_VIOLATION\]/gi, '')
    .replace(/\[TERMINATE_CHAT\]/gi, '')
    .replace(/\[PROBLEM_SOLVED\]/gi, '')
    .trim()
}

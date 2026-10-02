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
 * Detect language of user query: english, hindi, hinglish, arabic, urdu, spanish, other
 */
export function detectLanguage(query: string): 'english' | 'hindi' | 'hinglish' | 'arabic' | 'urdu' | 'spanish' | 'other' {
  if (!query) return 'english'

  // Arabic and Urdu script detection
  if (/[\u0600-\u06FF]/.test(query)) {
    // Distinctive Urdu characters/words
    if (/[ٹڈڑںہے]|(\b(کیسے|کیا|ہیں|تھا|تھی|تھے|کیوں|بنائیں|پوچھیں)\b)/.test(query)) {
      return 'urdu'
    }
    return 'arabic'
  }

  // Devanagari script detection
  if (/[\u0900-\u097F]/.test(query)) {
    return 'hindi'
  }

  const q = query.toLowerCase()

  // Spanish detection
  if (/[¿¡]|\b(cómo|como|hacer|receta|música|musica|hola|gracias|por favor|buenos días|buenas tardes)\b/i.test(q)) {
    return 'spanish'
  }

  const hinglishMarkers = /\b(kya|kyu|kaise|kitna|kitne|hai|hain|nahi|mila|hoga|batao|bataiye|kar|karo|raha|rahe|meri|mera|aap|tum|kaun|kab|apne|mujhe|hum|aur|ye|yeh|wo|woh|bhi|pe|par|ko|se|ne|mari|mara|kuch|sabko|baki|de)\b/i
  if (hinglishMarkers.test(q)) {
    return 'hinglish'
  }
  return 'english'
}

/**
 * Helper to identify off-topic questions (cooking, recipes, sports, cricket, celebrities, personal,
 * general knowledge, GK, science, math, history) so we can give a polite redirect WITHOUT any policy strike.
 */
export function isOffTopicQuery(query: string): boolean {
  if (!query) return false
  const q = query.toLowerCase().trim()

  // STRICT EXEMPTION: Any query about Producer Toy, founder, News, FAQ, About, DAW setup, VSTs, or audio tools is ALWAYS on-topic
  const onTopicExceptions = [
    'producer toy',
    'producertoy',
    'sampleswala',
    'naiem',
    'shaikh',
    'vst',
    'plugin',
    'plugins',
    'sample',
    'samples',
    'sound',
    'soundbank',
    'preset',
    'presets',
    'daw',
    'fl studio',
    'ableton',
    'logic pro',
    'cubase',
    'studio one',
    'reaper',
    'bitwig',
    'news',
    'deal',
    'deals',
    'faq',
    'faqs',
    'about',
    'founder',
    'sell',
    'selling',
    'distribute',
    'affiliate',
    'commission',
    'refund',
    'license',
    'serial',
    'key',
    'download',
    'order',
    'ticket',
    'support',
    'gift',
    'gifts',
    'wishlist',
    'install',
    'installation',
    'setup',
    'unzip',
    'extract',
    'activate',
    'activation',
    'authorize',
    'authorization',
    'serum',
    'vital',
    'massive',
    'sylenth',
    'midi',
    'audio unit',
    'component',
    'vst3',
    'vst2',
    'aax',
    'gatekeeper',
    'apple silicon',
    'rosetta',
    'drum kit',
    '808',
  ]
  if (onTopicExceptions.some((term) => q.includes(term))) {
    return false
  }

  const offTopicKeywords = [
    // Cooking, Food & Recipes
    'recipe',
    'recipes',
    'cooking',
    'cook',
    'biryani',
    'paella',
    'pizza',
    'burger',
    'curry',
    'roti',
    'sabzi',
    'chai',
    'tea',
    'coffee',
    'cake',
    'food',
    'dish',
    'ingredients',
    'how to make',
    'kaise banaye',
    'kaise banate',
    'طريقة عمل',
    'طبخ',
    'وصفة',
    'کھانا',
    'receta',
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
    // Politics & General Knowledge / GK
    'gk',
    'general knowledge',
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
    'planet',
    'solar system',
    'math equation',
    'chemistry formula',
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

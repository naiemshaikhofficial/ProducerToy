/**
 * ProducerToy Universal Ultra-Fast Music Production Search Engine
 * Features space/hyphen agnostic fuzzy matching, squashed token search, multi-field indexing,
 * and audio producer alias expansion.
 */

// Common producer terminology aliases to guarantee expected matches
const AUDIO_SYNONYMS: Record<string, string[]> = {
  'autotune': ['auto tune', 'auto-tune', 'pitch correction', 'vocal tuning', 'tuning', 'autopitch', 'mautopitch'],
  'auto tune': ['autotune', 'auto-tune', 'pitch correction', 'vocal tuning', 'tuning', 'autopitch', 'mautopitch'],
  'auto-tune': ['autotune', 'auto tune', 'pitch correction', 'vocal tuning', 'tuning', 'autopitch', 'mautopitch'],
  'autopitch': ['mautopitch', 'autotune', 'auto tune', 'auto-tune', 'pitch'],
  'pitch': ['autotune', 'auto tune', 'pitch shifter', 'vocal tuning', 'pitch correction'],
  'eq': ['equalizer', 'equaliser', 'dynamic eq', 'filter', 'tdr nova'],
  'equalizer': ['eq', 'equaliser', 'dynamic eq', 'filter'],
  'reverb': ['reverberation', 'space', 'hall', 'ambient', 'supermassive', 'valhalla'],
  'delay': ['echo', 'space echo', 'ping pong', 'supermassive'],
  'compressor': ['compression', 'comp', 'dynamics', 'limiter', 'bus'],
  'saturation': ['saturator', 'distortion', 'warmth', 'analog warmth', 'tape', 'tube', 'fresh air'],
  'distortion': ['saturation', 'overdrive', 'fuzz', 'warmth'],
  'drum': ['drums', 'drum kit', 'drumkit', 'percussion', 'trap', '808'],
  'drum kit': ['drumkit', 'drum-kit', 'drums', 'samples', 'sample pack', 'trap'],
  'drumkit': ['drum kit', 'drum-kit', 'drums', 'samples'],
  'sample': ['samples', 'sample pack', 'samplepack', 'loops', 'wav', 'sound kit'],
  'sample pack': ['samplepack', 'sample-pack', 'samples', 'loops', 'kit'],
  'samplepack': ['sample pack', 'sample-pack', 'samples'],
  'preset': ['presets', 'soundbank', 'serum', 'vital', 'massive', 'patches'],
  'vocal': ['vocals', 'acapella', 'voice', 'autotune', 'auto tune', 'pitch'],
}

/**
 * Universal search matching logic
 */
export function matchesSearchQuery(product: any, query: string): boolean {
  if (!query || !query.trim()) return true

  const rawQ = query.toLowerCase().trim()
  const squashedQ = rawQ.replace(/[\s\-_.,/]+/g, '')
  const tokens = rawQ.split(/[\s\-_.,/]+/).filter(Boolean)

  if (tokens.length === 0 && !squashedQ) return true

  // 1. Build unified text corpus across all product fields
  const corpusParts = [
    product.name,
    product.slug,
    product.brand,
    product.brands?.name,
    product.brands?.slug,
    product.category,
    product.categories?.name,
    product.categories?.slug,
    product.subcategory,
    product.subcategories?.name,
    product.subcategories?.slug,
    Array.isArray(product.category_slugs) ? product.category_slugs.join(' ') : '',
    product.short_description,
    product.description,
    product.full_description,
    product.product_type,
    product.vst_format,
    product.vstFormat,
    product.platform,
    Array.isArray(product.tags) ? product.tags.join(' ') : '',
  ].filter(Boolean)

  const corpusRaw = corpusParts.join(' ').toLowerCase()
  const squashedCorpus = corpusRaw.replace(/[\s\-_.,/]+/g, '')

  // 2. Direct string or squashed match (e.g. "autotune" in "mautopitch" or "auto tune" in "Auto Tune")
  if (corpusRaw.includes(rawQ) || squashedCorpus.includes(squashedQ)) {
    return true
  }

  // 3. Synonym / Alias expansion check
  const synonymList = AUDIO_SYNONYMS[rawQ] || AUDIO_SYNONYMS[squashedQ] || []
  for (const syn of synonymList) {
    const squashedSyn = syn.replace(/[\s\-_.,/]+/g, '')
    if (corpusRaw.includes(syn) || squashedCorpus.includes(squashedSyn)) {
      return true
    }
  }

  // 4. Token-by-token match (Every search word must match anywhere in raw or squashed text or synonyms)
  return tokens.every((token) => {
    const squashedToken = token.replace(/[\s\-_.,/]+/g, '')
    if (corpusRaw.includes(token) || squashedCorpus.includes(squashedToken)) {
      return true
    }

    const tokenSynonyms = AUDIO_SYNONYMS[token] || AUDIO_SYNONYMS[squashedToken] || []
    return tokenSynonyms.some((syn) => {
      const squashedSyn = syn.replace(/[\s\-_.,/]+/g, '')
      return corpusRaw.includes(syn) || squashedCorpus.includes(squashedSyn)
    })
  })
}

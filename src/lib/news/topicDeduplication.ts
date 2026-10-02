export interface MinimalArticle {
  id: string
  slug: string
  title: string
  cover_image?: string | null
  content?: string | null
  published_at?: string
  [key: string]: any
}

export const TOPIC_STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'the',
  'for',
  'with',
  'from',
  'in',
  'on',
  'at',
  'by',
  'to',
  'of',
  'this',
  'that',
  'these',
  'those',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'deal',
  'deals',
  'sale',
  'sales',
  'off',
  'discount',
  'discounts',
  'special',
  'limited',
  'time',
  'week',
  'month',
  'flash',
  'mega',
  'save',
  'savings',
  'major',
  'get',
  'grab',
  'now',
  'today',
  'free',
  'freeware',
  'giveaway',
  'vst',
  'vsts',
  'vst3',
  'plugin',
  'plugins',
  'audio',
  'sound',
  'sounds',
  'edition',
  'bundle',
  'alert',
  'huge',
  'collection',
])

export function getTitleKeywords(title?: string | null): string[] {
  if (!title) return []
  return title
    .toLowerCase()
    .replace(/&#[0-9]+;/g, ' ')
    .replace(/&[a-z0-9]+;/gi, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !TOPIC_STOPWORDS.has(w))
}

export function getTopicSignature(title?: string | null): string {
  const kw = getTitleKeywords(title)
  return kw.slice(0, 4).join(' ')
}

export function calculateTitleSimilarity(title1: string, title2: string): number {
  const kw1 = new Set(getTitleKeywords(title1))
  const kw2 = new Set(getTitleKeywords(title2))
  if (kw1.size === 0 || kw2.size === 0) return 0
  let intersection = 0
  for (const w of kw1) {
    if (kw2.has(w)) intersection++
  }
  const union = new Set([...kw1, ...kw2]).size
  return intersection / union
}

/**
 * Consolidate duplicate articles covering the same promotion/topic into one canonical article
 */
export function deduplicateArticlesByTopic<T extends MinimalArticle>(articles: T[]): T[] {
  if (!articles || articles.length === 0) return []
  const result: T[] = []

  for (const article of articles) {
    const title = article.title || ''
    const sig = getTopicSignature(title)

    let matchIdx = -1
    for (let i = 0; i < result.length; i++) {
      const existing = result[i]
      const existingSig = getTopicSignature(existing.title || '')
      const sim = calculateTitleSimilarity(title, existing.title || '')

      if ((sig && existingSig && sig === existingSig) || sim >= 0.55) {
        matchIdx = i
        break
      }
    }

    if (matchIdx === -1) {
      result.push(article)
    } else {
      // Pick the better canonical article between the two
      const existing = result[matchIdx]
      let existingScore = 0
      let newScore = 0

      // Better image (valid Fastly / CDN vs generic / placeholder)
      if (
        existing.cover_image &&
        !existing.cover_image.includes('placeholder') &&
        !existing.cover_image.includes('google')
      )
        existingScore += 30
      if (
        article.cover_image &&
        !article.cover_image.includes('placeholder') &&
        !article.cover_image.includes('google')
      )
        newScore += 30

      // Better slug relevance to topic
      const sigTokens = sig.split(' ')
      if (sigTokens.some((t) => existing.slug?.includes(t))) existingScore += 25
      if (sigTokens.some((t) => article.slug?.includes(t))) newScore += 25

      // Content depth
      if ((article.content?.length || 0) > (existing.content?.length || 0)) newScore += 15
      else existingScore += 15

      // Recency
      const existingTime = existing.published_at ? new Date(existing.published_at).getTime() : 0
      const newTime = article.published_at ? new Date(article.published_at).getTime() : 0
      if (newTime > existingTime) newScore += 10
      else existingScore += 10

      if (newScore > existingScore) {
        result[matchIdx] = article
      }
    }
  }
  return result
}

export function generateThemedCoverPrompt(title?: string | null): string {
  const clean = (title || 'music production vst audio plugin')
    .replace(/&#?[a-z0-9]+;/gi, ' ')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const lower = clean.toLowerCase()

  if (
    lower.includes('free vst') ||
    lower.includes('free plugin') ||
    lower.includes('freeware') ||
    lower.includes('essential list') ||
    lower.includes('best free')
  ) {
    return `futuristic music production studio audio workstation with glowing synthesizer rack, mixing console, and audio vst plugin interfaces on screens, professional music technology editorial visual for "${clean.slice(0, 65)}", 8k render, modern neon amber studio lighting`
  }
  if (lower.includes('kontakt') || lower.includes('library') || lower.includes('sample')) {
    return `high end virtual instrument sampler workstation with sound library rack, orchestral and synth sample visualizer on studio display, audio software header for "${clean.slice(0, 65)}", 8k render`
  }
  if (lower.includes('vocal') || lower.includes('pitch') || lower.includes('autotune') || lower.includes('tune')) {
    return `modern vocal production recording studio with studio microphone, vocal waveform visualizer, audio pitch correction plugin interface on monitor, neon lighting 8k render for "${clean.slice(0, 65)}"`
  }
  if (
    lower.includes('synth') ||
    lower.includes('synthesizer') ||
    lower.includes('wavetable') ||
    lower.includes('fm8') ||
    lower.includes('massive')
  ) {
    return `sleek modular analog synthesizer workstation with patch cables, illuminated oscilloscopes, and wavetable displays, professional audio tech editorial header for "${clean.slice(0, 65)}", 8k render, cinematic ambient lighting`
  }
  if (lower.includes('guitar') || lower.includes('amp') || lower.includes('pedal') || lower.includes('distortion')) {
    return `boutique tube amplifier guitar pedals and virtual audio effect plugin interface in high-end sound studio, 8k render for "${clean.slice(0, 65)}"`
  }
  if (lower.includes('drum') || lower.includes('beat') || lower.includes('percussion') || lower.includes('808')) {
    return `modern drum machine groovebox sequencer with glowing velocity pads and dynamic beat visualizer, music production gear 8k render for "${clean.slice(0, 65)}"`
  }
  if (lower.includes('mixing') || lower.includes('mastering') || lower.includes('compressor') || lower.includes('eq') || lower.includes('reverb')) {
    return `mastering studio console with analog VU meters, stereo mastering equalizer and compressor interfaces, pristine studio acoustics, 8k render for "${clean.slice(0, 65)}"`
  }
  return `sleek futuristic music production synthesizer daw studio vst plugin neon amber lighting high resolution 8k render, professional audio technology article header for ${clean.slice(0, 75)}`
}

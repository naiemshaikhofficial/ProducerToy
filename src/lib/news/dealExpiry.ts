/**
 * Deal Expiry Detection and Formatting Utility
 * Handles expiration detection, date parsing, and timeline formatting for audio news & deals.
 */

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

export interface DealExpiryResult {
  isExpired: boolean
  expiryTimeline: string | null // e.g. "Until Nov 01", "Ends Oct 31"
  expiryDateStr: string | null // e.g. "Nov 01, 2026" or "Nov 01"
  rawText: string | null
}

export function parseExpiryDateText(
  rawText: string,
  publishedAt?: string
): { isExpired: boolean; date: Date; formatted: string; isGracePeriod?: boolean } | null {
  if (!rawText || typeof rawText !== 'string') return null

  // Strip prefixes such as "Ends on", "Ends", "Until", "Valid until", "Expires on", etc.
  const clean = rawText
    .replace(/^(?:ends\s+(?:on\s+)?|until\s+|valid\s+until\s+|expires\s+(?:on\s+)?|valid\s+through\s+)/i, '')
    .replace(/(\d+)(?:st|nd|rd|th)/gi, '$1')
    .trim()

  // Relative: Today / Tonight / Ends Today
  if (/^(?:today|tonight|ends?\s+today|ending\s+today|ends?\s+tonight)/i.test(clean)) {
    const now = new Date()
    const expiryDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999))
    return {
      isExpired: Date.now() > expiryDate.getTime(),
      date: expiryDate,
      formatted: 'Today',
    }
  }

  // Relative: Tomorrow / Ends Tomorrow
  if (/^(?:tomorrow|ends?\s+tomorrow|ending\s+tomorrow)/i.test(clean)) {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const expiryDate = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate(), 23, 59, 59, 999))
    return {
      isExpired: false,
      date: expiryDate,
      formatted: 'Tomorrow',
    }
  }

  // Countdown timer format: e.g. "00:01:35:57" or "00 01 35 57" (Days Hours Minutes Seconds)
  const timerMatch = clean.match(/^(\d{2})[:\s]+(\d{2})[:\s]+(\d{2})[:\s]+(\d{2})/)
  if (timerMatch) {
    const days = parseInt(timerMatch[1], 10)
    const hours = parseInt(timerMatch[2], 10)
    const minutes = parseInt(timerMatch[3], 10)
    const seconds = parseInt(timerMatch[4], 10)
    const totalMs = (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000

    const expiryDate = new Date(Date.now() + totalMs)
    let formatted = 'Today'
    if (days > 1) {
      formatted = `${days} Days`
    } else if (days === 1) {
      formatted = 'Tomorrow'
    } else if (hours > 0) {
      formatted = `${hours}h Left`
    } else if (minutes > 0) {
      formatted = `${minutes}m Left`
    }

    return {
      isExpired: totalMs <= 0,
      date: expiryDate,
      formatted,
    }
  }

  // Relative hours: e.g. "Ends in 1h" or "1 hour" or "2 hours"
  const hoursLeftMatch = clean.match(/^(\d{1,2})\s*(?:hours?|hrs?|h)\s*(?:left)?/i)
  if (hoursLeftMatch) {
    const hrs = parseInt(hoursLeftMatch[1], 10)
    const expiryDate = new Date(Date.now() + hrs * 60 * 60 * 1000)
    return {
      isExpired: hrs <= 0,
      date: expiryDate,
      formatted: `${hrs}h Left`,
    }
  }

  // Pattern 1: Month Day Year? (e.g. "Nov 01", "Nov 1, 2024", "November 1 2026")
  const m1 = clean.match(/^([a-zA-Z]+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/)
  // Pattern 2: Day Month Year? (e.g. "01 Nov", "1 November 2026", "04 Oct")
  const m2 = clean.match(/^(\d{1,2})\s+([a-zA-Z]+)(?:,?\s*(\d{4}))?/)
  // Pattern 3: Numeric format (e.g. "2026-11-01" or "11/01/2026" or "01-11-2026")
  const m3 = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)

  let monthIndex = -1
  let day = -1
  let year = -1
  let formatted = ''

  if (m3) {
    year = parseInt(m3[1], 10)
    monthIndex = parseInt(m3[2], 10) - 1
    day = parseInt(m3[3], 10)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    formatted = `${monthNames[monthIndex] || 'M'} ${day}`
  } else if (m1 && MONTH_MAP[m1[1].toLowerCase()] !== undefined) {
    const rawMonth = m1[1]
    monthIndex = MONTH_MAP[rawMonth.toLowerCase()]
    day = parseInt(m1[2], 10)
    year = m1[3] ? parseInt(m1[3], 10) : -1
    formatted = `${rawMonth.slice(0, 3)} ${day}`
  } else if (m2 && MONTH_MAP[m2[2].toLowerCase()] !== undefined) {
    const rawMonth = m2[2]
    monthIndex = MONTH_MAP[rawMonth.toLowerCase()]
    day = parseInt(m2[1], 10)
    year = m2[3] ? parseInt(m2[3], 10) : -1
    formatted = `${rawMonth.slice(0, 3)} ${day}`
  }

  if (monthIndex < 0 || day <= 0 || day > 31) return null

  // If year not explicitly given, derive from publishedAt or current year
  if (year < 0) {
    let baseYear = new Date().getFullYear()
    let pubMonth = new Date().getMonth()

    if (publishedAt) {
      try {
        const pubDate = new Date(publishedAt)
        if (!isNaN(pubDate.getTime())) {
          baseYear = pubDate.getFullYear()
          pubMonth = pubDate.getMonth()
        }
      } catch {}
    }

    year = baseYear
    // If published in December and deal ends in January, rollover year
    if (pubMonth === 11 && monthIndex === 0) {
      year = baseYear + 1
    }
  }

  // Set expiration to end of the day in UTC (23:59:59.999)
  const expiryDate = new Date(Date.UTC(year, monthIndex, day, 23, 59, 59, 999))
  if (isNaN(expiryDate.getTime())) return null

  const diffMs = Date.now() - expiryDate.getTime()
  // 36-hour timezone grace period for active sales (PST/PDT offset + same-week store closeout)
  const isGracePeriod = diffMs > 0 && diffMs <= 36 * 60 * 60 * 1000
  const isExpired = diffMs > 36 * 60 * 60 * 1000

  return {
    isExpired,
    isGracePeriod,
    date: expiryDate,
    formatted: isGracePeriod ? 'Ending Soon' : formatted,
  }
}

/**
 * Detects whether a deal article is expired and extracts its timeline/deadline.
 */
export function detectDealExpiry(article: {
  title?: string
  content?: string
  excerpt?: string
  specs?: Record<string, string> | null
  published_at?: string
  badge?: string
  deal_expires_at?: string | null
}): DealExpiryResult {
  // 1. Explicit title check e.g. [Expired]
  if (article.title && /\[EXPIRED\]/i.test(article.title)) {
    return {
      isExpired: true,
      expiryTimeline: null,
      expiryDateStr: null,
      rawText: 'Expired',
    }
  }

  // 2. Explicit badge check
  if (article.badge && /EXPIRED/i.test(article.badge)) {
    return {
      isExpired: true,
      expiryTimeline: null,
      expiryDateStr: null,
      rawText: 'Expired',
    }
  }

  // 3. Explicit specs check (e.g. Status: 'Expired' or Valid Until: 'Expired')
  const specs = article.specs || {}
  const statusVal =
    specs['Status'] ||
    specs['status'] ||
    specs['Valid Until'] ||
    specs['valid_until'] ||
    specs['Expiry Date'] ||
    specs['Timeline']

  if (statusVal && /EXPIRED/i.test(statusVal)) {
    return {
      isExpired: true,
      expiryTimeline: null,
      expiryDateStr: null,
      rawText: 'Expired',
    }
  }

  // 4. Check explicit date fields in specs or top-level deal_expires_at
  const candidateDates = [
    article.deal_expires_at,
    specs['Valid Until'],
    specs['Expiry Date'],
    specs['Expires'],
    specs['Offer Ends'],
    specs['Deal Ends'],
    specs['Timeline'],
    specs['valid_until'],
    specs['expiry_date'],
  ].filter(Boolean) as string[]

  for (const dateVal of candidateDates) {
    if (/EXPIRED/i.test(dateVal)) {
      return {
        isExpired: true,
        expiryTimeline: null,
        expiryDateStr: null,
        rawText: 'Expired',
      }
    }

    const parsed = parseExpiryDateText(dateVal, article.published_at)
    if (parsed) {
      let displayTimeline = `Until ${parsed.formatted}`
      if (parsed.formatted === 'Ending Soon' || (parsed as any).isGracePeriod) {
        displayTimeline = 'Ending Soon'
      } else if (parsed.formatted === 'Today') {
        displayTimeline = 'Ends Today'
      } else if (parsed.formatted === 'Tomorrow') {
        displayTimeline = 'Ends Tomorrow'
      } else if (parsed.formatted.includes('Left') || parsed.formatted.includes('Days')) {
        displayTimeline = parsed.formatted.includes('Left') ? parsed.formatted : `Ends in ${parsed.formatted}`
      } else if (
        dateVal.toLowerCase().startsWith('until') ||
        dateVal.toLowerCase().startsWith('ends')
      ) {
        displayTimeline = dateVal
      }

      return {
        isExpired: parsed.isExpired,
        expiryTimeline: displayTimeline,
        expiryDateStr: parsed.formatted,
        rawText: dateVal,
      }
    }
  }

  // 5. Scan title, excerpt, and all specs values for timeline patterns
  // E.g.: "40% off until Nov 01", "Sale ends October 31", "Valid through November 15", "Ends Oct 11"
  // (Do not scan unstructured multi-paragraph content to prevent false positive matches on phrases like 'before this deal has ended')
  const specsValues = specs ? Object.values(specs).filter(v => typeof v === 'string') : []
  const textCorpus = [article.title, article.excerpt, ...specsValues]
    .filter(Boolean)
    .join('\n')

  const timelineMatches = [
    // "until Nov 01" / "until 1 November" / "ends Oct 11"
    ...textCorpus.matchAll(
      /(?:valid\s+)?(?:until|ends\s+on|ends|runs\s+until|valid\s+through|available\s+until|through|expires\s+on?)\s+([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?|\d{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+(?:,?\s*\d{4})?|\d{4}[-/]\d{1,2}[-/]\d{1,2})/gi
    ),
    // "[X]% off until [Date]" pattern (as seen on Plugin Boutique)
    ...textCorpus.matchAll(
      /\b\d{1,2}%\s+off\s+(?:until|ends)\s+([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?|\d{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+(?:,?\s*\d{4})?)/gi
    ),
  ]

  for (const match of timelineMatches) {
    const rawDatePart = match[1]?.trim()
    if (!rawDatePart) continue

    const parsed = parseExpiryDateText(rawDatePart, article.published_at)
    if (parsed) {
      const isEnds = /ends/i.test(match[0])
      return {
        isExpired: parsed.isExpired,
        expiryTimeline: isEnds ? `Ends ${parsed.formatted}` : `Until ${parsed.formatted}`,
        expiryDateStr: parsed.formatted,
        rawText: match[0].trim(),
      }
    }
  }

  // No expiry detected
  return {
    isExpired: false,
    expiryTimeline: null,
    expiryDateStr: null,
    rawText: null,
  }
}

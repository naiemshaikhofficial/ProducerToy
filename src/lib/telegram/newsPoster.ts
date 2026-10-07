import { NewsArticle } from '@/lib/turso/newsDb'
import { getTursoClient } from '@/lib/turso/client'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

import { getTopicSignature, calculateTitleSimilarity } from '@/lib/news/topicDeduplication'

/**
 * Initializes the telegram_posts tracking table in Turso with schema migration
 */
async function initTelegramPostsTable(): Promise<void> {
  const client = getTursoClient()
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS telegram_posts (
        article_id TEXT PRIMARY KEY,
        posted_at TEXT NOT NULL,
        slug TEXT,
        title TEXT,
        source_url TEXT,
        topic_signature TEXT
      );
    `)

    // Safe, idempotent column migrations for existing tables
    try { await client.execute('ALTER TABLE telegram_posts ADD COLUMN slug TEXT;') } catch {}
    try { await client.execute('ALTER TABLE telegram_posts ADD COLUMN title TEXT;') } catch {}
    try { await client.execute('ALTER TABLE telegram_posts ADD COLUMN source_url TEXT;') } catch {}
    try { await client.execute('ALTER TABLE telegram_posts ADD COLUMN topic_signature TEXT;') } catch {}

    // Backfill title, slug, source_url from news_articles for any older records
    try {
      await client.execute(`
        UPDATE telegram_posts
        SET slug = (SELECT slug FROM news_articles WHERE news_articles.id = telegram_posts.article_id),
            title = (SELECT title FROM news_articles WHERE news_articles.id = telegram_posts.article_id),
            source_url = (SELECT source_url FROM news_articles WHERE news_articles.id = telegram_posts.article_id)
        WHERE (slug IS NULL OR title IS NULL) AND article_id IN (SELECT id FROM news_articles);
      `)
    } catch {}
  } catch (err) {
    console.warn('[TelegramPoster] Failed to init telegram_posts table:', err)
  }
}

/**
 * Strict Multi-Layer Check: Determines whether an article has already been posted to Telegram.
 * Checks article_id, slug, source_url, topic signature, and title similarity against recently posted items.
 */
export async function isArticlePostedToTelegram(articleOrId: NewsArticle | string): Promise<boolean> {
  await initTelegramPostsTable()
  const client = getTursoClient()

  const articleId = typeof articleOrId === 'string' ? articleOrId : articleOrId.id
  const article = typeof articleOrId === 'object' ? articleOrId : null

  try {
    // 1. Exact Article ID match
    const idRes = await client.execute({
      sql: 'SELECT article_id FROM telegram_posts WHERE article_id = ? LIMIT 1',
      args: [articleId],
    })
    if (idRes.rows.length > 0) return true

    if (!article) return false

    // 2. Exact Slug match
    if (article.slug) {
      const slugRes = await client.execute({
        sql: 'SELECT article_id FROM telegram_posts WHERE slug = ? LIMIT 1',
        args: [article.slug],
      })
      if (slugRes.rows.length > 0) {
        console.log(`[TelegramPoster] Slug "${article.slug}" already posted. Skipping duplicate.`)
        return true
      }
    }

    // 3. Exact or normalized Source / Product Deal URL match
    if (article.source_url) {
      const cleanUrl = article.source_url.split('?')[0].replace(/\/+$/, '')
      const urlRes = await client.execute({
        sql: 'SELECT article_id FROM telegram_posts WHERE source_url = ? OR source_url LIKE ? LIMIT 1',
        args: [article.source_url, `%${cleanUrl}%`],
      })
      if (urlRes.rows.length > 0) {
        console.log(`[TelegramPoster] Product URL "${cleanUrl}" already posted. Skipping duplicate.`)
        return true
      }
    }

    // 4. Topic Signature match (catches same product from different RSS feeds)
    const targetSig = getTopicSignature(article.title)
    if (targetSig) {
      const sigRes = await client.execute({
        sql: 'SELECT article_id FROM telegram_posts WHERE topic_signature = ? LIMIT 1',
        args: [targetSig],
      })
      if (sigRes.rows.length > 0) {
        console.log(`[TelegramPoster] Topic signature "${targetSig}" already posted. Skipping duplicate.`)
        return true
      }
    }

    // 5. Title keyword similarity check against last 40 posted items
    if (article.title) {
      const recentPosts = await client.execute({
        sql: 'SELECT article_id, title FROM telegram_posts ORDER BY posted_at DESC LIMIT 40',
      })
      for (const row of recentPosts.rows) {
        const postedTitle = row.title ? String(row.title) : ''
        if (postedTitle) {
          const sim = calculateTitleSimilarity(article.title, postedTitle)
          if (sim >= 0.55) {
            console.log(
              `[TelegramPoster] Article "${article.title}" matched recently posted "${postedTitle}" (similarity: ${(sim * 100).toFixed(0)}%). Skipping duplicate.`
            )
            return true
          }
        }
      }
    }

    return false
  } catch (err) {
    console.warn('[TelegramPoster] Error checking if article posted:', err)
    return false
  }
}

/**
 * Record an article as posted in Turso with complete metadata for future deduplication
 */
export async function markArticleAsPostedToTelegram(articleOrId: NewsArticle | string): Promise<void> {
  await initTelegramPostsTable()
  const client = getTursoClient()

  let articleId = ''
  let slug = ''
  let title = ''
  let sourceUrl = ''
  let topicSig = ''

  if (typeof articleOrId === 'string') {
    articleId = articleOrId
  } else {
    articleId = articleOrId.id
    slug = articleOrId.slug || ''
    title = articleOrId.title || ''
    sourceUrl = articleOrId.source_url || ''
    topicSig = getTopicSignature(articleOrId.title)
  }

  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO telegram_posts (article_id, posted_at, slug, title, source_url, topic_signature)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [articleId, new Date().toISOString(), slug, title, sourceUrl, topicSig],
    })
  } catch (err) {
    console.warn('[TelegramPoster] Failed to mark article as posted:', err)
  }
}

/**
 * Overlays the official ProducerToy logo badge onto the cover image for maximum brand presence
 */
async function createBrandedCoverImage(photoUrl: string): Promise<Buffer | null> {
  try {
    const res = await fetch(photoUrl, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const inputBuffer = Buffer.from(await res.arrayBuffer())

    const metadata = await sharp(inputBuffer).metadata()
    const width = metadata.width || 1200
    const height = metadata.height || 800

    const logoPath = path.join(process.cwd(), 'public', 'logo-white.png')
    if (!fs.existsSync(logoPath)) {
      return inputBuffer
    }

    // Resize logo proportionally (~26% of width, capped at 240px)
    const targetLogoWidth = Math.min(Math.round(width * 0.26), 240)
    const logoBuffer = await sharp(logoPath)
      .resize({ width: targetLogoWidth })
      .toBuffer()

    const logoMeta = await sharp(logoBuffer).metadata()
    const margin = Math.round(width * 0.035)

    const backdropWidth = (logoMeta.width || 200) + 24
    const backdropHeight = (logoMeta.height || 60) + 16
    const badgeSvg = Buffer.from(`
      <svg width="${backdropWidth}" height="${backdropHeight}">
        <rect x="0" y="0" width="${backdropWidth}" height="${backdropHeight}" rx="12" fill="rgba(10, 10, 15, 0.82)" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.5"/>
      </svg>
    `)

    const branded = await sharp(inputBuffer)
      .composite([
        {
          input: badgeSvg,
          top: margin,
          left: margin,
        },
        {
          input: logoBuffer,
          top: margin + 8,
          left: margin + 12,
        },
      ])
      .jpeg({ quality: 92 })
      .toBuffer()

    return branded
  } catch (err: any) {
    console.warn('[TelegramPoster] Failed to brand image with sharp, will fallback:', err?.message || err)
    return null
  }
}

/**
 * Extracts a concise 1-2 sentence description for clean Telegram formatting
 */
function extractShortDescription(article: NewsArticle): string {
  let text = (article.excerpt || article.content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/###?[^\n]+/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/&#\d+;/g, '')
    .replace(/&[a-z]+;/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const sentences = text.match(/[^.!?]+[.!?]+/g)
  if (sentences && sentences.length > 0) {
    let result = sentences[0].trim()
    if (result.length < 90 && sentences[1]) {
      result += ' ' + sentences[1].trim()
    }
    if (result.length > 180) {
      result = result.slice(0, 175).trim() + '...'
    }
    return result
  }

  return text.slice(0, 150).trim() + (text.length > 150 ? '...' : '')
}

/**
 * Formats a NewsArticle into a high-converting, clean HTML caption for Telegram:
 * Concise title + clean offer summary + short 1-2 sentence description.
 */
export function formatTelegramCaption(article: NewsArticle): string {
  const lines: string[] = []

  // 1. Title
  lines.push(`🔥 <b>${escapeHtml(article.title)}</b>`)
  lines.push('')

  // 2. Clean Offer Line (Short & punchy with price, discount & deadline)
  const hasPaidPrice = Boolean(
    article.deal_price &&
    article.deal_price !== '$0' &&
    article.deal_price.toLowerCase() !== 'free' &&
    /\$[1-9]/.test(article.deal_price)
  )
  const isFree = !hasPaidPrice && (
    article.badge === 'FREEWARE' ||
    article.category === 'Free VSTs' ||
    article.deal_price === '$0' ||
    article.deal_price?.toLowerCase() === 'free'
  )

  const discount =
    (article.specs && typeof article.specs === 'object' && article.specs['Discount']) ||
    article.title.match(/(\d+%\s*OFF)/i)?.[1]?.toUpperCase() ||
    (article.badge?.includes('%') ? article.badge : null)

  const validUntil =
    (article.specs && typeof article.specs === 'object' && (article.specs['Valid Until'] || article.specs['Expiry Date'])) ||
    null

  if (isFree) {
    lines.push(`🎁 <b>Offer:</b> 100% FREE${validUntil ? ` (Until ${escapeHtml(validUntil)})` : ' (Limited Time)'}`)
  } else if (article.deal_price) {
    const reg = article.deal_regular_price ? ` • Regular ${article.deal_regular_price}` : ''
    const disc = discount ? ` (${discount})` : ''
    lines.push(`💰 <b>Offer:</b> ${article.deal_price}${disc}${reg}`)
    if (validUntil) {
      lines.push(`⏳ <b>Ends:</b> ${escapeHtml(validUntil)}`)
    }
  }

  // 3. Short Punchy Description (not overloaded with specs)
  const shortDesc = extractShortDescription(article)
  if (shortDesc) {
    lines.push('')
    lines.push(escapeHtml(shortDesc))
  }

  // 4. Subtle Channel Link
  lines.push('')
  lines.push(`📢 <i>Join @producertoynews for instant audio gear & plugin deals!</i>`)

  let caption = lines.join('\n')
  // Telegram captions are limited to 1024 characters
  if (caption.length > 1020) {
    caption = caption.slice(0, 1010) + '...'
  }

  return caption
}

/**
 * Builds the inline keyboard buttons for the post:
 * If Plugin Boutique deal: direct PB deal link + ProducerToy story
 * If free or other vendor: standard ProducerToy story link
 */
function buildInlineKeyboard(article: NewsArticle) {
  const articleUrl = `https://producertoy.com/news/${article.slug}`
  const isPbDeal = Boolean(
    article.source_url &&
    article.source_url.toLowerCase().includes('pluginboutique.com')
  )

  if (isPbDeal && article.source_url) {
    // Extract offer discount (e.g. "85% OFF", "50% OFF", "30% OFF")
    const discount =
      (article.specs && typeof article.specs === 'object' && article.specs['Discount']) ||
      article.title.match(/(\d+%\s*OFF)/i)?.[1]?.toUpperCase() ||
      (article.badge?.includes('%') ? article.badge : null)

    // Extract product name (e.g. "MODO BASS 2", "HyperWarp", "CARBON Q")
    let productName =
      (article.specs && typeof article.specs === 'object' && article.specs['Product']) || ''
    if (!productName) {
      const brand = (article.specs && typeof article.specs === 'object' && article.specs['Brand']) || ''
      let clean = article.title
        .replace(/\s*Deal:.*$/i, '')
        .replace(/\s*[-–—]\s*.*$/i, '')
        .replace(/\s*\(\s*\$[0-9].*?\)/g, '')
        .trim()
      if (brand && clean.toLowerCase().startsWith(brand.toLowerCase())) {
        clean = clean.slice(brand.length).trim()
      }
      productName = clean || article.title
    }

    // Format: "[Discount]: [Product Name]" (e.g. "⚡ 85% OFF: MODO BASS 2")
    let buttonLabel = discount
      ? `⚡ ${discount}: ${productName}`
      : `⚡ Get Deal: ${productName}`

    if (buttonLabel.length > 50) {
      buttonLabel = buttonLabel.slice(0, 48) + '…'
    }

    return {
      inline_keyboard: [
        [
          {
            text: buttonLabel,
            url: article.source_url,
          },
        ],
        [
          {
            text: '📖 Read on Producer Toy',
            url: articleUrl,
          },
        ],
        [
          {
            text: '📰 All Deals: producertoy.com/news',
            url: 'https://producertoy.com/news',
          },
        ],
      ],
    }
  }

  return {
    inline_keyboard: [
      [
        {
          text: '📖 Read Full Story & Claim',
          url: articleUrl,
        },
      ],
      [
        {
          text: '📰 All Deals: producertoy.com/news',
          url: 'https://producertoy.com/news',
        },
      ],
    ],
  }
}

/**
 * Posts a NewsArticle to the configured Telegram channel
 */
export async function postArticleToTelegram(
  article: NewsArticle,
  options?: { force?: boolean }
): Promise<{ success: boolean; error?: string; messageId?: number }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const channelId = process.env.TELEGRAM_CHANNEL_ID

  if (!botToken || !channelId) {
    return {
      success: false,
      error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not configured in environment',
    }
  }

  // Check if already posted
  if (!options?.force) {
    const alreadyPosted = await isArticlePostedToTelegram(article)
    if (alreadyPosted) {
      console.log(`[TelegramPoster] Article "${article.title}" was already posted. Skipping.`)
      return { success: true }
    }
  }

  const caption = formatTelegramCaption(article)
  const replyMarkup = buildInlineKeyboard(article)
  const photoUrl = article.cover_image

  try {
    // 1. First attempt: Create branded cover image with official ProducerToy logo badge
    if (photoUrl && /^https?:\/\//i.test(photoUrl)) {
      const brandedBuffer = await createBrandedCoverImage(photoUrl)
      if (brandedBuffer) {
        const formData = new FormData()
        formData.append('chat_id', channelId)
        formData.append('photo', new Blob([new Uint8Array(brandedBuffer)], { type: 'image/jpeg' }), 'cover.jpg')
        formData.append('caption', caption)
        formData.append('parse_mode', 'HTML')
        formData.append('reply_markup', JSON.stringify(replyMarkup))

        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (data.ok) {
          await markArticleAsPostedToTelegram(article)
          console.log(`[TelegramPoster] Successfully posted branded photo to Telegram: "${article.title}"`)
          return { success: true, messageId: data.result?.message_id }
        } else {
          console.warn(`[TelegramPoster] Branded photo upload failed: ${data.description}. Retrying via photo URL.`)
        }
      }

      // 2. Second attempt: Send via direct photo URL
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          photo: photoUrl,
          caption,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      })

      const data = await response.json()
      if (data.ok) {
        await markArticleAsPostedToTelegram(article)
        console.log(`[TelegramPoster] Successfully posted photo to Telegram channel: "${article.title}"`)
        return { success: true, messageId: data.result?.message_id }
      } else {
        console.warn(`[TelegramPoster] sendPhoto failed: ${data.description}. Falling back to sendMessage.`)
      }
    }

    // 3. Fallback: Text message with inline keyboard
    const msgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: caption,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
        disable_web_page_preview: false,
      }),
    })

    const msgData = await msgResponse.json()
    if (msgData.ok) {
      await markArticleAsPostedToTelegram(article)
      console.log(`[TelegramPoster] Successfully sent text message to Telegram: "${article.title}"`)
      return { success: true, messageId: msgData.result?.message_id }
    } else {
      console.error(`[TelegramPoster] sendMessage failed:`, msgData.description)
      return { success: false, error: msgData.description }
    }
  } catch (err: any) {
    console.error(`[TelegramPoster] Exception during Telegram dispatch:`, err.message || err)
    return { success: false, error: err.message || String(err) }
  }
}

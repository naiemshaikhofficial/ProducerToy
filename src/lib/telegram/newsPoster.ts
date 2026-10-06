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

/**
 * Initializes the telegram_posts tracking table in Turso
 */
async function initTelegramPostsTable(): Promise<void> {
  const client = getTursoClient()
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS telegram_posts (
        article_id TEXT PRIMARY KEY,
        posted_at TEXT NOT NULL
      );
    `)
  } catch (err) {
    console.warn('[TelegramPoster] Failed to init telegram_posts table:', err)
  }
}

/**
 * Check whether an article has already been posted to Telegram
 */
export async function isArticlePostedToTelegram(articleId: string): Promise<boolean> {
  await initTelegramPostsTable()
  const client = getTursoClient()
  try {
    const res = await client.execute({
      sql: 'SELECT article_id FROM telegram_posts WHERE article_id = ? LIMIT 1',
      args: [articleId],
    })
    return res.rows.length > 0
  } catch {
    return false
  }
}

/**
 * Record an article as posted in Turso
 */
export async function markArticleAsPostedToTelegram(articleId: string): Promise<void> {
  await initTelegramPostsTable()
  const client = getTursoClient()
  try {
    await client.execute({
      sql: 'INSERT OR REPLACE INTO telegram_posts (article_id, posted_at) VALUES (?, ?)',
      args: [articleId, new Date().toISOString()],
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
 * Formats a NewsArticle into a high-converting, clean HTML caption for Telegram
 */
export function formatTelegramCaption(article: NewsArticle): string {
  const lines: string[] = []

  // 1. Title
  lines.push(`🔥 <b>${escapeHtml(article.title)}</b>`)
  lines.push('')

  // 2. Pricing & Badge
  const isFree =
    article.badge === 'FREEWARE' ||
    article.category === 'Free VSTs' ||
    article.deal_price === '$0' ||
    /free/i.test(article.title)

  if (isFree) {
    lines.push(`🎁 <b>Offer:</b> 100% FREE (Limited Time)`)
  } else if (article.deal_price) {
    const reg = article.deal_regular_price ? ` (Regular ${article.deal_regular_price})` : ''
    lines.push(`💰 <b>Price:</b> ${article.deal_price}${reg}`)
  }

  // 3. Key Specs (Discount, Valid Until, Requirement)
  if (article.specs && typeof article.specs === 'object') {
    const discount = article.specs['Discount']
    const validUntil = article.specs['Valid Until'] || article.specs['Expiry Date']
    const requirement = article.specs['Requirement']
    const format = article.specs['Format']
    const license = article.specs['License']

    if (discount && !isFree) lines.push(`🏷️ <b>Discount:</b> ${escapeHtml(discount)}`)
    if (format) lines.push(`🎛️ <b>Format:</b> ${escapeHtml(format)}`)
    if (requirement) lines.push(`📋 <b>Requirement:</b> ${escapeHtml(requirement)}`)
    if (license) lines.push(`🔑 <b>License:</b> ${escapeHtml(license)}`)
    if (validUntil) lines.push(`⏳ <b>Ends:</b> ${escapeHtml(validUntil)}`)
  }

  lines.push('')

  // 4. Concise Excerpt / Summary
  if (article.excerpt) {
    const cleanExcerpt = article.excerpt
      .replace(/&#\d+;/g, '')
      .replace(/&[a-z]+;/gi, '')
      .trim()
    if (cleanExcerpt) {
      lines.push(`${escapeHtml(cleanExcerpt)}`)
      lines.push('')
    }
  }

  // 5. Official ProducerToy Website & Channel Branding
  lines.push(`🌐 <b>Website:</b> <a href="https://producertoy.com">producertoy.com</a>`)
  lines.push(`📢 <i>Follow @producertoynews for instant audio gear & plugin deals!</i>`)

  let caption = lines.join('\n')
  // Telegram captions are limited to 1024 characters
  if (caption.length > 1020) {
    caption = caption.slice(0, 1010) + '...'
  }

  return caption
}

/**
 * Builds the inline keyboard buttons for the post — directs 100% of traffic to ProducerToy
 */
function buildInlineKeyboard(article: NewsArticle) {
  const articleUrl = `https://producertoy.com/news/${article.slug}`
  return {
    inline_keyboard: [
      [
        {
          text: '📖 Read Full Story & Claim on ProducerToy',
          url: articleUrl,
        },
      ],
      [
        {
          text: '🌐 Explore ProducerToy Store',
          url: 'https://producertoy.com',
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
    const alreadyPosted = await isArticlePostedToTelegram(article.id)
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
          await markArticleAsPostedToTelegram(article.id)
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
        await markArticleAsPostedToTelegram(article.id)
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
      await markArticleAsPostedToTelegram(article.id)
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

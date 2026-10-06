import { NewsArticle } from '@/lib/turso/newsDb'
import { getTursoClient } from '@/lib/turso/client'

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

    if (discount && !isFree) lines.push(`🏷️ <b>Discount:</b> ${escapeHtml(discount)}`)
    if (format) lines.push(`🎛️ <b>Format:</b> ${escapeHtml(format)}`)
    if (requirement) lines.push(`📋 <b>Requirement:</b> ${escapeHtml(requirement)}`)
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

  lines.push(`📢 <i>Follow @ProducerToy for instant audio gear & plugin deals!</i>`)

  let caption = lines.join('\n')
  // Telegram captions are limited to 1024 characters
  if (caption.length > 1020) {
    caption = caption.slice(0, 1010) + '...'
  }

  return caption
}

/**
 * Builds the inline keyboard buttons for the post
 */
function buildInlineKeyboard(article: NewsArticle) {
  const buttons: Array<Array<{ text: string; url: string }>> = []

  const isFree =
    article.badge === 'FREEWARE' ||
    article.category === 'Free VSTs' ||
    article.deal_price === '$0' ||
    /free/i.test(article.title)

  // Direct Claim / Download Button
  if (article.source_url && /^https?:\/\//i.test(article.source_url)) {
    buttons.push([
      {
        text: isFree ? '⚡ Download Free Plugin' : '🛒 Get Official Deal',
        url: article.source_url,
      },
    ])
  }

  // Read on ProducerToy Button
  const articleUrl = `https://producertoy.com/news/${article.slug}`
  buttons.push([
    {
      text: '📖 Read Full Story & Details',
      url: articleUrl,
    },
  ])

  return { inline_keyboard: buttons }
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
    // 1. Try sending photo with caption if valid image URL exists
    if (photoUrl && /^https?:\/\//i.test(photoUrl)) {
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

    // 2. Fallback to sendMessage if photo fails or is absent
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

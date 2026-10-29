import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@libsql/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '..', '.env.local')
const envFile = fs.readFileSync(envPath, 'utf8')
const getEnv = (key) => {
  const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return match ? match[1].trim() : ''
}

const TELEGRAM_BOT_TOKEN = getEnv('TELEGRAM_BOT_TOKEN')
const TELEGRAM_CHANNEL_ID = getEnv('TELEGRAM_CHANNEL_ID') || '@producertoynews'
const TURSO_URL = getEnv('TURSO_DATABASE_URL')
const TURSO_TOKEN = getEnv('TURSO_AUTH_TOKEN')

console.log('----------------------------------------------------')
console.log('🚀 Pushing ProVerb News to Telegram & Turso DB')
console.log('----------------------------------------------------')
console.log(`Bot Token Present: ${Boolean(TELEGRAM_BOT_TOKEN)}`)
console.log(`Target Channel: ${TELEGRAM_CHANNEL_ID}`)

const article = {
  id: 'proverb-ai-reverb-free-vst3-launch',
  slug: 'proverb-free-ai-reverb-vst-plugin-launch',
  title: 'ProducerToy Releases ProVerb – Free AI-Assisted Smart Reverb Plugin',
  excerpt: 'ProducerToy has released ProVerb, a breakthrough free algorithmic reverb VST3 featuring an 8-line Feedback Delay Network, real-time AI source detection, dynamic vocal ducking, and shimmer tails.',
  content: `<h2>Next-Generation Space Design: ProVerb by ProducerToy</h2>
<p>ProducerToy has officially announced the public release of <strong>ProVerb</strong>, a studio-grade algorithmic reverb plugin combining an 8-line Feedback Delay Network (FDN) with real-time neural audio source detection.</p>
<p>Available as a 100% free download for Windows and macOS (VST3/AU 64-bit), ProVerb is designed to deliver pristine, metallic-free diffusion, celestial shimmer tails, and zero-latency performance while using only ~1.2% CPU load.</p>
<h3>Core Features</h3>
<ul>
  <li><strong>8-Line FDN Engine:</strong> High-density, silky reverberation inspired by classic digital hardware units.</li>
  <li><strong>Smart Auto-Learn AI:</strong> Analyzes vocals, drums, guitars, and synths to suggest mathematically optimal pre-delay, room size, and decay parameters.</li>
  <li><strong>Built-in Dynamic Vocal Ducking:</strong> Carves out vocal intelligibility without complex sidechain routing.</li>
  <li><strong>Ethereal Shimmer Engine:</strong> Octave-up pitch shifted harmonic trails for ambient textures.</li>
  <li><strong>Visual 5-Band Reverb EQ:</strong> 20 Hz to 20 kHz spectrum analyzer with steep high-pass and low-pass filters.</li>
</ul>`,
  category: 'Free VSTs',
  badge: 'FREEWARE',
  cover_image: 'https://voalgeyexfhfitlyorfl.supabase.co/storage/v1/object/public/product-assets/covers/ProVerb_4K_16x9_1793175905092.webp',
  author_name: 'Naiem Shaikh',
  author_role: 'Lead Audio Engineer',
  reading_time: '4 min read',
  source_name: 'ProducerToy',
  source_url: 'https://producertoy.com/product/proverb',
  deal_price: 'Free ($0)',
  deal_regular_price: null,
  published_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  is_featured: 1,
  specs: {
    'Offer': '100% FREE',
    'Formats': 'VST3, AU (64-bit Universal)',
    'Supported DAWs': 'FL Studio, Ableton Live, Logic Pro, Cubase, Studio One, Reaper',
    'DSP Architecture': '8-Line Feedback Delay Network (FDN)',
    'Features': 'Smart Auto-Learn AI, Dynamic Ducking, Shimmer, 5-Band EQ'
  },
  seo_keywords: 'proverb, reverb, free reverb vst, best reverb plugin, ai reverb plugin'
}

async function run() {
  // 1. Save in Turso DB if credentials exist
  if (TURSO_URL && TURSO_TOKEN) {
    try {
      console.log('💾 Saving article into Turso news_articles database...')
      const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN })
      await client.execute({
        sql: `
          INSERT OR REPLACE INTO news_articles (
            id, slug, title, excerpt, content, category, badge,
            cover_image, author_name, author_role, reading_time,
            source_name, source_url, deal_price, deal_regular_price,
            published_at, created_at, is_featured, specs,
            seo_keywords
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          article.id,
          article.slug,
          article.title,
          article.excerpt,
          article.content,
          article.category,
          article.badge,
          article.cover_image,
          article.author_name,
          article.author_role,
          article.reading_time,
          article.source_name,
          article.source_url,
          article.deal_price,
          article.deal_regular_price,
          article.published_at,
          article.created_at,
          article.is_featured,
          JSON.stringify(article.specs),
          article.seo_keywords
        ]
      })
      console.log('✅ Successfully saved to Turso DB! Live at: https://producertoy.com/news/' + article.slug)
    } catch (dbErr) {
      console.warn('⚠️ Turso DB save warning:', dbErr.message)
    }
  }

  // 2. Dispatch to Telegram
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN missing in .env.local')
    process.exit(1)
  }

  console.log(`📡 Sending formatted photo post to Telegram (${TELEGRAM_CHANNEL_ID})...`)

  const captionLines = [
    `🔥 <b>${article.title}</b>`,
    ``,
    `🎁 <b>Offer:</b> 100% FREE (No Catch)`,
    `🎛 <b>Engine:</b> 8-Line FDN Algorithmic Reverb`,
    `⚡ <b>Features:</b> AI Smart Auto-Learn, Vocal Ducking & Shimmer`,
    ``,
    `ProducerToy has officially released <b>ProVerb</b>, a studio-grade free reverb VST3/AU featuring an 8-line Feedback Delay Network, neural source detection, and dynamic vocal ducking that eliminates mix mud.`,
    ``,
    `📢 <i>Join @producertoynews for instant audio gear & plugin deals!</i>`
  ]

  const caption = captionLines.join('\n')

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '🎁 Download Free VST3: ProVerb',
          url: 'https://producertoy.com/product/proverb'
        }
      ],
      [
        {
          text: '📖 Read Full Story & DSP Specs',
          url: `https://producertoy.com/news/${article.slug}`
        }
      ],
      [
        {
          text: '📰 All News: producertoy.com/news',
          url: 'https://producertoy.com/news'
        }
      ]
    ]
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        photo: article.cover_image,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    })

    const data = await res.json()
    if (data.ok) {
      console.log('\n🎉 SUCCESS! News article successfully pushed to Telegram!')
      console.log(`Message ID: ${data.result.message_id}`)
      console.log(`Channel: ${data.result.chat.title} (@${data.result.chat.username || TELEGRAM_CHANNEL_ID})`)
    } else {
      console.error('❌ Telegram API error:', data.description)
    }
  } catch (tgErr) {
    console.error('❌ Telegram request failed:', tgErr.message)
  }
}

run()

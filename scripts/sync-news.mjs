import fs from 'fs'
import { createClient } from '@libsql/client'

// Read env for direct script execution
const envFile = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
  const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return match ? match[1].trim() : ''
}

const TURSO_URL = getEnv('TURSO_DATABASE_URL')
const TURSO_TOKEN = getEnv('TURSO_AUTH_TOKEN')
const GROQ_KEY = getEnv('GROQ_API_KEY')

console.log('----------------------------------------------------')
console.log('🎵 ProducerToy News Sync Engine (Google News + Groq)')
console.log('----------------------------------------------------')

async function run() {
  try {
    console.log('📡 Triggering news sync from localhost:3000...')
    const res = await fetch('http://localhost:3000/api/news/sync?limit=3')
    const json = await res.json()
    console.log('\n✅ Sync Result:', json)

    // Check count in Turso DB
    const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN })
    const countRes = await client.execute('SELECT COUNT(*) as total FROM news_articles')
    console.log(`\n🎉 Total Articles in Turso Cloud DB: ${countRes.rows[0].total}`)
    console.log('🌐 Check live at: http://localhost:3000/news')
  } catch (err) {
    console.error('❌ Sync error:', err.message)
  }
}

run()

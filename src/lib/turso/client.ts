import { createClient, type Client } from '@libsql/client'

let cachedClient: Client | null = null

/**
 * Returns a libSQL client instance.
 * Automatically connects to Turso Cloud if TURSO_DATABASE_URL is provided,
 * otherwise falls back seamlessly to local SQLite storage ('file:data_news.db').
 */
export function getTursoClient(): Client {
  if (cachedClient) return cachedClient

  let url = process.env.TURSO_DATABASE_URL?.trim() || 'file:data_news.db'
  let authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined

  // If the user hasn't replaced the placeholder or URL is invalid, fall back to local SQLite
  if (url.includes('YOUR_ACCOUNT') || !url.includes('.turso.io') && !url.startsWith('file:')) {
    url = 'file:data_news.db'
    authToken = undefined
  }

  cachedClient = createClient({
    url,
    authToken,
  })

  return cachedClient
}

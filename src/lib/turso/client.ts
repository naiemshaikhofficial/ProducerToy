import { createClient, type Client } from '@libsql/client'

let cachedClient: Client | null = null

/**
 * Returns a libSQL client instance.
 * Automatically connects to Turso Cloud if TURSO_DATABASE_URL is provided,
 * otherwise falls back seamlessly to local SQLite storage ('file:data_news.db').
 */
export function getTursoClient(): Client {
  if (cachedClient) return cachedClient

  const url = process.env.TURSO_DATABASE_URL?.trim() || 'file:data_news.db'
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined

  cachedClient = createClient({
    url,
    authToken,
  })

  return cachedClient
}

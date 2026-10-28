import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (typeof window !== 'undefined' && browserClient) {
    return browserClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.')
  }
  
  const isProd = typeof window !== 'undefined' && window.location.hostname.includes('producertoy.com')

  const client = createBrowserClient(url, key, {
    cookieOptions: isProd
      ? {
          domain: '.producertoy.com',
          path: '/',
          sameSite: 'lax',
          secure: true,
        }
      : undefined,
  })

  if (typeof window !== 'undefined') {
    browserClient = client
  }

  return client
}

export function getSupabaseBrowserClient() {
  return createClient()
}


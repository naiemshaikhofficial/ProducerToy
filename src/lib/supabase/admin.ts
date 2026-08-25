import { createClient } from '@supabase/supabase-js'

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://voalgeyexfhfitlyorfl.supabase.co'
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_AFTgvwUXdDPCgTny9uDIuQ_NGiDyAJD'
    
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export const createAdminClient = getAdminClient

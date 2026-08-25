const { createClient } = require('@supabase/supabase-js')

const url = 'https://voalgeyexfhfitlyorfl.supabase.co'
const key = 'sb_publishable_AFTgvwUXdDPCgTny9uDIuQ_NGiDyAJD'

const supabase = createClient(url, key)

async function test() {
  const { data, error } = await supabase.from('products').select('*')
  console.log('Error:', error)
  console.log('Products:', data)
}

test()

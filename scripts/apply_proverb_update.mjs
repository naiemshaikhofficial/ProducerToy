import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read env local
const envPath = path.resolve(__dirname, '../.env.local');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^\\s*${key}\\s*=\\s*(.+)`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : process.env[key];
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://voalgeyexfhfitlyorfl.supabase.co';
const serviceKey = process.argv[2] || getEnv('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey || serviceKey.length < 20) {
  console.log('No SUPABASE_SERVICE_ROLE_KEY provided.');
  console.log('Usage: node scripts/apply_proverb_update.mjs [SERVICE_ROLE_KEY]');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const payloadPath = path.join(__dirname, 'proverb_payload.json');
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

async function update() {
  console.log('Applying update to ProVerb in Supabase...');
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('slug', 'proverb')
    .select();

  if (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }

  console.log('Successfully updated ProVerb in Supabase!');
  console.log(JSON.stringify(data, null, 2));
}

update();

import { createClient } from '@supabase/supabase-js';
import { log } from '../vite';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

log('✅ Supabase client initialized');

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('restaurants').select('count').limit(1);

    if (error) {
      log(`⚠️  Supabase connection test warning: ${error.message}`);
      return false;
    }

    log('✅ Supabase connection test successful');
    return true;
  } catch (error) {
    log(`❌ Supabase connection test failed: ${error}`);
    return false;
  }
}

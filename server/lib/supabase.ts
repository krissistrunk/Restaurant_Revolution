import { createClient } from '@supabase/supabase-js';
import { log } from '../vite';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvVariables() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      }
    }
  } catch (error) {
    log(`Warning: Could not load .env file: ${error}`);
  }
}

loadEnvVariables();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    log('✅ Supabase client initialized');
  } catch (error) {
    log(`⚠️  Supabase initialization failed: ${error}`);
  }
} else {
  log('⚠️  Supabase not configured - running without Supabase integration');
}

export const supabase = supabaseClient!;

export async function testSupabaseConnection() {
  if (!supabaseClient) {
    log('⚠️  Supabase not configured - skipping connection test');
    return false;
  }

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

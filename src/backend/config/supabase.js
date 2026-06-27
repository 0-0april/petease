import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Not set');
  throw new Error('Missing Supabase environment variables');
}

console.log('✅ Supabase client initialized with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);

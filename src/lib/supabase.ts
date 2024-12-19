import { createClient } from '@supabase/supabase-js';

// Log all available environment variables (for debugging)
console.log('VITE_URL', import.meta.env.VITE_API_URL);

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.error('Available SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}

if (!import.meta.env.VITE_SUPABASE_KEY) {
  console.error('Available SUPABASE_KEY:', import.meta.env.VITE_SUPABASE_KEY);
  throw new Error('Missing environment variable: VITE_SUPABASE_KEY');
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);
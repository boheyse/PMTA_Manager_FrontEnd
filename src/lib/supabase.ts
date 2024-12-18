import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pcqjntcdeefdmgnruarq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjcWpudGNkZWVmZG1nbnJ1YXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDI2ODksImV4cCI6MjA1MDAxODY4OX0.tyoYM_RTcIDpXyJW9GTk_16-zpARHH89vD5KaGasWmU';

export const supabase = createClient(supabaseUrl, supabaseKey);
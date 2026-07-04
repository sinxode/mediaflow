import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasCredentials = !!supabaseUrl && !!supabaseAnonKey;

if (!hasCredentials) {
  console.warn(
    '[MediaFlow] Supabase credentials are not configured. ' +
    'Create a .env file in the project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'The app will run in local mock mode until credentials are provided.'
  );
}

// Only create a real client when both credentials are present.
// When running in mock mode this export is null and every service
// falls back to its localStorage adapter automatically.
export const supabase = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = hasCredentials;

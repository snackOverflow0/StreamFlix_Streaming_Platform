import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Server-only client. Never expose SUPABASE_SECRET_KEY to the browser.
export const supabase = createClient(env.supabaseUrl, env.supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Server-only client. Never expose SUPABASE_SECRET_KEY to the browser.
export const supabase = createClient(env.supabaseUrl, env.supabaseSecretKey, {
  global: {fetch: (input,init) => fetch(input,{...init,signal:AbortSignal.any([AbortSignal.timeout(15000),...(init?.signal?[init.signal]:[])])})},
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

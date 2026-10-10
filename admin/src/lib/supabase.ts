import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url) throw new Error("VITE_SUPABASE_URL is missing");
if (!publishableKey) throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY is missing");

export const supabase = createClient(url, publishableKey, {
  auth: {
    persistSession: true,
    storageKey: "streamflix-admin-auth",
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

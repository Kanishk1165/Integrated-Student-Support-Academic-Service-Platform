import { createClient } from "@supabase/supabase-js";

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const parseSupabaseUrlFromAnonKey = (anonKey) => {
  try {
    const payload = anonKey?.split(".")?.[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    if (!decoded?.ref) return null;
    return `https://${decoded.ref}.supabase.co`;
  } catch {
    return null;
  }
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || parseSupabaseUrlFromAnonKey(supabaseAnonKey);

if (!supabaseAnonKey) {
  throw new Error("Supabase client is not configured. Set VITE_SUPABASE_ANON_KEY.");
}

if (!supabaseUrl) {
  throw new Error("Supabase client is not configured. Set VITE_SUPABASE_URL or provide a valid VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

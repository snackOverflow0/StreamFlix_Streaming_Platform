import { supabase } from "@/lib/supabase";
import { apiRequest } from "./api-client";

export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function register(details: { name: string; email: string; phone?: string; dateOfBirth?: string }, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: details.email.trim(),
    password,
    options: { data: { full_name: details.name.trim(), phone: details.phone?.trim() || null, date_of_birth: details.dateOfBirth || null } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/oauth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, queryParams: { prompt: "select_account" } } });
  if (error) throw error;
}

export function getCurrentAppUser() { return apiRequest("/auth/me"); }

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

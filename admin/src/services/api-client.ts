import { ENV } from "@/lib/env";
import { supabase } from "@/lib/supabase";

const API_URL = ENV.apiUrl;
export type ApiRequestOptions = RequestInit & { token?: string };

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token: explicitToken, headers, body, ...requestInit } = options;
  let token = explicitToken;
  if (!token) {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token;
  }
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15_000);
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  if (body && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) requestHeaders.set("Content-Type", "application/json");
  try {
    const response = await fetch(`${API_URL}${path}`, { ...requestInit, body, headers: requestHeaders, signal: controller.signal, credentials: "same-origin" });
    const type = response.headers.get("content-type") ?? "";
    const responseBody = type.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) {
      const message = typeof responseBody === "object" && responseBody && "message" in responseBody ? String(responseBody.message) : `Request failed with status ${response.status}`;
      throw new Error(message);
    }
    return responseBody as T;
  } finally { window.clearTimeout(timeoutId); }
}
export { API_URL };

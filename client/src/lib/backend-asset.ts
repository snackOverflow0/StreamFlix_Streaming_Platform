import { ENV } from "@/lib/env";

const BACKEND_ORIGIN = new URL(ENV.apiUrl).origin;

export function backendAsset(path: string | null | undefined, fallback = "/streamflix/logo.png") {
  if (!path) return `${BACKEND_ORIGIN}${fallback}`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

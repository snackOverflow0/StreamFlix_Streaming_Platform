import { ENV } from "@/lib/env";

const BACKEND_ORIGIN = new URL(ENV.apiUrl).origin;

export function backendAsset(path: string | null | undefined, fallback = "/streamflix/logo.png") {
  // StreamFlix brand artwork is bundled inside public/streamflix during the
  // Android sync. Do not request it from the PC backend in the APK.
  if (!path) path = fallback;
  if (/^\/streamflix\/logo(?:-optimized)?\.(?:png|webp)$/i.test(path)) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

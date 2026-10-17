import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "@/lib/supabase";

const APP_SCHEME = "streamflix://";
let pendingListener: Promise<{ remove: () => Promise<void> }> | null = null;
let processing = false;

/** Register once on app startup, before beginning browser-based OAuth. */
export function registerMobileReturn(onSignedIn: () => Promise<void>, onError: (message: string) => void) {
  if (!Capacitor.isNativePlatform()) return () => {};
  if (pendingListener) return () => {};

  let active = true;
  const handle = async (raw: string) => {
    if (!active || !raw.startsWith(APP_SCHEME) || processing) return;
    const u = new URL(raw);
    if (u.host !== "auth" && u.host !== "payment") return;
    processing = true;
    try {
      if (u.host === "auth") {
        if (u.pathname !== "/callback") return;
        const hash = new URLSearchParams(u.hash.substring(1));
        const errorText = u.searchParams.get("error_description") || hash.get("error_description") || u.searchParams.get("error") || hash.get("error");
        if (errorText) throw new Error(errorText);
        const code = u.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const access_token = hash.get("access_token");
          const refresh_token = hash.get("refresh_token");
          if (!access_token || !refresh_token) throw new Error("Google did not return a valid authentication session.");
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
        }
        localStorage.removeItem("streamflix-explicitly-logged-out");
        try { await Browser.close(); } catch { /* Chrome custom tabs can already be closed. */ }
        await onSignedIn();
      } else {
        if (u.pathname !== "/success" && u.pathname !== "/cancel") return;
        try { await Browser.close(); } catch { /* Ignore if browser was closed. */ }
        if (u.pathname === "/cancel") {
          onError("Checkout was cancelled. No payment has been confirmed.");
          return;
        }
        const session = u.searchParams.get("session_id") || "";
        const kind = u.searchParams.get("kind");
        if (!/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(session) || !["subscription", "merchandise"].includes(kind ?? "")) {
          throw new Error("Invalid Stripe checkout return. Check your payment history before trying again.");
        }
        const param = kind === "subscription" ? "subscription_session_id" : "merch_session_id";
        // Return to the *embedded* app origin; verification still takes place
        // in the existing authenticated backend checkout-status endpoint.
        window.location.assign(`/?${param}=${encodeURIComponent(session)}`);
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : "Unable to complete sign-in or checkout.");
    } finally { processing = false; }
  };
  pendingListener = App.addListener("appUrlOpen", ({ url }) => { void handle(url); });
  void App.getLaunchUrl().then(result => { if (result?.url) void handle(result.url); }).catch(() => undefined);
  return () => { active = false; const listener = pendingListener; pendingListener = null; void listener?.then(h => h.remove()); };
}

export async function openMobileCheckout(checkoutUrl: string) {
  if (Capacitor.isNativePlatform()) await Browser.open({ url: checkoutUrl });
  else window.location.assign(checkoutUrl);
}

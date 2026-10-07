import { useEffect, useState } from "react";
import { Check, Cookie, Settings2, ShieldCheck, X } from "lucide-react";
import { emitActionFeedback } from "./ActionFeedback";
import { getCookie, setCookie } from "@/lib/cookies";

type CookiePreferences = {
  functional: boolean;
  analytics: boolean;
};

const CONSENT_COOKIE = "streamflix_cookie_consent";
const PREFERENCES_COOKIE = "streamflix_cookie_preferences";

const DEFAULT_PREFERENCES: CookiePreferences = {
  functional: true,
  analytics: false,
};

function readPreferences(): CookiePreferences {
  const raw = getCookie(PREFERENCES_COOKIE);
  if (!raw) return DEFAULT_PREFERENCES;

  try {
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    return {
      functional: parsed.functional !== false,
      analytics: parsed.analytics === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function savePreferences(preferences: CookiePreferences) {
  setCookie(CONSENT_COOKIE, "customized", { maxAge: 60 * 60 * 24 * 180 });
  setCookie(PREFERENCES_COOKIE, JSON.stringify(preferences), {
    maxAge: 60 * 60 * 24 * 180,
  });
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const consent = getCookie(CONSENT_COOKIE);
    setPreferences(readPreferences());
    setVisible(!consent);
  }, []);

  const acceptAll = () => {
    const next = { functional: true, analytics: true };
    savePreferences(next);
    setPreferences(next);
    setVisible(false);
    setSettingsOpen(false);
    emitActionFeedback("success", "Cookie preferences saved. Optional cookies are enabled.");
  };

  const rejectOptional = () => {
    const next = { functional: true, analytics: false };
    savePreferences(next);
    setPreferences(next);
    setVisible(false);
    setSettingsOpen(false);
    emitActionFeedback("success", "Cookie preferences saved. Only essential cookies are enabled.");
  };

  const saveCustom = () => {
    savePreferences(preferences);
    setVisible(false);
    setSettingsOpen(false);
    emitActionFeedback("success", "Cookie preferences saved.");
  };

  const openSettings = () => {
    setPreferences(readPreferences());
    setSettingsOpen(true);
    setVisible(true);
  };

  return (
    <>
      {!visible && (
        <button
          type="button"
          onClick={openSettings}
          className="fixed bottom-4 left-4 z-[9998] inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/75 px-4 py-2.5 text-xs font-bold text-white shadow-2xl shadow-black/30 backdrop-blur-xl transition hover:border-white/25 hover:bg-black/90"
          aria-label="Open cookie settings"
        >
          <Cookie className="size-4" />
          Cookie Settings
        </button>
      )}

      {visible && (
        <div className="fixed inset-x-3 bottom-3 z-[10000] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[min(94vw,560px)]">
          <div className="overflow-hidden rounded-3xl border border-white/12 bg-[#0a0f1f]/95 shadow-[0_24px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl">
            <div className="flex items-start gap-4 border-b border-white/10 p-5 sm:p-6">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/8 text-white">
                <Cookie className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">
                      Your privacy
                    </p>
                    <h2 className="mt-1 text-lg font-black text-white">
                      We use cookies on StreamFlix
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVisible(false);
                      setSettingsOpen(false);
                      emitActionFeedback("info", "Cookie banner dismissed. You can reopen Cookie Settings anytime.");
                    }}
                    className="rounded-full p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close cookie banner"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Essential cookies keep the app working. Functional cookies remember preferences, while optional analytics cookies help measure how StreamFlix is used.
                </p>
              </div>
            </div>

            {settingsOpen && (
              <div className="space-y-3 border-b border-white/10 p-5 sm:p-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-white">Essential cookies</p>
                          <p className="mt-1 text-xs leading-5 text-white/50">
                            Required for core security, authentication-related app behavior, and cookie preferences.
                          </p>
                        </div>
                        <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/55">
                          Always on
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreferences((current) => ({ ...current, functional: !current.functional }))}
                  className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"
                  aria-pressed={preferences.functional}
                >
                  <div
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${preferences.functional ? "border-violet-400 bg-violet-500" : "border-white/20 bg-transparent"}`}
                  >
                    {preferences.functional && <Check className="size-3.5 text-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-white">Functional cookies</p>
                    <p className="mt-1 text-xs leading-5 text-white/50">
                      Remember helpful UI preferences such as cookie settings and interface choices.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferences((current) => ({ ...current, analytics: !current.analytics }))}
                  className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"
                  aria-pressed={preferences.analytics}
                >
                  <div
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${preferences.analytics ? "border-violet-400 bg-violet-500" : "border-white/20 bg-transparent"}`}
                  >
                    {preferences.analytics && <Check className="size-3.5 text-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-white">Analytics cookies</p>
                    <p className="mt-1 text-xs leading-5 text-white/50">
                      Optional measurement cookies. StreamFlix does not turn these on until you choose them.
                    </p>
                  </div>
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <button
                type="button"
                onClick={settingsOpen ? () => setSettingsOpen(false) : openSettings}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white/65 transition hover:bg-white/8 hover:text-white"
              >
                <Settings2 className="size-4" />
                {settingsOpen ? "Hide settings" : "Customize"}
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={rejectOptional}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-white/75 transition hover:bg-white/8 hover:text-white"
                >
                  Essential only
                </button>
                {settingsOpen ? (
                  <button
                    type="button"
                    onClick={saveCustom}
                    className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-500"
                  >
                    Save preferences
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-500"
                  >
                    Accept all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

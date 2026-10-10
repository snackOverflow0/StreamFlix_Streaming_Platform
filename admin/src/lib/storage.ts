/**
 * Local storage is used only for non-sensitive demo preferences.
 * Authentication tokens and payment data must not be stored here.
 */
export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage may be blocked by the browser. The app can continue in memory.
    }
  },

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage failures; they should not break the UI.
    }
  },
};

export type CookieOptions = {
  maxAge?: number;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
};

export function setCookie(name: string, value: string, options: CookieOptions = {}) {
  if (typeof document === "undefined") return;

  const maxAge = options.maxAge ?? 60 * 60 * 24 * 180;
  const path = options.path ?? "/";
  const sameSite = options.sameSite ?? "Lax";
  const secure = options.secure ?? window.location.protocol === "https:";

  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    `Path=${path}`,
    `SameSite=${sameSite}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const encodedName = encodeURIComponent(name);
  const value = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${encodedName}=`))
    ?.slice(encodedName.length + 1);

  return value ? decodeURIComponent(value) : null;
}

export function deleteCookie(name: string) {
  setCookie(name, "", { maxAge: 0 });
}

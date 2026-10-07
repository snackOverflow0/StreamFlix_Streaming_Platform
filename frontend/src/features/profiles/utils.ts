export function detectDevice() {
  if (typeof navigator === "undefined") return { type: "Browser", name: "StreamFlix device" };
  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  const browser = ua.includes("edg/") ? "Edge" : ua.includes("chrome") && !ua.includes("edg/") ? "Chrome" : ua.includes("firefox") ? "Firefox" : ua.includes("safari") ? "Safari" : "Browser";

  if (/iphone|ipod/.test(ua)) return { type: "iPhone", name: `${browser} on iPhone` };
  if (/ipad/.test(ua)) return { type: "iPad", name: `${browser} on iPad` };
  if (/android/.test(ua)) return { type: "Android", name: `${browser} on Android` };
  if (platform.includes("mac")) return { type: "macOS", name: `${browser} on macOS` };
  if (platform.includes("win")) return { type: "Windows", name: `${browser} on Windows` };
  if (platform.includes("linux")) return { type: "Linux", name: `${browser} on Linux` };
  return { type: "Browser", name: `${browser} device` };
}

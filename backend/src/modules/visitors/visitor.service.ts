import type { Request } from "express";
import crypto from "node:crypto";
import { supabase } from "../../config/supabase.js";
import { getCurrentAppUser } from "../../utils/ownership.js";

const COOKIE = "streamflix_visitor";
const maxAge = 1000 * 60 * 60 * 24 * 365;

function readCookie(req: Request) {
  const raw = req.headers.cookie ?? "";
  const match = raw.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}

export async function trackVisit(req: Request, res: any) {
  let visitorKey = readCookie(req);
  if (!visitorKey || !/^[a-f0-9]{64}$/.test(visitorKey)) visitorKey = crypto.randomBytes(32).toString("hex");
  const secure = process.env.NODE_ENV === "production";
  const sameSite = secure ? "None" : "Lax";
  res.setHeader("Set-Cookie", `${COOKIE}=${visitorKey}; Max-Age=${Math.floor(maxAge / 1000)}; Path=/; HttpOnly; SameSite=${sameSite}${secure ? "; Secure" : ""}`);

  let userId: number | null = null;
  try { userId = (await getCurrentAppUser(req)).user_id; } catch { /* anonymous visitor */ }

  const { data: existing } = await supabase.from("site_visitors").select("visit_count").eq("visitor_key", visitorKey).maybeSingle();
  if (existing) {
    await supabase.from("site_visitors").update({ last_seen_at: new Date().toISOString(), visit_count: Number(existing.visit_count) + 1, user_id: userId }).eq("visitor_key", visitorKey);
  } else {
    await supabase.from("site_visitors").insert({ visitor_key: visitorKey, user_id: userId });
  }
  const { count, error } = await supabase.from("site_visitors").select("visitor_key", { count: "exact", head: true });
  if (error) throw error;
  return { uniqueVisitors: count ?? 0 };
}

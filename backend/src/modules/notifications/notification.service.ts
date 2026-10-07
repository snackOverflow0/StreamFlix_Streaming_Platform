import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { getCurrentAppUser } from "../../utils/ownership.js";
import { parseId } from "../../utils/http.js";

export type Notification = {
  notification_id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const columns = "notification_id, user_id, type, title, message, is_read, created_at";

export async function listNotifications(req: Request, limit = 30) {
  const user = await getCurrentAppUser(req);
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const { data, error } = await supabase
    .from("notifications")
    .select(columns)
    .eq("user_id", user.user_id)
    .order("created_at", { ascending: false })
    .limit(safeLimit)
    .returns<Notification[]>();
  if (error) throw error;
  return data ?? [];
}

export async function unreadCount(req: Request) {
  const user = await getCurrentAppUser(req);
  const { count, error } = await supabase
    .from("notifications")
    .select("notification_id", { count: "exact", head: true })
    .eq("user_id", user.user_id)
    .eq("is_read", false);
  if (error) throw error;
  return { count: count ?? 0 };
}

export async function markRead(req: Request, notificationId: number) {
  const user = await getCurrentAppUser(req);
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("notification_id", notificationId)
    .eq("user_id", user.user_id)
    .select(columns)
    .maybeSingle()
    .returns<Notification | null>();
  if (error) throw error;
  if (!data) return null;
  return data;
}

export async function markAllRead(req: Request) {
  const user = await getCurrentAppUser(req);
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.user_id)
    .eq("is_read", false);
  if (error) throw error;
  return { success: true };
}

export async function createForUser(userId: number, type: string, title: string, message: string) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type: type.slice(0, 50),
      title: title.slice(0, 160),
      message,
    })
    .select(columns)
    .single()
    .returns<Notification>();
  if (error) throw error;
  return data;
}

export async function markReadFromParam(req: Request, rawId: string) {
  return markRead(req, parseId(rawId, "notificationId"));
}

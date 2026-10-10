import { personalProfile } from "../../utils/profile-scope.js";
import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { ensureUserOwnsResource } from "../../utils/ownership.js";
import { parseId, requireNumber, optionalString } from "../../utils/http.js";

export type WatchListItem = { list_id: number; user_id: number; profile_id: number; content_id: number; episode_id: number | null; progress: number | null; date_added: string; watchlist_status: string };
const columns = "list_id, user_id, profile_id, content_id, episode_id, progress, date_added, watchlist_status";
export async function getByUser(req: Request, userId: number) {
  await ensureUserOwnsResource(req, userId);
  const profileId = await personalProfile(req, userId);
  const { data, error } = await supabase.from("watch_list").select(columns).eq("user_id", userId).eq("profile_id", profileId).order("date_added", { ascending: false }).returns<WatchListItem[]>();
  if (error) throw error;
  return data ?? [];
}
export async function getOne(req: Request, listId: number) {
  const { data, error } = await supabase.from("watch_list").select(columns).eq("list_id", listId).maybeSingle().returns<WatchListItem | null>();
  if (error) throw error;
  if (!data) throw new AppError(404, "Watch-list item not found");
  await ensureUserOwnsResource(req, data.user_id);
  const profileId = await personalProfile(req, data.user_id);
  if (data.profile_id !== profileId) throw new AppError(404, "Item not found in this profile");
  return data;
}
export async function create(req: Request, userId: number, body: Record<string, unknown>) {
  await ensureUserOwnsResource(req, userId);
  const profileId = await personalProfile(req, userId);
  const contentId = parseId(String(body.content_id), "content_id");
  const episodeId = body.episode_id === undefined || body.episode_id === null ? null : parseId(String(body.episode_id), "episode_id");
  const progress = body.progress === undefined ? 0 : requireNumber(body.progress, "progress", { min: 0, max: 100 });
  const status = body.watchlist_status === undefined ? "planned" : optionalString(body.watchlist_status, "watchlist_status", 50);
  const { data, error } = await supabase.from("watch_list").insert({ user_id: userId, profile_id: profileId, content_id: contentId, episode_id: episodeId, progress, watchlist_status: status }).select(columns).single().returns<WatchListItem>();
  if (error) {
    if (error.code === "23505") {
      const existing=await supabase.from("watch_list").select(columns).eq("user_id",userId).eq("profile_id",profileId).eq("content_id",contentId).maybeSingle().returns<WatchListItem|null>();
      if(existing.error)throw existing.error;if(existing.data)return existing.data;
    }
    throw error;
  }
  return data;
}
export async function update(req: Request, listId: number, body: Record<string, unknown>) {
  await getOne(req, listId);
  const updates: Record<string, unknown> = {};
  if (body.progress !== undefined) updates.progress = requireNumber(body.progress, "progress", { min: 0, max: 100 });
  if (body.watchlist_status !== undefined) updates.watchlist_status = optionalString(body.watchlist_status, "watchlist_status", 50);
  if (Object.keys(updates).length === 0) throw new AppError(400, "No valid fields to update");
  const { data, error } = await supabase.from("watch_list").update(updates).eq("list_id", listId).select(columns).single().returns<WatchListItem>();
  if (error) throw error;
  return data;
}
export async function remove(req: Request, listId: number) {
  await getOne(req, listId);
  const { error } = await supabase.from("watch_list").delete().eq("list_id", listId);
  if (error) throw error;
}

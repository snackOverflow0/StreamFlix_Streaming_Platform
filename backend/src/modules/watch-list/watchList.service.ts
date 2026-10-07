import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { getCurrentAppUser, ensureUserOwnsResource } from "../../utils/ownership.js";
import { parseId, requireNumber, optionalString } from "../../utils/http.js";

export type WatchListItem = { list_id: number; user_id: number; content_id: number; episode_id: number | null; progress: number | null; date_added: string; watchlist_status?: string };
const columns = "list_id, user_id, content_id, episode_id, progress, date_added";

export async function getMyWatchList(req: Request) {
  const user = await getCurrentAppUser(req);
  const { data, error } = await supabase.from("watch_list").select(columns).eq("user_id", user.user_id).order("date_added", { ascending: false }).returns<WatchListItem[]>();
  if (error) throw error;
  return data ?? [];
}

export async function getOne(req: Request, listId: number) {
  const { data, error } = await supabase.from("watch_list").select(columns).eq("list_id", listId).maybeSingle().returns<WatchListItem | null>();
  if (error) throw error;
  if (!data) throw new AppError(404, "Watch-list item not found");
  await ensureUserOwnsResource(req, data.user_id);
  return data;
}

export async function create(req: Request, body: Record<string, unknown>) {
  const user = await getCurrentAppUser(req);
  const contentId = parseId(String(body.content_id), "content_id");
  const episodeId = body.episode_id === undefined || body.episode_id === null ? null : parseId(String(body.episode_id), "episode_id");
  const progress = body.progress === undefined ? 0 : requireNumber(body.progress, "progress", { min: 0, max: 100 });
  const { data, error } = await supabase.from("watch_list").insert({ user_id: user.user_id, content_id: contentId, episode_id: episodeId, progress }).select(columns).single().returns<WatchListItem>();
  if (error) {
    if (error.code === "23505") throw new AppError(409, "This item is already in your watch list");
    throw error;
  }
  return data;
}

export async function update(req: Request, listId: number, body: Record<string, unknown>) {
  await getOne(req, listId);
  const updates: Record<string, unknown> = {};
  if (body.progress !== undefined) updates.progress = requireNumber(body.progress, "progress", { min: 0, max: 100 });
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

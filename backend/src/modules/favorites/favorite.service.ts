import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { getCurrentAppUser, ensureUserOwnsResource } from "../../utils/ownership.js";
import { parseId } from "../../utils/http.js";

export type Favorite = { fav_id: number; user_id: number; content_id: number; date_added: string };
const columns = "fav_id, user_id, content_id, date_added";

export async function getMyFavorites(req: Request) {
  const user = await getCurrentAppUser(req);
  const { data, error } = await supabase
    .from("favorites")
    .select(columns)
    .eq("user_id", user.user_id)
    .order("date_added", { ascending: false })
    .returns<Favorite[]>();
  if (error) throw error;
  return data ?? [];
}

export async function getFavorite(req: Request, favoriteId: number) {
  const { data, error } = await supabase.from("favorites").select(columns).eq("fav_id", favoriteId).maybeSingle().returns<Favorite | null>();
  if (error) throw error;
  if (!data) throw new AppError(404, "Favorite not found");
  await ensureUserOwnsResource(req, data.user_id);
  return data;
}

export async function createFavorite(req: Request, body: Record<string, unknown>) {
  const user = await getCurrentAppUser(req);
  const contentId = parseId(String(body.content_id), "content_id");
  const { data, error } = await supabase
    .from("favorites")
    .insert({ user_id: user.user_id, content_id: contentId })
    .select(columns)
    .single()
    .returns<Favorite>();
  if (error) {
    if (error.code === "23505") throw new AppError(409, "Content is already in favorites");
    throw error;
  }
  return data;
}

export async function deleteFavorite(req: Request, favoriteId: number) {
  await getFavorite(req, favoriteId);
  const { error } = await supabase.from("favorites").delete().eq("fav_id", favoriteId);
  if (error) throw error;
}

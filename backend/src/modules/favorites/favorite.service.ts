import { personalProfile } from "../../utils/profile-scope.js";
import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { ensureUserOwnsResource } from "../../utils/ownership.js";
import { parseId } from "../../utils/http.js";

export type Favorite = { fav_id: number; user_id: number; profile_id: number; content_id: number; date_added: string };
export async function getFavoritesByUser(req: Request, userId: number) {
  await ensureUserOwnsResource(req, userId);
  const profileId = await personalProfile(req, userId);
  const { data, error } = await supabase.from("favorites").select("fav_id, user_id, profile_id, content_id, date_added").eq("user_id", userId).eq("profile_id", profileId).order("date_added", { ascending: false }).returns<Favorite[]>();
  if (error) throw error;
  return data ?? [];
}
export async function getFavorite(req: Request, favoriteId: number) {
  const { data, error } = await supabase.from("favorites").select("fav_id, user_id, profile_id, content_id, date_added").eq("fav_id", favoriteId).maybeSingle().returns<Favorite | null>();
  if (error) throw error;
  if (!data) throw new AppError(404, "Favorite not found");
  await ensureUserOwnsResource(req, data.user_id);
  const profileId = await personalProfile(req, data.user_id);
  if (data.profile_id !== profileId) throw new AppError(404, "Item not found in this profile");
  return data;
}
export async function createFavorite(req: Request, userId: number, body: Record<string, unknown>) {
  await ensureUserOwnsResource(req, userId);
  const profileId = await personalProfile(req, userId);
  const contentId = parseId(String(body.content_id), "content_id");
  const { data, error } = await supabase.from("favorites").insert({ user_id: userId, profile_id: profileId, content_id: contentId }).select("fav_id, user_id, profile_id, content_id, date_added").single().returns<Favorite>();
  if (error) {
    if (error.code === "23505") {
      const existing=await supabase.from("favorites").select("fav_id, user_id, profile_id, content_id, date_added").eq("user_id",userId).eq("profile_id",profileId).eq("content_id",contentId).maybeSingle().returns<Favorite|null>();
      if(existing.error)throw existing.error;if(existing.data)return existing.data;
    }
    throw error;
  }
  return data;
}
export async function deleteFavorite(req: Request, favoriteId: number) {
  await getFavorite(req, favoriteId);
  const { error } = await supabase.from("favorites").delete().eq("fav_id", favoriteId);
  if (error) throw error;
}

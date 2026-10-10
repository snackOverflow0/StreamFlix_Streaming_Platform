import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { ensureUserOwnsResource } from "../../utils/ownership.js";
import { requireString, optionalString } from "../../utils/http.js";

export type Profile = { profile_id: number; user_id: number; profile_name: string; is_kids: boolean; avatar_url: string | null; device: string | null; created_at: string };

function avatar(value:unknown) {const url=optionalString(value,"avatar_url",2000);if(!url)return null;let parsed:URL;try{parsed=new URL(url);}catch{throw new AppError(400,"Avatar must be a valid HTTPS image URL");}if(!["https:","http:"].includes(parsed.protocol))throw new AppError(400,"Avatar must use HTTP or HTTPS");return parsed.toString();}

export async function getProfilesByUser(req: Request, userId: number) {
  await ensureUserOwnsResource(req, userId);
  const { data, error } = await supabase.from("profiles").select("profile_id, user_id, profile_name, is_kids, avatar_url, device, created_at").eq("user_id", userId).order("profile_id").returns<Profile[]>();
  if (error) throw error;
  return data ?? [];
}
export async function getProfile(req: Request, profileId: number) {
  const { data, error } = await supabase.from("profiles").select("profile_id, user_id, profile_name, is_kids, avatar_url, device, created_at").eq("profile_id", profileId).maybeSingle().returns<Profile | null>();
  if (error) throw error;
  if (!data) throw new AppError(404, "Profile not found");
  await ensureUserOwnsResource(req, data.user_id);
  return data;
}
export async function createProfile(req: Request, userId: number, body: Record<string, unknown>) {
  await ensureUserOwnsResource(req, userId);
  const profileName = requireString(body.profile_name, "profile_name", 100);
  const avatarUrl = avatar(body.avatar_url);
  const device = optionalString(body.device, "device", 100) ?? null;
  const { data, error } = await supabase.from("profiles").insert({ user_id: userId, profile_name: profileName, avatar_url: avatarUrl, device, is_kids: kidsMode(body.is_kids) }).select("profile_id, user_id, profile_name, is_kids, avatar_url, device, created_at").single().returns<Profile>();
  if (error) throw error;
  return data;
}
export async function updateProfile(req: Request, profileId: number, body: Record<string, unknown>) {
  const existing = await getProfile(req, profileId);
  const updates: Record<string, unknown> = {};
  if(body.is_kids!==undefined)updates.is_kids=kidsMode(body.is_kids);
  if (body.profile_name !== undefined) updates.profile_name = requireString(body.profile_name, "profile_name", 100);
  if (body.avatar_url !== undefined) updates.avatar_url = avatar(body.avatar_url);
  if (body.device !== undefined) updates.device = optionalString(body.device, "device", 100) ?? null;
  if (Object.keys(updates).length === 0) throw new AppError(400, "No valid fields to update");
  const { data, error } = await supabase.from("profiles").update(updates).eq("profile_id", profileId).select("profile_id, user_id, profile_name, is_kids, avatar_url, device, created_at").single().returns<Profile>();
  if (error) throw error;
  return { ...existing, ...data };
}
export async function deleteProfile(req: Request, profileId: number) {
  const profile = await getProfile(req, profileId);
  const { error } = await supabase.from("profiles").delete().eq("profile_id", profile.profile_id);
  if (error) throw error;
}

function kidsMode(value:unknown):boolean{if(value===undefined)return false;if(typeof value!=="boolean")throw new AppError(400,"is_kids must be a boolean");return value;}

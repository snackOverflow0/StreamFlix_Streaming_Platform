import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { ensureUserOwnsResource, getCurrentAppUser } from "../../utils/ownership.js";
import { requireString, optionalString } from "../../utils/http.js";
import { findBlockedTerm, normalizeUserText } from "../../utils/content-filter.js";

export type Profile = {
  profile_id: number;
  user_id: number;
  profile_name: string;
  avatar_url: string | null;
  device: string | null;
  created_at: string;
};

export async function getProfilesByUser(req: Request, userId: number) {
  await ensureUserOwnsResource(req, userId);

  const { data, error } = await supabase
    .from("profiles")
    .select("profile_id, user_id, profile_name, avatar_url, device, created_at")
    .eq("user_id", userId)
    .order("profile_id")
    .returns<Profile[]>();

  if (error) throw error;

  return data ?? [];
}

export async function getProfile(req: Request, profileId: number) {
  const { data, error } = await supabase
    .from("profiles")
    .select("profile_id, user_id, profile_name, avatar_url, device, created_at")
    .eq("profile_id", profileId)
    .maybeSingle()
    .returns<Profile | null>();

  if (error) throw error;

  if (!data) {
    throw new AppError(404, "Profile not found");
  }

  await ensureUserOwnsResource(req, data.user_id);

  return data;
}

export async function createProfile(
  req: Request,
  userId: number,
  body: Record<string, unknown>
) {
  await ensureUserOwnsResource(req, userId);

  const profileName = requireString(body.profile_name, "profile_name", 20);
  const normalizedName = normalizeUserText(profileName);
  if (normalizedName.length < 2 || !/^[\p{L}\p{N} .'’()-]+$/u.test(profileName) || findBlockedTerm(profileName)) throw new AppError(422, "Choose a valid profile name without abusive language.");
  const avatarUrl = optionalString(body.avatar_url, "avatar_url", 2000) ?? null;
  if (avatarUrl) {
    try { const parsed = new URL(avatarUrl); if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(); }
    catch { throw new AppError(400, "avatar_url must be a valid HTTP or HTTPS URL"); }
  }
  const device = optionalString(body.device, "device", 80) ?? null;
  if (device && !/^[\p{L}\p{N} .•'’()\/-]+$/u.test(device)) throw new AppError(400, "device must be a controlled display label");

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("subscription_id, plan_id, status")
    .eq("subscription_user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscriptionError) {
    throw subscriptionError;
  }

  if (!subscription) {
    throw new AppError(
      400,
      "You need an active subscription before creating a profile."
    );
  }

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("plan_id, plan_name, max_members")
    .eq("plan_id", subscription.plan_id)
    .maybeSingle();

  if (planError) {
    throw planError;
  }

  if (!plan) {
    throw new AppError(
      400,
      "Your subscription plan could not be found."
    );
  }

  const maxProfiles = Number(plan.max_members);

  if (!Number.isFinite(maxProfiles) || maxProfiles < 1) {
    throw new AppError(
      400,
      "Your subscription plan has an invalid profile limit."
    );
  }

  const { count, error: countError } = await supabase
    .from("profiles")
    .select("profile_id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId);

  if (countError) {
    throw countError;
  }

  const currentProfiles = count ?? 0;

  if (currentProfiles >= maxProfiles) {
    throw new AppError(
      400,
      `PROFILE LIMIT REACHED: ${plan.plan_name} allows only ${maxProfiles} profile${maxProfiles === 1 ? "" : "s"}. You currently have ${currentProfiles}.`
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      profile_name: profileName,
      avatar_url: avatarUrl,
      device,
    })
    .select(
      "profile_id, user_id, profile_name, avatar_url, device, created_at"
    )
    .single()
    .returns<Profile>();

  if (error) {
    throw error;
  }

  return data;
}

export async function createProfileForCurrentUser(req: Request, body: Record<string, unknown>) {
  const user = await getCurrentAppUser(req);
  return createProfile(req, user.user_id, body);
}

export async function updateProfile(
  req: Request,
  profileId: number,
  body: Record<string, unknown>
) {
  const existing = await getProfile(req, profileId);

  const updates: Record<string, unknown> = {};

  if (body.profile_name !== undefined) {
    const profileName = requireString(body.profile_name, "profile_name", 20);
    if (normalizeUserText(profileName).length < 2 || !/^[\p{L}\p{N} .'’()-]+$/u.test(profileName) || findBlockedTerm(profileName)) throw new AppError(422, "Choose a valid profile name without abusive language.");
    updates.profile_name = profileName;
  }

  if (body.avatar_url !== undefined) {
    const avatarUrl = optionalString(body.avatar_url, "avatar_url", 2000) ?? null;
    if (avatarUrl) {
      try { const parsed = new URL(avatarUrl); if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(); }
      catch { throw new AppError(400, "avatar_url must be a valid HTTP or HTTPS URL"); }
    }
    updates.avatar_url = avatarUrl;
  }

  if (body.device !== undefined) {
    const device = optionalString(body.device, "device", 80) ?? null;
    if (device && !/^[\p{L}\p{N} .•'’()\/-]+$/u.test(device)) throw new AppError(400, "device must be a controlled display label");
    updates.device = device;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(400, "No valid fields to update");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("profile_id", profileId)
    .select(
      "profile_id, user_id, profile_name, avatar_url, device, created_at"
    )
    .single()
    .returns<Profile>();

  if (error) {
    throw error;
  }

  return { ...existing, ...data };
}

export async function deleteProfile(req: Request, profileId: number) {
  const profile = await getProfile(req, profileId);

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("profile_id", profile.profile_id);

  if (error) {
    throw error;
  }
}
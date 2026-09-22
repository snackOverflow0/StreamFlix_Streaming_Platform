import { supabase } from "../../config/supabase.js";

export async function getProfilesByUser(
  userId: number
) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "profile_id, user_id, profile_name, avatar_url, device, created_at"
    )
    .eq("user_id", userId)
    .order("profile_id", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getProfileById(
  profileId: number
) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "profile_id, user_id, profile_name, avatar_url, device, created_at"
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createProfile(
  profile: {
    user_id: number;
    profile_name: string;
    avatar_url?: string;
    device?: string;
  }
) {
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select(
      "profile_id, user_id, profile_name, avatar_url, device, created_at"
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProfile(
  profileId: number,
  updates: {
    profile_name?: string;
    avatar_url?: string;
    device?: string;
  }
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("profile_id", profileId)
    .select(
      "profile_id, user_id, profile_name, avatar_url, device, created_at"
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProfile(
  profileId: number
) {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("profile_id", profileId);

  if (error) {
    throw new Error(error.message);
  }
}
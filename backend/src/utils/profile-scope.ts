import type { Request } from "express";
import { supabase } from "../config/supabase.js";
import { parseId } from "./http.js";
import { AppError } from "./errors.js";

// Call after authenticating userId. Personal requests explicitly select an owned profile.
export async function personalProfile(req: Request, userId: number) {
  const id = parseId(req.query.profile_id ?? req.body?.profile_id, "profile_id");
  const {data, error} = await supabase.from("profiles").select("profile_id")
    .eq("profile_id", id).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data) throw new AppError(403, "Profile is not available to this account");
  return id;
}

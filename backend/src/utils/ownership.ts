import type { Request } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { supabase } from "../config/supabase.js";
import { AppError } from "./errors.js";

export function getAuthContext(req: Request) {
  const authReq = req as Partial<AuthenticatedRequest>;
  if (!authReq.auth) throw new AppError(401, "Authentication required");
  return authReq.auth;
}

export async function getCurrentAppUser(req: Request) {
  const auth = getAuthContext(req);
  if (!auth.email) throw new AppError(403, "Authenticated user has no email address");

  const { data, error } = await supabase
    .from("users")
    .select("user_id, full_name, email, account_status, deleted_at")
    .eq("auth_user_id", auth.authUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new AppError(403, "No StreamFlix application user is linked to this account");

  if (data.account_status !== "active") {
    throw new AppError(403, "Your StreamFlix account is not active");
  }

  if(req.res)req.res.locals.changeUserId=data.user_id;
  return data;
}

export async function ensureUserOwnsResource(req: Request, requestedUserId: number) {
  const currentUser = await getCurrentAppUser(req);
  if (currentUser.user_id !== requestedUserId) {
    throw new AppError(403, "You can only access your own resources");
  }
  return currentUser;
}

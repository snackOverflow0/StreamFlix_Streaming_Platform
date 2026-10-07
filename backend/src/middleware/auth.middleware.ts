import type { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/errors.js";
import { getBearerToken } from "../utils/http.js";

export type AuthContext = {
  authUserId: string;
  email: string | null;
};

export type AuthenticatedRequest = Request & {
  auth: AuthContext;
};

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req);
    if (!token) throw new AppError(401, "Authentication required");

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new AppError(401, "Invalid or expired access token");
    }

    (req as AuthenticatedRequest).auth = {
      authUserId: data.user.id,
      email: data.user.email ?? null,
    };

    next();
  } catch (error) {
    next(error);
  }
}

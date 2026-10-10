import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { requireString, optionalString } from "../../utils/http.js";
import { ensureUserOwnsResource } from "../../utils/ownership.js";
import type { Request } from "express";

export type User = {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  date_of_birth: string | null;
  account_status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export async function getUser(userId: number) {
  const { data, error } = await supabase.from("users").select("user_id, full_name, email, phone_number, date_of_birth, account_status, created_at, updated_at, deleted_at").eq("user_id", userId).is("deleted_at", null).maybeSingle().returns<User | null>();
  if (error) throw error;
  if (!data) throw new AppError(404, "User not found");
  return data;
}

export async function updateUser(req: Request, userId: number, body: Record<string, unknown>) {
  await ensureUserOwnsResource(req, userId);
  const updates: Record<string, unknown> = {};
  if (body.full_name !== undefined) updates.full_name = requireString(body.full_name, "full_name", 150);
  if (body.phone_number !== undefined) updates.phone_number = optionalString(body.phone_number, "phone_number", 30) ?? null;
  if (body.date_of_birth !== undefined) updates.date_of_birth = optionalString(body.date_of_birth, "date_of_birth", 20) ?? null;
  if (body.account_status !== undefined) {if(body.account_status!=="deactivated")throw new AppError(403,"Only administrators can reactivate or suspend accounts");updates.account_status="deactivated";}
  if (Object.keys(updates).length === 0) throw new AppError(400, "No valid fields to update");
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("users").update(updates).eq("user_id", userId).select("user_id, full_name, email, phone_number, date_of_birth, account_status, created_at, updated_at, deleted_at").single().returns<User>();
  if (error) throw error;
  return data;
}

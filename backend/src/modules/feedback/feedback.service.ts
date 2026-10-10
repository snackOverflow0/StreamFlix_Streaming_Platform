import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { getCurrentAppUser, ensureUserOwnsResource } from "../../utils/ownership.js";
import { requireString, optionalString } from "../../utils/http.js";
import { AppError } from "../../utils/errors.js";
export type Feedback = { feedback_id: number; user_id: number | null; subject: string; message: string; created_date: string; type: string; status: string };
const columns = "feedback_id, user_id, subject, message, created_date, type, status";
export async function listMine(req: Request, userId: number) { await ensureUserOwnsResource(req, userId); const { data, error } = await supabase.from("feedback").select(columns).eq("user_id", userId).order("created_date", { ascending: false }).returns<Feedback[]>(); if (error) throw error; return data ?? []; }
export async function create(req: Request, body: Record<string, unknown>) { const user = await getCurrentAppUser(req); const subject = requireString(body.subject, "subject", 150); const message = requireString(body.message, "message", 5000); const type = optionalString(body.type, "type", 50) ?? "general"; const { data, error } = await supabase.from("feedback").insert({ user_id: user.user_id, subject, message, type, status: "pending" }).select(columns).single().returns<Feedback>(); if (error) throw error; return data; }
export async function getOne(req: Request, feedbackId: number) { const { data, error } = await supabase.from("feedback").select(columns).eq("feedback_id", feedbackId).maybeSingle().returns<Feedback | null>(); if (error) throw error; if (!data) throw new AppError(404, "Feedback not found"); if (data.user_id === null) throw new AppError(404, "Feedback is not accessible"); await ensureUserOwnsResource(req, data.user_id); return data; }

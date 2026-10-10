import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { ensureUserOwnsResource } from "../../utils/ownership.js";
import { parseId, optionalString } from "../../utils/http.js";

export type Plan = { plan_id: number; plan_name: string; max_members: number; monthly_price: number; is_active: boolean; quality: string };
export type Subscription = { subscription_id: number; subscription_user_id: number; plan_id: number; start_date: string; end_date: string | null; status: string; created_at: string };

export async function getPlans() {
  const { data, error } = await supabase.from("plans").select("plan_id, plan_name, max_members, monthly_price, is_active").order("monthly_price");
  if (error) throw error;
  return (data ?? []).map((item) => ({
    ...item,
    quality: String(item.plan_name).toLowerCase().includes("premium") ? "4K + HDR" : String(item.plan_name).toLowerCase().includes("standard") ? "1080p" : "720p",
  })) as Plan[];
}
export async function getPlan(planId: number) {
  const { data, error } = await supabase.from("plans").select("plan_id, plan_name, max_members, monthly_price, is_active").eq("plan_id", planId).maybeSingle();
  if (error) throw error;
  if (!data) throw new AppError(404, "Plan not found");
  return {
    ...data,
    quality: String(data.plan_name).toLowerCase().includes("premium") ? "4K + HDR" : String(data.plan_name).toLowerCase().includes("standard") ? "1080p" : "720p",
  } as Plan;
}
export async function getSubscriptionsByUser(req: Request, userId: number) {
  await ensureUserOwnsResource(req, userId);
  const { data, error } = await supabase.from("subscriptions").select("subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at").eq("subscription_user_id", userId).order("created_at", { ascending: false }).returns<Subscription[]>();
  if (error) throw error;
  return data ?? [];
}
export async function getSubscription(req: Request, subscriptionId: number) {
  const { data, error } = await supabase.from("subscriptions").select("subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at").eq("subscription_id", subscriptionId).maybeSingle().returns<Subscription | null>();
  if (error) throw error;
  if (!data) throw new AppError(404, "Subscription not found");
  await ensureUserOwnsResource(req, data.subscription_user_id);
  return data;
}
export async function createSubscription(req: Request, userId: number, body: Record<string, unknown>) {
  await ensureUserOwnsResource(req, userId);
  throw new AppError(403,"Use verified checkout or ask an administrator to activate your subscription");
}
export async function updateSubscription(req: Request, subscriptionId: number, body: Record<string, unknown>) {
  const existing = await getSubscription(req, subscriptionId);
  if(body.status!=="cancelled"||Object.keys(body).some(k=>k!=="status"))throw new AppError(403,"Only administrators can activate, renew, or change subscription dates and plans");
  const updates = {status:"cancelled"};
  const { data, error } = await supabase.from("subscriptions").update(updates).eq("subscription_id", subscriptionId).select("subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at").single().returns<Subscription>();
  if (error) throw error;
  return { ...existing, ...data };
}

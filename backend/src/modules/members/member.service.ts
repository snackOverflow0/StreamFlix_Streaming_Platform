import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { ensureUserOwnsResource } from "../../utils/ownership.js";
import { parseId, requireString } from "../../utils/http.js";

export type Member = { member_id: number; subscription_id: number; user_id: number; relationship: string; date_added: string };

async function getSubscriptionOwner(subscriptionId: number) {
  const { data, error } = await supabase.from("subscriptions").select("subscription_user_id").eq("subscription_id", subscriptionId).maybeSingle();
  if (error) throw error;
  if (!data) throw new AppError(404, "Subscription not found");
  return data.subscription_user_id;
}
export async function getMembersBySubscription(req: Request, subscriptionId: number) {
  await ensureUserOwnsResource(req, await getSubscriptionOwner(subscriptionId));
  const { data, error } = await supabase.from("members").select("member_id, subscription_id, user_id, relationship, date_added").eq("subscription_id", subscriptionId).order("member_id").returns<Member[]>();
  if (error) throw error;
  return data ?? [];
}
export async function getMember(req: Request, memberId: number) {
  const { data, error } = await supabase.from("members").select("member_id, subscription_id, user_id, relationship, date_added").eq("member_id", memberId).maybeSingle().returns<Member | null>();
  if (error) throw error;
  if (!data) throw new AppError(404, "Member not found");
  await ensureUserOwnsResource(req, await getSubscriptionOwner(data.subscription_id));
  return data;
}
export async function createMember(req: Request, subscriptionId: number, body: Record<string, unknown>) {
  await ensureUserOwnsResource(req, await getSubscriptionOwner(subscriptionId));
  const userId = parseId(String(body.user_id), "user_id");
  const relationship = requireString(body.relationship, "relationship", 50);
  const { data, error } = await supabase.from("members").insert({ subscription_id: subscriptionId, user_id: userId, relationship }).select("member_id, subscription_id, user_id, relationship, date_added").single().returns<Member>();
  if (error) throw error;
  return data;
}
export async function deleteMember(req: Request, memberId: number) {
  await getMember(req, memberId);
  const { error } = await supabase.from("members").delete().eq("member_id", memberId);
  if (error) throw error;
}

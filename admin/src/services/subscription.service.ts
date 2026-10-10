import { apiRequest } from "./api-client";
export type Plan = { plan_id: number; plan_name: string; max_members: number; monthly_price: number; is_active: boolean; quality: string };
export type Subscription = { subscription_id: number; subscription_user_id: number; plan_id: number; start_date: string; end_date: string | null; status: string; created_at: string };
export function getPlans() { return apiRequest<Plan[]>("/subscriptions/plans"); }
export function getSubscriptionsByUser(userId: number) { return apiRequest<Subscription[]>(`/subscriptions/user/${userId}`); }
export function createSubscription(userId: number, planId: number) { return apiRequest<Subscription>(`/subscriptions/user/${userId}`, { method: "POST", body: JSON.stringify({ plan_id: planId }) }); }
export function updateSubscription(subscriptionId: number, data: Partial<Pick<Subscription, "plan_id" | "start_date" | "end_date" | "status">>) { return apiRequest<Subscription>(`/subscriptions/${subscriptionId}`, { method: "PATCH", body: JSON.stringify(data) }); }

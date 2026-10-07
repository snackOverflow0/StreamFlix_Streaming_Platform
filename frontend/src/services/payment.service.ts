import { apiRequest } from "./api-client";

export type SubscriptionCheckout = {
  checkout_url: string | null;
  session_id: string;
  plan: { plan_id: number; plan_name: string; max_members: number; monthly_price: number; is_active: boolean; quality: string };
};

export type SubscriptionCheckoutStatus = {
  complete: boolean;
  checkout_status: string | null;
  payment_status: string | null;
  subscription: {
    subscription_id: number;
    subscription_user_id: number;
    plan_id: number;
    start_date: string;
    end_date: string | null;
    status: string;
    created_at: string;
    payment_method?: string | null;
    payment_status?: string | null;
    transaction_reference?: string | null;
  } | null;
  payment: {
    payment_transaction_id: number;
    amount: number;
    currency: string;
    payment_method: string | null;
    status: string;
    gateway_payment_id: string | null;
    gateway_session_id: string | null;
    created_at: string;
    email_sent: boolean;
  } | null;
  plan: { plan_id: number; plan_name: string; max_members: number; monthly_price: number; is_active: boolean; quality: string };
  email_sent: boolean;
};

export function createSubscriptionCheckout(userId: number, planId: number) {
  return apiRequest<SubscriptionCheckout>("/payments/subscription-checkout", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, plan_id: planId }),
  });
}

export function getSubscriptionCheckoutStatus(sessionId: string) {
  return apiRequest<SubscriptionCheckoutStatus>(`/payments/subscription-checkout-status?session_id=${encodeURIComponent(sessionId)}`);
}

export type MerchandiseCheckoutResponse = { checkout_url: string | null; session_id: string };

export function createMerchandiseCardCheckout(userId: number, items: Array<{ product_id: number; quantity: number }>, delivery: { delivery_name: string; delivery_phone: string; delivery_address: string; delivery_method: string }) {
  return apiRequest<MerchandiseCheckoutResponse>(`/merchandise/orders/card/user/${userId}/checkout`, {
    method: "POST",
    body: JSON.stringify({ items, ...delivery }),
  });
}

export function createMerchandiseCodOrder(userId: number, items: Array<{ product_id: number; quantity: number }>, delivery: { delivery_name: string; delivery_phone: string; delivery_address: string; delivery_method: string }) {
  return apiRequest(`/merchandise/orders/cod/user/${userId}`, {
    method: "POST",
    body: JSON.stringify({ items, ...delivery }),
  });
}

export type MerchandiseCheckoutStatus = {
  found: boolean;
  paid: boolean;
  fulfilled: boolean;
  order_count: number;
  checkout_status?: string | null;
  payment_status?: string | null;
};

export function getMerchandiseCardCheckoutStatus(userId: number, sessionId: string) {
  return apiRequest<MerchandiseCheckoutStatus>(
    `/merchandise/orders/card/status?user_id=${encodeURIComponent(userId)}&session_id=${encodeURIComponent(sessionId)}`,
  );
}

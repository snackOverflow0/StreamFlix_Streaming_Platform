import { apiRequest } from "./api-client";
export type Product = { product_id: number; product_name: string; category: string; price: number; listing_status: string; image_url: string | null; stock_quantity: number; updated_at: string };
export type MerchandiseTransaction = { transaction_id: number; user_id: number; profile_id: number | null; profile_name: string | null; product_id: number; quantity: number; total_amount: number; price_at_purchase: number; created_at: string; payment_method: string | null; payment_status: string; order_status: string; delivery_method: string | null; delivery_name: string | null; delivery_phone: string | null; delivery_address: string | null; payment_reference: string | null; stripe_checkout_session_id: string | null };
export function getProducts() { return apiRequest<Product[]>("/merchandise/products"); }
export function getTransactions(userId: number, profileId: number) { return apiRequest<MerchandiseTransaction[]>(`/merchandise/transactions/user/${userId}?profile_id=${profileId}`); }

export function orderStatus(status: string): "Pending" | "Processing" | "Shipped" | "Completed" | "Cancelled" {
  return ({pending:"Pending",processing:"Processing",shipped:"Shipped",completed:"Completed",delivered:"Completed",cancelled:"Cancelled"} as const)[status as "pending"] ?? "Pending";
}

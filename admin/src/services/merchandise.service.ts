import { apiRequest } from "./api-client";
export type Product = { product_id: number; product_name: string; category: string; price: number; listing_status: string; image_url: string | null; stock_label: string | null; stock: number; description: string; variants: string[] };
export type MerchandiseTransaction = { transaction_id: number; user_id: number | null; product_id: number; quantity: number; total_amount: number; created_at: string };
export function getProducts() { return apiRequest<Product[]>("/merchandise/products"); }
export function createTransaction(userId: number, productId: number, quantity: number) { return apiRequest<MerchandiseTransaction>(`/merchandise/transactions/user/${userId}`, { method: "POST", body: JSON.stringify({ product_id: productId, quantity }) }); }
export function getTransactions(userId: number) { return apiRequest<MerchandiseTransaction[]>(`/merchandise/transactions/user/${userId}`); }

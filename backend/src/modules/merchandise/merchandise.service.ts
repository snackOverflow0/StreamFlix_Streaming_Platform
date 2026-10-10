import {resolveTrailerUrl,warmMediaUrls} from '../../utils/trailer-url.js';
import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { ensureUserOwnsResource } from "../../utils/ownership.js";
import { getProfile } from "../profiles/profile.service.js";
import { AppError } from "../../utils/errors.js";
import { parseId, requireNumber } from "../../utils/http.js";

export type Product = { product_id: number; product_name: string; category: string; price: number; listing_status: string; stock: number; stock_quantity: number; description: string; variants: string[]; image_url: string | null; stock_label: string | null };
export type Transaction = { transaction_id: number; user_id: number | null; product_id: number; quantity: number; total_amount: number; created_at: string };
const transactionColumns = "transaction_id, user_id, profile_id, profile_name, product_id, quantity, total_amount, price_at_purchase, created_at, payment_method, payment_status, order_status, delivery_method, delivery_name, delivery_phone, delivery_address";

export async function listProducts() {
  const { data, error } = await supabase.from("merchandise_product").select("product_id, product_name, category, price, listing_status, stock_quantity, image_url, description, variants").neq("listing_status","removed").order("product_name");
  if (error) throw error;
  await warmMediaUrls((data??[]).map(item=>item.image_url));
  return await Promise.all((data ?? []).map(async (item) => ({ ...item, stock:Number(item.stock_quantity), stock_quantity:Number(item.stock_quantity), image_url:await resolveTrailerUrl(item.image_url || null), stock_label:item.listing_status!=="active"||Number(item.stock_quantity)<=0?"Sold out":Number(item.stock_quantity)<=5?"Low stock":null }))) as Product[];
}
export async function getProduct(productId: number) { const products = await listProducts(); const product = products.find((item) => item.product_id === productId); if (!product) throw new AppError(404, "Product not found"); return product; }
export async function listTransactions(req: Request, userId: number) { await ensureUserOwnsResource(req, userId); const profileId=parseId(String(req.query.profile_id),"profile_id"); const profile=await getProfile(req,profileId); if(profile.user_id!==userId)throw new AppError(403,"Profile does not belong to this account"); const { data, error } = await supabase.from("merchandise_transaction").select(transactionColumns).eq("user_id", userId).eq("profile_id",profileId).order("created_at", { ascending: false }).returns<Transaction[]>(); if (error) throw error; return data ?? []; }
export async function createTransaction(req: Request, userId: number, body: Record<string, unknown>) {
  await ensureUserOwnsResource(req, userId);
  const profile=await getProfile(req,parseId(String(body.profile_id),"profile_id"));
  if(profile.user_id!==userId)throw new AppError(403,"Profile does not belong to this account");
  const productId = parseId(String(body.product_id), "product_id");
  const quantity = requireNumber(body.quantity, "quantity", { min: 1, max: 100 });
  if (!Number.isInteger(quantity)) throw new AppError(400, "quantity must be a whole number");
  const product = await getProduct(productId);
  if (product.listing_status !== "active") throw new AppError(400, "Product is not available");
  const { data, error } = await supabase.rpc("streamflix_order", {p_user:userId,p_items:[{product_id:productId,quantity}],p_delivery:{profile_id:String(profile.profile_id),delivery_method:"Pickup",delivery_name:"Account holder",delivery_phone:"",delivery_address:""},p_session:null});
  if (error) throw new AppError(409,"Product unavailable or insufficient stock");

  return data?.[0];
}

import type { Request } from "express";
import Stripe from "stripe";
import { supabase } from "../../config/supabase.js";
import { createForUser as createNotification } from "../notifications/notification.service.js";
import { stripe } from "../../config/stripe.js";
import { AppError } from "../../utils/errors.js";
import { ensureUserOwnsResource } from "../../utils/ownership.js";
import { parseId, requireNumber, requireString } from "../../utils/http.js";

export type Product = {
  product_id: number;
  product_name: string;
  category: string;
  price: number;
  listing_status: string;
  image_url: string | null;
  stock_quantity: number;
  updated_at: string;
};

export type MerchandiseTransaction = {
  transaction_id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  total_amount: number;
  price_at_purchase: number;
  created_at: string;
  payment_method: string | null;
  payment_status: string;
  order_status: string;
  delivery_method: string | null;
  delivery_name: string | null;
  delivery_phone: string | null;
  delivery_address: string | null;
  payment_reference: string | null;
  stripe_checkout_session_id: string | null;
};

const productColumns =
  "product_id, product_name, category, price, listing_status, image_url, stock_quantity, updated_at";

const transactionColumns =
  "transaction_id, user_id, product_id, quantity, total_amount, price_at_purchase, created_at, payment_method, payment_status, order_status, delivery_method, delivery_name, delivery_phone, delivery_address, payment_reference, stripe_checkout_session_id";

export type MerchandiseCheckoutItem = {
  product_id: number;
  quantity: number;
};

export type DeliveryDetails = {
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_method: string;
};

export async function listProducts() {
  const { data, error } = await supabase
    .from("merchandise_product")
    .select(productColumns)
    .order("product_name");

  if (error) throw error;

  return (data ?? []).map((item) => ({
    ...item,
    price: Number(item.price),
    stock_quantity: Number(item.stock_quantity ?? 0),
  })) as Product[];
}

export async function getProduct(productId: number) {
  const { data, error } = await supabase
    .from("merchandise_product")
    .select(productColumns)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new AppError(404, "Product not found");

  return {
    ...data,
    price: Number(data.price),
    stock_quantity: Number(data.stock_quantity ?? 0),
  } as Product;
}

export async function listTransactions(req: Request, userId: number) {
  await ensureUserOwnsResource(req, userId);

  const { data, error } = await supabase
    .from("merchandise_transaction")
    .select(transactionColumns)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<MerchandiseTransaction[]>();

  if (error) throw error;
  return data ?? [];
}

async function validateCart(items: MerchandiseCheckoutItem[]) {
  if (!items.length) {
    throw new AppError(400, "Your merchandise bag is empty");
  }

  const merged = new Map<number, number>();

  for (const rawItem of items) {
    const productId = parseId(String(rawItem.product_id), "product_id");
    const quantity = requireNumber(rawItem.quantity, "quantity", {
      min: 1,
      max: 100,
    });

    if (!Number.isInteger(quantity)) {
      throw new AppError(400, "quantity must be a whole number");
    }

    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  const normalized: Array<Product & { quantity: number }> = [];

  for (const [productId, quantity] of merged) {
    const product = await getProduct(productId);

    if (product.listing_status !== "active") {
      throw new AppError(400, `${product.product_name} is not available`);
    }

    if (product.stock_quantity < quantity) {
      throw new AppError(
        400,
        `${product.product_name} only has ${product.stock_quantity} left in stock`,
      );
    }

    normalized.push({ ...product, quantity });
  }

  return normalized;
}

function deliveryFromBody(body: Record<string, unknown>): DeliveryDetails {
  return {
    delivery_name: requireString(body.delivery_name, "delivery_name", 150),
    delivery_phone: requireString(body.delivery_phone, "delivery_phone", 50),
    delivery_address: requireString(body.delivery_address, "delivery_address", 1000),
    delivery_method: requireString(body.delivery_method, "delivery_method", 100),
  };
}

export async function createCodOrder(
  req: Request,
  userId: number,
  body: Record<string, unknown>,
) {
  await ensureUserOwnsResource(req, userId);

  const items = Array.isArray(body.items)
    ? (body.items as MerchandiseCheckoutItem[])
    : [];
  const delivery = deliveryFromBody(body);
  const products = await validateCart(items);

  const rows: MerchandiseTransaction[] = [];

  for (const item of products) {
    // Do not use .catch() on Supabase's PostgREST builder. Await the builder
    // directly so Supabase returns { data, error } consistently.
    const { data, error } = await supabase.rpc("create_merchandise_order", {
      p_delivery_address: delivery.delivery_address,
      p_delivery_method: delivery.delivery_method,
      p_delivery_name: delivery.delivery_name,
      p_delivery_phone: delivery.delivery_phone,
      p_payment_method: "Cash on Delivery",
      p_product_id: item.product_id,
      p_quantity: item.quantity,
      p_user_id: userId,
      p_payment_reference: null,
      p_stripe_checkout_session_id: null,
    });

    if (error) throw error;
    rows.push(data as MerchandiseTransaction);
  }

  try {
    await createNotification(userId, "order", "Merchandise order confirmed", "Your merchandise payment was received and your order is being processed.");
  } catch (error) {
    console.warn("[Notifications] Could not create merchandise notification:", error);
  }

  return rows;
}

export async function createCardCheckout(
  req: Request,
  userId: number,
  body: Record<string, unknown>,
) {
  const user = await ensureUserOwnsResource(req, userId);

  const items = Array.isArray(body.items)
    ? (body.items as MerchandiseCheckoutItem[])
    : [];
  const delivery = deliveryFromBody(body);
  const products = await validateCart(items);

  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: products.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "php",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.product_name,
          ...(item.image_url ? { images: [item.image_url] } : {}),
        },
      },
    })),
    success_url: `${frontendUrl}/?merch_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/?merch_cancelled=1`,
    metadata: {
      userId: String(userId),
      items: JSON.stringify(
        products.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      ),
      delivery_name: delivery.delivery_name,
      delivery_phone: delivery.delivery_phone,
      delivery_address: delivery.delivery_address,
      delivery_method: delivery.delivery_method,
    },
  } satisfies Stripe.Checkout.SessionCreateParams);

  if (!session.url) {
    throw new AppError(502, "Stripe did not return a checkout URL");
  }

  return {
    checkout_url: session.url,
    session_id: session.id,
  };
}

export async function getCardCheckoutStatus(
  req: Request,
  userId: number,
  sessionId: string,
) {
  await ensureUserOwnsResource(req, userId);

  if (!sessionId) {
    throw new AppError(400, "Checkout session id is required");
  }

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error: any) {
    if (error?.code === "resource_missing") {
      return {
        found: false,
        paid: false,
        fulfilled: false,
        order_count: 0,
      };
    }
    throw error;
  }

  if (Number(session.metadata?.userId) !== userId) {
    throw new AppError(403, "You can only access your own checkout session");
  }

  const { data: orders, error } = await supabase
    .from("merchandise_transaction")
    .select("transaction_id")
    .eq("user_id", userId)
    .eq("stripe_checkout_session_id", session.id);

  if (error) throw error;

  return {
    found: true,
    paid: session.payment_status === "paid",
    checkout_status: session.status,
    payment_status: session.payment_status,
    fulfilled: (orders?.length ?? 0) > 0,
    order_count: orders?.length ?? 0,
  };
}

export async function fulfillStripeMerchandise(session: {
  id: string;
  payment_intent: string | null;
  metadata: Record<string, string>;
  payment_status: string;
  amount_total: number;
  currency: string;
  event_id: string;
}) {
  if (session.payment_status !== "paid") return [];

  const userId = Number(session.metadata.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError(400, "Merchandise checkout metadata has an invalid userId");
  }

  let items: MerchandiseCheckoutItem[];
  try {
    items = JSON.parse(session.metadata.items ?? "[]") as MerchandiseCheckoutItem[];
  } catch {
    throw new AppError(400, "Merchandise checkout metadata contains invalid items");
  }

  if (!items.length) {
    throw new AppError(400, "Merchandise checkout metadata contains no items");
  }

  const rows: MerchandiseTransaction[] = [];

  for (const rawItem of items) {
    const productId = parseId(String(rawItem.product_id), "product_id");
    const quantity = requireNumber(rawItem.quantity, "quantity", {
      min: 1,
      max: 100,
    });

    if (!Number.isInteger(quantity)) {
      throw new AppError(400, "quantity must be a whole number");
    }

    const product = await getProduct(productId);
    if (product.listing_status !== "active") {
      throw new AppError(400, `${product.product_name} is not available`);
    }

    const reference = `${session.payment_intent ?? session.id}:${productId}`;

    const { data: existing, error: existingError } = await supabase
      .from("merchandise_transaction")
      .select(transactionColumns)
      .eq("payment_reference", reference)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      rows.push(existing as MerchandiseTransaction);
      continue;
    }

    // Stock is deliberately NOT checked in this request before the RPC.
    // The database function locks the product row and performs the final
    // atomic stock check/decrement inside the same transaction.
    const { data, error } = await supabase.rpc("create_merchandise_order", {
      p_delivery_address: session.metadata.delivery_address ?? "",
      p_delivery_method: session.metadata.delivery_method ?? "",
      p_delivery_name: session.metadata.delivery_name ?? "",
      p_delivery_phone: session.metadata.delivery_phone ?? "",
      p_payment_method: "Card",
      p_product_id: productId,
      p_quantity: quantity,
      p_user_id: userId,
      p_payment_reference: reference,
      p_stripe_checkout_session_id: session.id,
    });

    if (error) throw error;
    rows.push(data as MerchandiseTransaction);
  }

  // Keep the central payment ledger synchronized with merchandise payments too.
  // This row is idempotent by Stripe gateway/event_id, so webhook retries never
  // create duplicate payment transactions.
  const { data: existingPayment, error: existingPaymentError } = await supabase
    .from("payment_transactions")
    .select("payment_transaction_id")
    .eq("gateway", "stripe")
    .eq("event_id", session.event_id)
    .maybeSingle();

  if (existingPaymentError) throw existingPaymentError;

  if (!existingPayment) {
    const { error: paymentError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: userId,
        plan_id: null,
        subscription_id: null,
        gateway: "stripe",
        gateway_payment_id: session.payment_intent,
        gateway_session_id: session.id,
        gateway_subscription_id: null,
        amount: Number(session.amount_total ?? 0) / 100,
        currency: String(session.currency ?? "php").toUpperCase(),
        payment_method: "Card",
        status: "succeeded",
        event_id: session.event_id,
      });

    if (paymentError) throw paymentError;
  }

  return rows;
}

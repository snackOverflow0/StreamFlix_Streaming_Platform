import type { Request } from "express";
import Stripe from "stripe";
import { stripe } from "../../config/stripe.js";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { ensureUserOwnsResource, getCurrentAppUser } from "../../utils/ownership.js";
import { getPlan } from "../subscriptions/subscription.service.js";
import { sendSubscriptionConfirmationEmail } from "../../utils/email.js";
import { createForUser as createNotification } from "../notifications/notification.service.js";

function getStripePeriodTimestamp(
  subscription: Stripe.Subscription,
  field: "current_period_start" | "current_period_end",
): number | null {
  const rootValue = (subscription as any)?.[field];
  if (typeof rootValue === "number" && Number.isFinite(rootValue) && rootValue > 0) {
    return rootValue;
  }

  const firstItem = (subscription as any)?.items?.data?.[0];
  const itemValue = firstItem?.[field];
  if (typeof itemValue === "number" && Number.isFinite(itemValue) && itemValue > 0) {
    return itemValue;
  }

  return null;
}

function stripeTimestampToDateOnly(
  timestamp: number | null,
  fieldName: string,
  fallback?: Date,
): string {
  if (timestamp !== null) {
    const date = new Date(timestamp * 1000);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  if (fallback) {
    return fallback.toISOString().slice(0, 10);
  }

  throw new AppError(500, `Stripe subscription ${fieldName} is missing or invalid`);
}

async function getStripeBillingDates(subscription: Stripe.Subscription) {
  let startTimestamp = getStripePeriodTimestamp(subscription, "current_period_start");
  let endTimestamp = getStripePeriodTimestamp(subscription, "current_period_end");

  // Stripe API versions can expose billing periods on invoice/line-item data
  // rather than the subscription root. Retrieve the latest invoice as a
  // server-side fallback instead of inventing an arbitrary billing period.
  if (startTimestamp === null || endTimestamp === null) {
    const latestInvoice = (subscription as any)?.latest_invoice;
    const latestInvoiceId =
      typeof latestInvoice === "string"
        ? latestInvoice
        : latestInvoice?.id;

    if (latestInvoiceId) {
      try {
        const invoice = await stripe.invoices.retrieve(latestInvoiceId);
        const invoiceAny = invoice as any;
        const linePeriod = invoiceAny?.lines?.data?.[0]?.period;

        if (startTimestamp === null) {
          const candidate = invoiceAny?.period_start ?? linePeriod?.start;
          if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
            startTimestamp = candidate;
          }
        }

        if (endTimestamp === null) {
          const candidate = invoiceAny?.period_end ?? linePeriod?.end;
          if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
            endTimestamp = candidate;
          }
        }
      } catch (error) {
        console.warn("[Stripe] Could not retrieve latest invoice for billing period fallback:", error);
      }
    }
  }

  // The first period should normally come from Stripe. This fallback only
  // prevents a malformed/legacy Stripe response from crashing activation.
  const start = stripeTimestampToDateOnly(startTimestamp, "current_period_start", new Date());

  if (endTimestamp !== null) {
    return { start, end: stripeTimestampToDateOnly(endTimestamp, "current_period_end") };
  }

  const fallbackEnd = new Date(`${start}T00:00:00.000Z`);
  fallbackEnd.setUTCMonth(fallbackEnd.getUTCMonth() + 1);
  return { start, end: fallbackEnd.toISOString().slice(0, 10) };
}

function getInvoiceSubscriptionId(invoice: any): string | null {
  const direct = invoice?.subscription;
  if (typeof direct === "string" && direct) return direct;
  if (direct?.id && typeof direct.id === "string") return direct.id;

  const nested = invoice?.parent?.subscription_details?.subscription;
  if (typeof nested === "string" && nested) return nested;
  if (nested?.id && typeof nested.id === "string") return nested.id;

  return null;
}

export async function createSubscriptionCheckout(req: Request, userId: number, planId: number) {
  const user = await ensureUserOwnsResource(req, userId);
  const plan = await getPlan(planId);
  if (!plan.is_active) throw new AppError(400, "Selected plan is inactive");

  const existing = await supabase.from("subscriptions").select("subscription_id, status, stripe_subscription_id").eq("subscription_user_id", userId).eq("status", "active").maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data?.stripe_subscription_id) {
    throw new AppError(409, "You already have an active subscription. Manage your current subscription instead.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "php",
        unit_amount: Math.round(Number(plan.monthly_price) * 100),
        recurring: { interval: "month" },
        product_data: { name: `StreamFlix ${plan.plan_name}` },
      },
    }],
    success_url: `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/?subscription_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/?subscription_cancelled=1`,
    metadata: { userId: String(userId), planId: String(planId) },
    subscription_data: { metadata: { userId: String(userId), planId: String(planId) } },
  } as Stripe.Checkout.SessionCreateParams);


  return { checkout_url: session.url, session_id: session.id, plan };
}

export async function getCheckoutStatus(req: Request, sessionId: string) {
  const user = await getCurrentAppUser(req);
  if (!sessionId) throw new AppError(400, "Checkout session id is required");

  // Prefer our database as the source of truth for activation. Stripe Checkout
  // sessions can disappear from the current account/mode (for example after a
  // stale browser redirect), and that must never turn into a 500 loop.
  const { data: payment, error: paymentError } = await supabase.from("payment_transactions")
    .select("payment_transaction_id, plan_id, subscription_id, amount, currency, payment_method, status, gateway_payment_id, gateway_session_id, gateway_subscription_id, created_at, email_sent")
    .eq("user_id", user.user_id)
    .eq("gateway_session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();
  if (paymentError) throw paymentError;

  let session: Stripe.Checkout.Session | null = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError && error.code === "resource_missing") {
      if (payment?.status === "succeeded" && payment.subscription_id) {
        const { data: subscription, error: subscriptionError } = await supabase.from("subscriptions")
          .select("subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at, payment_method, payment_status, transaction_reference")
          .eq("subscription_id", payment.subscription_id)
          .eq("subscription_user_id", user.user_id)
          .maybeSingle();
        if (subscriptionError) throw subscriptionError;
        if (subscription?.status === "active") {
          const plan = await getPlan(Number(payment.plan_id));
          return {
            complete: true,
            checkout_status: "complete",
            payment_status: "paid",
            subscription,
            payment,
            plan,
            email_sent: Boolean(payment.email_sent),
          };
        }
      }
      throw new AppError(404, "Checkout session is no longer available. Please start checkout again.");
    }
    throw error;
  }

  const sessionMetadata = session.metadata ?? {};
  if (sessionMetadata.userId !== String(user.user_id)) {
    throw new AppError(403, "Checkout session does not belong to this account");
  }

  const { data: subscription, error: subscriptionError } = await supabase.from("subscriptions")
    .select("subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at, payment_method, payment_status, transaction_reference")
    .eq("subscription_user_id", user.user_id)
    .eq("stripe_checkout_session_id", session.id)
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();
  if (subscriptionError) throw subscriptionError;

  const complete = session.payment_status === "paid" && subscription?.status === "active";
  return {
    complete,
    checkout_status: session.status,
    payment_status: session.payment_status,
    subscription,
    payment,
    plan: await getPlan(Number(sessionMetadata.planId)),
    email_sent: Boolean(payment?.email_sent),
  };
}

async function sendConfirmationOnce(userId: number, paymentTransactionId: number, details: { planName: string; monthlyPrice: number; maxMembers: number; paymentIntentId: string; amount: number; paymentMethod: string }) {
  const { data: existing } = await supabase.from("email_delivery_log").select("email_delivery_id").eq("payment_transaction_id", paymentTransactionId).eq("message_type", "subscription_confirmation").maybeSingle();
  if (existing) return true;

  const sent = await sendSubscriptionConfirmationEmail(userId, details);
  await supabase.from("email_delivery_log").insert({
    user_id: userId,
    payment_transaction_id: paymentTransactionId,
    provider: "brevo",
    recipient_email: (await getCurrentUserEmail(userId)) ?? "unknown",
    message_type: "subscription_confirmation",
    status: sent ? "sent" : "failed",
  });
  if (sent) await supabase.from("payment_transactions").update({ email_sent: true }).eq("payment_transaction_id", paymentTransactionId);
  return sent;
}

async function getCurrentUserEmail(userId: number) {
  const { data } = await supabase.from("users").select("email").eq("user_id", userId).maybeSingle();
  return data?.email ?? null;
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) throw new AppError(500, "STRIPE_WEBHOOK_SECRET is not configured");
  const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription") await activateSubscriptionFromCheckout(session, event.id);
    if (session.mode === "payment") {
      const { fulfillStripeMerchandise } = await import("../merchandise/merchandise.service.js");
      await fulfillStripeMerchandise({
        id: session.id,
        payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
        metadata: session.metadata ?? {},
        payment_status: session.payment_status ?? "unpaid",
        amount_total: session.amount_total ?? 0,
        currency: session.currency ?? "php",
        event_id: event.id,
      });
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = getInvoiceSubscriptionId(invoice as any);
    if (subId) await syncStripeSubscription(subId, event.id, "paid");
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = getInvoiceSubscriptionId(invoice as any);
    if (subId) await syncStripeSubscription(subId, event.id, "failed");
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await syncDeletedSubscription(subscription.id);
  }

  return { received: true };
}

async function activateSubscriptionFromCheckout(session: Stripe.Checkout.Session, eventId: string) {
  const metadata = session.metadata ?? {};
  const userId = Number(metadata.userId);
  const planId = Number(metadata.planId);
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
  if (!userId || !planId || !subscriptionId) throw new AppError(400, "Stripe checkout metadata is incomplete");
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const { start, end } = await getStripeBillingDates(stripeSubscription);
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.id;

  const { data: existingSub, error: existingSubError } = await supabase.from("subscriptions")
    .select("subscription_id")
    .eq("subscription_user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (existingSubError) throw existingSubError;

  let sub: any;
  if (existingSub) {
    const { data, error } = await supabase.from("subscriptions").update({
      plan_id: planId, start_date: start, end_date: end, status: "active",
      stripe_subscription_id: stripeSubscription.id, stripe_checkout_session_id: session.id,
      payment_method: "Card", payment_status: "paid", transaction_reference: paymentIntentId,
      paid_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("subscription_id", existingSub.subscription_id).select("subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at").single();
    if (error) throw error;
    sub = data;
  } else {
    const { data, error } = await supabase.from("subscriptions").insert({
      subscription_user_id: userId, plan_id: planId, start_date: start, end_date: end, status: "active",
      stripe_subscription_id: stripeSubscription.id, stripe_checkout_session_id: session.id,
      payment_method: "Card", payment_status: "paid", transaction_reference: paymentIntentId,
      paid_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).select("subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at").single();
    if (error) throw error;
    sub = data;
  }

  const plan = await getPlan(planId);
  const amount = Number(session.amount_total ?? Math.round(Number(plan.monthly_price) * 100)) / 100;
  const { data: existingPayment } = await supabase.from("payment_transactions").select("payment_transaction_id, email_sent").eq("gateway_session_id", session.id).maybeSingle();
  let paymentId = existingPayment?.payment_transaction_id as number | undefined;
  if (!paymentId) {
    const { data: payment, error } = await supabase.from("payment_transactions").insert({
      user_id: userId, plan_id: planId, subscription_id: sub.subscription_id,
      gateway: "stripe", gateway_payment_id: paymentIntentId, gateway_session_id: session.id,
      gateway_subscription_id: stripeSubscription.id, amount, currency: "PHP", payment_method: "Card",
      status: "succeeded", event_id: eventId,
    }).select("payment_transaction_id").single();
    if (error) throw error;
    paymentId = payment.payment_transaction_id;
  }

  if (!existingPayment?.email_sent) {
    await sendConfirmationOnce(userId, paymentId!, {
      planName: plan.plan_name, monthlyPrice: Number(plan.monthly_price), maxMembers: Number(plan.max_members),
      paymentIntentId, amount, paymentMethod: "Card",
    });
  }

  try {
    await createNotification(userId, "subscription", "Subscription activated", `Your ${plan.plan_name} subscription is active.`);
  } catch (error) {
    console.warn("[Notifications] Could not create subscription notification:", error);
  }
}

async function findPaymentIntentForSubscription(stripeSubscriptionId: string): Promise<{ paymentIntentId: string | null; amount: number; currency: string }> {
  try {
    const invoices = await stripe.invoices.list({ subscription: stripeSubscriptionId, limit: 1 });
    const invoice: any = invoices.data?.[0];
    const paymentIntent = invoice?.payment_intent;
    return {
      paymentIntentId: typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id ?? null,
      amount: Number(invoice?.amount_paid ?? invoice?.total ?? 0) / 100,
      currency: String(invoice?.currency ?? "php").toUpperCase(),
    };
  } catch (error) {
    console.warn("[Stripe] Could not load invoice payment details:", error);
    return { paymentIntentId: null, amount: 0, currency: "PHP" };
  }
}

async function syncStripeSubscription(stripeSubscriptionId: string, eventId: string, status: "paid" | "failed") {
  const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const { data: current } = await supabase.from("subscriptions").select("subscription_id, subscription_user_id, plan_id").eq("stripe_subscription_id", stripeSubscriptionId).maybeSingle();
  if (!current) return;
  const { end } = await getStripeBillingDates(stripeSubscription);
  const mappedStatus = stripeSubscription.status === "active" ? "active" : stripeSubscription.status === "past_due" ? "past_due" : (stripeSubscription.status === "canceled" || stripeSubscription.status === "unpaid") ? "cancelled" : "expired";
  const { error: subscriptionUpdateError } = await supabase.from("subscriptions").update({ end_date: end, status: mappedStatus, payment_status: status, paid_at: status === "paid" ? new Date().toISOString() : undefined, updated_at: new Date().toISOString() }).eq("subscription_id", current.subscription_id);
  if (subscriptionUpdateError) throw subscriptionUpdateError;

  const invoicePayment = await findPaymentIntentForSubscription(stripeSubscriptionId);
  const invoiceAmount = invoicePayment.amount;
  const { data: existingEventPayment, error: existingEventError } = await supabase
    .from("payment_transactions")
    .select("payment_transaction_id")
    .eq("gateway", "stripe")
    .eq("event_id", eventId)
    .maybeSingle();
  if (existingEventError) throw existingEventError;

  if (!existingEventPayment) {
    const { error: paymentInsertError } = await supabase.from("payment_transactions").insert({
      user_id: current.subscription_user_id,
      plan_id: current.plan_id,
      subscription_id: current.subscription_id,
      gateway: "stripe",
      gateway_payment_id: invoicePayment.paymentIntentId,
      gateway_subscription_id: stripeSubscriptionId,
      amount: invoiceAmount,
      currency: invoicePayment.currency,
      payment_method: "Card",
      status: status === "paid" ? "succeeded" : "failed",
      failure_reason: status === "failed" ? "Stripe invoice payment failed" : null,
      event_id: eventId,
    });
    if (paymentInsertError) throw paymentInsertError;
  }

  try {
    await createNotification(
      current.subscription_user_id,
      status === "paid" ? "payment" : "payment_failed",
      status === "paid" ? "Subscription payment received" : "Subscription payment failed",
      status === "paid" ? "Your latest subscription payment was received." : "Your latest subscription payment could not be completed. Please check your payment method.",
    );
  } catch (error) {
    console.warn("[Notifications] Could not create payment notification:", error);
  }
}

async function syncDeletedSubscription(stripeSubscriptionId: string) {
  const { data: current } = await supabase.from("subscriptions").select("subscription_id, subscription_user_id").eq("stripe_subscription_id", stripeSubscriptionId).maybeSingle();
  await supabase.from("subscriptions").update({ status: "canceled", end_date: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() }).eq("stripe_subscription_id", stripeSubscriptionId);
  if (current?.subscription_user_id) {
    try { await createNotification(current.subscription_user_id, "subscription", "Subscription ended", "Your StreamFlix subscription has ended."); } catch (error) { console.warn("[Notifications] Could not create cancellation notification:", error); }
  }
}

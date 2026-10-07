import type { Request, Response } from "express";
import {
  createSubscriptionCheckout,
  getCheckoutStatus,
  handleStripeWebhook,
} from "./payment.service.js";
import { getCurrentAppUser } from "../../utils/ownership.js";
import { AppError } from "../../utils/errors.js";

export async function subscriptionCheckout(req: Request, res: Response) {
  try {
    const currentUser = await getCurrentAppUser(req);
    const userId = Number(currentUser.user_id);
    const planId = Number(req.body?.plan_id ?? req.body?.planId);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError(400, "Invalid authenticated user");
    }

    if (!Number.isInteger(planId) || planId <= 0) {
      throw new AppError(400, "Invalid plan_id");
    }

    return res.status(200).json(
      await createSubscriptionCheckout(req, userId, planId),
    );
  } catch (error: any) {
    console.error("[Payments] subscriptionCheckout error:", error);
    return res.status(error?.statusCode ?? 500).json({
      error: error?.message ?? "Unable to create subscription checkout",
    });
  }
}

export async function checkoutStatus(req: Request, res: Response) {
  try {
    const sessionId = String(req.query.session_id ?? req.query.sessionId ?? "").trim();
    return res.json(await getCheckoutStatus(req, sessionId));
  } catch (error: any) {
    return res.status(error?.statusCode ?? 500).json({
      error: error?.message ?? "Unable to read checkout status",
    });
  }
}

export async function stripeWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Missing Stripe signature" });
    }

    const signatureValue = Array.isArray(signature)
      ? signature[0]
      : signature;

    if (!signatureValue) {
      return res.status(400).json({ error: "Invalid Stripe signature" });
    }

    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        error: "Stripe webhook requires a raw request body",
      });
    }

    return res.json(await handleStripeWebhook(req.body, signatureValue));
  } catch (error: any) {
    console.error("\n========== STRIPE WEBHOOK ERROR ==========");
    console.error("Name:", error?.name);
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Status:", error?.statusCode);
    console.error("Details:", error?.details);
    console.error("Hint:", error?.hint);
    if (error?.stack) console.error("Stack:", error.stack);
    console.error("===========================================\n");

    return res.status(error?.statusCode ?? 500).json({
      error: error?.message ?? "Stripe webhook processing failed",
    });
  }
}

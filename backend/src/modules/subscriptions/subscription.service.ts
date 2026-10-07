import type { Request } from "express";

import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { ensureUserOwnsResource } from "../../utils/ownership.js";
import { parseId, optionalString } from "../../utils/http.js";

export type Plan = {
  plan_id: number;
  plan_name: string;
  max_members: number;
  monthly_price: number;
  is_active: boolean;
  quality: string;
};

export type Subscription = {
  subscription_id: number;
  subscription_user_id: number;
  plan_id: number;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
};

function getQuality(planName: string) {
  const name = planName.toLowerCase();

  if (name.includes("premium")) return "4K + HDR";
  if (name.includes("standard")) return "1080p";

  return "720p";
}

export async function getPlans() {
  const { data, error } = await supabase
    .from("plans")
    .select(
      "plan_id, plan_name, max_members, monthly_price, is_active"
    )
    .order("monthly_price");

  if (error) throw error;

  return (data ?? []).map((item) => ({
    ...item,
    quality: getQuality(String(item.plan_name)),
  })) as Plan[];
}

export async function getPlan(planId: number) {
  const { data, error } = await supabase
    .from("plans")
    .select(
      "plan_id, plan_name, max_members, monthly_price, is_active"
    )
    .eq("plan_id", planId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new AppError(404, "Plan not found");
  }

  return {
    ...data,
    quality: getQuality(String(data.plan_name)),
  } as Plan;
}

export async function getSubscriptionsByUser(
  req: Request,
  userId: number
) {
  await ensureUserOwnsResource(req, userId);

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at"
    )
    .eq("subscription_user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .returns<Subscription[]>();

  if (error) throw error;

  return data ?? [];
}

export async function getSubscription(
  req: Request,
  subscriptionId: number
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at"
    )
    .eq("subscription_id", subscriptionId)
    .maybeSingle()
    .returns<Subscription | null>();

  if (error) throw error;

  if (!data) {
    throw new AppError(
      404,
      "Subscription not found"
    );
  }

  await ensureUserOwnsResource(
    req,
    data.subscription_user_id
  );

  return data;
}

export async function createSubscription(
  req: Request,
  userId: number,
  body: Record<string, unknown>
) {
  await ensureUserOwnsResource(req, userId);

  const planId = parseId(
    String(body.plan_id),
    "plan_id"
  );

  return activateSubscriptionAfterPayment(
    userId,
    planId
  );
}

export async function activateSubscriptionAfterPayment(
  userId: number,
  planId: number
) {
  const plan = await getPlan(planId);

  if (!plan.is_active) {
    throw new AppError(
      400,
      "Selected plan is inactive"
    );
  }

  const startDate =
    new Date().toISOString().slice(0, 10);

  const { data: existing, error: existingError } =
    await supabase
      .from("subscriptions")
      .select(
        "subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at"
      )
      .eq("subscription_user_id", userId)
      .eq("status", "active")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()
      .returns<Subscription | null>();

  if (existingError) {
    throw existingError;
  }

  let subscription: Subscription;

  if (existing) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        plan_id: planId,
        start_date: startDate,
        end_date: null,
        status: "active",
      })
      .eq(
        "subscription_id",
        existing.subscription_id
      )
      .select(
        "subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at"
      )
      .single()
      .returns<Subscription>();

    if (error) throw error;

    subscription = data;
  } else {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        subscription_user_id: userId,
        plan_id: planId,
        start_date: startDate,
        end_date: null,
        status: "active",
      })
      .select(
        "subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at"
      )
      .single()
      .returns<Subscription>();

    if (error) throw error;

    subscription = data;
  }

  return subscription;
}

export async function updateSubscription(
  req: Request,
  subscriptionId: number,
  body: Record<string, unknown>
) {
  const existing = await getSubscription(
    req,
    subscriptionId
  );

  const updates: Record<string, unknown> = {};

  if (body.plan_id !== undefined) {
    updates.plan_id = parseId(
      String(body.plan_id),
      "plan_id"
    );
  }

  if (body.start_date !== undefined) {
    updates.start_date = optionalString(
      body.start_date,
      "start_date",
      20
    );
  }

  if (body.end_date !== undefined) {
    updates.end_date =
      optionalString(
        body.end_date,
        "end_date",
        20
      ) ?? null;
  }

  if (body.status !== undefined) {
    updates.status = optionalString(
      body.status,
      "status",
      50
    );
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(
      400,
      "No valid fields to update"
    );
  }

  if (updates.plan_id) {
    const plan = await getPlan(
      Number(updates.plan_id)
    );

    if (!plan.is_active) {
      throw new AppError(
        400,
        "Selected plan is inactive"
      );
    }
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq(
      "subscription_id",
      subscriptionId
    )
    .select(
      "subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at"
    )
    .single()
    .returns<Subscription>();

  if (error) throw error;

  return {
    ...existing,
    ...data,
  };
}
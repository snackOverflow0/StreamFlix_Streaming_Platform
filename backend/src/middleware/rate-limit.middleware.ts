import type { RequestHandler } from "express";
import { AppError } from "../utils/errors.js";

type Bucket = { count: number; resetAt: number };

function keyFor(req: Parameters<RequestHandler>[0]) {
  const forwarded = req.header("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.ip || "unknown";
}

export function rateLimit(options: { windowMs: number; max: number; message?: string }): RequestHandler {
  const buckets = new Map<string, Bucket>();
  const cleanupEvery = Math.max(options.windowMs, 60_000);
  let lastCleanup = Date.now();

  return (req, _res, next) => {
    const now = Date.now();
    if (now - lastCleanup >= cleanupEvery) {
      for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
      lastCleanup = now;
    }

    const key = keyFor(req);
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > options.max) {
      const error = new AppError(429, options.message ?? "Too many requests. Please try again shortly.");
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      (error as AppError & { retryAfter?: number }).retryAfter = retryAfter;
      return next(error);
    }

    next();
  };
}

export const generalRateLimit = rateLimit({ windowMs: 60_000, max: 240 });
export const mutationRateLimit = rateLimit({ windowMs: 60_000, max: 90 });
export const searchRateLimit = rateLimit({ windowMs: 60_000, max: 120, message: "Search rate limit reached. Please slow down." });
export const reviewRateLimit = rateLimit({ windowMs: 60_000, max: 20, message: "Too many review attempts. Please try again shortly." });
export const feedbackRateLimit = rateLimit({ windowMs: 10 * 60_000, max: 10, message: "Too many feedback submissions. Please try again later." });

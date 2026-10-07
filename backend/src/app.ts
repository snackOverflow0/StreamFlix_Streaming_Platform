import express from "express";
import path from "node:path";
import cors from "cors";

import { env } from "./config/env.js";
import { supabase } from "./config/supabase.js";
import { securityHeaders } from "./middleware/security.middleware.js";
import { generalRateLimit, mutationRateLimit } from "./middleware/rate-limit.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import contentRoutes from "./modules/content/content.routes.js";
import genreRoutes from "./modules/genres/genre.routes.js";
import seasonRoutes from "./modules/seasons/season.routes.js";
import episodeRoutes from "./modules/episodes/episode.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import profileRoutes from "./modules/profiles/profile.routes.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import memberRoutes from "./modules/members/member.routes.js";
import favoriteRoutes from "./modules/favorites/favorite.routes.js";
import watchListRoutes from "./modules/watch-list/watchList.routes.js";
import reviewRoutes from "./modules/reviews/review.routes.js";
import viewHistoryRoutes from "./modules/view-history/viewHistory.routes.js";
import feedbackRoutes from "./modules/feedback/feedback.routes.js";
import merchandiseRoutes from "./modules/merchandise/merchandise.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import recommendationRoutes from "./modules/recommendations/recommendation.routes.js";
import visitorRoutes from "./modules/visitors/visitor.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(securityHeaders);
app.use(generalRateLimit);

app.use(
  cors({
    origin: env.frontendOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.post("/api/payments/webhook", express.raw({ type: "application/json", limit: "2mb" }), async (req, res, next) => {
  try {
    const { stripeWebhook } = await import("./modules/payments/payment.controller.js");
    await stripeWebhook(req, res);
  } catch (error) { next(error); }
});

app.use(express.json({ limit: "1mb" }));
app.use((req, _res, next) => {
  if (["POST", "PATCH", "DELETE"].includes(req.method) && !req.path.startsWith("/api/payments/webhook")) return mutationRateLimit(req, _res, next);
  next();
});

app.use(
  "/streamflix",
  express.static(path.resolve(process.cwd(), "public/streamflix"))
);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "streamflix-backend",
  });
});

app.get("/api/test-db", async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("content")
      .select("content_id, title")
      .limit(1);

    if (error) throw error;

    res.json({
      connected: true,
      sample: data?.[0] ?? null,
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/episodes", episodeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/watch-list", watchListRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/view-history", viewHistoryRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/merchandise", merchandiseRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/visitors", visitorRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;
import express from "express";
import {requestContext,createRateLimiter} from "./middleware/operations.js";
import {eventsRouter,mutationEvents} from "./change-events.js";
import {stripeWebhook} from "./stripe-webhook.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import path from "node:path";
import cors from "cors";
import { env } from "./config/env.js";
import { supabase } from "./config/supabase.js";
import { securityHeaders } from "./middleware/security.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import contentRoutes from "./modules/content/content.routes.js";
import genreRoutes from "./modules/genres/genre.routes.js";
import seasonRoutes from "./modules/seasons/season.routes.js";
import episodeRoutes from "./modules/episodes/episode.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import profileRoutes from "./modules/profiles/profile.routes.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js";
import memberRoutes from "./modules/members/member.routes.js";
import favoriteRoutes from "./modules/favorites/favorite.routes.js";
import watchListRoutes from "./modules/watch-list/watchList.routes.js";
import reviewRoutes from "./modules/reviews/review.routes.js";
import viewHistoryRoutes from "./modules/view-history/viewHistory.routes.js";
import feedbackRoutes from "./modules/feedback/feedback.routes.js";
import merchandiseRoutes from "./modules/merchandise/merchandise.routes.js";

import {paymentRouter} from "./payments.routes.js";
import {clientRouter} from "./client.routes.js";
const app = express();
// Configure only the exact proxy addresses operated by your deployment.
if(process.env.TRUST_PROXY)app.set("trust proxy",process.env.TRUST_PROXY.split(",").map(value=>value.trim()));
app.use(requestContext);

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(cors({ origin: env.frontendOrigins, methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use("/api",createRateLimiter());
app.use(mutationEvents);
app.use("/api",eventsRouter);
app.post("/api/payments/webhook",express.raw({type:"application/json",limit:"1mb"}),stripeWebhook);
app.use(express.json({ limit: "1mb" }));

app.use("/streamflix", express.static(path.resolve(process.cwd(), "public/streamflix"),{maxAge:"1d",etag:true}));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "streamflix-backend" });
});

app.get("/api/ready",async(_req,res)=>{try{const {data,error}=await supabase.rpc("streamflix_readiness");if(error)throw error;const ready=data?.ready===true;res.status(ready?200:503).json({ready,cardPayments:Boolean(process.env.STRIPE_SECRET_KEY?.trim()&&process.env.STRIPE_WEBHOOK_SECRET?.trim())});}catch{res.status(503).json({ready:false,message:"Database connection or setup is incomplete"});}});

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/episodes", episodeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/watch-list", watchListRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/view-history", viewHistoryRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/merchandise", merchandiseRoutes);

app.use("/api", paymentRouter);
app.use("/api", clientRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;

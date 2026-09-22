import express from "express";
import cors from "cors";

import { supabase } from "./config/supabase.js";

import contentRoutes from "./modules/content/content.routes.js";
import genreRoutes from "./modules/genres/genre.routes.js";
import seasonRoutes from "./modules/seasons/season.routes.js";
import episodeRoutes from "./modules/episodes/episode.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import profileRoutes from "./modules/profiles/profile.routes.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "StreamFlix backend is running",
  });
});

app.get("/api/test-db", async (_req, res) => {
  const { data, error } = await supabase
    .from("genre")
    .select("genre_id, genre_name")
    .limit(5);

  if (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });

    return;
  }

  res.json({
    success: true,
    message: "Database connection is working",
    data,
  });
});

app.use("/api/content", contentRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/episodes", episodeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);

export default app;
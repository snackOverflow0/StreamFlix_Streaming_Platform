import express from "express";
import cors from "cors";
import { supabase } from "./config/supabase.js";

import contentRoutes from "./modules/content/content.routes.js";
import { getGenres } from "./modules/genres/genre.controller.js";
import seasonRoutes from "./modules/seasons/season.routes.js";
import episodeRoutes from "./modules/episodes/episode.routes.js";

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
app.use("/api/genres", getGenres);

app.use("/api/seasons", seasonRoutes);
app.use("/api/episodes", episodeRoutes);

export default app;
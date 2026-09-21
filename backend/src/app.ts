import express from "express";
import cors from "cors";
import { supabase } from "./config/supabase.js";

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
    .from("users")
    .select("user_id")
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

export default app;
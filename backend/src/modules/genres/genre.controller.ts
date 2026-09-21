import type { Request, Response } from "express";
import { getAllGenres } from "./genre.service.js";

export async function getGenres(_req: Request, res: Response) {
  try {
    const genres = await getAllGenres();

    res.json({
      success: true,
      data: genres,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get genres";

    res.status(500).json({
      success: false,
      message,
    });
  }
}
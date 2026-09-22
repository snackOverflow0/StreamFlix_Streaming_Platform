import type { Request, Response } from "express";

import {
  getEpisodesBySeason,
} from "./episode.service.js";

export async function getEpisodes(
  req: Request,
  res: Response
) {
  const seasonId = Number(req.params.seasonId);

  if (!Number.isInteger(seasonId)) {
    res.status(400).json({
      success: false,
      message: "Invalid season ID",
    });

    return;
  }

  try {
    const episodes = await getEpisodesBySeason(
      seasonId
    );

    res.json({
      success: true,
      data: episodes,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get episodes";

    res.status(500).json({
      success: false,
      message,
    });
  }
}
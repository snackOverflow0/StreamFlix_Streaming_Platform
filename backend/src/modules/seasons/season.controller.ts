import type { Request, Response } from "express";

import {
  getSeasonsByContent,
} from "./season.service.js";

export async function getSeasons(
  req: Request,
  res: Response
) {
  const contentId = Number(req.params.contentId);

  if (!Number.isInteger(contentId)) {
    res.status(400).json({
      success: false,
      message: "Invalid content ID",
    });

    return;
  }

  try {
    const seasons = await getSeasonsByContent(
      contentId
    );

    res.json({
      success: true,
      data: seasons,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get seasons";

    res.status(500).json({
      success: false,
      message,
    });
  }
}
import type { Request, Response } from "express";

import {
  getAllContent,
  getContentById,
  searchContent,
} from "./content.service.js";

export async function getContent(
  _req: Request,
  res: Response
) {
  try {
    const content = await getAllContent();

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get content";

    res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function getContentDetails(
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
    const content = await getContentById(contentId);

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });

      return;
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get content details";

    res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function searchContentController(
  req: Request,
  res: Response
) {
  const search =
    typeof req.query.q === "string"
      ? req.query.q
      : undefined;

  const genre =
    typeof req.query.genre === "string"
      ? req.query.genre
      : undefined;

  const type =
    typeof req.query.type === "string"
      ? req.query.type
      : undefined;

  try {
    const content = await searchContent(
      search,
      genre,
      type
    );

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to search content";

    res.status(500).json({
      success: false,
      message,
    });
  }
}
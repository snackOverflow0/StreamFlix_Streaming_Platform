import type { Request, Response } from "express";
import { getAllContent } from "./content.service.js";

export async function getContent(_req: Request, res: Response) {
  try {
    const content = await getAllContent();

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    const message = 
      error instanceof Error ? error.message : "Failed to get content";

    res.status(500).json({
      success: false,
      message,
    });
  }
}
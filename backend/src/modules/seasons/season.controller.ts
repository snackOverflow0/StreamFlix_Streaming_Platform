import type { Request, Response } from "express";
import { getSeasonsByContent } from "./season.service.js";
import { parseId } from "../../utils/http.js";
export async function getByContent(req: Request, res: Response) {
  res.json(await getSeasonsByContent(parseId(req.params.contentId, "contentId")));
}

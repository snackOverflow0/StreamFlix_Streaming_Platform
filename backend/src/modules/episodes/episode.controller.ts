import type { Request, Response } from "express";
import { getEpisodesBySeason } from "./episode.service.js";
import { parseId } from "../../utils/http.js";
export async function getBySeason(req: Request, res: Response) {
  res.json(await getEpisodesBySeason(parseId(req.params.seasonId, "seasonId")));
}

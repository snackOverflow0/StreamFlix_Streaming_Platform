import type { Request, Response } from "express";
import { getRecommendations } from "./recommendation.service.js";
export async function recommendations(req: Request, res: Response) { res.json(await getRecommendations(req)); }

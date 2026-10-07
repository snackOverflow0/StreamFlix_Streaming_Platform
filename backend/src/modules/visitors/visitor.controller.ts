import type { Request, Response } from "express";
import { trackVisit } from "./visitor.service.js";
export async function visit(req: Request, res: Response) { res.json(await trackVisit(req, res)); }

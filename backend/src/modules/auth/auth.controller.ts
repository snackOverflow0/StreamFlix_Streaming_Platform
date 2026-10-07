import type { Request, Response } from "express";
import { bootstrap as bootstrapApp, getCurrentUser } from "./auth.service.js";
export async function me(req: Request, res: Response) { res.json(await getCurrentUser(req)); }
export async function bootstrap(req: Request, res: Response) { res.json(await bootstrapApp(req)); }

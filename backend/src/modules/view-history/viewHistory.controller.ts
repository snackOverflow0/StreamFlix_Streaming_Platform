import type { Request, Response } from "express";
import { parseId } from "../../utils/http.js";
import { create, getOne, listByUser, listMine, saveProgress } from "./viewHistory.service.js";
export async function byUser(req: Request, res: Response) { res.json(await listByUser(req, parseId(req.params.userId, "userId"))); }
export async function mine(req: Request, res: Response) { res.json(await listMine(req)); }
export async function one(req: Request, res: Response) { res.json(await getOne(req, parseId(req.params.historyId, "historyId"))); }
export async function add(req: Request, res: Response) { res.status(201).json(await create(req, req.body)); }
export async function progress(req: Request, res: Response) { res.json(await saveProgress(req, req.body)); }

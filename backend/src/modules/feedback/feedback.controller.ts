import type { Request, Response } from "express";
import { parseId } from "../../utils/http.js";
import { create, getOne, listMine } from "./feedback.service.js";
export async function byUser(req: Request, res: Response) { res.json(await listMine(req, parseId(req.params.userId, "userId"))); }
export async function one(req: Request, res: Response) { res.json(await getOne(req, parseId(req.params.feedbackId, "feedbackId"))); }
export async function add(req: Request, res: Response) { res.status(201).json(await create(req, req.body)); }

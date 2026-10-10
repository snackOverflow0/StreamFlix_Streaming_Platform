import type { Request, Response } from "express";
import { parseId } from "../../utils/http.js";
import { create, getOne, listByContent, listRatingSummaries, remove, update } from "./review.service.js";
export async function byContent(req: Request, res: Response) { res.json(await listByContent(parseId(req.params.contentId, "contentId"))); }
export async function ratings(_req: Request, res: Response) { res.json(await listRatingSummaries()); }
export async function one(req: Request, res: Response) { res.json(await getOne(req, parseId(req.params.reviewId, "reviewId"))); }
export async function add(req: Request, res: Response) { res.status(201).json(await create(req, req.body)); }
export async function patch(req: Request, res: Response) { res.json(await update(req, parseId(req.params.reviewId, "reviewId"), req.body)); }
export async function del(req: Request, res: Response) { await remove(req, parseId(req.params.reviewId, "reviewId")); res.status(204).send(); }

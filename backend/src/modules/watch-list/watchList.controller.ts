import type { Request, Response } from "express";
import { parseId } from "../../utils/http.js";
import { create, getMyWatchList, getOne, remove, update } from "./watchList.service.js";
export async function mine(req: Request, res: Response) { res.json(await getMyWatchList(req)); }
export async function one(req: Request, res: Response) { res.json(await getOne(req, parseId(req.params.listId, "listId"))); }
export async function add(req: Request, res: Response) { res.status(201).json(await create(req, req.body)); }
export async function patch(req: Request, res: Response) { res.json(await update(req, parseId(req.params.listId, "listId"), req.body)); }
export async function del(req: Request, res: Response) { await remove(req, parseId(req.params.listId, "listId")); res.status(204).send(); }

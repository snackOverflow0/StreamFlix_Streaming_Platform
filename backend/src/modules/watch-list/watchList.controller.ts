import type { Request, Response } from "express";
import { getCurrentAppUser } from "../../utils/ownership.js";
import { parseId } from "../../utils/http.js";
import { create, getByUser, getOne, remove, update } from "./watchList.service.js";
export async function byUser(req: Request, res: Response) { res.json(await getByUser(req, parseId(req.params.userId, "userId"))); }
export async function one(req: Request, res: Response) { res.json(await getOne(req, parseId(req.params.listId, "listId"))); }
export async function add(req: Request, res: Response) { res.status(201).json(await create(req, parseId(req.params.userId, "userId"), req.body)); }
export async function patch(req: Request, res: Response) { res.json(await update(req, parseId(req.params.listId, "listId"), req.body)); }
export async function del(req: Request, res: Response) { await remove(req, parseId(req.params.listId, "listId")); res.status(204).send(); }

export async function me(req: Request,res: Response) {const user=await getCurrentAppUser(req);res.json(await getByUser(req,user.user_id));}
export async function addMine(req: Request,res: Response) {const user=await getCurrentAppUser(req);res.status(201).json(await create(req,user.user_id,req.body));}

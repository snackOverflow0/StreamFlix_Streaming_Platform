import type { Request, Response } from "express";
import { getCurrentAppUser } from "../../utils/ownership.js";
import { parseId } from "../../utils/http.js";
import { createFavorite, deleteFavorite, getFavorite, getFavoritesByUser } from "./favorite.service.js";
export async function byUser(req: Request, res: Response) { res.json(await getFavoritesByUser(req, parseId(req.params.userId, "userId"))); }
export async function one(req: Request, res: Response) { res.json(await getFavorite(req, parseId(req.params.favoriteId, "favoriteId"))); }
export async function create(req: Request, res: Response) { res.status(201).json(await createFavorite(req, parseId(req.params.userId, "userId"), req.body)); }
export async function remove(req: Request, res: Response) { await deleteFavorite(req, parseId(req.params.favoriteId, "favoriteId")); res.status(204).send(); }

export async function me(req: Request,res: Response) {const user=await getCurrentAppUser(req);res.json(await getFavoritesByUser(req,user.user_id));}
export async function createMine(req: Request,res: Response) {const user=await getCurrentAppUser(req);res.status(201).json(await createFavorite(req,user.user_id,req.body));}

import type { Request, Response } from "express";
import { parseId } from "../../utils/http.js";
import { createFavorite, deleteFavorite, getFavorite, getMyFavorites } from "./favorite.service.js";
export async function mine(req: Request, res: Response) { res.json(await getMyFavorites(req)); }
export async function one(req: Request, res: Response) { res.json(await getFavorite(req, parseId(req.params.favoriteId, "favoriteId"))); }
export async function create(req: Request, res: Response) { res.status(201).json(await createFavorite(req, req.body)); }
export async function remove(req: Request, res: Response) { await deleteFavorite(req, parseId(req.params.favoriteId, "favoriteId")); res.status(204).send(); }

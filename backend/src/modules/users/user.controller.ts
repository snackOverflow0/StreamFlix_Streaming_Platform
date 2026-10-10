import type { Request, Response } from "express";
import { getUser, updateUser } from "./user.service.js";
import { parseId } from "../../utils/http.js";
export async function getOne(req: Request, res: Response) { res.json(await getUser(parseId(req.params.userId, "userId"))); }
export async function patch(req: Request, res: Response) { res.json(await updateUser(req, parseId(req.params.userId, "userId"), req.body)); }

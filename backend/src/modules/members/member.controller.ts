import type { Request, Response } from "express";
import { parseId } from "../../utils/http.js";
import { createMember, deleteMember, getMember, getMembersBySubscription } from "./member.service.js";
export async function bySubscription(req: Request, res: Response) { res.json(await getMembersBySubscription(req, parseId(req.params.subscriptionId, "subscriptionId"))); }
export async function one(req: Request, res: Response) { res.json(await getMember(req, parseId(req.params.memberId, "memberId"))); }
export async function create(req: Request, res: Response) { res.status(201).json(await createMember(req, parseId(req.params.subscriptionId, "subscriptionId"), req.body)); }
export async function remove(req: Request, res: Response) { await deleteMember(req, parseId(req.params.memberId, "memberId")); res.status(204).send(); }

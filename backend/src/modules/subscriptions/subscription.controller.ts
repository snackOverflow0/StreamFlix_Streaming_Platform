import type { Request, Response } from "express";
import { parseId } from "../../utils/http.js";
import { createSubscription, getPlan, getPlans, getSubscription, getSubscriptionsByUser, updateSubscription } from "./subscription.service.js";
export async function plans(_req: Request, res: Response) { res.json(await getPlans()); }
export async function plan(req: Request, res: Response) { res.json(await getPlan(parseId(req.params.planId, "planId"))); }
export async function byUser(req: Request, res: Response) { res.json(await getSubscriptionsByUser(req, parseId(req.params.userId, "userId"))); }
export async function one(req: Request, res: Response) { res.json(await getSubscription(req, parseId(req.params.subscriptionId, "subscriptionId"))); }
export async function create(req: Request, res: Response) { res.status(201).json(await createSubscription(req, parseId(req.params.userId, "userId"), req.body)); }
export async function patch(req: Request, res: Response) { res.json(await updateSubscription(req, parseId(req.params.subscriptionId, "subscriptionId"), req.body)); }

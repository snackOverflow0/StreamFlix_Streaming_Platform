import type { Request, Response } from "express";
import { parseId } from "../../utils/http.js";
import { createProfile, createProfileForCurrentUser, deleteProfile, getProfile, getProfilesByUser, updateProfile } from "./profile.service.js";
export async function byUser(req: Request, res: Response) { res.json(await getProfilesByUser(req, parseId(req.params.userId, "userId"))); }
export async function one(req: Request, res: Response) { res.json(await getProfile(req, parseId(req.params.profileId, "profileId"))); }
export async function create(req: Request, res: Response) { res.status(201).json(await createProfile(req, parseId(req.params.userId, "userId"), req.body)); }
export async function createMe(req: Request, res: Response) { res.status(201).json(await createProfileForCurrentUser(req, req.body)); }
export async function patch(req: Request, res: Response) { res.json(await updateProfile(req, parseId(req.params.profileId, "profileId"), req.body)); }
export async function remove(req: Request, res: Response) { await deleteProfile(req, parseId(req.params.profileId, "profileId")); res.status(204).send(); }

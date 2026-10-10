import type { Request, Response } from "express";
import { listGenres } from "./genre.service.js";

export async function getGenres(_req: Request, res: Response) {
  res.json(await listGenres());
}

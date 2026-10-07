import type { Request, Response } from "express";
import { listContent, getContentById, searchContent } from "./content.service.js";
import { parseId } from "../../utils/http.js";

export async function getAllContent(req: Request, res: Response) {
  const genreParam = typeof req.query.genre === "string" ? Number(req.query.genre) : undefined;
  const genre = Number.isFinite(genreParam) && genreParam !== undefined && genreParam > 0 ? genreParam : undefined;
  const type = typeof req.query.type === "string" ? req.query.type.trim() : undefined;
  res.json(await listContent({ genre, type }));
}

export async function getOneContent(req: Request, res: Response) {
  res.json(await getContentById(parseId(req.params.contentId, "contentId")));
}

export async function search(req: Request, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 55) : undefined;
  const genreParam = typeof req.query.genre === "string" ? Number(req.query.genre) : undefined;
  const genre = Number.isFinite(genreParam) && genreParam !== undefined && genreParam > 0 ? genreParam : undefined;
  const type = typeof req.query.type === "string" ? req.query.type.trim() : undefined;
  res.json(await searchContent({ q, genre, type }));
}

import type { Request, Response } from "express";
import { listNotifications, markAllRead, markReadFromParam, unreadCount } from "./notification.service.js";

export async function list(req: Request, res: Response) {
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 30;
  res.json(await listNotifications(req, Number.isFinite(limit) ? limit : 30));
}

export async function count(_req: Request, res: Response) {
  res.json(await unreadCount(_req));
}

export async function read(req: Request, res: Response) {
  const notification = await markReadFromParam(req, req.params.notificationId);
  if (!notification) return res.status(404).json({ error: "Notification not found" });
  return res.json(notification);
}

export async function readAll(req: Request, res: Response) {
  res.json(await markAllRead(req));
}

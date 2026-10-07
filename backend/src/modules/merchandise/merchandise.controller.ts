import type { Request, Response } from "express";
import { parseId } from "../../utils/http.js";
import {
  createCardCheckout,
  createCodOrder,
  getCardCheckoutStatus,
  getProduct,
  listProducts,
  listTransactions,
} from "./merchandise.service.js";

export async function products(_req: Request, res: Response) {
  res.json(await listProducts());
}

export async function product(req: Request, res: Response) {
  res.json(await getProduct(parseId(req.params.productId, "productId")));
}

export async function transactions(req: Request, res: Response) {
  res.json(await listTransactions(req, parseId(req.params.userId, "userId")));
}

export async function codOrder(req: Request, res: Response) {
  res.status(201).json(
    await createCodOrder(req, parseId(req.params.userId, "userId"), req.body),
  );
}

export async function cardCheckout(req: Request, res: Response) {
  res.status(201).json(
    await createCardCheckout(req, parseId(req.params.userId, "userId"), req.body),
  );
}

export async function cardCheckoutStatus(req: Request, res: Response) {
  const userId = parseId(String(req.query.user_id ?? ""), "user_id");
  const sessionId = String(req.query.session_id ?? "").trim();
  res.json(await getCardCheckoutStatus(req, userId, sessionId));
}

import type { Request, Response } from "express";
import { parseId } from "../../utils/http.js";
import { createTransaction, getProduct, listProducts, listTransactions } from "./merchandise.service.js";
export async function products(_req: Request, res: Response) { res.json(await listProducts()); }
export async function product(req: Request, res: Response) { res.json(await getProduct(parseId(req.params.productId, "productId"))); }
export async function transactions(req: Request, res: Response) { res.json(await listTransactions(req, parseId(req.params.userId, "userId"))); }
export async function buy(req: Request, res: Response) { res.status(201).json(await createTransaction(req, parseId(req.params.userId, "userId"), req.body)); }

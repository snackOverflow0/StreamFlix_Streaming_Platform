import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  cardCheckout,
  cardCheckoutStatus,
  codOrder,
  product,
  products,
  transactions,
} from "./merchandise.controller.js";

const router = Router();

router.get("/products", products);
router.get("/products/:productId", product);

router.use(requireAuth);
router.get("/orders/card/status", cardCheckoutStatus);
router.get("/transactions/user/:userId", transactions);
router.post("/orders/cod/user/:userId", codOrder);
router.post("/orders/card/user/:userId/checkout", cardCheckout);

export default router;

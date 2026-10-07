import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { checkoutStatus, subscriptionCheckout } from "./payment.controller.js";

const router = Router();

router.use(requireAuth);
router.post("/subscription-checkout", subscriptionCheckout);
router.get("/subscription-checkout-status", checkoutStatus);

export default router;

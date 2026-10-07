import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { getOne, patch } from "./user.controller.js";
const router = Router();
router.get("/:userId", requireAuth, getOne);
router.patch("/:userId", requireAuth, patch);
export default router;

import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { recommendations } from "./recommendation.controller.js";
const router = Router();
router.use(requireAuth);
router.get("/", recommendations);
export default router;

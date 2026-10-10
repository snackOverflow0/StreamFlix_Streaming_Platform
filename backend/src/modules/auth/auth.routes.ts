import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { bootstrap, me } from "./auth.controller.js";
const router = Router();
router.use(requireAuth);
router.get("/me", me);
router.get("/bootstrap", bootstrap);
export default router;

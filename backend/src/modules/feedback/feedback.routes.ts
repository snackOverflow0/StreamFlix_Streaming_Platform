import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { add, byUser, one } from "./feedback.controller.js";
const router = Router();
router.use(requireAuth);
router.get("/user/:userId", byUser);
router.get("/:feedbackId", one);
router.post("/", add);
export default router;

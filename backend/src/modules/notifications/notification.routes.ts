import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { count, list, read, readAll } from "./notification.controller.js";

const router = Router();
router.use(requireAuth);
router.get("/", list);
router.get("/unread-count", count);
router.patch("/:notificationId/read", read);
router.patch("/read-all", readAll);
export default router;

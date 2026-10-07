import { Router } from "express";
import { getByContent } from "./season.controller.js";
const router = Router();
router.get("/content/:contentId", getByContent);
export default router;

import { Router } from "express";
import { getBySeason } from "./episode.controller.js";
const router = Router();
router.get("/season/:seasonId", getBySeason);
export default router;

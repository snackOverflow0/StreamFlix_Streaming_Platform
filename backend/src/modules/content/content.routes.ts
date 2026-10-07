import { Router } from "express";
import { searchRateLimit } from "../../middleware/rate-limit.middleware.js";
import { getAllContent, getOneContent, search } from "./content.controller.js";

const router = Router();
router.get("/search", searchRateLimit, search);
router.get("/", getAllContent);
router.get("/:contentId", getOneContent);
export default router;

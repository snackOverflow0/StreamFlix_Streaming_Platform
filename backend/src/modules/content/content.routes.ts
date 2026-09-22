import { Router } from "express";

import {
  getContent,
  getContentDetails,
  searchContentController,
} from "./content.controller.js";

const router = Router();

router.get("/search", searchContentController);
router.get("/", getContent);
router.get("/:contentId", getContentDetails);

export default router;
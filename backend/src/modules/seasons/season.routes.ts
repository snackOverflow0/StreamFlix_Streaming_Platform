import { Router } from "express";

import { getSeasons } from "./season.controller.js";

const router = Router();

router.get(
  "/content/:contentId",
  getSeasons
);

export default router;
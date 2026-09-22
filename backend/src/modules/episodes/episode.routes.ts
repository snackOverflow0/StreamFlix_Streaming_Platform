import { Router } from "express";

import { getEpisodes } from "./episode.controller.js";

const router = Router();

router.get(
  "/season/:seasonId",
  getEpisodes
);

export default router;
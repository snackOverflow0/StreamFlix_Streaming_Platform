import { Router } from "express";

import { getGenres } from "./genre.controller.js";

const router = Router();

router.get("/", getGenres);

export default router;
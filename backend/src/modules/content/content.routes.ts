import { Router } from "express";
import { getAllContent, getOneContent, search } from "./content.controller.js";

import {playbackRouter} from './playback.js';
const router = Router();
router.use(playbackRouter);
router.get("/search", search);
router.get("/", getAllContent);
router.get("/:contentId", getOneContent);
export default router;

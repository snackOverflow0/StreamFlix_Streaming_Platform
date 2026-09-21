import { Router } from "express";
import {
  getContent,
  getContentDetails,
} from "./content.controller.js";

const router = Router();

router.get("/", getContent);
router.get("/:contentId", getContentDetails);

export default router;
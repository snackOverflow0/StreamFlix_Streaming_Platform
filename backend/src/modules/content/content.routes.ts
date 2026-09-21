import { Router } from "express";
import { getContent } from "./content.controller.js";

const router = Router();

router.get("/", getContent);

export default router;
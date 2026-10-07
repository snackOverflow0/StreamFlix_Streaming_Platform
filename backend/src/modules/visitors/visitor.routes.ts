import { Router } from "express";
import { visit } from "./visitor.controller.js";
const router = Router();
router.post("/visit", visit);
export default router;

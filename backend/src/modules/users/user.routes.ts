import { Router } from "express";

import {
  getUser,
  updateUserProfile,
} from "./user.controller.js";

const router = Router();

router.get("/:userId", getUser);
router.patch("/:userId", updateUserProfile);

export default router;
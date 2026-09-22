import { Router } from "express";

import {
  getUserProfiles,
  getProfile,
  addProfile,
  editProfile,
  removeProfile,
} from "./profile.controller.js";

const router = Router();

router.get(
  "/user/:userId",
  getUserProfiles
);

router.get(
  "/:profileId",
  getProfile
);

router.post(
  "/user/:userId",
  addProfile
);

router.patch(
  "/:profileId",
  editProfile
);

router.delete(
  "/:profileId",
  removeProfile
);

export default router;
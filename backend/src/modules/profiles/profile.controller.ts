import type { Request, Response } from "express";

import {
  getProfilesByUser,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} from "./profile.service.js";

export async function getUserProfiles(
  req: Request,
  res: Response
) {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId)) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });

    return;
  }

  try {
    const profiles =
      await getProfilesByUser(userId);

    res.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get profiles";

    res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function getProfile(
  req: Request,
  res: Response
) {
  const profileId = Number(
    req.params.profileId
  );

  if (!Number.isInteger(profileId)) {
    res.status(400).json({
      success: false,
      message: "Invalid profile ID",
    });

    return;
  }

  try {
    const profile =
      await getProfileById(profileId);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Profile not found",
      });

      return;
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get profile";

    res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function addProfile(
  req: Request,
  res: Response
) {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId)) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });

    return;
  }

  const {
    profile_name,
    avatar_url,
    device,
  } = req.body;

  if (
    typeof profile_name !== "string" ||
    !profile_name.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "Profile name is required",
    });

    return;
  }

  try {
    const profile = await createProfile({
      user_id: userId,
      profile_name: profile_name.trim(),
      avatar_url,
      device,
    });

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create profile";

    res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function editProfile(
  req: Request,
  res: Response
) {
  const profileId = Number(
    req.params.profileId
  );

  if (!Number.isInteger(profileId)) {
    res.status(400).json({
      success: false,
      message: "Invalid profile ID",
    });

    return;
  }

  const {
    profile_name,
    avatar_url,
    device,
  } = req.body;

  const updates: {
    profile_name?: string;
    avatar_url?: string;
    device?: string;
  } = {};

  if (profile_name !== undefined) {
    updates.profile_name = profile_name;
  }

  if (avatar_url !== undefined) {
    updates.avatar_url = avatar_url;
  }

  if (device !== undefined) {
    updates.device = device;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({
      success: false,
      message: "No fields provided for update",
    });

    return;
  }

  try {
    const profile =
      await updateProfile(
        profileId,
        updates
      );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update profile";

    res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function removeProfile(
  req: Request,
  res: Response
) {
  const profileId = Number(
    req.params.profileId
  );

  if (!Number.isInteger(profileId)) {
    res.status(400).json({
      success: false,
      message: "Invalid profile ID",
    });

    return;
  }

  try {
    await deleteProfile(profileId);

    res.json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete profile";

    res.status(500).json({
      success: false,
      message,
    });
  }
}
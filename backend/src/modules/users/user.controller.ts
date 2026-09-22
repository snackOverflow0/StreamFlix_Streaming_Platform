import type { Request, Response } from "express";

import {
  getUserById,
  updateUser,
} from "./user.service.js";

export async function getUser(
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
    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });

      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get user";

    res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function updateUserProfile(
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
    full_name,
    phone_number,
    date_of_birth,
  } = req.body;

  const updates: {
    full_name?: string;
    phone_number?: string;
    date_of_birth?: string;
  } = {};

  if (full_name !== undefined) {
    updates.full_name = full_name;
  }

  if (phone_number !== undefined) {
    updates.phone_number = phone_number;
  }

  if (date_of_birth !== undefined) {
    updates.date_of_birth = date_of_birth;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({
      success: false,
      message: "No fields provided for update",
    });

    return;
  }

  try {
    const user = await updateUser(
      userId,
      updates
    );

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update user";

    res.status(500).json({
      success: false,
      message,
    });
  }
}
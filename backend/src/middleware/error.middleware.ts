import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code?: unknown }).code);
    const messages: Record<string, string> = {
      "23505": "That record already exists",
      "23503": "A related record does not exist",
      "23514": "The submitted value failed a database rule",
    };
    const message = messages[code];
    if (message) {
      res.status(400).json({ message });
      return;
    }
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
};

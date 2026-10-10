import type { Request } from "express";
import { AppError } from "./errors.js";

export function parseId(value: unknown, name = "id"): number {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new AppError(400, `${name} must be a positive integer`);
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(400, `${name} must be a positive integer`);
  }
  return id;
}

export function requireString(value: unknown, field: string, maxLength = 5000): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, `${field} is required`);
  }
  const result = value.trim();
  if (result.length > maxLength) {
    throw new AppError(400, `${field} is too long`);
  }
  return result;
}

export function optionalString(value: unknown, field: string, maxLength = 5000): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new AppError(400, `${field} must be a string`);
  }
  const result = value.trim();
  if (result.length > maxLength) {
    throw new AppError(400, `${field} is too long`);
  }
  return result;
}

export function requireNumber(value: unknown, field: string, options?: { min?: number; max?: number }): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new AppError(400, `${field} must be a number`);
  }
  if (options?.min !== undefined && numberValue < options.min) {
    throw new AppError(400, `${field} must be at least ${options.min}`);
  }
  if (options?.max !== undefined && numberValue > options.max) {
    throw new AppError(400, `${field} must be at most ${options.max}`);
  }
  return numberValue;
}

export function requireEnum<T extends string>(value: unknown, field: string, values: readonly T[]): T {
  if (typeof value !== "string" || !values.includes(value as T)) {
    throw new AppError(400, `${field} must be one of: ${values.join(", ")}`);
  }
  return value as T;
}

export function getBearerToken(req: Request): string | null {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isSupabaseError(value: unknown): value is { code?: string; message: string } {
  return typeof value === "object" && value !== null && "message" in value;
}

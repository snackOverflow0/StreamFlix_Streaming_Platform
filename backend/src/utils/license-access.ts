/** Expiration date is inclusive in Asia/Manila; missing/invalid licenses fail closed. */
export function licenseAvailable(expiration: unknown, today: string): boolean {
  const end = String(expiration ?? '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(end) && end >= today;
}

export function nepalDateBoundary(value: string): Date | undefined {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Choose a valid date.");
  const utc = new Date(value + "T00:00:00Z");
  if (!Number.isFinite(utc.getTime()) || utc.toISOString().slice(0, 10) !== value) throw new Error("Choose a valid date.");
  return new Date(utc.getTime() - 345 * 60000);
}
export function auditDateRange(from: string, to: string) {
  const gte = nepalDateBoundary(from), lastDay = nepalDateBoundary(to);
  if (gte && lastDay && gte > lastDay) throw new Error("The end date must be on or after the start date.");
  return { ...(gte ? { gte } : {}), ...(lastDay ? { lt: new Date(lastDay.getTime() + 86400_000) } : {}) };
}

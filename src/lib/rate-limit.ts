/**
 * Tiny in-memory fixed-window rate limiter.
 *
 * Keyed by an arbitrary string (typically the client IP). It is per-process, so
 * on a serverless/multi-instance deploy each instance keeps its own counters and
 * the effective limit is looser than the number below — that's acceptable here
 * because it's a secondary defense (the contact form already has a honeypot and
 * a submit-time trap). For a hard guarantee you'd back this with Redis/Upstash,
 * but that's overkill for a low-traffic school site.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; retryAfterSec: number };

/**
 * @param key       identifier to limit on (e.g. the request IP)
 * @param limit     max requests allowed per window
 * @param windowMs  window length in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

/**
 * Best-effort client IP from proxy headers. Netlify/Vercel set
 * `x-forwarded-for` (comma-separated, client first) and `x-real-ip`.
 * Falls back to a constant so a missing header degrades to a shared bucket
 * rather than skipping the limit entirely.
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

// Best-effort per-IP rate limiting for the anonymous endpoints.
//
// Counters live in module memory only. On serverless, each running
// instance keeps its own map and cold starts reset it — so this is a
// speed bump that blunts casual abuse, not a hard guarantee. A strict
// limit would need an external store (e.g. Redis) keyed by IP.

interface Hit {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Hit>();

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Records one hit for this caller and returns true when the caller is
 * OVER the limit. `bucket` separates endpoints so traffic on one route
 * doesn't eat another route's allowance.
 */
export function isRateLimited(
  req: Request,
  bucket: string,
  limit: number,
  windowMs: number
): boolean {
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const hit = buckets.get(key);

  if (!hit || now - hit.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }

  hit.count += 1;
  return hit.count > limit;
}

// Simple in-memory sliding-window rate limiter. Sufficient abuse protection
// for a single-process demo — no external service required.

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

const hits = new Map<string, number[]>();

export function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    hits.set(ip, timestamps);
    return { ok: false, retryAfter };
  }

  timestamps.push(now);
  hits.set(ip, timestamps);
  return { ok: true, retryAfter: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

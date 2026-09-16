import type { NextRequest } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const LIMIT = Number(process.env.AI_RATE_LIMIT_MAX ?? 20);
const WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS ?? 60_000);

let lastSweep = 0;

function sweep(now: number): void {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfter: number };

/**
 * Rate limit en memoria por IP. Suficiente para una instancia unica
 * (el objetivo es proteger la cuota de OpenAI de abuso trivial).
 * Si se escala horizontalmente, sustituir por un store compartido (Redis/Upstash).
 */
export function checkRateLimit(req: NextRequest): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const key = clientIp(req);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: LIMIT - 1 };
  }

  if (bucket.count >= LIMIT) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, remaining: LIMIT - bucket.count };
}

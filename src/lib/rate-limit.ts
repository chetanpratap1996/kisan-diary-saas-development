/**
 * Simple in-memory rate limiter for API routes.
 * Works perfectly for Vercel's single-instance serverless functions.
 * Free, no external dependencies required.
 *
 * Usage:
 *   const limiter = rateLimit({ limit: 5, windowMs: 15 * 60 * 1000 });
 *   const result = limiter.check(ip);
 *   if (!result.success) return NextResponse.json(..., { status: 429 });
 */

interface RateLimitStore {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

// Module-level store — persists across requests within the same serverless instance
const store = new Map<string, RateLimitStore>();

// Periodic cleanup to prevent memory leaks (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (value.resetAt < now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function rateLimit(options: RateLimitOptions) {
  const { limit, windowMs } = options;

  return {
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const key = identifier;
      const entry = store.get(key);

      if (!entry || entry.resetAt < now) {
        // New window
        const resetAt = now + windowMs;
        store.set(key, { count: 1, resetAt });
        return {
          success: true,
          remaining: limit - 1,
          resetAt,
          retryAfterSeconds: 0,
        };
      }

      if (entry.count >= limit) {
        return {
          success: false,
          remaining: 0,
          resetAt: entry.resetAt,
          retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
        };
      }

      entry.count += 1;
      return {
        success: true,
        remaining: limit - entry.count,
        resetAt: entry.resetAt,
        retryAfterSeconds: 0,
      };
    },

    reset(identifier: string) {
      store.delete(identifier);
    },
  };
}

// Pre-configured limiters
export const authLimiter = rateLimit({ limit: 10, windowMs: 15 * 60 * 1000 }); // 10 attempts / 15 min
export const otpLimiter = rateLimit({ limit: 5, windowMs: 10 * 60 * 1000 });   // 5 attempts / 10 min
export const apiLimiter = rateLimit({ limit: 120, windowMs: 60 * 1000 });       // 120 req / min

/**
 * Extract IP from request headers (works with Vercel proxy).
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

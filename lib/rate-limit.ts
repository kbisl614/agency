/**
 * Simple In-Memory Rate Limiter
 *
 * For production, replace this with Redis-based rate limiting.
 * This implementation is suitable for single-server deployments only.
 *
 * Configuration:
 * - MAX_REQUESTS: Maximum submissions per IP within the window
 * - WINDOW_MS: Time window in milliseconds (1 hour default)
 */

const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface RateLimitEntry {
  timestamps: number[];
}

// In-memory store (note: resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if an IP address has exceeded the rate limit
 *
 * @param ip - The IP address to check
 * @returns Object with limited status and remaining attempts
 */
export function checkRateLimit(ip: string): {
  limited: boolean;
  remaining: number;
  resetAt: Date | null;
} {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Get or create entry for this IP
  let entry = rateLimitStore.get(ip);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(ip, entry);
  }

  // Filter out timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  // Check if rate limited
  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldestTimestamp = entry.timestamps[0];
    const resetAt = new Date(oldestTimestamp + WINDOW_MS);

    return {
      limited: true,
      remaining: 0,
      resetAt,
    };
  }

  // Not limited - add current timestamp
  entry.timestamps.push(now);

  return {
    limited: false,
    remaining: MAX_REQUESTS - entry.timestamps.length,
    resetAt: null,
  };
}

/**
 * Clean up old entries from the rate limit store
 * Call this periodically to prevent memory leaks
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  for (const [ip, entry] of rateLimitStore.entries()) {
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(ip);
    }
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 10 * 60 * 1000);
}

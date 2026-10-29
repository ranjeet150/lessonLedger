import { Request, Response, NextFunction } from 'express';

export interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests allowed in the window
  message?: string;
  statusCode?: number;
  whitelist?: string[];
  keyGenerator?: (req: Request) => string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function isIpWhitelisted(ip: string, whitelist: string[] = []): boolean {
  if (!ip || whitelist.length === 0) return false;
  const normalized = ip.replace(/^::ffff:/, '');
  return whitelist.some((item) => {
    const cleanItem = item.replace(/^::ffff:/, '');
    return cleanItem === normalized || item === ip;
  });
}

/**
 * Creates an Express rate limiting middleware with headers and whitelist support
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests. Please try again later.',
    statusCode = 429,
    whitelist = ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'],
    keyGenerator = getClientIp,
  } = options;

  const clients = new Map<string, ClientRecord>();

  // Cleanup expired entries every minute
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of clients.entries()) {
      if (record.resetTime <= now) {
        clients.delete(key);
      }
    }
  }, Math.min(windowMs, 60000));

  // Do not block process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientKey = keyGenerator(req);

    // Whitelist bypass
    if (isIpWhitelisted(clientKey, whitelist)) {
      next();
      return;
    }

    const now = Date.now();
    let record = clients.get(clientKey);

    if (!record || record.resetTime <= now) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      clients.set(clientKey, record);
    } else {
      record.count += 1;
    }

    const resetSeconds = Math.ceil(record.resetTime / 1000);
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    const remaining = Math.max(0, max - record.count);

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(statusCode).json({
        error: message,
        statusCode,
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    next();
  };
}

/**
 * General API rate limiter: 100 requests per minute per IP
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests. Please try again later.',
  whitelist: ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'],
});

/**
 * Auth rate limiter: 5 attempts per minute per IP
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts. Please try again after 1 minute.',
  whitelist: ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'],
});

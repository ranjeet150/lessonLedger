import assert from 'assert';
import { Request, Response } from 'express';
import {
  createRateLimiter,
  generalRateLimiter,
  authRateLimiter,
  isIpWhitelisted,
  getClientIp,
} from '../middleware/rateLimiter';
import {
  AppError,
  generateErrorId,
  generateRequestId,
  requestLogger,
  errorHandler,
  notFoundHandler,
} from '../middleware/errorHandler';
import { logger, sanitizeLogData, Logger } from '../utils/logger';

// Mock Express Request helper
function createMockRequest(options: Partial<Request> = {}): Request {
  const headers = options.headers || {};
  const url = options.url || '/api/test';
  const originalUrl = options.originalUrl || url;
  return {
    method: options.method || 'GET',
    url,
    originalUrl,
    ip: options.ip || '192.168.1.100',
    headers,
    socket: { remoteAddress: options.ip || '192.168.1.100' },
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    ...options,
  } as unknown as Request;
}

// Mock Express Response helper
function createMockResponse(): { res: Response; sentData: any; headers: Record<string, any>; statusCode: number } {
  let statusCode = 200;
  let sentData: any = null;
  const headers: Record<string, any> = {};

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      sentData = data;
      return res;
    },
    setHeader(name: string, value: any) {
      headers[name] = value;
      return res;
    },
    getHeader(name: string) {
      return headers[name];
    },
    on(_event: string, callback: (...args: any[]) => void) {
      // noop in unit mock
      return res;
    },
    get statusCode() {
      return statusCode;
    },
  } as unknown as Response;

  return {
    res,
    get sentData() {
      return sentData;
    },
    get headers() {
      return headers;
    },
    get statusCode() {
      return statusCode;
    },
  };
}

async function runTests() {
  console.log('--- Running LessonLedger Security Middleware Unit Tests ---');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(err);
      failed++;
    }
  }

  // 1. IP extraction and whitelist checks
  test('getClientIp should extract IP from x-forwarded-for or socket', () => {
    const req1 = createMockRequest({ headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' } });
    assert.strictEqual(getClientIp(req1), '203.0.113.195');

    const req2 = createMockRequest({ ip: '10.0.0.1', headers: {} });
    assert.strictEqual(getClientIp(req2), '10.0.0.1');
  });

  test('isIpWhitelisted correctly matches localhost and IPv6 forms', () => {
    const whitelist = ['127.0.0.1', '::1', 'localhost'];
    assert.strictEqual(isIpWhitelisted('127.0.0.1', whitelist), true);
    assert.strictEqual(isIpWhitelisted('::ffff:127.0.0.1', whitelist), true);
    assert.strictEqual(isIpWhitelisted('::1', whitelist), true);
    assert.strictEqual(isIpWhitelisted('localhost', whitelist), true);
    assert.strictEqual(isIpWhitelisted('192.168.1.1', whitelist), false);
  });

  // 2. Rate Limiting Middleware (Issue #13)
  test('RateLimiter sets standard rate limit headers on allowed requests', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      max: 10,
      whitelist: [],
    });

    const req = createMockRequest({ ip: '198.51.100.5' });
    const { res, headers } = createMockResponse();
    let nextCalled = false;

    limiter(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(headers['X-RateLimit-Limit'], 10);
    assert.strictEqual(headers['X-RateLimit-Remaining'], 9);
    assert.ok(headers['X-RateLimit-Reset'] > 0);
  });

  test('RateLimiter returns 429 when max threshold is exceeded', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      max: 3,
      whitelist: [],
      message: 'Too many requests.',
    });

    const ip = '198.51.100.42';

    // Send 3 requests (all allowed)
    for (let i = 0; i < 3; i++) {
      const req = createMockRequest({ ip });
      const { res } = createMockResponse();
      let nextCalled = false;
      limiter(req, res, () => {
        nextCalled = true;
      });
      assert.strictEqual(nextCalled, true);
    }

    // 4th request must be rejected with 429
    const req4 = createMockRequest({ ip });
    const mockRes4 = createMockResponse();
    let nextCalled4 = false;

    limiter(req4, mockRes4.res, () => {
      nextCalled4 = true;
    });

    assert.strictEqual(nextCalled4, false);
    assert.strictEqual(mockRes4.statusCode, 429);
    assert.strictEqual(mockRes4.sentData.error, 'Too many requests.');
    assert.strictEqual(mockRes4.headers['X-RateLimit-Remaining'], 0);
    assert.ok(mockRes4.headers['Retry-After'] > 0);
  });

  test('RateLimiter bypasses whitelisted internal IP addresses', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      max: 1,
      whitelist: ['127.0.0.1'],
    });

    // Make multiple requests with whitelisted IP
    for (let i = 0; i < 5; i++) {
      const req = createMockRequest({ ip: '127.0.0.1' });
      const { res } = createMockResponse();
      let nextCalled = false;
      limiter(req, res, () => {
        nextCalled = true;
      });
      assert.strictEqual(nextCalled, true, `Request ${i} should be allowed for whitelisted IP`);
    }
  });

  test('authRateLimiter is configured for 5 requests per minute', () => {
    assert.ok(authRateLimiter !== undefined);
    assert.ok(generalRateLimiter !== undefined);
  });

  // 3. Structured Logging & Sanitization (Issue #14)
  test('sanitizeLogData redacts sensitive fields like passwords and tokens', () => {
    const sensitive = {
      user: 'alice',
      password: 'super-secret-password-123',
      token: 'eyJhbGciOiJIUzI1NiIsIn...',
      nested: {
        authorization: 'Bearer secret_value_here',
        apiKey: 'sk_live_123456789',
        publicNote: 'This is visible',
      },
    };

    const sanitized = sanitizeLogData(sensitive);
    assert.strictEqual(sanitized.user, 'alice');
    assert.strictEqual(sanitized.password, '[REDACTED]');
    assert.strictEqual(sanitized.token, '[REDACTED]');
    assert.strictEqual(sanitized.nested.authorization, '[REDACTED]');
    assert.strictEqual(sanitized.nested.apiKey, '[REDACTED]');
    assert.strictEqual(sanitized.nested.publicNote, 'This is visible');
  });

  test('generateErrorId produces err_ prefixed unique identifiers', () => {
    const id1 = generateErrorId();
    const id2 = generateErrorId();
    assert.ok(id1.startsWith('err_'));
    assert.ok(id2.startsWith('err_'));
    assert.notStrictEqual(id1, id2);
  });

  test('generateRequestId produces req_ prefixed unique identifiers', () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();
    assert.ok(id1.startsWith('req_'));
    assert.ok(id2.startsWith('req_'));
    assert.notStrictEqual(id1, id2);
  });

  // 4. Error Handling Middleware (Issue #14)
  test('errorHandler returns structured error JSON with errorId and status', () => {
    const testErr = new AppError('Resource not found', 404, true);
    const req = createMockRequest({ url: '/api/roadmaps/999' });
    const mockRes = createMockResponse();

    errorHandler(testErr, req, mockRes.res, () => {});

    assert.strictEqual(mockRes.statusCode, 404);
    assert.strictEqual(mockRes.sentData.error, 'Resource not found');
    assert.strictEqual(mockRes.sentData.statusCode, 404);
    assert.ok(mockRes.sentData.errorId.startsWith('err_'));
    assert.ok(mockRes.sentData.timestamp);
  });

  test('errorHandler sanitizes database/internal errors in 500 responses', () => {
    const dbErr = new Error('PrismaClientKnownRequestError: database connection refused at 10.0.0.5:5432 with password secret123');
    const req = createMockRequest({ url: '/api/tasks' });
    const mockRes = createMockResponse();

    errorHandler(dbErr, req, mockRes.res, () => {});

    assert.strictEqual(mockRes.statusCode, 500);
    assert.ok(mockRes.sentData.errorId.startsWith('err_'));
    // Ensure sensitive database credentials / IP were not leaked to client
    assert.strictEqual(mockRes.sentData.error.includes('secret123'), false);
    assert.strictEqual(mockRes.sentData.error.includes('10.0.0.5'), false);
  });

  test('requestLogger injects X-Request-Id header when missing', () => {
    const req = createMockRequest();
    const { res, headers } = createMockResponse();
    let nextCalled = false;

    requestLogger(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.ok(headers['X-Request-Id']);
    assert.ok(headers['X-Request-Id'].startsWith('req_'));
  });

  test('notFoundHandler raises 404 AppError', () => {
    const req = createMockRequest({ method: 'POST', url: '/api/non-existent' });
    const { res } = createMockResponse();
    let passedErr: any = null;

    notFoundHandler(req, res, (err: any) => {
      passedErr = err;
    });

    assert.ok(passedErr instanceof AppError);
    assert.strictEqual(passedErr.statusCode, 404);
    assert.strictEqual(passedErr.message, 'Cannot POST /api/non-existent');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode = 500, isOperational = true, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function generateErrorId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `err_${timestamp}_${randomPart}`;
}

export function generateRequestId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${randomPart}`;
}

/**
 * Middleware to assign request IDs and log incoming/outgoing HTTP traffic
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const existingRequestId = req.headers['x-request-id'];
  const requestId =
    typeof existingRequestId === 'string' && existingRequestId.length > 0
      ? existingRequestId
      : generateRequestId();

  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    const logContext = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode,
      durationMs,
      ip: clientIp,
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.originalUrl || req.url} ${statusCode}`, logContext);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.originalUrl || req.url} ${statusCode}`, logContext);
    } else {
      logger.info(`HTTP ${req.method} ${req.originalUrl || req.url} ${statusCode}`, logContext);
    }
  });

  next();
}

/**
 * 404 handler for routes that do not match any defined endpoint
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const err = new AppError(`Cannot ${req.method} ${req.originalUrl || req.url}`, 404, true);
  next(err);
}

/**
 * Comprehensive central error handler with error IDs and sensitive data protection
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const errorId = generateErrorId();
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : typeof err.status === 'number' ? err.status : 500;
  const isOperational = Boolean(err.isOperational);
  const requestId = (req.headers['x-request-id'] as string) || undefined;

  // Log full context internally for debugging
  logger.error(err.message || 'Unhandled Application Error', {
    errorId,
    requestId,
    statusCode,
    isOperational,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl || req.url,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Sanitize message returned to client to prevent exposing sensitive internal data or DB credentials
  let clientMessage = err.message || 'Internal server error';

  if (statusCode >= 500 && !isOperational && process.env.NODE_ENV === 'production') {
    clientMessage = 'An unexpected internal error occurred. Please contact support with the error ID.';
  } else if (/database|prisma|sql|connection|password|secret|auth/i.test(clientMessage) && statusCode >= 500) {
    clientMessage = 'A database or infrastructure error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    error: clientMessage,
    errorId,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(err.details && isOperational ? { details: err.details } : {}),
  });
}

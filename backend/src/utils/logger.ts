export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITIES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'passwd',
  'secret',
  'token',
  'authorization',
  'cookie',
  'apikey',
  'api_key',
  'privatekey',
  'private_key',
  'stellarsecret',
  'secretkey',
]);

/**
 * Recursively sanitize sensitive keys from objects before logging
 */
export function sanitizeLogData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Redact Bearer tokens if present in strings
    if (/bearer\s+[a-zA-Z0-9_\-\.]+/i.test(data)) {
      return data.replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]');
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }

  return data;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  errorId?: string;
  durationMs?: number;
}

export class Logger {
  private minLevel: LogLevel;

  constructor(minLevel?: LogLevel) {
    this.minLevel =
      minLevel ||
      (process.env.LOG_LEVEL as LogLevel) ||
      (process.env.NODE_ENV === 'test' ? 'error' : 'info');
  }

  public setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public getLevel(): LogLevel {
    return this.minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITIES[level] >= LOG_LEVEL_PRIORITIES[this.minLevel];
  }

  private formatEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): StructuredLogEntry {
    const sanitizedContext = context ? sanitizeLogData(context) : undefined;
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(sanitizedContext ? { context: sanitizedContext } : {}),
      ...(context?.requestId ? { requestId: context.requestId } : {}),
      ...(context?.errorId ? { errorId: context.errorId } : {}),
      ...(typeof context?.durationMs === 'number' ? { durationMs: context.durationMs } : {}),
    };
  }

  private output(entry: StructuredLogEntry): void {
    const jsonStr = JSON.stringify(entry);
    switch (entry.level) {
      case 'error':
        console.error(jsonStr);
        break;
      case 'warn':
        console.warn(jsonStr);
        break;
      case 'debug':
        console.debug(jsonStr);
        break;
      case 'info':
      default:
        console.log(jsonStr);
        break;
    }
  }

  public debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.output(this.formatEntry('debug', message, context));
    }
  }

  public info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.output(this.formatEntry('info', message, context));
    }
  }

  public warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      this.output(this.formatEntry('warn', message, context));
    }
  }

  public error(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      this.output(this.formatEntry('error', message, context));
    }
  }
}

export const logger = new Logger();

/**
 * API Key Validation Middleware
 * 
 * Validates Bearer tokens, enforces rate limiting, and checks scopes.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '@openrooms/database';
import * as crypto from 'crypto';

interface APIKeyValidationResult {
  valid: boolean;
  keyId?: string;
  scopes?: string[];
  error?: string;
}

/**
 * Rate limiter using Redis
 */
class RateLimiter {
  constructor(private redis: any) {}

  async checkLimit(keyId: string, limit: number, windowSeconds: number): Promise<boolean> {
    const key = `ratelimit:${keyId}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);

    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in window
    const count = await this.redis.zcard(key);

    if (count >= limit) {
      return false; // Rate limit exceeded
    }

    // Add current request
    await this.redis.zadd(key, now, `${now}`);
    await this.redis.expire(key, windowSeconds);

    return true;
  }

  async getRemainingRequests(keyId: string, limit: number, windowSeconds: number): Promise<number> {
    const key = `ratelimit:${keyId}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);

    await this.redis.zremrangebyscore(key, 0, windowStart);
    const count = await this.redis.zcard(key);

    return Math.max(0, limit - count);
  }
}

/**
 * Validate API key from Authorization header
 */
async function validateAPIKey(apiKey: string): Promise<APIKeyValidationResult> {
  const db = getDb();

  // Hash the provided key
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Query database
  const keyRecord = await db
    .selectFrom('api_keys')
    .selectAll()
    .where('keyHash', '=', keyHash)
    .where('isActive', '=', true)
    .executeTakeFirst();

  if (!keyRecord) {
    return { valid: false, error: 'Invalid or revoked API key' };
  }

  // Check expiration
  if (keyRecord.expiresAt) {
    const expiresAt = new Date(keyRecord.expiresAt);
    if (expiresAt < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }
  }

  return {
    valid: true,
    keyId: keyRecord.id,
    scopes: keyRecord.scopes as string[],
  };
}

/**
 * Log API key usage
 */
async function logAPIKeyUsage(
  keyId: string,
  request: FastifyRequest,
  statusCode: number,
  responseTime: number
) {
  const db = getDb();

  try {
    // Log usage
    await db
      .insertInto('api_key_usage')
      .values({
        id: crypto.randomUUID(),
        apiKeyId: keyId,
        endpoint: request.url,
        method: request.method,
        statusCode,
        responseTime,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || null,
        timestamp: new Date().toISOString(),
      })
      .execute();

    // Update lastUsedAt
    await db
      .updateTable('api_keys')
      .set({ lastUsedAt: new Date().toISOString() })
      .where('id', '=', keyId)
      .execute();
  } catch (error) {
    console.error('Failed to log API key usage:', error);
  }
}

/**
 * API Key Authentication Middleware
 */
export function createAPIKeyMiddleware(redis: any) {
  const rateLimiter = new RateLimiter(redis);

  return async function apiKeyMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const startTime = Date.now();

    // Extract Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Missing Authorization header',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid Authorization header format. Expected: Bearer <api_key>',
      });
    }

    const apiKey = authHeader.substring(7);

    // Validate API key
    const validation = await validateAPIKey(apiKey);

    if (!validation.valid) {
      await logAPIKeyUsage('unknown', request, 401, Date.now() - startTime);
      return reply.code(401).send({
        error: 'Unauthorized',
        message: validation.error,
      });
    }

    // Get rate limit config
    const db = getDb();
    const keyConfig = await db
      .selectFrom('api_keys')
      .select(['rateLimit', 'rateLimitWindow'])
      .where('id', '=', validation.keyId!)
      .executeTakeFirst();

    if (!keyConfig) {
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve API key configuration',
      });
    }

    // Check rate limit
    const allowed = await rateLimiter.checkLimit(
      validation.keyId!,
      keyConfig.rateLimit,
      keyConfig.rateLimitWindow
    );

    if (!allowed) {
      await logAPIKeyUsage(validation.keyId!, request, 429, Date.now() - startTime);
      
      const remaining = await rateLimiter.getRemainingRequests(
        validation.keyId!,
        keyConfig.rateLimit,
        keyConfig.rateLimitWindow
      );

      return reply.code(429).send({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Limit: ${keyConfig.rateLimit} requests per ${keyConfig.rateLimitWindow}s`,
        retryAfter: keyConfig.rateLimitWindow,
        remaining: 0,
      });
    }

    // Add API key info to request
    (request as any).apiKey = {
      id: validation.keyId,
      scopes: validation.scopes,
    };

    // Set rate limit headers
    const remaining = await rateLimiter.getRemainingRequests(
      validation.keyId!,
      keyConfig.rateLimit,
      keyConfig.rateLimitWindow
    );

    reply.header('X-RateLimit-Limit', keyConfig.rateLimit);
    reply.header('X-RateLimit-Remaining', remaining);
    reply.header('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + keyConfig.rateLimitWindow);

    // Log successful request on response
    reply.addHook('onResponse', async (request, reply) => {
      const responseTime = Date.now() - startTime;
      await logAPIKeyUsage(validation.keyId!, request, reply.statusCode, responseTime);
    });
  };
}

/**
 * Scope validation decorator
 */
export function requireScope(requiredScope: string) {
  return async function scopeValidator(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = (request as any).apiKey;

    if (!apiKey || !apiKey.scopes) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'No API key scopes available',
      });
    }

    if (!apiKey.scopes.includes(requiredScope) && !apiKey.scopes.includes('admin')) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: `This action requires '${requiredScope}' scope`,
        yourScopes: apiKey.scopes,
      });
    }
  };
}

# API Authentication

## Overview

OpenRooms implements API key-based authentication with SHA-256 hashing, rate limiting, and audit logging for programmatic access control.

## API Key System

### Key Generation

API keys follow the format: `sk_<64-char-hex>`

```http
POST /api/api-keys
Content-Type: application/json

{
  "name": "Production API Key",
  "scopes": ["agents:read", "agents:execute"],
  "rateLimit": 100
}

Response:
{
  "id": "uuid",
  "key": "sk_abc123...",  // Only shown once
  "name": "Production API Key",
  "prefix": "sk_abc123",
  "scopes": ["agents:read", "agents:execute"],
  "rateLimit": 100,
  "createdAt": "2026-03-05T22:00:00Z"
}
```

**Security**: Full key returned only on creation. Subsequent responses show prefix only.

### Key Storage

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,  -- SHA-256 hash
  key_prefix VARCHAR(20),
  scopes TEXT[],
  rate_limit INTEGER DEFAULT 100,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
```

Keys stored as SHA-256 hashes, never plaintext.

## Authentication Flow

### Request Format

```http
GET /api/agents
Authorization: Bearer sk_abc123...
```

### Validation Process

1. **Extract Bearer token** from Authorization header
2. **Hash token** using SHA-256
3. **Database lookup** by hash
4. **Check expiration** if set
5. **Validate scope** for endpoint
6. **Enforce rate limit** via Redis
7. **Log usage** timestamp
8. **Add key info** to request context

### Middleware Implementation

```typescript
export function createAPIKeyMiddleware(redis: Redis) {
  const rateLimiter = new RateLimiter(redis);
  
  return async function apiKeyMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    // Extract token
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid Authorization header' });
    }
    
    const apiKey = authHeader.substring(7);
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Lookup key
    const keyRecord = await db
      .selectFrom('api_keys')
      .selectAll()
      .where('key_hash', '=', keyHash)
      .executeTakeFirst();
    
    if (!keyRecord) {
      return reply.code(401).send({ error: 'Invalid API key' });
    }
    
    // Check expiration
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      return reply.code(401).send({ error: 'API key expired' });
    }
    
    // Rate limiting
    const allowed = await rateLimiter.checkLimit(
      keyRecord.id,
      keyRecord.rate_limit
    );
    
    if (!allowed) {
      return reply.code(429).send({ error: 'Rate limit exceeded' });
    }
    
    // Update usage
    await db
      .updateTable('api_keys')
      .set({ last_used_at: new Date() })
      .where('id', '=', keyRecord.id)
      .execute();
    
    // Set headers
    reply.header('X-RateLimit-Limit', keyRecord.rate_limit.toString());
    reply.header('X-RateLimit-Remaining', remaining.toString());
    
    // Add to request
    (request as any).apiKey = keyRecord;
  };
}
```

## Rate Limiting

### Implementation

Redis-backed sliding window rate limiter.

```typescript
class RateLimiter {
  constructor(private redis: Redis) {}
  
  async checkLimit(keyId: string, limit: number): Promise<boolean> {
    const key = `ratelimit:${keyId}`;
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);
    
    // Count requests
    const count = await this.redis.zcard(key);
    
    if (count >= limit) {
      return false;
    }
    
    // Add request
    await this.redis.zadd(key, now, `${now}-${Math.random()}`);
    await this.redis.expire(key, 60);
    
    return true;
  }
}
```

### Response Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1234567890
```

On limit exceeded:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

## Scope-Based Authorization

### Scope Definition

```typescript
type Scope =
  | 'agents:read'
  | 'agents:write'
  | 'agents:execute'
  | 'rooms:read'
  | 'rooms:write'
  | 'workflows:read'
  | 'workflows:write'
  | 'admin:all';
```

### Route Protection

```typescript
fastify.get(
  '/api/agents',
  {
    preHandler: [
      fastify.apiKeyAuth,
      requireScope('agents:read')
    ]
  },
  async (request, reply) => {
    // Handler
  }
);

fastify.post(
  '/api/agents/:id/execute',
  {
    preHandler: [
      fastify.apiKeyAuth,
      requireScope('agents:execute')
    ]
  },
  async (request, reply) => {
    // Handler
  }
);
```

### Validation Function

```typescript
export function requireScope(requiredScope: string) {
  return async function(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = (request as any).apiKey;
    
    if (!apiKey) {
      return reply.code(401).send({ error: 'Authentication required' });
    }
    
    const hasScope = apiKey.scopes.includes(requiredScope) 
      || apiKey.scopes.includes('admin:all');
    
    if (!hasScope) {
      return reply.code(403).send({
        error: 'Insufficient permissions',
        required: requiredScope
      });
    }
  };
}
```

## Key Management

### List Keys

```http
GET /api/api-keys

Response:
{
  "keys": [
    {
      "id": "uuid",
      "name": "Production Key",
      "prefix": "sk_abc123",
      "scopes": ["agents:read"],
      "rateLimit": 100,
      "lastUsedAt": "2026-03-05T22:00:00Z",
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ]
}
```

### Revoke Key

```http
DELETE /api/api-keys/:id

Response: 204 No Content
```

### Update Key

```http
PATCH /api/api-keys/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "scopes": ["agents:read", "agents:execute"],
  "rateLimit": 200
}
```

## Audit Logging

### Usage Tracking

```sql
CREATE TABLE api_key_usage (
  id UUID PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  endpoint VARCHAR(255),
  method VARCHAR(10),
  status_code INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_key_usage_key ON api_key_usage(api_key_id);
CREATE INDEX idx_api_key_usage_time ON api_key_usage(created_at);
```

### Usage Statistics

```http
GET /api/api-keys/:id/usage?days=7

Response:
{
  "totalRequests": 1234,
  "successfulRequests": 1200,
  "failedRequests": 34,
  "avgRequestsPerDay": 176,
  "topEndpoints": [
    { "endpoint": "/api/agents", "count": 500 },
    { "endpoint": "/api/agents/:id/execute", "count": 400 }
  ]
}
```

## Security Best Practices

### Key Rotation

```bash
# Generate new key
curl -X POST http://localhost:3001/api/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "Rotated Key", "scopes": ["agents:read"]}'

# Update application
export API_KEY="sk_newkey..."

# Revoke old key
curl -X DELETE http://localhost:3001/api/api-keys/{old_key_id}
```

### Expiration

```http
POST /api/api-keys
Content-Type: application/json

{
  "name": "Temporary Key",
  "scopes": ["agents:read"],
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

### IP Allowlisting

(Future enhancement - not currently implemented)

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Invalid API key",
  "statusCode": 401
}
```

### 403 Forbidden

```json
{
  "error": "Insufficient permissions",
  "required": "agents:execute",
  "statusCode": 403
}
```

### 429 Rate Limit Exceeded

```json
{
  "error": "Rate limit exceeded",
  "limit": 100,
  "retryAfter": 60,
  "statusCode": 429
}
```

## Configuration

### Environment Variables

```bash
# Redis for rate limiting
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Database for key storage
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### Default Limits

```typescript
const DEFAULT_RATE_LIMIT = 100; // requests per minute
const DEFAULT_KEY_EXPIRATION = null; // never expires
const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms
```

## Testing

### Create Test Key

```bash
curl -X POST http://localhost:3001/api/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "scopes": ["agents:read", "agents:execute"],
    "rateLimit": 10
  }'
```

### Test Authentication

```bash
curl http://localhost:3001/api/agents \
  -H "Authorization: Bearer sk_abc123..."
```

### Test Rate Limiting

```bash
for i in {1..15}; do
  curl http://localhost:3001/api/agents \
    -H "Authorization: Bearer sk_abc123..."
  sleep 0.1
done
```

Expected: First 10 succeed (200), remaining fail (429).

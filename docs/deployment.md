# Production Deployment

## Infrastructure Requirements

### Compute
- **API Servers**: 2+ instances (1GB RAM, 1 vCPU minimum)
- **Workers**: 2+ instances (2GB RAM, 2 vCPU minimum)
- **Dashboard**: 1+ instance (512MB RAM, 1 vCPU minimum)

### Database
- **Postgres**: 11+ (managed service recommended)
  - 2GB RAM minimum
  - SSD storage
  - Automated backups
  - Read replicas for scaling

### Cache & Queue
- **Redis**: 6+ (managed service recommended)
  - 1GB RAM minimum
  - Persistence enabled
  - Redis Cluster for HA

## Environment Configuration

### Production `.env`

```bash
# Node
NODE_ENV=production

# API
API_PORT=3001
API_HOST=0.0.0.0
API_CORS_ORIGIN=https://dashboard.example.com

# Database
DATABASE_URL=postgresql://user:pass@db.example.com:5432/openrooms
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://redis.example.com:6379
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=1000

# Queue
BULLMQ_CONCURRENCY=10
BULLMQ_MAX_JOBS_PER_WORKER=50

# LLM
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info

# Security
API_KEY_SALT=random-string
CORS_CREDENTIALS=true
```

## Docker Deployment

### Build Production Images

```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Or build individually
docker build -t openrooms/api -f apps/api/Dockerfile .
docker build -t openrooms/dashboard -f apps/dashboard/Dockerfile .
docker build -t openrooms/worker -f packages/worker/Dockerfile .
```

### Deploy with Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    image: openrooms/api:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  worker:
    image: openrooms/worker:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure

  dashboard:
    image: openrooms/dashboard:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.example.com
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
```

```bash
# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale worker=5
```

## Kubernetes Deployment

### API Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: openrooms-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: openrooms-api
  template:
    metadata:
      labels:
        app: openrooms-api
    spec:
      containers:
      - name: api
        image: openrooms/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: openrooms-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: openrooms-secrets
              key: redis-url
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service

```yaml
# k8s/api-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: openrooms-api
spec:
  selector:
    app: openrooms-api
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

```bash
# Deploy
kubectl apply -f k8s/

# Scale
kubectl scale deployment openrooms-api --replicas=5
```

## Database Migrations

### Production Migration Strategy

```bash
# 1. Backup database
pg_dump -h db.example.com -U user openrooms > backup.sql

# 2. Apply migrations
pnpm db:migrate

# 3. Verify
psql -h db.example.com -U user openrooms -c "SELECT * FROM migrations;"
```

### Zero-Downtime Migrations

1. Add new columns as nullable
2. Deploy code that writes to both old and new columns
3. Backfill data
4. Deploy code that reads from new columns
5. Remove old columns

## Monitoring

### Health Checks

```bash
# API health
curl https://api.example.com/health

# Response
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": 123456
}
```

### Metrics

Add Prometheus metrics:

```typescript
import { register, Counter, Histogram } from 'prom-client';

// Request counter
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Request duration
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route']
});

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Logging

Use structured JSON logging:

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: false }
  }
});

logger.info({ roomId, workflowId }, 'Room execution started');
```

### Error Tracking

Add Sentry:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

## Security

### API Authentication

```typescript
// Add API key middleware
app.addHook('onRequest', async (request, reply) => {
  const apiKey = request.headers['x-api-key'];
  if (!apiKey || !await validateApiKey(apiKey)) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});
```

### Rate Limiting

```typescript
import rateLimit from '@fastify/rate-limit';

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});
```

### CORS

```typescript
import cors from '@fastify/cors';

app.register(cors, {
  origin: process.env.API_CORS_ORIGIN,
  credentials: true
});
```

## Scaling

### Horizontal Scaling

- Load balance API servers (NGINX, ALB)
- Scale workers independently
- Use Redis Cluster for distributed state

### Database Scaling

- Read replicas for query load
- Connection pooling (PgBouncer)
- Partitioning for large tables

### Queue Scaling

- Separate queues by priority
- Dedicated workers per queue type
- Auto-scaling based on queue depth

## Backup & Recovery

### Automated Backups

```bash
# Daily Postgres backup
0 2 * * * pg_dump -h db.example.com -U user openrooms | gzip > /backups/openrooms-$(date +\%Y\%m\%d).sql.gz

# Retention: 30 days
find /backups -name "openrooms-*.sql.gz" -mtime +30 -delete
```

### Recovery

```bash
# Restore from backup
gunzip < backup.sql.gz | psql -h db.example.com -U user openrooms
```

## Cost Optimization

- Use spot instances for workers
- Scale down during low traffic
- Cache workflow definitions
- Optimize database queries
- Use CDN for dashboard assets

## Performance Tuning

- Connection pooling: 10-20 connections per instance
- Worker concurrency: 5-10 jobs per worker
- Redis maxmemory-policy: allkeys-lru
- Postgres shared_buffers: 25% of RAM
- Enable query caching

# 🚀 Local Development Setup Guide

This guide will help you get OpenRooms running on your local machine.

## Prerequisites Checklist

- ✅ Docker Desktop installed and running
- ✅ Node.js >= 18 (you have v20.18.3)
- ✅ pnpm >= 8 (you have v8.15.0)
- ✅ Dependencies installed (already done)

## Step-by-Step Setup

### 1. Start Docker Desktop

**Important**: Make sure Docker Desktop is running before proceeding.

You can verify Docker is running with:
```bash
docker ps
```

### 2. Start Infrastructure Services

Start PostgreSQL and Redis:
```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on `localhost:5432`
- **Redis** on `localhost:6379`

Wait a few seconds for services to be healthy:
```bash
docker-compose ps
```

### 3. Set Up Database Schema

Run the database setup script:
```bash
./scripts/setup-db.sh
```

Or manually:
```bash
docker exec -i $(docker ps -q -f name=postgres) psql -U postgres -d openrooms < packages/database/schema.sql
```

### 4. Verify Environment Files

Check that environment files exist:
- `apps/api/.env` - API configuration
- `apps/dashboard/.env.local` - Dashboard configuration

Expected `.env` content:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/openrooms"
REDIS_URL="redis://localhost:6379"
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
```

Expected `.env.local` content:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Start Development Servers

Start all services in development mode:
```bash
pnpm dev
```

This starts:
- **API Server**: http://localhost:3001
- **Dashboard**: http://localhost:3000
- **Background Workers**: Running in API process

### 6. Test the API

In a new terminal, test the health endpoint:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-01T...",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### 7. Open Dashboard

Visit http://localhost:3000 in your browser.

## Verification Commands

### Check Docker Containers
```bash
docker-compose ps
```

Should show:
- `rooms-postgres-1` - Up and healthy
- `rooms-redis-1` - Up and healthy

### Check Database Connection
```bash
docker exec -it $(docker ps -q -f name=postgres) psql -U postgres -d openrooms -c "SELECT tablename FROM pg_tables WHERE schemaname='public';"
```

### Check Redis Connection
```bash
docker exec -it $(docker ps -q -f name=redis) redis-cli ping
```

Should return: `PONG`

### View Logs
```bash
# All services
docker-compose logs -f

# PostgreSQL only
docker-compose logs -f postgres

# Redis only
docker-compose logs -f redis
```

## Troubleshooting

### Docker won't start containers

**Problem**: "Cannot connect to the Docker daemon"
**Solution**: Start Docker Desktop application

### "role postgres does not exist" error

**Problem**: API returns `{"error":"Failed to fetch rooms","message":"role \"postgres\" does not exist"}`
**Solution**: You have a local PostgreSQL running that's conflicting with Docker

```bash
# Find the local PostgreSQL process
lsof -i :5432

# Unload the Homebrew PostgreSQL service
launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.postgresql@14.plist

# Or manually kill the process
kill -9 <PID>

# Verify only Docker PostgreSQL is running
lsof -i :5432
# Should only show com.docker process
```

This is the most common issue when starting OpenRooms!

### Port conflicts

**Problem**: "Port 5432 already in use"
**Solution**: 
```bash
# Find and kill process using port
lsof -ti:5432 | xargs kill -9

# Or change port in docker-compose.yml
```

### Database connection fails

**Problem**: "Connection refused to localhost:5432"
**Solution**: 
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Redis connection fails

**Problem**: "Connection refused to localhost:6379"
**Solution**:
```bash
# Restart Redis
docker-compose restart redis
```

### Clean restart

If things are broken, clean restart:
```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d
./scripts/setup-db.sh
```

## Next Steps

Once everything is running:

1. **Create a workflow**: See `examples/create-workflow.ts`
2. **Test the API**: See `API.md` for endpoints
3. **Explore Dashboard**: Visit http://localhost:3000

## Quick Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Setup database
./scripts/setup-db.sh

# Start dev servers
pnpm dev

# Run tests (if available)
pnpm test

# Build for production
pnpm build
```

## Environment URLs

- **API**: http://localhost:3001
- **Dashboard**: http://localhost:3000
- **PostgreSQL**: postgresql://postgres:postgres@localhost:5432/openrooms
- **Redis**: redis://localhost:6379

## Default Credentials

- **PostgreSQL**:
  - User: `postgres`
  - Password: `postgres`
  - Database: `openrooms`

- **Redis**: No authentication (local development only)

---

**Ready to build!** 🎉

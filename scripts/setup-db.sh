#!/bin/bash

# Database Setup Script for OpenRooms

set -e

echo "🗄️  Setting up OpenRooms database..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
timeout=30
counter=0

until docker exec $(docker ps -q -f name=postgres) pg_isready -U postgres > /dev/null 2>&1; do
  counter=$((counter + 1))
  if [ $counter -gt $timeout ]; then
    echo "❌ PostgreSQL failed to start within ${timeout} seconds"
    exit 1
  fi
  echo "  Waiting... ($counter/$timeout)"
  sleep 1
done

echo "✅ PostgreSQL is ready!"

# Run schema
echo "Creating database schema..."
docker exec -i $(docker ps -q -f name=postgres) psql -U postgres -d openrooms < packages/database/schema.sql

echo "✅ Database schema created!"
echo ""
echo "Database is ready at: postgresql://postgres:postgres@localhost:5432/openrooms"

#!/bin/bash

# OpenRooms Setup Script

set -e

echo "🚀 Setting up OpenRooms..."

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ Prerequisites OK"

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Setup environment files
echo "Setting up environment files..."

if [ ! -f apps/api/.env ]; then
    cp apps/api/.env.example apps/api/.env
    echo "✅ Created apps/api/.env (please configure)"
fi

if [ ! -f apps/dashboard/.env.local ]; then
    cp apps/dashboard/.env.local.example apps/dashboard/.env.local
    echo "✅ Created apps/dashboard/.env.local"
fi

# Check Docker
if command -v docker &> /dev/null; then
    echo "Starting dependencies with Docker..."
    docker-compose up -d
    echo "⏳ Waiting for services to be ready..."
    sleep 5
else
    echo "⚠️  Docker not found. Please start PostgreSQL and Redis manually."
    echo "   PostgreSQL: localhost:5432 (database: openrooms)"
    echo "   Redis: localhost:6379"
fi

# Setup database
echo "Setting up database..."
pnpm db:generate
pnpm db:push

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  pnpm dev"
echo ""
echo "API will be available at: http://localhost:3001"
echo "Dashboard will be available at: http://localhost:3000"
echo ""

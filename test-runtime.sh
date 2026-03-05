#!/bin/bash
# Run ROOMS Critical Runtime Tests
# Non-negotiable guarantees: Idempotency, FSM, Crash Recovery

set -e

echo "🚀 ROOMS Critical Runtime Tests"
echo "================================"
echo ""

# Check if test DB is running
if ! docker ps | grep -q rooms-test-db; then
  echo "⚠️  Test database not running. Starting..."
  docker-compose -f docker-compose.test.yml up -d
  
  echo "⏳ Waiting for database to be ready..."
  sleep 3
  until docker exec rooms-test-db pg_isready -U rooms_test > /dev/null 2>&1; do
    sleep 1
  done
  echo "✅ Test database ready!"
  echo ""
fi

# Run the critical tests
echo "🧪 Running critical runtime tests..."
echo ""

cd apps/api
export DATABASE_URL=postgresql://rooms_test:rooms_test_pass@localhost:5433/rooms_test

pnpm test runtime-guarantees

echo ""
echo "================================"
echo "✅ All critical runtime tests complete!"
echo ""
echo "Tests validated:"
echo "  [A] Duplicate execution prevention (idempotency)"
echo "  [B] FSM transition enforcement"
echo "  [C] Crash recovery without duplication"

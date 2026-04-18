#!/bin/sh
set -e

echo "=== BPMS Backend Startup ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-10000}"
echo "DATABASE_URL set: $(test -n "$DATABASE_URL" && echo 'yes' || echo 'no')"
echo "Working directory: $(pwd)"
echo "Contents of dist/: $(ls dist/ 2>/dev/null | head -5)"
echo "Prisma schema: $(ls prisma/schema.prisma 2>/dev/null && echo 'found' || echo 'NOT FOUND')"

echo ""
echo "=== Running prisma db push ==="
npx prisma db push --accept-data-loss 2>&1 || echo "WARNING: prisma db push failed, continuing anyway..."

echo ""
echo "=== Starting Node.js server ==="
exec node dist/index.js

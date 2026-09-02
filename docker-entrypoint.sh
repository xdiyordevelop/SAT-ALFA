#!/bin/sh
set -e

echo "Waiting for database..."
until npx prisma db execute --stdin <<< "SELECT 1" 2>/dev/null; do
  sleep 2
  echo "Still waiting for database..."
done

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting Next.js app..."
exec node server.js

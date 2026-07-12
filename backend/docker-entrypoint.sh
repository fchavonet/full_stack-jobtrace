#!/bin/sh

set -e

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Starting JobTrace backend..."
exec npm run start

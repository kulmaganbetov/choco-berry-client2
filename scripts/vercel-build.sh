#!/usr/bin/env bash
# Build script for Vercel (and local) deploys.
#
# Why this exists:
# - Prisma Postgres uses an Accelerate (prisma+postgres://) connection, so we
#   generate the client with --no-engine: queries go over HTTP and no native
#   query-engine binary needs to be bundled into the serverless function. This
#   avoids the classic "query engine not found" runtime 500 on Vercel/Nitro.
# - When DATABASE_URL is present we run `prisma db push` so the Catalog table is
#   created/updated automatically on every deploy — no manual migration step.
set -euo pipefail

# prisma generate validates that env("DATABASE_URL") resolves, even with
# --no-engine. Fall back to a placeholder so the client can still be generated
# in environments where the var is not configured (the app then serves defaults).
DATABASE_URL="${DATABASE_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder}" \
  npx prisma generate --no-engine

if [ -n "${DATABASE_URL:-}" ]; then
  echo "[vercel-build] DATABASE_URL set — syncing schema to database..."
  npx prisma db push --skip-generate || echo "[vercel-build] WARN: prisma db push failed; continuing (app falls back to defaults)"
else
  echo "[vercel-build] DATABASE_URL not set — skipping prisma db push"
fi

npx vite build

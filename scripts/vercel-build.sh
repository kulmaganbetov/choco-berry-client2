#!/usr/bin/env bash
# Build script for Vercel (and local) deploys.
#
# Why this exists:
# - We generate the Prisma client with its default binary query engine. Nitro
#   traces the engine (libquery_engine-*.so.node) into the serverless function,
#   so a direct `postgres://` connection (what the Vercel Prisma integration
#   injects as DATABASE_URL) works out of the box. An Accelerate
#   `prisma+postgres://` URL is also supported at runtime (see src/lib/prisma.ts).
# - When DATABASE_URL is present we run `prisma db push` so the Catalog table is
#   created/updated automatically on every deploy — no manual migration step.
set -euo pipefail

# prisma generate validates that env("DATABASE_URL") resolves. Fall back to a
# placeholder so the client can still be generated in environments where the var
# is not configured (the app then serves defaults via the resilient read path).
DATABASE_URL="${DATABASE_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder}" \
  npx prisma generate

if [ -n "${DATABASE_URL:-}" ]; then
  echo "[vercel-build] DATABASE_URL set — syncing schema to database..."
  npx prisma db push --skip-generate || echo "[vercel-build] WARN: prisma db push failed; continuing (app falls back to defaults)"
else
  echo "[vercel-build] DATABASE_URL not set — skipping prisma db push"
fi

npx vite build

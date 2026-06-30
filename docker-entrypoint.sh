#!/usr/bin/env bash
# Startup sequence for the single deployable image.
#
# Photos Parallèles used to run migrations + seed in a separate one-shot `migrate`
# service before the app. Platforms that deploy a single image per project (e.g.
# Registring) have no such pre-step, so the app image performs it itself at boot,
# then hands off to the Next.js server. Both steps are idempotent:
#   - `migrate deploy` only applies pending migrations (no-op when up to date);
#   - the seed upserts, so re-running on every (re)start is safe.
set -euo pipefail

echo "[entrypoint] prisma migrate deploy…"
node_modules/.bin/prisma migrate deploy

# Run the seed directly via tsx (the same command prisma.config.ts declares). Calling
# the binary by path avoids relying on node_modules/.bin being on PATH, which is what
# `prisma db seed` assumes when it spawns a bare `tsx`.
echo "[entrypoint] seeding (tsx prisma/seed.ts)…"
node_modules/.bin/tsx prisma/seed.ts

echo "[entrypoint] starting app…"
exec "$@"

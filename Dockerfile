# syntax=docker/dockerfile:1
# Photos Parallèles — production image (Next.js 15 standalone, Prisma 7).
#
# Debian (bookworm) base — NOT alpine — so the glibc prebuilt binaries for
# @node-rs/argon2 (seed) and sharp (next/image) load cleanly. Prisma 7 uses a
# WASM query compiler (bundled in @prisma/client), so there is no native rust
# query-engine binary to ship.

ARG NODE_IMAGE=node:22-bookworm-slim
ARG PNPM_VERSION=10.19.0

# ─── deps : full dependency install (incl. dev, for build + migrate/seed) ────
FROM ${NODE_IMAGE} AS deps
ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app
# Prisma 7 resolves env("DATABASE_URL") in prisma.config.ts eagerly — even for
# `generate` — so a placeholder must exist at build time. The real URL is
# injected at runtime by compose (env overrides this ENV). No DB connection is
# made during the build.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
# prisma.config.ts + prisma/ are needed because `postinstall` runs
# `prisma generate`. Native deps (argon2, sharp) come from prebuilt optional
# packages; prisma's schema engine and esbuild (tsx) are built via the
# pnpm `onlyBuiltDependencies` allowlist in package.json.
COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma ./prisma
RUN pnpm config set fetch-retries 5 \
 && pnpm install --frozen-lockfile

# ─── builder : prisma generate + next build (standalone) ─────────────────────
FROM ${NODE_IMAGE} AS builder
ARG PNPM_VERSION
# openssl/ca-certificates: required by Prisma's schema engine (migrate deploy,
# run from this stage by the one-shot `migrate` service) and for HTTPS fetches.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder for prisma.config.ts at generate/build time (see deps stage).
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

# NEXT_PUBLIC_* are inlined by Next at build time and must be present here.
ARG NEXT_PUBLIC_APP_URL=
ARG NEXT_PUBLIC_UMAMI_SRC=
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID=
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_UMAMI_SRC=$NEXT_PUBLIC_UMAMI_SRC
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=$NEXT_PUBLIC_UMAMI_WEBSITE_ID

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm exec next build

# `builder` holds the full toolchain (prisma CLI, tsx, @node-rs/argon2, app source)
# reused by the runner to migrate + seed at startup.

# ─── runner : final image (standalone server + startup migrate/seed) ─────────
FROM ${NODE_IMAGE} AS runner
# No curl/wget in the runtime image: keeps the attack surface minimal so a
# compromised process can't pull a second-stage payload. Healthcheck uses Node.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --gid 1001 nodejs \
 && useradd --uid 1001 --gid nodejs --create-home --shell /bin/bash nextjs

# Standalone server: traced node_modules + server.js are bundled by Next, which
# also picks up @prisma/client (WASM compiler) and sharp.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Startup migrate + seed (single-image deploy: no separate `migrate` service). The
# seed runs through tsx and imports app source (lib/*), and pnpm's node_modules
# layout makes cherry-picking the prisma CLI unsafe — so bring the builder's full
# node_modules and the sources the seed needs. This overrides the standalone's
# pruned node_modules with the complete one (server.js runs fine against it).
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Uploads volume (future back-office image pipeline).
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads
VOLUME ["/app/uploads"]

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]

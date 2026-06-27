import { defineConfig, env } from "prisma/config";

// Prisma 7 reads connection URLs from here (not schema.prisma). The CLI does not
// auto-load .env, so do it explicitly for migrate/seed/studio commands.
try {
  process.loadEnvFile();
} catch {
  // No .env file present (e.g. CI with real env vars) — fall back to process.env.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});

#!/usr/bin/env bash
# Photos Parallèles — backup of the app database + uploaded images.
#
# Usage:    ./scripts/backup.sh [destination_dir]
# Cron (nightly, configure on the server):
#   0 3 * * * cd /path/to/photos-paralleles && ./scripts/backup.sh >> /var/log/pp-backup.log 2>&1
#
# Restore DB:
#   gunzip -c backup/pp-db-YYYYMMDD-HHMMSS.sql.gz | \
#     docker compose -f docker-compose.prod.yml exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
# Restore uploads:
#   docker run --rm -v photos-paralleles_uploads:/data -v "$PWD/backup":/b alpine \
#     sh -c "tar xzf /b/pp-uploads-YYYYMMDD-HHMMSS.tar.gz -C /data"

set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
DEST="${1:-./backup}"
STAMP="$(date +%Y%m%d-%H%M%S)"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# Load DB credentials from .env.production if present (POSTGRES_USER/DB).
ENV_FILE="${ENV_FILE:-.env.production}"
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a; . "$ENV_FILE"; set +a
fi
DB_USER="${POSTGRES_USER:-photos}"
DB_NAME="${POSTGRES_DB:-photos_paralleles}"

# Volume name follows the compose project name (`photos-paralleles`).
PROJECT="${COMPOSE_PROJECT_NAME:-photos-paralleles}"
VOLUME="${PROJECT}_uploads"

mkdir -p "$DEST"
echo "[backup] $STAMP — start"

# 1. Database
docker compose -f "$COMPOSE_FILE" exec -T db \
  pg_dump -U "$DB_USER" -d "$DB_NAME" \
  | gzip > "$DEST/pp-db-$STAMP.sql.gz"
echo "[backup] database  → $DEST/pp-db-$STAMP.sql.gz"

# 2. Uploaded images volume
docker run --rm \
  -v "${VOLUME}:/data:ro" \
  -v "$(realpath "$DEST"):/backup" \
  alpine sh -c "tar czf /backup/pp-uploads-$STAMP.tar.gz -C /data ."
echo "[backup] uploads   → $DEST/pp-uploads-$STAMP.tar.gz"

# 3. Rotation
find "$DEST" -name 'pp-*' -type f -mtime "+$RETENTION_DAYS" -delete
echo "[backup] rotation  : older than ${RETENTION_DAYS}d removed"
echo "[backup] done"

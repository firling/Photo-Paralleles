# Déploiement — Photos Parallèles

Runbook de mise en production. Stack Docker : Next.js 15 (standalone) + Postgres
16 + Prisma 7, derrière **Traefik** (TLS Let's Encrypt), avec **Umami** pour
l'analytics sans cookie.

> Le paramétrage **Stripe / paiement** fait l'objet d'un document séparé (livré
> ultérieurement). Ce runbook couvre l'infrastructure et l'analytics.

## 1. Prérequis serveur

- Docker Engine + Compose v2.
- Un **Traefik** déjà en service, exposant les entrypoints `web`/`websecure` et
  un certresolver Let's Encrypt (par défaut `letsencrypt`).
- Le réseau Docker externe partagé avec Traefik :
  ```bash
  docker network create traefik-net   # une seule fois (ignore si déjà créé)
  ```
- DNS : `photosparalleles.fr` **et** `analytics.photosparalleles.fr` pointant
  vers le serveur.

## 2. Configurer l'environnement

```bash
cp .env.production.example .env.production
# puis éditer .env.production : domaines + tous les secrets
#   openssl rand -base64 48   # pour JWT_SECRET, UMAMI_APP_SECRET, mots de passe
```
Champs critiques : `ROOT_DOMAIN`, `NEXT_PUBLIC_APP_URL`, `POSTGRES_*` +
`DATABASE_URL` cohérents (hôte = `db`), `JWT_SECRET`, `ADMIN_EMAIL` /
`ADMIN_PASSWORD`, `UMAMI_DB_PASSWORD`, `UMAMI_APP_SECRET`.

`.env.production` est gitignoré — ne jamais le committer.

## 3. Démarrer la stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Ordre d'exécution (géré par `depends_on`) :
1. `db` démarre, attend le healthcheck `pg_isready`.
2. `migrate` (one-shot, cible `builder`) lance
   `prisma migrate deploy && pnpm db:seed`, puis se termine. Le seed crée les
   8 livres + 8 artistes, les `SiteSetting`, et le compte admin (argon2).
3. `app` démarre seulement après que `migrate` s'est terminé avec succès.
4. `umami-db` puis `umami` démarrent en parallèle (Umami initialise son schéma
   au premier lancement, ~30–60 s).

Vérifier le seed :
```bash
docker compose -f docker-compose.prod.yml logs migrate   # → "Seed complete: Books: 8 ..."
docker compose -f docker-compose.prod.yml ps
```

## 4. Activer l'analytics Umami

1. Ouvrir `https://analytics.<ROOT_DOMAIN>`. Identifiants par défaut
   `admin` / `umami` → **changer le mot de passe immédiatement** (Settings →
   Profile), puis reporter le nouveau dans `UMAMI_PASSWORD`.
2. **Settings → Websites → Add website** : nom + domaine `<ROOT_DOMAIN>`.
   Copier le **Website ID** (UUID).
3. Renseigner dans `.env.production` :
   ```ini
   NEXT_PUBLIC_UMAMI_SRC="https://analytics.<ROOT_DOMAIN>/script.js"
   NEXT_PUBLIC_UMAMI_WEBSITE_ID="<le-UUID>"
   UMAMI_WEBSITE_ID="<le-UUID>"      # pour le lecteur de stats du back-office
   ```
   Ces variables `NEXT_PUBLIC_*` sont **inlinées au build** → reconstruire :
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build app
   ```
   Le `<Script>` Umami n'apparaît dans le `<head>` que si les deux variables
   sont définies (sinon rien n'est injecté).

## 5. Sauvegardes

```bash
./scripts/backup.sh                 # dump DB (.sql.gz) + tar du volume uploads
RETENTION_DAYS=30 ./scripts/backup.sh /srv/backups/pp
```
Cron nocturne suggéré :
```cron
0 3 * * * cd /path/to/photos-paralleles && ./scripts/backup.sh >> /var/log/pp-backup.log 2>&1
```
Procédures de restauration : en tête de `scripts/backup.sh`.

## 6. Test LOCAL sans Traefik

Le `compose` committé garde la config Traefik, mais le service `app` publie un
port hôte (`APP_HOST_PORT`), donc on peut tester sans Traefik. Méthode utilisée
pour la validation :

```bash
# 1. Le réseau externe doit exister (Traefik n'a pas besoin de tourner) :
docker network create traefik-net 2>/dev/null || true

# 2. Un env de test (ROOT_DOMAIN=localhost, port 3200) :
cat > .env.test <<'EOF'
ROOT_DOMAIN=localhost
NEXT_PUBLIC_APP_URL=http://localhost:3200
APP_HOST_PORT=3200
POSTGRES_DB=photos_paralleles
POSTGRES_USER=photos
POSTGRES_PASSWORD=testpass
DATABASE_URL=postgresql://photos:testpass@db:5432/photos_paralleles
JWT_SECRET=test-secret-at-least-32-characters-long-xx
ADMIN_EMAIL=admin@photosparalleles.fr
ADMIN_PASSWORD=test-admin-pass
UMAMI_DB_PASSWORD=umamipass
UMAMI_APP_SECRET=umami-test-secret-long-enough-xxxxxxxx
EOF

# 3. Projet de test ISOLÉ (-p) pour ne pas toucher la prod ni `pp-dev-db` :
docker compose -p pp-test -f docker-compose.prod.yml --env-file .env.test up -d --build

# 4. Vérifier :
docker compose -p pp-test -f docker-compose.prod.yml logs migrate   # seed counts
curl -i http://localhost:3200/          # 200
curl -s http://localhost:3200/livres    # 8 livres rendus depuis la DB

# 5. Démontage (volumes du SEUL projet de test) :
docker compose -p pp-test -f docker-compose.prod.yml down -v
rm -f .env.test
```

> Le dev Postgres `pp-dev-db` (port hôte 5433) est un projet distinct et n'est
> jamais touché : la stack a son propre service `db`, ses propres volumes et un
> nom de projet dédié.

## 7. Exploitation

```bash
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml restart app
docker compose -f docker-compose.prod.yml down            # stop (garde les volumes)
```
Mise à jour du code : `git pull` puis `up -d --build` (re-run `migrate` applique
les nouvelles migrations automatiquement, le seed est idempotent — upserts).

# Photos Parallèles

Site vitrine + boutique de l'association photographique **Photos Parallèles** et
de sa collection de photobooks « Le Souffle de l'Image ».

Stack : Next.js 15 (App Router, RSC), React 19, TypeScript strict, Tailwind CSS 3,
`pnpm`. Le système de design validé par le client (cf. `design-bundle/`) est porté
dans `app/globals.css` ; les polices Fraunces / Jost sont chargées via `next/font`.

## Développement

```bash
pnpm install      # installer les dépendances
pnpm dev          # serveur de développement → http://localhost:3000
pnpm build        # build de production
pnpm start        # servir le build de production
pnpm lint         # lint Next.js / ESLint
```

## Structure

```
app/          Pages App Router (RSC) + globals.css (design system porté)
components/   Header, Footer, BookCard, ArtistCard
lib/          content.ts — données typées (asso, 8 artistes, 8 livres)
public/       Images (artists/<slug>/…, brand/logo-*.png)
design-bundle/  Maquettes HTML validées (source de vérité du design)
```

## Incréments à venir

Panier / checkout, paiement (Stripe), i18n FR/EN, backoffice admin, base de
données (Prisma + PostgreSQL), envoi des emails (Resend), Docker.

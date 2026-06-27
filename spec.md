# Photos Parallèles — Spécification

Site « vitrine » + boutique en ligne pour l'association photographique **Photos Parallèles**.
Présentation de l'association, des artistes, et vente en ligne de la collection de photobooks
« Le Souffle de l'Image ».

> Ce document est la spécification de référence. Les sections « Source » en fin de document
> conservent les textes bruts fournis par le client (présentation, bios, fiches livres).

---

## 1. Objectifs

1. **Vitrine** : présenter l'association et ses 8 artistes.
2. **Boutique** : vendre en ligne les 8 livres physiques de la collection « Le Souffle de l'Image ».
3. **Backoffice** : gérer les livres, les artistes, les commandes, et consulter les statistiques de fréquentation — le tout depuis une seule interface admin, sans outil externe.

---

## 2. Décisions produit (validées)

| Sujet | Décision |
|---|---|
| **Modèle de vente** | Livres **physiques avec livraison** (adresse de livraison collectée). |
| **Frais de port** | **Forfait unique** (un seul tarif quel que soit le nombre de livres / la destination). Montant configurable en backoffice. |
| **Panier** | **Panier multi-livres** (plusieurs titres, un seul paiement). |
| **Paiement** | **Stripe plus tard.** Pour l'instant, checkout = commande **« en attente de paiement »** : enregistre commande + adresse, statut `EN_ATTENTE`, email à l'admin et au client. Architecture prête à brancher Stripe (provider de paiement abstrait). |
| **Stock** | **Disponible / indisponible** par livre (bascule manuelle : `en vente` / `épuisé` / `bientôt`). Pas de décompte d'unités. |
| **Prix** | **Par livre**, saisi et modifiable dans le backoffice (placeholder en attendant les vrais prix). |
| **TVA / factures** | **À déterminer** (régime fiscal à confirmer avec le trésorier). Le modèle de commande stocke les montants HT/TTC ; affichage TVA désactivé par défaut, activable plus tard. Mention « TVA non applicable, art. 293 B du CGI » prévue en option. |
| **Backoffice / auth** | **Login simple, 1 admin** (email + mot de passe, argon2 + session JWT httpOnly), comme `lisa`. |
| **Périmètre éditable en backoffice** | **Livres** + **Artistes** (bios, portrait, œuvre) + **Commandes** (consultation, changement de statut). Présentation de l'asso codée en dur (ou config). |
| **Langues** | **Français uniquement** (décision client — pas de traduction EN). |
| **Responsive** | **Mobile-first obligatoire** : le site doit être pleinement responsive (menu mobile, grilles adaptatives). |
| **Thème** | **Clair uniquement** (pas de dark mode). |
| **Direction artistique** | À proposer par Claude Design (2–3 directions) → validation client **avant** tout développement. |
| **Structure artistes/livres** | **Deux grilles séparées** (section Artistes / section Boutique) reliées par des liens croisés. 1 artiste = 1 livre. |
| **Contact / audience** | **Formulaire de contact** (→ email à l'asso) + **liens réseaux** (Instagram…). Pas de newsletter au lancement. |
| **Légal** | **Mentions légales** + **CGV** (pages prévues, textes à fournir/affiner par le client). |
| **Analytics** | **Umami auto-hébergé**, dashboard **intégré dans le backoffice** (pas d'interface séparée), comme `lisa`. |
| **Photos artistes** | **Extraction ponctuelle** depuis Instagram `@photosparalleles` → enregistrées comme **assets locaux** (pas de dépendance Instagram en prod). Remplaçables ensuite via le backoffice. |
| **Logo** | Retravaillé sur **fond transparent**, en **deux versions** (encre foncée pour fond clair + version claire pour fonds sombres : footer, sur-image). |

---

## 3. Stack technique

Base réutilisée du projet **`/home/trinumja/workplace/perso/lisa`** (mêmes conventions), augmentée des briques e-commerce.

- **Next.js 15** (App Router, RSC, Server Actions), **React 19**, **TypeScript strict**.
- **pnpm**.
- **Tailwind CSS 3.4** (tokens de marque dérivés du logo + DA validée), typographie serif/sans.
- **Prisma 7 + PostgreSQL 16** (conteneurisé Docker). Prisma 7 impose `prisma.config.ts` + un driver adapter (`@prisma/adapter-pg`) ; argent stocké en **centimes** (Int).
- **Auth** : argon2 (`@node-rs/argon2`) + JWT (`jose`) en cookie httpOnly. Un seul `AdminUser` seedé.
- **Images** : pipeline `sharp` (strip EXIF, variantes responsives AVIF/WebP), stockées **sur disque** (`UPLOADS_DIR`, volume Docker), servies via route `/media/[...path]` avec cache immuable.
- **Éditeur riche** : **Tiptap** (descriptions livres, bios artistes — textes littéraires longs du PDF).
- **Emails** : **Resend** (emails de commande, contact). Fallback console en dev.
- **Analytics** : **Umami** auto-hébergé (service Docker + base dédiée), tracking via `<Script>` ; stats lues côté serveur et rendues dans `/admin/analytics`.
- **Langue** : site en français uniquement (pas d'i18n / pas de routing `[locale]`).
- **Validation** : `zod`.
- **Déploiement** : **VPS auto-hébergé**, Docker multi-stage (`output: "standalone"`), `docker-compose.prod.yml`, reverse proxy **Traefik** (TLS Let's Encrypt). `ROOT_DOMAIN` configurable (domaine **pas encore décidé** → placeholder). Umami sur `analytics.${ROOT_DOMAIN}`.
- **Backups** : script de dump Postgres + archive des uploads (cf. `lisa/scripts/backup.sh`).

---

## 4. Modèle de données (Prisma — esquisse)

```
AdminUser      { id, email (unique), passwordHash, createdAt, updatedAt }

Media          { id, path, width, height, variants(JSON), blurDataUrl, alt }

Artist         { id, slug (unique), name, birthInfo, originCountry, baseCity,
                 bioFr(Tiptap JSON), bioEn(Tiptap JSON),
                 portrait → Media, artwork → Media,   // portrait = 1ʳᵉ photo Insta, œuvre = dernière
                 order, published, instagramUrl?,
                 book? (relation 1–1) }

Book           { id, slug (unique), title, subtitle?,
                 artist → Artist (1–1),
                 descriptionFr(Tiptap JSON), descriptionEn(Tiptap JSON),
                 priceCents, currency,
                 availability: AVAILABLE | SOLD_OUT | COMING_SOON,
                 coverImage → Media, gallery → Media[],
                 // specs collection : format 105×152mm, 32 p., agrafé, papier Arena Natural Smooth…
                 specs(JSON), order, published }

Order          { id, reference (unique), status: EN_ATTENTE | PAYEE | EXPEDIEE | LIVREE | ANNULEE,
                 customerName, customerEmail,
                 shippingAddress(JSON: ligne1, ligne2, cp, ville, pays),
                 items: OrderItem[],
                 subtotalCents, shippingCents, totalCents,
                 // champs fiscaux réservés (TVA à déterminer) : taxRate?, taxCents?
                 paymentProvider?: 'stripe' | null, paymentRef?,
                 createdAt, updatedAt }

OrderItem      { id, order → Order, book → Book (snapshot titre+prix), quantity, unitPriceCents }

SiteSetting    { id, shippingFlatCents, currency, contactEmail, socialLinks(JSON), ... }
```

> Le `OrderItem` capture un **snapshot** du titre et du prix au moment de l'achat (le prix d'un livre peut changer ensuite).

---

## 5. Arborescence & pages

### Public `/(site)` — français uniquement
- `/` — **Accueil** : présentation courte de l'asso, mise en avant collection + artistes.
- `/association` (`/about`) — présentation complète de Photos Parallèles + expositions/activités.
- `/artistes` — **grille des 8 artistes** (portrait + nom + lien).
- `/artistes/[slug]` — page artiste : portrait, bio, une œuvre, lien vers son livre.
- `/livres` (`/shop`) — **grille boutique** (8 livres : couverture, titre, auteur, prix, dispo).
- `/livres/[slug]` — fiche livre : galerie, description, specs, prix, bouton « Ajouter au panier ».
- `/panier` — panier multi-livres.
- `/commande` — checkout : coordonnées + adresse de livraison → crée la commande `EN_ATTENTE`.
- `/commande/confirmation` — récapitulatif + message « paiement à venir ».
- `/contact` — formulaire (→ email asso) + liens réseaux.
- `/mentions-legales`, `/cgv`, (`/confidentialite` si tracking nominatif).

### Backoffice `/admin`
- `/admin/login` — connexion (public).
- `/admin` — tableau de bord (KPIs : commandes récentes, ventes).
- `/admin/livres` — CRUD livres (prix, dispo, images, description Tiptap, specs).
- `/admin/artistes` — CRUD artistes (bio, portrait, œuvre, ordre, rattachement livre).
- `/admin/commandes` — **liste des commandes** + détail + changement de statut (`EN_ATTENTE → PAYEE → EXPEDIEE → LIVREE`) + **export CSV** (adresses pour les envois).
- `/admin/analytics` — dashboard **Umami** intégré (visiteurs, pages vues, top pages/referrers, plages 24h/7j/30j).
- `/admin/reglages` — frais de port forfaitaires, email de contact, liens réseaux.

---

## 6. Flux de commande (sans Stripe, pour l'instant)

1. Visiteur ajoute des livres au panier → checkout.
2. Saisie coordonnées + adresse de livraison ; total = Σ prix livres + **forfait port**.
3. Validation → création `Order` en statut **`EN_ATTENTE`**.
4. **Emails** (Resend) : récap au client + notification à l'admin.
5. L'admin voit la commande dans `/admin/commandes`, fait évoluer le statut manuellement.
6. **Plus tard** : brancher Stripe via le `paymentProvider` (Checkout/Payment Intent + webhook qui passe la commande à `PAYEE`).

> Livrable de fin de dev : **document d'aide à la mise en place de Stripe** (clés, webhook, passage `EN_ATTENTE → PAYEE`, factures éventuelles).

---

## 7. Les 8 livres / artistes (« Le Souffle de l'Image »)

Collection : 8 livres format poche **105 × 152 mm**, **32 pages**, couverture souple,
reliure 2 agrafes métal, intérieur 140 g/m² + couverture 240 g/m² (papier Arena Natural Smooth),
N&B ou quadri selon l'ouvrage. Sortie **Festival d'Arles, juillet 2026**, puis Annecy, Barcelone, Paris.

| Artiste | Livre | Origine | Ville |
|---|---|---|---|
| Dominique Agius | **ID-ENTITY** | France | Nice |
| Claire Amaouche | **De tous les chemins sauvages** | France | Berlin |
| Rafa Badía | **Barcelona Riff** | Espagne | Barcelone |
| Maëva Benaiche | **Magma** | France | Toulouse |
| Jean-Matthieu Gosselin | **Working on a Dream** | France | Barcelone |
| Ullic Morard | **Aria** | Italie–France | Annecy |
| François-Xavier Seren | **La Comédie humaine** | France | Paris |
| Giorgia Vlassich | **À travers** | Italie–Croatie | Fermo |

> Images : portrait = **1ʳᵉ photo** du post Instagram correspondant ; œuvre = **dernière photo** du post.
> Extraction ponctuelle → assets locaux, puis remplaçables via `/admin/artistes`.

---

## 8. Logo

- Retravailler `logo.png` : **fond transparent**.
- **Deux versions** : encre foncée (anthracite/noir) pour le fond clair du site ; version claire pour fonds sombres (footer, sur-image).
- Le logo blanc-sur-gris actuel n'est pas lisible sur fond clair → la version foncée est la principale.

---

## 9. Processus de design (bloquant avant dev)

1. Se connecter à **Claude Design** et générer **2–3 directions artistiques** (le client n'a pas tranché : galerie minimaliste N&B / éditorial contrasté / chaleureux-mat).
2. **Validation client obligatoire** avant le premier développement.
3. Décliner tokens Tailwind (couleurs, typo, espacements) à partir de la direction retenue + du logo.

---

## 10. Conformité & ops

- **Mentions légales** + **CGV** (e-commerce FR : droit de rétractation, livraison, identité asso, hébergeur). Textes à fournir/valider par le client.
- **RGPD** : Umami est sans cookie / respectueux de la vie privée (bannière probablement non requise — à confirmer selon config).
- **Emails transactionnels** via Resend (`MAIL_FROM`, `MAIL_TO`).
- **Backups** : dump Postgres + archive uploads (cron sur le VPS).
- **Domaine** : non décidé → `ROOT_DOMAIN` en variable d'env ; Umami sur `analytics.${ROOT_DOMAIN}`.

---

## 11. Reste à clarifier (non bloquant)

- Prix réels des 8 livres (placeholder en attendant).
- Montant du forfait de port.
- Régime TVA de l'association (active/désactive l'affichage et le calcul TVA + factures PDF).
- Domaine définitif.
- Contenus définitifs des CGV / mentions légales.

---

# Sources brutes (fournies par le client)

## Présentation de l'association

### Photos Parallèles : quand les regards se répondent
Fondée en 2023 par Jean-Matthieu Gosselin et Ullic Morard, **Photos Parallèles** est une association photographique qui explore les territoires sensibles de l'image, de l'art et de la mémoire. Née de la rencontre de deux regards et d'une même passion pour la narration visuelle, elle rassemble des photographes, artistes et créateurs autour d'une réflexion commune : faire dialoguer les images, les styles, les époques, les récits et les émotions.

À travers les correspondances visuelles, les mémoires croisées, les techniques artistiques et les narrations parallèles, **Photos Parallèles** développe une approche ouverte de la création contemporaine, où la photographie documentaire côtoie la photographie d'auteur, la vidéo, la peinture et les pratiques artistiques hybrides. L'association défend une vision de l'image comme espace de rencontre, de transmission et de questionnement du réel.

Implantée aux portes d'Annecy, **Photos Parallèles** conçoit et organise des expositions (Ullic Morard et J-M Gosselin ont exposé récemment à Andorre, Annecy, Arles, Rennes…), workshops, conférences, publications - comme la collection « Le Souffle de l'Image », et des projets éditoriaux destinés à favoriser les échanges entre artistes et publics. Chaque initiative vise à créer des passerelles entre les disciplines, les générations et les sensibilités, dans un esprit d'ouverture et de partage.

Particulièrement engagée dans l'accompagnement de la jeune création, **Photos Parallèles** s'attache à révéler de nouveaux talents et à offrir aux auteurs émergents des espaces de visibilité et d'expression. L'association se veut ainsi un laboratoire d'idées et d'images, où les parcours individuels se croisent pour construire des récits collectifs.

**Photos Parallèles, c'est la conviction que chaque image dialogue avec une autre, que chaque mémoire en éclaire une seconde, et que la photographie demeure l'un des plus puissants langages pour raconter le monde.**

## Bios des artistes

**Giorgia Vlassich** (Jesi, 1982) est une artiste visuelle et photographe professionnelle italo-croate. Elle étudie la photographie argentique et le tirage à l'école internationale The Darkroom de Florence, avant de poursuivre et d'approfondir sa recherche artistique au cours d'un séjour déterminant à Paris.
Sa pratique actuelle explore les lieux, les objets et les liens affectifs oubliés à travers un langage qui mêle performance, interventions in situ et documentation argentique. Son travail transforme l'acte artistique en un geste de soin, révélant avec délicatesse les traces de la mémoire, de l'absence et de la présence.

**François-Xavier Seren** — Né à Marseille en 1958, il découvre très tôt la diversité des milieux sociaux au gré des déplacements imposés par la carrière de son père. En 1979, l'arrivée de son premier appareil photo marque un tournant décisif. Nourri par les romans de Balzac et de Flaubert, il se donne pour ambition de raconter la société française à travers l'image. De la famille aux questions d'héritage et d'identité, puis aux réalités de la précarité et du déracinement, il développe une approche profondément humaine fondée sur l'observation attentive et l'immersion au sein des communautés qu'il photographie.
Photographe documentaire et portraitiste remarquable, il construit une œuvre en noir et blanc où se mêlent élégance, ironie et regard social. Qu'il photographie l'aristocratie, les intellectuels, les marginaux ou les oubliés, il cherche toujours à révéler la dignité des individus sans jugement ni complaisance. Influencé par Cartier-Bresson, Martin Parr, David Goldblatt et Dorothea Lange, il poursuit tout au long de sa vie une même quête : témoigner des coutumes, des fractures et des transformations de la société française.

**Ullic Morard** — Né en France et installé en Italie depuis de nombreuses années, il a d'abord étudié l'architecture au Politecnico de Turin. C'est au cours de ce parcours qu'il découvre la photographie, qu'il approfondit à travers différents ateliers et formations, notamment auprès de l'agence américaine VII. Peu à peu, l'image devient pour lui un moyen d'explorer des atmosphères, des émotions et des récits personnels qui dépassent la simple représentation du réel.
Son travail, principalement réalisé en noir et blanc, s'appuie sur une recherche sensible des contrastes entre lumière et obscurité. Marqué par un long séjour en Australie, qui donnera naissance à la série Dark Night, il développe une écriture photographique attentive aux silences, aux traces et aux espaces de transition. Exposé dans plusieurs festivals et événements internationaux en Europe, en Australie et en Amérique du Sud, il poursuit aujourd'hui une démarche où chaque image cherche à révéler la part invisible du monde ordinaire.

**Jean-Matthieu Gosselin** est un photographe français installé à Barcelone. Formé à l'histoire de l'art, à la muséologie et à la photographie, il développe une œuvre profondément liée à la mémoire, à la perte, aux racines et à la narration visuelle.
Victime d'une amnésie totale à la suite d'un AVC, il a d'abord utilisé la photographie comme une thérapie, avant d'en faire un véritable outil de reconstruction personnelle. Ses images interrogent les mécanismes du souvenir, la fragilité de l'identité et la manière dont les lieux, les traces et les récits participent à la construction de soi.

**Maëva Benaiche** est une photographe française née à Toulouse en 1996. Son travail explore les liens entre l'intime, la mémoire et les fragilités qui façonnent notre rapport au monde. À travers la photographie, elle cherche à exprimer ce que les mots peinent parfois à révéler, transformant l'image en un espace de questionnement et de résonance personnelle.
Photographe et bègue, elle développe une écriture visuelle sensible où se mêlent vulnérabilité, introspection et observation du réel. Ses images interrogent la place de l'individu dans un monde traversé par les incertitudes, les silences et les fêlures. Depuis 2023, elle est également fondatrice du magazine « Premier Exemplaire », dédié à la jeune photographie contemporaine.

**Rafa Badía** — Photographe, éditeur, historien de l'art et enseignant, il vit et travaille à Barcelone depuis 1994. Figure majeure de la photographie documentaire et de rue en Espagne, il consacre son regard à la narration visuelle et à l'exploration du quotidien.
Son travail se nourrit d'une observation patiente de la vie urbaine, où chaque image s'inscrit dans un récit plus vaste. À travers la lumière, les détails, les gestes et les rencontres, il révèle la poésie discrète des rues et des instants ordinaires. Entre documentaire et fiction, ses photographies transforment le réel en un espace de résonance sensible.

**Claire Amaouche** — Artiste visuelle basée à Berlin, elle a toujours dans son sac un carnet, un appareil photo et quelques pinceaux. Elle se promène d'un endroit à l'autre, essayant de saisir des instants fugaces, des fragments de vie et des histoires disséminées à travers le monde. Au fil des années, elle a pratiqué un art de la photographie fait de calme, de patience et de silence. Une discipline qui semble contre-intuitive au premier abord, mais qui ne cesse de révéler que la beauté réside souvent dans l'ordinaire.

**Dominique Agius** — La photographie est pour moi un espace d'exploration où se rencontrent le corps, la mémoire et les métamorphoses de l'identité. Chaque série naît d'une question différente, mais toutes procèdent d'un même désir : révéler ce qui se cache sous la surface des apparences. Inspiré autant par les maîtres de la peinture classique que par les fragilités du présent, je cherche une écriture visuelle où la lumière sculpte les formes et donne une présence nouvelle à l'invisible. Du clair-obscur aux cyanotypes sur peau, des vanités aux natures mortes, mes images interrogent ce qui nous constitue, nous transforme et nous relie à notre humanité.

## Fiches livres (extraits du PDF « TESTS LIVRES »)

> Le PDF source contient les textes de présentation de la collection et de chaque ouvrage
> (Working on a Dream, Claire Amaouche / « De tous les chemins sauvages », ID-ENTITY,
> La Comédie humaine, À travers, Magma, Barcelona Riff, Aria). À reprendre tels quels comme
> descriptions de livres dans le backoffice.

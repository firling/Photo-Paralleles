# Mettre en place le paiement en ligne (Stripe)

Ce guide explique, étape par étape, comment brancher **Stripe** sur la boutique
Photos Parallèles. Le code a été conçu pour ça dès le départ : le checkout ne parle
qu'à une **abstraction de paiement** (`lib/payment.ts`), donc l'ajout de Stripe ne
touche presque pas au reste de l'application.

Tu n'as **pas** besoin d'être développeur pour suivre la partie « compte Stripe » et
« variables d'environnement ». Les étapes de code (3 à 6) sont à confier à un
développeur (ou à Claude Code) — elles sont fournies clés en main ci-dessous.

---

## 1. Comment marche le paiement aujourd'hui (sans Stripe)

- Le client remplit son panier puis le formulaire `/commande`.
- Le serveur **recalcule lui-même** tous les montants depuis la base (il ne fait
  jamais confiance aux prix envoyés par le navigateur) — c'est une sécurité déjà en place.
- Une commande est créée avec le statut **`EN_ATTENTE`** (« en attente de paiement »),
  un email part au client et à l'association, et la commande apparaît dans
  **Back-office → Commandes**.
- Aucun paiement n'est demandé. Le bouton affiche « Le paiement en ligne sera bientôt disponible ».

Avec Stripe, le seul changement de parcours sera : après « Valider la commande », le
client est **redirigé vers une page de paiement Stripe** ; une fois payé, la commande
passe automatiquement de `EN_ATTENTE` à **`PAYEE`**.

**Ce qui est déjà prêt dans le code** (rien à créer) :
- `lib/payment.ts` — l'interface `PaymentProvider` et le champ `redirectUrl` du résultat.
- `Order.paymentProvider` et `Order.paymentRef` en base — pour stocker `"stripe"` et l'ID Stripe.
- Le statut `PAYEE` existe déjà dans l'enum des commandes.
- `createOrder` (`app/commande/actions.ts`) route déjà la commande via le provider de paiement.

---

## 2. Côté Stripe (aucune ligne de code)

1. Crée un compte sur **https://stripe.com** et complète le profil de l'association
   (Stripe demande des informations légales/bancaires pour verser l'argent — IBAN de l'asso).
2. Reste en **mode Test** tant que tout n'est pas validé (interrupteur « Test mode » en haut à droite).
3. Récupère les **clés API** dans *Développeurs → Clés API* :
   - **Clé publiable** : `pk_test_…`
   - **Clé secrète** : `sk_test_…` (⚠️ secrète — ne jamais la mettre dans le code public ni la partager)
4. Devise : la boutique est en **EUR**, les montants sont gérés en **centimes** (déjà le cas dans le code).
5. (Le **secret du webhook** `whsec_…` sera créé à l'étape 7.)

---

## 3. Variables d'environnement à ajouter

Ajoute ces variables à `.env.production` (et à `.env` en dev pour tester). Elles sont
déjà documentées dans `.env.production.example` à compléter :

```bash
STRIPE_SECRET_KEY="sk_test_..."          # puis sk_live_... en production
STRIPE_WEBHOOK_SECRET="whsec_..."        # créé à l'étape 7
NEXT_PUBLIC_APP_URL="https://photosparalleles.xxx"   # déjà présent — sert aux URLs de retour
# Active Stripe (sans ça, le site reste en mode "commande en attente, sans paiement")
PAYMENT_PROVIDER="stripe"
```

> En l'absence de `PAYMENT_PROVIDER=stripe` ou de `STRIPE_SECRET_KEY`, le site retombe
> automatiquement sur le mode actuel (commande `EN_ATTENTE`, sans paiement). Tu peux donc
> activer/désactiver Stripe juste avec cette variable.

Installe la librairie Stripe :

```bash
pnpm add stripe
```

---

## 4. Implémenter le provider Stripe — `lib/payment.ts`

Remplace le contenu de `lib/payment.ts` par celui-ci (il garde le provider « pending »
existant et bascule sur Stripe selon l'environnement) :

```ts
import "server-only";
import Stripe from "stripe";
import type { Order, OrderItem } from "@prisma/client";

export type PaymentStatus = "pending" | "paid";

export interface PaymentResult {
  provider: string | null;     // -> Order.paymentProvider ("stripe")
  status: PaymentStatus;
  redirectUrl?: string;        // -> URL de paiement Stripe Checkout
  reference?: string;          // -> Order.paymentRef (id de session Stripe)
}

export interface PaymentProvider {
  readonly name: string;
  // l'order inclut désormais ses lignes (voir étape 5)
  createCheckout(order: Order & { items: OrderItem[] }): Promise<PaymentResult>;
}

/** Provider sans paiement (état actuel) : commande laissée en EN_ATTENTE. */
export const pendingProvider: PaymentProvider = {
  name: "pending",
  async createCheckout() {
    return { provider: null, status: "pending" };
  },
};

/** Provider Stripe Checkout (redirection). */
function makeStripeProvider(): PaymentProvider {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    name: "stripe",
    async createCheckout(order) {
      const lineItems = order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: item.unitPriceCents, // déjà en centimes
          product_data: { name: item.title },
        },
      }));

      // Frais de port en ligne dédiée (forfait unique)
      if (order.shippingCents > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: order.shippingCents,
            product_data: { name: "Livraison — forfait unique" },
          },
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        customer_email: order.customerEmail,
        client_reference_id: order.reference,
        metadata: { orderId: order.id, reference: order.reference },
        success_url: `${appUrl}/commande/confirmation?ref=${order.reference}`,
        cancel_url: `${appUrl}/panier`,
      });

      return {
        provider: "stripe",
        status: "pending",
        redirectUrl: session.url ?? undefined,
        reference: session.id,
      };
    },
  };
}

/** Provider actif selon l'environnement. */
export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYMENT_PROVIDER === "stripe" && process.env.STRIPE_SECRET_KEY) {
    return makeStripeProvider();
  }
  return pendingProvider;
}
```

---

## 5. Rediriger le client vers Stripe — `app/commande/actions.ts` et le formulaire

Deux petits ajustements seulement.

**a) `app/commande/actions.ts`** — l'`order` créé inclut déjà ses `items` (`include: { items: true }`),
il n'y a donc rien à changer côté requête. Il faut juste **remonter l'URL de redirection** au navigateur.

Modifie le type de retour :

```ts
export type CreateOrderResult =
  | { ok: true; reference: string; redirectUrl?: string }   // <- ajout redirectUrl
  | { ok: false; error: string };
```

Et à la toute fin de `createOrder`, après l'appel au provider, renvoie l'URL :

```ts
  const provider = getPaymentProvider();
  const payment = await provider.createCheckout(created);
  if (payment.provider) {
    await prisma.order.update({
      where: { id: created.id },
      data: { paymentProvider: payment.provider, paymentRef: payment.reference ?? null },
    });
  }

  // N'envoie l'email "commande enregistrée" QUE s'il n'y a pas de paiement en ligne
  // (avec Stripe, l'email de confirmation part au webhook, une fois la commande payée).
  if (!payment.redirectUrl) {
    await sendOrderEmails(created, settings?.contactEmail ?? null);
  }

  return { ok: true, reference: created.reference, redirectUrl: payment.redirectUrl };
```

**b) Le formulaire de checkout** (`app/commande/CheckoutView.tsx`) — après l'appel à
`createOrder`, si une `redirectUrl` est renvoyée, redirige vers Stripe au lieu d'aller
directement à la page de confirmation :

```ts
const result = await createOrder(payload);
if (result.ok) {
  clearCart();                          // vide le panier
  if (result.redirectUrl) {
    window.location.href = result.redirectUrl;   // -> page de paiement Stripe
  } else {
    router.push(`/commande/confirmation?ref=${result.reference}`);
  }
} else {
  // afficher result.error (déjà géré)
}
```

> ⚠️ Avec Stripe, ne vide le panier qu'au retour réussi si tu préfères : ici on le vide
> avant la redirection. Le `cancel_url` ramène l'utilisateur au `/panier` ; comme le panier
> est côté navigateur, garde le comportement qui te convient (le plus simple : vider après
> redirection, et la commande `EN_ATTENTE` reste visible au back-office si le client abandonne).

---

## 6. Recevoir la confirmation de paiement — webhook `app/api/stripe/webhook/route.ts`

Stripe confirme le paiement **de serveur à serveur** (et non via le navigateur, qui n'est
pas fiable). Crée ce fichier :

```ts
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { sendOrderEmails } from "@/lib/mail";

export const runtime = "nodejs";          // accès au corps brut requis
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  const body = await req.text();          // corps BRUT obligatoire pour la signature
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, sig as string, process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    console.error("[stripe] signature invalide:", err);
    return new Response("invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAYEE",
          paymentProvider: "stripe",
          paymentRef: typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.id,
        },
        include: { items: true },
      });
      // Envoie les emails de confirmation maintenant que c'est payé
      const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
      await sendOrderEmails(order, settings?.contactEmail ?? null).catch(() => {});
    }
  }

  return new Response("ok", { status: 200 });
}
```

---

## 7. Créer le webhook dans Stripe + récupérer `whsec_…`

**En production** :
1. Stripe → *Développeurs → Webhooks → Ajouter un endpoint*.
2. URL : `https://TON-DOMAINE/api/stripe/webhook`
3. Événement à écouter : **`checkout.session.completed`** (suffisant). Tu peux aussi
   ajouter `checkout.session.expired` plus tard si tu veux marquer les abandons.
4. Copie le **secret de signature** `whsec_…` → variable `STRIPE_WEBHOOK_SECRET`.

**En local (tests)**, utilise la CLI Stripe :
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# -> affiche un whsec_... à mettre dans .env le temps des tests
```

---

## 8. Tester (mode Test)

1. Mets les clés **test** (`sk_test_…`, `pk_test_…`, le `whsec_…` de `stripe listen`) et `PAYMENT_PROVIDER=stripe`.
2. Lance le site, ajoute des livres au panier, va jusqu'à « Valider la commande ».
3. Sur la page Stripe, paie avec une **carte de test** : `4242 4242 4242 4242`, date future, CVC quelconque.
4. Vérifie que :
   - tu es redirigé vers `/commande/confirmation` ;
   - la commande passe à **`PAYEE`** dans Back-office → Commandes ;
   - les emails de confirmation sont partis (voir `RESEND_API_KEY`, cf. `DEPLOY.md`).
5. Autres cartes de test utiles : `4000 0000 0000 9995` (paiement refusé), `4000 0025 0000 3155` (3D Secure).

---

## 9. Passage en production (mode Live)

1. Bascule le compte Stripe en **mode Live** et refais *Clés API* → `sk_live_…`.
2. Recrée le **webhook** sur l'URL de production et récupère un nouveau `whsec_…` **live**.
3. Mets à jour `.env.production` : `STRIPE_SECRET_KEY=sk_live_…`, `STRIPE_WEBHOOK_SECRET=whsec_…` (live), `PAYMENT_PROVIDER=stripe`.
4. Rebuild + redéploiement de l'app (cf. `DEPLOY.md`).
5. Fais un **vrai achat test** (petit montant) puis rembourse-le depuis le dashboard Stripe.

---

## 10. Exploitation au quotidien

- **Voir / encaisser** : tableau de bord Stripe (paiements, virements vers l'IBAN de l'asso).
- **Suivi des commandes** : Back-office → Commandes (statuts `EN_ATTENTE` → `PAYEE` → `EXPEDIEE` → `LIVREE`).
  Le passage à `PAYEE` est automatique (webhook) ; `EXPEDIEE`/`LIVREE` se font à la main après envoi.
- **Remboursement** : depuis le dashboard Stripe (le statut de la commande peut être repassé à `ANNULEE` au back-office).
- **Export** des commandes/adresses : bouton CSV dans Back-office → Commandes (pour le publipostage des envois).

---

## 11. À garder en tête

- **TVA** : le régime fiscal de l'association reste à déterminer (cf. `spec.md` §11). Si l'asso
  est en franchise de TVA, rien à faire de plus. Sinon, Stripe propose **Stripe Tax** (option payante)
  ou tu peux ajouter un taux fixe dans `price_data` ultérieurement. À valider avec le trésorier.
- **Sécurité** (déjà respectée par le code) : la clé secrète ne quitte jamais le serveur, la
  signature du webhook est vérifiée, et **les montants sont recalculés côté serveur** — un client
  ne peut pas se fabriquer un prix.
- **Frais Stripe** : ~1,5 % + 0,25 € par transaction (cartes EU) — à prévoir dans le prix des livres.
- **Rien d'autre à migrer** : aucune création de « produits » dans Stripe n'est nécessaire, les
  livres sont envoyés dynamiquement à chaque commande (`price_data`).

---

### Récapitulatif des fichiers touchés
| Fichier | Action |
|---|---|
| `.env.production` / `.env` | + `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYMENT_PROVIDER=stripe` |
| `lib/payment.ts` | implémenter le provider Stripe (étape 4) |
| `app/commande/actions.ts` | remonter `redirectUrl` + email au webhook (étape 5a) |
| `app/commande/CheckoutView.tsx` | rediriger vers Stripe si `redirectUrl` (étape 5b) |
| `app/api/stripe/webhook/route.ts` | **nouveau** — passage à `PAYEE` (étape 6) |
| `package.json` | + `stripe` |

Une fois ces étapes faites et testées en mode Test, le paiement en ligne est opérationnel.

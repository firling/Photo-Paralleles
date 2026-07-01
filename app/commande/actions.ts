"use server";

import { z } from "zod";
import type { Availability, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payment";
import { sendOrderEmails } from "@/lib/mail";

/**
 * Checkout server action.
 *
 * The client sends only slugs + quantities — never prices. Every line is
 * re-fetched from the DB by slug so price, title and availability are
 * authoritative. Totals are computed server-side. The order + items are
 * written in a single transaction, then routed through the payment
 * abstraction (currently a no-op "pending" provider) and the order emails are
 * sent best-effort.
 */

const checkoutSchema = z.object({
  customerName: z.string().trim().min(1, "Le nom est requis.").max(120),
  customerEmail: z.string().trim().email("Adresse email invalide.").max(160),
  line1: z.string().trim().min(1, "L'adresse est requise.").max(160),
  line2: z.string().trim().max(160).optional(),
  postalCode: z.string().trim().min(1, "Le code postal est requis.").max(20),
  city: z.string().trim().min(1, "La ville est requise.").max(120),
  country: z.string().trim().min(1).max(80).default("France"),
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Votre panier est vide."),
});

export type CreateOrderInput = z.input<typeof checkoutSchema>;

export type CreateOrderResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

const AVAILABILITY_LABELS: Record<Availability, string> = {
  AVAILABLE: "disponible",
  SOLD_OUT: "épuisé",
  COMING_SOON: "à venir",
};

function generateReference(): string {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `PP-${datePart}-${suffix}`;
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Formulaire invalide." };
  }
  const data = parsed.data;

  // Collapse duplicate slugs defensively (cart shouldn't produce them).
  const quantities = new Map<string, number>();
  for (const item of data.items) {
    quantities.set(item.slug, (quantities.get(item.slug) ?? 0) + item.quantity);
  }
  const slugs = [...quantities.keys()];

  // AUTHORITATIVE re-fetch: never trust client-supplied prices/titles.
  const books = await prisma.book.findMany({
    where: { slug: { in: slugs }, published: true },
  });
  const bySlug = new Map(books.map((b) => [b.slug, b]));

  const lineItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
  let subtotalCents = 0;

  for (const slug of slugs) {
    const book = bySlug.get(slug);
    const qty = quantities.get(slug) ?? 0;
    if (!book) {
      return {
        ok: false,
        error: `Un article de votre panier n'est plus disponible à la vente.`,
      };
    }
    if (book.availability !== "AVAILABLE" || book.copiesRemaining <= 0) {
      return {
        ok: false,
        error: `« ${book.title} » n'est plus disponible à la vente (${AVAILABILITY_LABELS[book.availability]}). Merci de le retirer de votre panier.`,
      };
    }
    if (book.copiesRemaining < qty) {
      return {
        ok: false,
        error: `Il ne reste que ${book.copiesRemaining} exemplaire(s) de « ${book.title} ». Merci d'ajuster la quantité.`,
      };
    }
    subtotalCents += book.priceCents * qty;
    lineItems.push({
      bookId: book.id,
      bookSlug: book.slug,
      title: book.title,
      unitPriceCents: book.priceCents,
      quantity: qty,
    });
  }

  const settings = await prisma.siteSetting.findUnique({
    where: { id: "singleton" },
  });
  const shippingCents = settings?.shippingFlatCents ?? 600;
  const totalCents = subtotalCents + shippingCents;

  const shippingAddress: Prisma.InputJsonValue = {
    line1: data.line1,
    line2: data.line2 ?? "",
    postalCode: data.postalCode,
    city: data.city,
    country: data.country,
  };

  // Create the order (+ items) and decrement each book's stock in a single
  // transaction, retrying the human reference on the off chance of a unique
  // collision. Stock is decremented with a guarded `updateMany` (only when
  // enough copies remain) so two concurrent checkouts can never oversell — if
  // the guard matches 0 rows we roll back with a friendly out-of-stock error.
  const OUT_OF_STOCK = Symbol("out-of-stock");
  let created;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = generateReference();
    try {
      created = await prisma.$transaction(async (tx) => {
        for (const line of lineItems) {
          if (!line.bookId) continue; // custom line without a catalog book
          const { count } = await tx.book.updateMany({
            where: { id: line.bookId, copiesRemaining: { gte: line.quantity } },
            data: { copiesRemaining: { decrement: line.quantity } },
          });
          if (count === 0) throw OUT_OF_STOCK;
        }
        return tx.order.create({
          data: {
            reference,
            status: "EN_ATTENTE",
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            shippingAddress,
            subtotalCents,
            shippingCents,
            totalCents,
            paymentProvider: null,
            items: { create: lineItems },
          },
          include: { items: true },
        });
      });
      break;
    } catch (err) {
      if (err === OUT_OF_STOCK) {
        return {
          ok: false,
          error:
            "Un article de votre panier vient d'être épuisé. Merci de vérifier votre panier.",
        };
      }
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        continue; // reference collision — retry with a new one
      }
      console.error("[checkout] Échec de création de la commande:", err);
      return {
        ok: false,
        error: "Une erreur est survenue lors de l'enregistrement. Réessayez.",
      };
    }
  }

  if (!created) {
    return {
      ok: false,
      error: "Impossible de générer une référence de commande. Réessayez.",
    };
  }

  // Route through the payment abstraction (no-op pending provider for now).
  const provider = getPaymentProvider();
  const payment = await provider.createCheckout(created);
  if (payment.provider) {
    await prisma.order.update({
      where: { id: created.id },
      data: {
        paymentProvider: payment.provider,
        paymentRef: payment.reference ?? null,
      },
    });
  }

  await sendOrderEmails(created, settings?.contactEmail ?? null);

  return { ok: true, reference: created.reference };
}

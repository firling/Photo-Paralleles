"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eurosToCents } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { EMPTY_DOC, isRichTextDoc } from "@/lib/richtext";
import type { Prisma } from "@prisma/client";

/**
 * Server Actions for the Books back-office. All mutations are admin-guarded,
 * validated with zod, and revalidate the affected public routes. Money is taken
 * in euros and stored in cents; the description is a Tiptap JSON document.
 */

export interface BookFormState {
  error?: string;
}

const AVAILABILITIES = ["AVAILABLE", "SOLD_OUT", "COMING_SOON"] as const;

const bookSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis."),
  slug: z
    .string()
    .trim()
    .min(1, "Le slug est requis.")
    .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des minuscules, chiffres et tirets."),
  artistId: z.string().trim().min(1, "Sélectionnez un artiste."),
  priceCents: z.number().int().min(0, "Le prix doit être positif."),
  currency: z.string().trim().min(1).max(3),
  availability: z.enum(AVAILABILITIES),
  cover: z.string().trim().min(1, "Une image de couverture est requise."),
  order: z.number().int(),
  published: z.boolean(),
  format: z.string().trim(),
  pages: z.string().trim(),
  binding: z.string().trim(),
  paper: z.string().trim(),
  printing: z.string().trim(),
});

interface ParsedBook {
  data: z.infer<typeof bookSchema>;
  description: Prisma.InputJsonValue;
  gallery: Prisma.InputJsonValue;
}

function parseDescription(raw: string): Prisma.InputJsonValue {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isRichTextDoc(parsed)) return parsed as Prisma.InputJsonValue;
  } catch {
    // fall through to empty doc
  }
  return EMPTY_DOC as Prisma.InputJsonValue;
}

function parseGallery(raw: string): Prisma.InputJsonValue {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string");
    }
  } catch {
    // fall through to empty list
  }
  return [];
}

function parseBookForm(
  formData: FormData,
): { ok: true; value: ParsedBook } | { ok: false; error: string } {
  const titleRaw = String(formData.get("title") ?? "");
  const slugRaw = String(formData.get("slug") ?? "").trim();

  const parsed = bookSchema.safeParse({
    title: titleRaw,
    slug: slugRaw || slugify(titleRaw),
    artistId: String(formData.get("artistId") ?? ""),
    priceCents: eurosToCents(String(formData.get("priceEuros") ?? "")),
    currency: String(formData.get("currency") ?? "EUR") || "EUR",
    availability: String(formData.get("availability") ?? "AVAILABLE"),
    cover: String(formData.get("cover") ?? ""),
    order: Number.parseInt(String(formData.get("order") ?? "0"), 10) || 0,
    published: formData.get("published") === "on",
    format: String(formData.get("format") ?? ""),
    pages: String(formData.get("pages") ?? ""),
    binding: String(formData.get("binding") ?? ""),
    paper: String(formData.get("paper") ?? ""),
    printing: String(formData.get("printing") ?? ""),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  return {
    ok: true,
    value: {
      data: parsed.data,
      description: parseDescription(String(formData.get("description") ?? "")),
      gallery: parseGallery(String(formData.get("gallery") ?? "")),
    },
  };
}

function specsJson(d: z.infer<typeof bookSchema>): Prisma.InputJsonValue {
  return {
    format: d.format,
    pages: d.pages,
    binding: d.binding,
    paper: d.paper,
    printing: d.printing,
  };
}

/** Revalidate every public route that reflects a given book + its artist. */
async function revalidateBook(slug: string, artistId: string): Promise<void> {
  revalidatePath("/");
  revalidatePath("/livres");
  revalidatePath(`/livres/${slug}`);
  const artist = await prisma.artist.findUnique({
    where: { id: artistId },
    select: { slug: true },
  });
  if (artist) revalidatePath(`/artistes/${artist.slug}`);
  revalidatePath("/admin/livres");
}

export async function createBookAction(
  _prev: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = parseBookForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { data, description, gallery } = parsed.value;

  const slugTaken = await prisma.book.findUnique({ where: { slug: data.slug } });
  if (slugTaken) return { error: "Ce slug est déjà utilisé par un autre livre." };

  const artistTaken = await prisma.book.findUnique({
    where: { artistId: data.artistId },
  });
  if (artistTaken) {
    return { error: "Cet artiste est déjà lié à un autre livre." };
  }

  await prisma.book.create({
    data: {
      slug: data.slug,
      title: data.title,
      priceCents: data.priceCents,
      currency: data.currency,
      availability: data.availability,
      cover: data.cover,
      gallery,
      specs: specsJson(data),
      description,
      order: data.order,
      published: data.published,
      artistId: data.artistId,
    },
  });

  await revalidateBook(data.slug, data.artistId);
  redirect("/admin/livres");
}

export async function updateBookAction(
  id: string,
  _prev: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  await requireAdmin();

  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) return { error: "Livre introuvable." };

  const parsed = parseBookForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { data, description, gallery } = parsed.value;

  const slugTaken = await prisma.book.findFirst({
    where: { slug: data.slug, id: { not: id } },
  });
  if (slugTaken) return { error: "Ce slug est déjà utilisé par un autre livre." };

  const artistTaken = await prisma.book.findFirst({
    where: { artistId: data.artistId, id: { not: id } },
  });
  if (artistTaken) {
    return { error: "Cet artiste est déjà lié à un autre livre." };
  }

  await prisma.book.update({
    where: { id },
    data: {
      slug: data.slug,
      title: data.title,
      priceCents: data.priceCents,
      currency: data.currency,
      availability: data.availability,
      cover: data.cover,
      gallery,
      specs: specsJson(data),
      description,
      order: data.order,
      published: data.published,
      artistId: data.artistId,
    },
  });

  await revalidateBook(data.slug, data.artistId);
  if (existing.slug !== data.slug) revalidatePath(`/livres/${existing.slug}`);
  redirect("/admin/livres");
}

export async function deleteBookAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) redirect("/admin/livres");

  await prisma.book.delete({ where: { id } });
  await revalidateBook(book!.slug, book!.artistId);
  redirect("/admin/livres");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { EMPTY_DOC, isRichTextDoc } from "@/lib/richtext";
import type { Prisma } from "@prisma/client";

/**
 * Server Actions for the Artists back-office. Admin-guarded, zod-validated, and
 * revalidating the affected public routes. The bio is a Tiptap JSON document.
 * Deletion is blocked while the artist still has a linked book.
 */

export interface ArtistFormState {
  error?: string;
}

const artistSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis."),
  slug: z
    .string()
    .trim()
    .min(1, "Le slug est requis.")
    .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des minuscules, chiffres et tirets."),
  role: z.string().trim().min(1, "Le rôle est requis."),
  originCountry: z.string().trim(),
  baseCity: z.string().trim(),
  lead: z.string().trim(),
  portrait: z.string().trim().min(1, "Un portrait est requis."),
  oeuvre: z.string().trim().min(1, "Une image d'œuvre est requise."),
  order: z.number().int(),
  published: z.boolean(),
});

interface ParsedArtist {
  data: z.infer<typeof artistSchema>;
  bio: Prisma.InputJsonValue;
}

function parseBio(raw: string): Prisma.InputJsonValue {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isRichTextDoc(parsed)) return parsed as Prisma.InputJsonValue;
  } catch {
    // fall through
  }
  return EMPTY_DOC as Prisma.InputJsonValue;
}

function parseArtistForm(
  formData: FormData,
): { ok: true; value: ParsedArtist } | { ok: false; error: string } {
  const nameRaw = String(formData.get("name") ?? "");
  const slugRaw = String(formData.get("slug") ?? "").trim();

  const parsed = artistSchema.safeParse({
    name: nameRaw,
    slug: slugRaw || slugify(nameRaw),
    role: String(formData.get("role") ?? ""),
    originCountry: String(formData.get("originCountry") ?? ""),
    baseCity: String(formData.get("baseCity") ?? ""),
    lead: String(formData.get("lead") ?? ""),
    portrait: String(formData.get("portrait") ?? ""),
    oeuvre: String(formData.get("oeuvre") ?? ""),
    order: Number.parseInt(String(formData.get("order") ?? "0"), 10) || 0,
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  return {
    ok: true,
    value: { data: parsed.data, bio: parseBio(String(formData.get("bio") ?? "")) },
  };
}

async function revalidateArtist(slug: string, artistId: string): Promise<void> {
  revalidatePath("/");
  revalidatePath("/artistes");
  revalidatePath(`/artistes/${slug}`);
  revalidatePath("/admin/artistes");
  const book = await prisma.book.findUnique({
    where: { artistId },
    select: { slug: true },
  });
  if (book) revalidatePath(`/livres/${book.slug}`);
}

export async function createArtistAction(
  _prev: ArtistFormState,
  formData: FormData,
): Promise<ArtistFormState> {
  await requireAdmin();

  const parsed = parseArtistForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { data, bio } = parsed.value;

  const slugTaken = await prisma.artist.findUnique({ where: { slug: data.slug } });
  if (slugTaken) return { error: "Ce slug est déjà utilisé par un autre artiste." };

  const created = await prisma.artist.create({
    data: {
      slug: data.slug,
      name: data.name,
      role: data.role,
      originCountry: data.originCountry,
      baseCity: data.baseCity,
      lead: data.lead,
      bio,
      portrait: data.portrait,
      oeuvre: data.oeuvre,
      order: data.order,
      published: data.published,
    },
  });

  await revalidateArtist(data.slug, created.id);
  redirect("/admin/artistes");
}

export async function updateArtistAction(
  id: string,
  _prev: ArtistFormState,
  formData: FormData,
): Promise<ArtistFormState> {
  await requireAdmin();

  const existing = await prisma.artist.findUnique({ where: { id } });
  if (!existing) return { error: "Artiste introuvable." };

  const parsed = parseArtistForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { data, bio } = parsed.value;

  const slugTaken = await prisma.artist.findFirst({
    where: { slug: data.slug, id: { not: id } },
  });
  if (slugTaken) return { error: "Ce slug est déjà utilisé par un autre artiste." };

  await prisma.artist.update({
    where: { id },
    data: {
      slug: data.slug,
      name: data.name,
      role: data.role,
      originCountry: data.originCountry,
      baseCity: data.baseCity,
      lead: data.lead,
      bio,
      portrait: data.portrait,
      oeuvre: data.oeuvre,
      order: data.order,
      published: data.published,
    },
  });

  await revalidateArtist(data.slug, id);
  if (existing.slug !== data.slug) revalidatePath(`/artistes/${existing.slug}`);
  redirect("/admin/artistes");
}

export async function deleteArtistAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const artist = await prisma.artist.findUnique({
    where: { id },
    include: { book: true },
  });
  if (!artist) redirect("/admin/artistes");

  // Block deletion while a book is still linked (1–1 relation).
  if (artist!.book) {
    redirect(`/admin/artistes/${id}?error=linked-book`);
  }

  await prisma.artist.delete({ where: { id } });
  await revalidateArtist(artist!.slug, id);
  redirect("/admin/artistes");
}

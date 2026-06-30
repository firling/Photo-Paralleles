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
 * Server Actions for the Projects back-office. Admin-guarded, zod-validated, and
 * revalidating the affected public routes. The description is a Tiptap JSON
 * document; the gallery is a JSON array of `/media/...` URLs.
 */

export interface ProjectFormState {
  error?: string;
}

const projectSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis."),
  slug: z
    .string()
    .trim()
    .min(1, "Le slug est requis.")
    .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des minuscules, chiffres et tirets."),
  kind: z.string().trim().min(1, "Le type est requis."),
  year: z.string().trim(),
  location: z.string().trim(),
  lead: z.string().trim(),
  cover: z.string().trim().min(1, "Une image de couverture est requise."),
  order: z.number().int(),
  published: z.boolean(),
});

interface ParsedProject {
  data: z.infer<typeof projectSchema>;
  description: Prisma.InputJsonValue;
  gallery: Prisma.InputJsonValue;
}

function parseDescription(raw: string): Prisma.InputJsonValue {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isRichTextDoc(parsed)) return parsed as Prisma.InputJsonValue;
  } catch {
    // fall through
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
    // fall through
  }
  return [];
}

function parseProjectForm(
  formData: FormData,
): { ok: true; value: ParsedProject } | { ok: false; error: string } {
  const titleRaw = String(formData.get("title") ?? "");
  const slugRaw = String(formData.get("slug") ?? "").trim();

  const parsed = projectSchema.safeParse({
    title: titleRaw,
    slug: slugRaw || slugify(titleRaw),
    kind: String(formData.get("kind") ?? ""),
    year: String(formData.get("year") ?? ""),
    location: String(formData.get("location") ?? ""),
    lead: String(formData.get("lead") ?? ""),
    cover: String(formData.get("cover") ?? ""),
    order: Number.parseInt(String(formData.get("order") ?? "0"), 10) || 0,
    published: formData.get("published") === "on",
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

function revalidateProject(slug: string): void {
  revalidatePath("/");
  revalidatePath("/projets");
  revalidatePath(`/projets/${slug}`);
  revalidatePath("/admin/projets");
}

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();

  const parsed = parseProjectForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { data, description, gallery } = parsed.value;

  const slugTaken = await prisma.project.findUnique({ where: { slug: data.slug } });
  if (slugTaken) return { error: "Ce slug est déjà utilisé par un autre projet." };

  await prisma.project.create({
    data: {
      slug: data.slug,
      title: data.title,
      kind: data.kind,
      year: data.year,
      location: data.location,
      lead: data.lead,
      description,
      cover: data.cover,
      gallery,
      order: data.order,
      published: data.published,
    },
  });

  revalidateProject(data.slug);
  redirect("/admin/projets");
}

export async function updateProjectAction(
  id: string,
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return { error: "Projet introuvable." };

  const parsed = parseProjectForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { data, description, gallery } = parsed.value;

  const slugTaken = await prisma.project.findFirst({
    where: { slug: data.slug, id: { not: id } },
  });
  if (slugTaken) return { error: "Ce slug est déjà utilisé par un autre projet." };

  await prisma.project.update({
    where: { id },
    data: {
      slug: data.slug,
      title: data.title,
      kind: data.kind,
      year: data.year,
      location: data.location,
      lead: data.lead,
      description,
      cover: data.cover,
      gallery,
      order: data.order,
      published: data.published,
    },
  });

  revalidateProject(data.slug);
  if (existing.slug !== data.slug) revalidatePath(`/projets/${existing.slug}`);
  redirect("/admin/projets");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) redirect("/admin/projets");

  await prisma.project.delete({ where: { id } });
  revalidateProject(project!.slug);
  redirect("/admin/projets");
}

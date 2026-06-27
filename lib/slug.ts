/**
 * Slug helper for the catalog back-office. Produces a URL-safe slug from a
 * title/name: lowercased, accents stripped, non-alphanumerics collapsed to
 * single hyphens. Mirrors the hand-authored slugs in the seed (e.g.
 * "La Comédie humaine" -> "la-comedie-humaine").
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Photos Parallèles — content layer (types, static association copy, formatters).
 *
 * The catalog (artists, books, settings) now lives in PostgreSQL and is read via
 * `lib/queries.ts`. This module keeps the public TS types and the pure display
 * helpers the components rely on, plus the static association/collection/social
 * copy that is not yet database-backed (sourced from spec.md).
 */

export type Availability = "AVAILABLE" | "SOLD_OUT" | "COMING_SOON";
export type Currency = "EUR";

export interface BookSpecs {
  format: string;
  pages: string;
  binding: string;
  paper: string;
  printing: string;
}

export interface Artist {
  slug: string;
  name: string;
  /** Short label used as eyebrow on the detail page, e.g. "Artiste visuelle". */
  role: string;
  originCountry: string;
  baseCity: string;
  /** Full bio rendered to HTML from the stored Tiptap document. */
  bioHtml: string;
  /** Single-sentence lead pulled from the start of the bio. */
  lead: string;
  portrait: string;
  oeuvre: string;
  bookSlug: string;
}

export interface Book {
  slug: string;
  title: string;
  artistSlug: string;
  price: number;
  currency: Currency;
  availability: Availability;
  /** Placeholder cover: the artist's œuvre image. */
  cover: string;
  /** Inside spreads / title card shown on the book detail page. */
  gallery: string[];
  specs: BookSpecs;
  /** Description rendered to HTML from the stored Tiptap document. */
  descriptionHtml: string;
}

export interface Project {
  slug: string;
  title: string;
  /** Short type label, e.g. "Exposition", "Édition", "Workshop". */
  kind: string;
  year: string;
  location: string;
  /** Single-sentence introduction. */
  lead: string;
  /** Description rendered to HTML from the stored Tiptap document. */
  descriptionHtml: string;
  /** Hero / thumbnail image. */
  cover: string;
  /** Additional images shown in the project gallery. */
  gallery: string[];
}

export const association = {
  tagline: "Photos Parallèles : quand les regards se répondent",
  foundingYear: 2023,
  founders: ["Jean-Matthieu Gosselin", "Ullic Morard"],
  location: "près d'Annecy",
  presentation: [
    "Fondée en 2023 par Jean-Matthieu Gosselin et Ullic Morard, Photos Parallèles est une association photographique qui explore les territoires sensibles de l'image, de l'art et de la mémoire. Née de la rencontre de deux regards et d'une même passion pour la narration visuelle, elle rassemble des photographes, artistes et créateurs autour d'une réflexion commune : faire dialoguer les images, les styles, les époques, les récits et les émotions.",
    "À travers les correspondances visuelles, les mémoires croisées, les techniques artistiques et les narrations parallèles, Photos Parallèles développe une approche ouverte de la création contemporaine, où la photographie documentaire côtoie la photographie d'auteur, la vidéo, la peinture et les pratiques artistiques hybrides. L'association défend une vision de l'image comme espace de rencontre, de transmission et de questionnement du réel.",
    "Implantée aux portes d'Annecy, Photos Parallèles conçoit et organise des expositions (Ullic Morard et J-M Gosselin ont exposé récemment à Andorre, Annecy, Arles, Rennes…), workshops, conférences, publications — comme la collection « Le Souffle de l'Image », et des projets éditoriaux destinés à favoriser les échanges entre artistes et publics. Chaque initiative vise à créer des passerelles entre les disciplines, les générations et les sensibilités, dans un esprit d'ouverture et de partage.",
    "Particulièrement engagée dans l'accompagnement de la jeune création, Photos Parallèles s'attache à révéler de nouveaux talents et à offrir aux auteurs émergents des espaces de visibilité et d'expression. L'association se veut ainsi un laboratoire d'idées et d'images, où les parcours individuels se croisent pour construire des récits collectifs.",
    "Photos Parallèles, c'est la conviction que chaque image dialogue avec une autre, que chaque mémoire en éclaire une seconde, et que la photographie demeure l'un des plus puissants langages pour raconter le monde.",
  ],
} as const;

export const collection = {
  name: "Le Souffle de l'Image",
  blurb:
    "Huit photobooks au format poche (105 × 152 mm), 32 pages, couverture souple — une identité visuelle commune, la liberté de chaque auteur. Sortie au Festival d'Arles en juillet 2026, puis Annecy, Barcelone et Paris.",
  releaseInfo: "Sortie Festival d'Arles, juillet 2026 — puis Annecy, Barcelone, Paris.",
} as const;

export const social = {
  instagram: "https://www.instagram.com/photosparalleles/",
  instagramHandle: "@photosparalleles",
} as const;

// ---- Display helpers (pure) -----------------------------------------------

const AVAILABILITY_LABELS: Record<Availability, string> = {
  AVAILABLE: "Disponible",
  SOLD_OUT: "Épuisé",
  COMING_SOON: "Bientôt",
};

export function availabilityLabel(availability: Availability): string {
  return AVAILABILITY_LABELS[availability];
}

export function formatPrice(price: number, currency: Currency = "EUR"): string {
  const symbol = currency === "EUR" ? "€" : currency;
  return `${price} ${symbol}`;
}

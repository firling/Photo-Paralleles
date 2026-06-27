/**
 * Async data access for the public site. Reads the PostgreSQL catalog through
 * Prisma and maps rows to the public `Artist` / `Book` shapes from `content.ts`,
 * so the existing Server Components and cards keep compiling unchanged.
 *
 * Money is stored in cents in the database and exposed here as a euros number
 * (`price`) to match the `Book.price: number` contract the components expect.
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { renderRichText } from "@/lib/richtext";
import type {
  Artist,
  Availability,
  Book,
  BookSpecs,
  Currency,
} from "@/lib/content";

type BookWithArtist = Prisma.BookGetPayload<{ include: { artist: true } }>;
type ArtistWithBook = Prisma.ArtistGetPayload<{ include: { book: true } }>;

export interface SiteSettings {
  shippingFlatCents: number;
  currency: Currency;
  contactEmail: string | null;
  instagramUrl: string | null;
  showBoxset: boolean;
  /** Boxset price in euros (derived from `boxsetPriceCents`). */
  boxsetPrice: number;
}

const SETTINGS_DEFAULTS: SiteSettings = {
  shippingFlatCents: 600,
  currency: "EUR",
  contactEmail: null,
  instagramUrl: null,
  showBoxset: true,
  boxsetPrice: 130,
};

function mapBook(row: BookWithArtist): Book {
  return {
    slug: row.slug,
    title: row.title,
    artistSlug: row.artist.slug,
    price: row.priceCents / 100,
    currency: row.currency as Currency,
    availability: row.availability as Availability,
    cover: row.cover,
    specs: row.specs as unknown as BookSpecs,
    descriptionHtml: renderRichText(row.description),
  };
}

function mapArtist(row: ArtistWithBook): Artist {
  return {
    slug: row.slug,
    name: row.name,
    role: row.role,
    originCountry: row.originCountry,
    baseCity: row.baseCity,
    lead: row.lead,
    bioHtml: renderRichText(row.bio),
    portrait: row.portrait,
    oeuvre: row.oeuvre,
    bookSlug: row.book?.slug ?? "",
  };
}

export async function getArtists(): Promise<Artist[]> {
  const rows = await prisma.artist.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: { book: true },
  });
  return rows.map(mapArtist);
}

export async function getArtist(slug: string): Promise<Artist | null> {
  const row = await prisma.artist.findFirst({
    where: { slug, published: true },
    include: { book: true },
  });
  return row ? mapArtist(row) : null;
}

export async function getBooks(): Promise<Book[]> {
  const rows = await prisma.book.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: { artist: true },
  });
  return rows.map(mapBook);
}

export async function getBook(slug: string): Promise<Book | null> {
  const row = await prisma.book.findFirst({
    where: { slug, published: true },
    include: { artist: true },
  });
  return row ? mapBook(row) : null;
}

export async function getBookByArtist(
  artistSlug: string,
): Promise<Book | null> {
  const row = await prisma.book.findFirst({
    where: { published: true, artist: { slug: artistSlug } },
    include: { artist: true },
  });
  return row ? mapBook(row) : null;
}

export async function getArtistOfBook(book: Book): Promise<Artist | null> {
  return getArtist(book.artistSlug);
}

export async function getSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSetting.findUnique({
    where: { id: "singleton" },
  });
  if (!row) return SETTINGS_DEFAULTS;
  return {
    shippingFlatCents: row.shippingFlatCents,
    currency: row.currency as Currency,
    contactEmail: row.contactEmail,
    instagramUrl: row.instagramUrl,
    showBoxset: row.showBoxset,
    boxsetPrice: row.boxsetPriceCents / 100,
  };
}

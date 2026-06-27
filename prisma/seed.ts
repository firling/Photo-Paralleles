import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";
import { artists, books } from "./seed-data";
import { paragraphsToDoc } from "../lib/richtext";

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

/**
 * Build the bio rich text document. The public artist page renders the
 * dedicated `lead` field followed by the bio's body paragraphs (the first
 * authored paragraph restates the lead, so it was historically not shown). We
 * preserve that exact output by storing only the body paragraphs as rich text.
 */
function artistBioDoc(bio: string[]): Prisma.InputJsonValue {
  const body = bio.length > 1 ? bio.slice(1) : bio;
  return asJson(paragraphsToDoc(body));
}

// The Prisma CLI does not auto-load .env; load it before reading DATABASE_URL.
try {
  process.loadEnvFile();
} catch {
  // No .env file — rely on the ambient environment.
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedArtists(): Promise<Map<string, string>> {
  const slugToId = new Map<string, string>();
  for (const [index, artist] of artists.entries()) {
    const row = await prisma.artist.upsert({
      where: { slug: artist.slug },
      create: {
        slug: artist.slug,
        name: artist.name,
        role: artist.role,
        originCountry: artist.originCountry,
        baseCity: artist.baseCity,
        lead: artist.lead,
        bio: artistBioDoc(artist.bio),
        portrait: artist.portrait,
        oeuvre: artist.oeuvre,
        order: index,
      },
      update: {
        name: artist.name,
        role: artist.role,
        originCountry: artist.originCountry,
        baseCity: artist.baseCity,
        lead: artist.lead,
        bio: artistBioDoc(artist.bio),
        portrait: artist.portrait,
        oeuvre: artist.oeuvre,
        order: index,
      },
    });
    slugToId.set(artist.slug, row.id);
  }
  return slugToId;
}

async function seedBooks(artistIdBySlug: Map<string, string>): Promise<void> {
  for (const [index, book] of books.entries()) {
    const artistId = artistIdBySlug.get(book.artistSlug);
    if (!artistId) {
      throw new Error(
        `Book "${book.slug}" references unknown artist "${book.artistSlug}".`,
      );
    }
    const specs = asJson(book.specs);
    await prisma.book.upsert({
      where: { slug: book.slug },
      create: {
        slug: book.slug,
        title: book.title,
        priceCents: book.price * 100,
        currency: book.currency,
        availability: book.availability,
        cover: book.cover,
        specs,
        description: asJson(paragraphsToDoc(book.description)),
        order: index,
        artistId,
      },
      update: {
        title: book.title,
        priceCents: book.price * 100,
        currency: book.currency,
        availability: book.availability,
        cover: book.cover,
        specs,
        description: asJson(paragraphsToDoc(book.description)),
        order: index,
        artistId,
      },
    });
  }
}

async function seedSettings(): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      contactEmail: "contact@photosparalleles.fr",
      instagramUrl: "https://www.instagram.com/photosparalleles/",
    },
    update: {},
  });
}

async function seedAdmin(): Promise<boolean> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "⚠️  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user seed.",
    );
    return false;
  }
  const passwordHash = await hash(password);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });
  return true;
}

async function main(): Promise<void> {
  const artistIdBySlug = await seedArtists();
  await seedBooks(artistIdBySlug);
  await seedSettings();
  const adminSeeded = await seedAdmin();

  const [artistCount, bookCount, settingsCount, adminCount] = await Promise.all([
    prisma.artist.count(),
    prisma.book.count(),
    prisma.siteSetting.count(),
    prisma.adminUser.count(),
  ]);

  console.log("\n✅ Seed complete:");
  console.log(`   • Artists:  ${artistCount}`);
  console.log(`   • Books:    ${bookCount}`);
  console.log(`   • Settings: ${settingsCount}`);
  console.log(`   • Admins:   ${adminCount}${adminSeeded ? "" : " (skipped)"}`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

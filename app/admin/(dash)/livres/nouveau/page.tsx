import Link from "next/link";
import { prisma } from "@/lib/db";
import BookForm, { type BookFormInitial } from "../BookForm";
import { createBookAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewBookPage() {
  const [artists, bookCount] = await Promise.all([
    prisma.artist.findMany({
      where: { book: { is: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.book.count(),
  ]);

  const initial: BookFormInitial = {
    title: "",
    slug: "",
    artistId: "",
    priceEuros: "18",
    currency: "EUR",
    availability: "AVAILABLE",
    cover: "",
    gallery: [],
    order: String(bookCount),
    published: true,
    format: "Poche · 105 × 152 mm",
    pages: "32 pages",
    binding: "Couverture souple · reliure 2 agrafes métal",
    paper: "Arena Natural Smooth · 140 / 240 g/m²",
    printing: "Noir & blanc / Quadri",
    description: null,
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <p style={{ marginBottom: 4 }}>
            <Link href="/admin/livres" style={{ color: "var(--accent)" }}>
              ← Livres
            </Link>
          </p>
          <h1>Nouveau livre</h1>
        </div>
      </div>

      {artists.length === 0 ? (
        <div className="adm-alert adm-alert--info" style={{ maxWidth: 760 }}>
          Tous les artistes sont déjà liés à un livre. Créez d&apos;abord un
          artiste (ou détachez un livre existant) avant d&apos;ajouter un titre.
        </div>
      ) : (
        <div className="adm-card">
          <BookForm
            action={createBookAction}
            artists={artists}
            initial={initial}
            submitLabel="Créer le livre"
          />
        </div>
      )}
    </>
  );
}

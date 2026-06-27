import type { Metadata } from "next";
import Link from "next/link";
import BookCard from "@/components/BookCard";
import { collection, formatPrice } from "@/lib/content";
import { getBooks, getSettings } from "@/lib/queries";

// Catalog is DB-backed and editable from the back-office → render dynamically
// so edits appear instantly and the build never requires the database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: collection.name,
  description: collection.blurb,
};

export default async function ShopPage() {
  const [books, settings] = await Promise.all([getBooks(), getSettings()]);
  const boxsetPrice = formatPrice(settings.boxsetPrice, settings.currency);

  return (
    <>
      <div className="wrap page-head">
        <p className="label eyebrow label--accent">La collection · 8 photographes</p>
        <h1>{collection.name}</h1>
        <p>
          Huit livres au format poche (105 × 152 mm), 32 pages, couverture souple
          — une identité visuelle commune, la liberté de chaque auteur. Conçus
          comme des objets accessibles et sensibles, à découvrir, collectionner
          et partager.
        </p>
      </div>

      <main className="wrap" style={{ paddingBottom: "clamp(64px,8vw,120px)" }}>
        <div className="books">
          {books.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>

        {settings.showBoxset && (
          <div
            className="box"
            style={{
              marginTop: 48,
              display: "flex",
              gap: 28,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p className="label">Le coffret</p>
              <h3
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "var(--step-2)",
                  margin: "8px 0",
                }}
              >
                Les 8 titres
              </h3>
              <p style={{ color: "var(--muted)", maxWidth: "42ch" }}>
                La collection complète, expédiée dès la sortie au Festival
                d&apos;Arles 2026.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "var(--step-2)" }}>
                {boxsetPrice}
              </div>
              <Link className="btn" href="/livres" style={{ marginTop: 10 }}>
                Ajouter le coffret
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

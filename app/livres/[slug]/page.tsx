import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collection, availabilityLabel, formatPrice } from "@/lib/content";
import { getBook, getArtistOfBook } from "@/lib/queries";
import BookBuyPanel from "@/components/BookBuyPanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) return { title: "Livre" };
  return { title: book.title };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();

  const artist = await getArtistOfBook(book);

  return (
    <>
      <div className="wrap" style={{ paddingTop: 28 }}>
        <p className="label">
          <Link href="/livres" style={{ color: "var(--muted)" }}>
            {collection.name}
          </Link>
          &nbsp;·&nbsp; {book.title}
        </p>
      </div>

      <main className="wrap section" style={{ paddingTop: 36 }}>
        <div className="product">
          <figure className="product__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={book.cover} alt={`Couverture — ${book.title}`} />
          </figure>

          <div className="product__info">
            <p className="label eyebrow label--accent">{collection.name}</p>
            <h1>{book.title}</h1>
            {artist && (
              <p style={{ color: "var(--muted)", marginTop: 8 }}>
                par{" "}
                <Link
                  href={`/artistes/${artist.slug}`}
                  style={{ color: "var(--ink)", borderBottom: "1px solid var(--line)" }}
                >
                  {artist.name}
                </Link>
              </p>
            )}

            <div className="product__price">
              {formatPrice(book.price, book.currency)}
            </div>
            <span className="tag-avail">{availabilityLabel(book.availability)}</span>

            <BookBuyPanel
              slug={book.slug}
              title={book.title}
              priceCents={Math.round(book.price * 100)}
              cover={book.cover}
              isAvailable={book.availability === "AVAILABLE"}
            />
            <p className="note">
              Livraison — forfait unique.{" "}
              <strong style={{ color: "var(--ink-soft)" }}>
                Paiement en ligne bientôt disponible.
              </strong>
            </p>

            <ul className="specs">
              <li>
                <span>Format</span>
                <span>{book.specs.format}</span>
              </li>
              <li>
                <span>Pages</span>
                <span>{book.specs.pages}</span>
              </li>
              <li>
                <span>Reliure</span>
                <span>{book.specs.binding}</span>
              </li>
              <li>
                <span>Papier</span>
                <span>{book.specs.paper}</span>
              </li>
              <li>
                <span>Impression</span>
                <span>{book.specs.printing}</span>
              </li>
            </ul>

            <div
              className="richtext"
              style={{ marginTop: 8 }}
              dangerouslySetInnerHTML={{ __html: book.descriptionHtml }}
            />
          </div>
        </div>
      </main>
    </>
  );
}

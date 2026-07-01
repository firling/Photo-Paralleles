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
                <a
                  href="#auteur"
                  style={{ color: "var(--ink)", borderBottom: "1px solid var(--line)" }}
                >
                  {artist.name}
                </a>
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
                <span>Tirage</span>
                <span>Édition limitée · {book.copiesTotal} exemplaires</span>
              </li>
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

        {/* Inside the book — title card + spreads */}
        {book.gallery.length > 0 && (
          <section className="book-gallery">
            <p className="label eyebrow" style={{ marginBottom: 24 }}>
              Feuilleter l&apos;ouvrage
            </p>
            <div className="book-gallery__grid">
              {book.gallery.map((src, i) => (
                <figure
                  key={src}
                  className={`book-gallery__item${i === 0 ? " book-gallery__item--lead" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${book.title} — vue ${i + 1}`} loading="lazy" />
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* The author — folded in from the former standalone artist page */}
        {artist && (
          <section id="auteur" className="book-author">
            <hr className="rule" style={{ margin: "0 0 clamp(40px,5vw,72px)" }} />
            <div className="detail">
              <figure className="detail__photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artist.portrait} alt={`Portrait de ${artist.name}`} />
              </figure>
              <div className="detail__bio">
                <p className="label eyebrow label--accent">
                  L&apos;auteur · {artist.role}
                  {artist.baseCity ? ` · ${artist.baseCity}` : ""}
                </p>
                <h2 style={{ fontSize: "var(--step-3)", margin: "16px 0 28px" }}>
                  {artist.name}
                </h2>
                <p className="lead">{artist.lead}</p>
                <div
                  className="richtext"
                  dangerouslySetInnerHTML={{ __html: artist.bioHtml }}
                />
              </div>
            </div>

            {artist.oeuvre && (
              <figure className="work">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artist.oeuvre} alt={`Œuvre de ${artist.name}`} />
                <figcaption className="label" style={{ marginTop: 12 }}>
                  {artist.name} — extrait
                </figcaption>
              </figure>
            )}
          </section>
        )}
      </main>
    </>
  );
}

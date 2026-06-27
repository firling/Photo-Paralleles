import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, collection } from "@/lib/content";
import { getArtist, getBookByArtist } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) return { title: "Artiste" };
  return { title: artist.name, description: artist.lead };
}

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();

  const book = await getBookByArtist(artist.slug);

  return (
    <>
      <div className="wrap" style={{ paddingTop: 28 }}>
        <p className="label">
          <Link href="/artistes" style={{ color: "var(--muted)" }}>
            Artistes
          </Link>
          &nbsp;·&nbsp; {artist.name}
        </p>
      </div>

      <main className="wrap section" style={{ paddingTop: 36 }}>
        <div className="detail">
          <figure className="detail__photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artist.portrait} alt={`Portrait de ${artist.name}`} />
          </figure>
          <div className="detail__bio">
            <p className="label eyebrow label--accent">
              {artist.role} · {artist.originCountry}
            </p>
            <h1 style={{ fontSize: "var(--step-3)", margin: "16px 0 28px" }}>
              {artist.name}
            </h1>
            <p className="lead">{artist.lead}</p>
            <div
              className="richtext"
              dangerouslySetInnerHTML={{ __html: artist.bioHtml }}
            />

            {book && (
              <div className="crosslink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={book.cover} alt={book.title} />
                <div className="crosslink__body">
                  <p className="label">Son livre</p>
                  <h3
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "var(--step-1)",
                      margin: "6px 0",
                    }}
                  >
                    {book.title}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "var(--step--1)" }}>
                    {collection.name} · {formatPrice(book.price, book.currency)}
                  </p>
                </div>
                <Link className="btn btn--ghost" href={`/livres/${book.slug}`}>
                  Voir le livre
                </Link>
              </div>
            )}
          </div>
        </div>

        <figure className="work">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artist.oeuvre} alt={`Œuvre de ${artist.name}`} />
          {book && (
            <figcaption className="label" style={{ marginTop: 12 }}>
              Extrait de « {book.title} »
            </figcaption>
          )}
        </figure>
      </main>
    </>
  );
}

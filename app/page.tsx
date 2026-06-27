import Link from "next/link";
import BookCard from "@/components/BookCard";
import ArtistCard from "@/components/ArtistCard";
import { collection } from "@/lib/content";
import { getArtist, getArtists, getBooks } from "@/lib/queries";

// Catalog is DB-backed and editable from the back-office → render dynamically
// so edits appear instantly and the build never requires the database.
export const dynamic = "force-dynamic";

const HERO_ARTIST_SLUG = "francois-xavier-seren";

export default async function HomePage() {
  const [heroArtist, books, artists] = await Promise.all([
    getArtist(HERO_ARTIST_SLUG),
    getBooks(),
    getArtists(),
  ]);
  const teaserBooks = books.slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="wrap hero">
        <div className="hero__text">
          <p className="label eyebrow label--accent">
            Association photographique · depuis 2023
          </p>
          <h1 className="hero__title">
            Quand les regards <em>se répondent</em>
          </h1>
          <p className="hero__lead">
            Photos Parallèles explore les territoires sensibles de l&apos;image,
            de l&apos;art et de la mémoire — et fait dialoguer les styles, les
            époques, les récits et les émotions.
          </p>
          <div className="hero__cta">
            <Link className="btn" href="/livres">
              Découvrir la collection
            </Link>
            <Link className="btn btn--ghost" href="/artistes">
              Les artistes
            </Link>
          </div>
        </div>
        {heroArtist && (
          <figure className="hero__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroArtist.oeuvre} alt={`Œuvre — ${heroArtist.name}`} />
            <figcaption className="label">
              {heroArtist.name} — « La Comédie humaine »
            </figcaption>
          </figure>
        )}
      </section>

      <hr className="rule" />

      {/* COLLECTION */}
      <section className="wrap section">
        <div className="section-head">
          <div>
            <p className="label eyebrow">La collection</p>
            <h2 style={{ marginTop: 14 }}>{collection.name}</h2>
          </div>
          <p>
            Huit photographes, huit univers, huit récits visuels singuliers. Des
            livres au format poche, à découvrir, collectionner et partager.
          </p>
          <Link href="/livres">Toute la collection</Link>
        </div>

        <div className="books">
          {teaserBooks.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      </section>

      {/* ARTISTS */}
      <section
        className="section"
        style={{ background: "var(--paper-2)", borderBlock: "1px solid var(--line)" }}
      >
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="label eyebrow">Les auteurs</p>
              <h2 style={{ marginTop: 14 }}>Huit regards</h2>
            </div>
            <p>
              Photographes, artistes et créateurs réunis autour d&apos;une même
              passion pour la narration visuelle.
            </p>
            <Link href="/artistes">Tous les artistes</Link>
          </div>

          <div className="artists artists--mini">
            {artists.map((artist) => (
              <ArtistCard key={artist.slug} artist={artist} variant="mini" />
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="wrap section" style={{ textAlign: "center" }}>
        <p className="label eyebrow" style={{ justifyContent: "center" }}>
          Notre conviction
        </p>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 300,
            fontSize: "var(--step-2)",
            lineHeight: 1.25,
            maxWidth: "24ch",
            margin: "24px auto 0",
          }}
        >
          Chaque image dialogue avec une autre, chaque mémoire en éclaire une
          seconde.
        </p>
      </section>
    </>
  );
}

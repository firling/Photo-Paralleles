import Link from "next/link";
import type { Metadata } from "next";
import { association } from "@/lib/content";
import { getArtist } from "@/lib/queries";

// The landing page is the association page: a hero followed by the association
// presentation. The catalog is DB-backed → render dynamically so the hero œuvre
// reflects back-office edits and the build never requires the database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Photos Parallèles — L'association" },
  description: association.tagline,
};

const HERO_ARTIST_SLUG = "francois-xavier-seren";

export default async function HomePage() {
  const heroArtist = await getArtist(HERO_ARTIST_SLUG);
  const [lead, ...rest] = association.presentation;
  // The closing paragraph reads as a manifesto → set it apart as a pull-quote.
  const manifesto = rest[rest.length - 1];
  const body = rest.slice(0, -1);

  return (
    <>
      {/* HERO */}
      <section className="wrap hero">
        <div className="hero__text">
          <p className="label eyebrow label--accent">
            Association photographique · depuis {association.foundingYear}
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
            <Link className="btn btn--ghost" href="/projets">
              Nos projets
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

      {/* ASSOCIATION */}
      <section className="assoc">
        <div className="wrap assoc__grid">
          <aside className="assoc__aside">
            <p className="label eyebrow label--accent">L&apos;association</p>
            <h2 className="assoc__title">
              Un laboratoire d&apos;idées <em>et d&apos;images</em>
            </h2>
            <dl className="assoc__facts">
              <div>
                <dt>Depuis</dt>
                <dd>{association.foundingYear}</dd>
              </div>
              <div>
                <dt>Fondateurs</dt>
                <dd>{association.founders.join(" & ")}</dd>
              </div>
              <div>
                <dt>Ancrage</dt>
                <dd>{association.location}</dd>
              </div>
            </dl>
            <Link className="btn btn--ghost assoc__cta" href="/contact">
              Nous écrire
            </Link>
          </aside>

          <div className="assoc__body">
            <p className="assoc__lead">{lead}</p>
            {body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            <blockquote className="assoc__quote">{manifesto}</blockquote>
          </div>
        </div>
      </section>
    </>
  );
}

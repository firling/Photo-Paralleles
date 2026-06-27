import type { Metadata } from "next";
import ArtistCard from "@/components/ArtistCard";
import { getArtists } from "@/lib/queries";

// Catalog is DB-backed and editable from the back-office → render dynamically
// so edits appear instantly and the build never requires the database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Les artistes",
  description:
    "Huit photographes et artistes visuels que l'association Photos Parallèles accompagne et expose.",
};

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <>
      <div className="wrap page-head">
        <p className="label eyebrow label--accent">Les auteurs</p>
        <h1>Les artistes</h1>
        <p>
          Huit photographes et artistes visuels que l&apos;association accompagne
          et expose — entre photographie documentaire, photographie d&apos;auteur,
          vidéo et pratiques hybrides.
        </p>
      </div>

      <main className="wrap" style={{ paddingBottom: "clamp(64px,8vw,120px)" }}>
        <div className="artists">
          {artists.map((artist) => (
            <ArtistCard key={artist.slug} artist={artist} />
          ))}
        </div>
      </main>
    </>
  );
}

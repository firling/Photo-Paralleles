import Link from "next/link";
import { prisma } from "@/lib/db";
import ArtistForm, { type ArtistFormInitial } from "../ArtistForm";
import { createArtistAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewArtistPage() {
  const count = await prisma.artist.count();

  const initial: ArtistFormInitial = {
    name: "",
    slug: "",
    role: "",
    originCountry: "",
    baseCity: "",
    lead: "",
    portrait: "",
    oeuvre: "",
    order: String(count),
    published: true,
    bio: null,
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <p style={{ marginBottom: 4 }}>
            <Link href="/admin/artistes" style={{ color: "var(--accent)" }}>
              ← Artistes
            </Link>
          </p>
          <h1>Nouvel artiste</h1>
        </div>
      </div>

      <div className="adm-card">
        <ArtistForm
          action={createArtistAction}
          initial={initial}
          submitLabel="Créer l'artiste"
        />
      </div>
    </>
  );
}

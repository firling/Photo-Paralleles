import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";
import ArtistForm, { type ArtistFormInitial } from "../ArtistForm";
import { updateArtistAction, deleteArtistAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: { book: true },
  });
  if (!artist) notFound();

  const initial: ArtistFormInitial = {
    name: artist.name,
    slug: artist.slug,
    role: artist.role,
    originCountry: artist.originCountry,
    baseCity: artist.baseCity,
    lead: artist.lead,
    portrait: artist.portrait,
    oeuvre: artist.oeuvre,
    order: String(artist.order),
    published: artist.published,
    bio: artist.bio,
  };

  const updateAction = updateArtistAction.bind(null, id);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <p style={{ marginBottom: 4 }}>
            <Link href="/admin/artistes" style={{ color: "var(--accent)" }}>
              ← Artistes
            </Link>
          </p>
          <h1>{artist.name}</h1>
          <p>
            <Link
              href={`/artistes/${artist.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Voir sur le site ↗
            </Link>
          </p>
        </div>
        {artist.book ? (
          <span className="adm-badge adm-badge--info" title="Détachez le livre avant de supprimer">
            Livre lié : {artist.book.title}
          </span>
        ) : (
          <DeleteButton
            action={deleteArtistAction}
            id={artist.id}
            label="Supprimer"
            confirmMessage={`Supprimer définitivement « ${artist.name} » ?`}
          />
        )}
      </div>

      {error === "linked-book" ? (
        <div className="adm-alert adm-alert--error" style={{ maxWidth: 760, marginBottom: 20 }}>
          Impossible de supprimer cet artiste : un livre lui est encore associé.
          Supprimez ou réattribuez d&apos;abord le livre lié.
        </div>
      ) : null}

      <div className="adm-card">
        <ArtistForm
          action={updateAction}
          initial={initial}
          submitLabel="Enregistrer"
        />
      </div>
    </>
  );
}

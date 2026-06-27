import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { centsToEurosInput } from "@/lib/admin";
import type { Availability, BookSpecs } from "@/lib/content";
import DeleteButton from "@/components/admin/DeleteButton";
import BookForm, { type BookFormInitial } from "../BookForm";
import { updateBookAction, deleteBookAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: { artist: true },
  });
  if (!book) notFound();

  const artists = await prisma.artist.findMany({
    where: { OR: [{ book: { is: null } }, { id: book.artistId }] },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const specs = book.specs as unknown as BookSpecs;

  const initial: BookFormInitial = {
    title: book.title,
    slug: book.slug,
    artistId: book.artistId,
    priceEuros: centsToEurosInput(book.priceCents),
    currency: book.currency,
    availability: book.availability as Availability,
    cover: book.cover,
    order: String(book.order),
    published: book.published,
    format: specs.format ?? "",
    pages: specs.pages ?? "",
    binding: specs.binding ?? "",
    paper: specs.paper ?? "",
    printing: specs.printing ?? "",
    description: book.description,
  };

  const updateAction = updateBookAction.bind(null, id);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <p style={{ marginBottom: 4 }}>
            <Link href="/admin/livres" style={{ color: "var(--accent)" }}>
              ← Livres
            </Link>
          </p>
          <h1>{book.title}</h1>
          <p>
            <Link href={`/livres/${book.slug}`} target="_blank" rel="noreferrer">
              Voir sur le site ↗
            </Link>
          </p>
        </div>
        <DeleteButton
          action={deleteBookAction}
          id={book.id}
          label="Supprimer"
          confirmMessage={`Supprimer définitivement « ${book.title} » ?`}
        />
      </div>

      <div className="adm-card">
        <BookForm
          action={updateAction}
          artists={artists}
          initial={initial}
          submitLabel="Enregistrer"
        />
      </div>
    </>
  );
}

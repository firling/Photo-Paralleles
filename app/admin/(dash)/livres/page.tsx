import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  formatCents,
  AVAILABILITY_LABELS,
  AVAILABILITY_TONE,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function BooksListPage() {
  const books = await prisma.book.findMany({
    orderBy: { order: "asc" },
    include: { artist: true },
  });

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Livres</h1>
          <p>
            {books.length} livre{books.length > 1 ? "s" : ""} au catalogue.
          </p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/livres/nouveau" className="adm-btn adm-btn--accent adm-btn--sm">
            Nouveau livre
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="adm-empty">
          <h3>Aucun livre</h3>
          <p>Ajoutez un premier titre à la collection.</p>
        </div>
      ) : (
        <div className="adm-tablewrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Couv.</th>
                <th>Titre</th>
                <th>Auteur</th>
                <th className="adm-num">Prix</th>
                <th>Disponibilité</th>
                <th>Publié</th>
                <th className="adm-num">Ordre</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="adm-thumb" src={book.cover} alt="" />
                  </td>
                  <td>
                    <Link href={`/admin/livres/${book.id}`}>{book.title}</Link>
                    <br />
                    <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                      {book.slug}
                    </span>
                  </td>
                  <td>{book.artist.name}</td>
                  <td className="adm-num">{formatCents(book.priceCents)}</td>
                  <td>
                    <span
                      className={`adm-badge adm-badge--${AVAILABILITY_TONE[book.availability]}`}
                    >
                      {AVAILABILITY_LABELS[book.availability]}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`adm-badge adm-badge--${book.published ? "ok" : "muted"}`}
                    >
                      {book.published ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td className="adm-num">{book.order}</td>
                  <td className="adm-num">
                    <Link href={`/admin/livres/${book.id}`}>Éditer</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

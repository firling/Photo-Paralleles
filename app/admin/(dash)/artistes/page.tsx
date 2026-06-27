import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ArtistsListPage() {
  const artists = await prisma.artist.findMany({
    orderBy: { order: "asc" },
    include: { book: true },
  });

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Artistes</h1>
          <p>
            {artists.length} artiste{artists.length > 1 ? "s" : ""}.
          </p>
        </div>
        <div className="adm-actions">
          <Link
            href="/admin/artistes/nouveau"
            className="adm-btn adm-btn--accent adm-btn--sm"
          >
            Nouvel artiste
          </Link>
        </div>
      </div>

      {artists.length === 0 ? (
        <div className="adm-empty">
          <h3>Aucun artiste</h3>
          <p>Ajoutez un premier artiste au catalogue.</p>
        </div>
      ) : (
        <div className="adm-tablewrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Portrait</th>
                <th>Nom</th>
                <th>Origine / Ville</th>
                <th>Livre lié</th>
                <th>Publié</th>
                <th className="adm-num">Ordre</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="adm-thumb adm-thumb--sq" src={artist.portrait} alt="" />
                  </td>
                  <td>
                    <Link href={`/admin/artistes/${artist.id}`}>{artist.name}</Link>
                    <br />
                    <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                      {artist.role}
                    </span>
                  </td>
                  <td>
                    {[artist.originCountry, artist.baseCity]
                      .filter(Boolean)
                      .join(" · ")}
                  </td>
                  <td>
                    {artist.book ? (
                      <Link href={`/admin/livres/${artist.book.id}`}>
                        {artist.book.title}
                      </Link>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`adm-badge adm-badge--${artist.published ? "ok" : "muted"}`}
                    >
                      {artist.published ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td className="adm-num">{artist.order}</td>
                  <td className="adm-num">
                    <Link href={`/admin/artistes/${artist.id}`}>Éditer</Link>
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

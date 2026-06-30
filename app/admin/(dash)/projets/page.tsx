import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage() {
  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Projets</h1>
          <p>
            {projects.length} projet{projects.length > 1 ? "s" : ""}.
          </p>
        </div>
        <div className="adm-actions">
          <Link
            href="/admin/projets/nouveau"
            className="adm-btn adm-btn--accent adm-btn--sm"
          >
            Nouveau projet
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="adm-empty">
          <h3>Aucun projet</h3>
          <p>Ajoutez un premier projet (exposition, édition, workshop…).</p>
        </div>
      ) : (
        <div className="adm-tablewrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Titre</th>
                <th>Type</th>
                <th>Année / Lieu</th>
                <th>Publié</th>
                <th className="adm-num">Ordre</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="adm-thumb adm-thumb--sq" src={project.cover} alt="" />
                  </td>
                  <td>
                    <Link href={`/admin/projets/${project.id}`}>
                      {project.title}
                    </Link>
                  </td>
                  <td>{project.kind}</td>
                  <td>
                    {[project.year, project.location].filter(Boolean).join(" · ")}
                  </td>
                  <td>
                    <span
                      className={`adm-badge adm-badge--${project.published ? "ok" : "muted"}`}
                    >
                      {project.published ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td className="adm-num">{project.order}</td>
                  <td className="adm-num">
                    <Link href={`/admin/projets/${project.id}`}>Éditer</Link>
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

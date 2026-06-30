import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";
import ProjectForm, { type ProjectFormInitial } from "../ProjectForm";
import { updateProjectAction, deleteProjectAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const gallery = Array.isArray(project.gallery)
    ? (project.gallery.filter((v) => typeof v === "string") as string[])
    : [];

  const initial: ProjectFormInitial = {
    title: project.title,
    slug: project.slug,
    kind: project.kind,
    year: project.year,
    location: project.location,
    lead: project.lead,
    cover: project.cover,
    gallery,
    order: String(project.order),
    published: project.published,
    description: project.description,
  };

  const updateAction = updateProjectAction.bind(null, id);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <p style={{ marginBottom: 4 }}>
            <Link href="/admin/projets" style={{ color: "var(--accent)" }}>
              ← Projets
            </Link>
          </p>
          <h1>{project.title}</h1>
          <p>
            <Link
              href={`/projets/${project.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Voir sur le site ↗
            </Link>
          </p>
        </div>
        <DeleteButton
          action={deleteProjectAction}
          id={project.id}
          label="Supprimer"
          confirmMessage={`Supprimer définitivement « ${project.title} » ?`}
        />
      </div>

      <div className="adm-card">
        <ProjectForm
          action={updateAction}
          initial={initial}
          submitLabel="Enregistrer"
        />
      </div>
    </>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import ProjectForm, { type ProjectFormInitial } from "../ProjectForm";
import { createProjectAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const count = await prisma.project.count();

  const initial: ProjectFormInitial = {
    title: "",
    slug: "",
    kind: "",
    year: "",
    location: "",
    lead: "",
    cover: "",
    gallery: [],
    order: String(count),
    published: true,
    description: null,
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <p style={{ marginBottom: 4 }}>
            <Link href="/admin/projets" style={{ color: "var(--accent)" }}>
              ← Projets
            </Link>
          </p>
          <h1>Nouveau projet</h1>
        </div>
      </div>

      <div className="adm-card">
        <ProjectForm
          action={createProjectAction}
          initial={initial}
          submitLabel="Créer le projet"
        />
      </div>
    </>
  );
}

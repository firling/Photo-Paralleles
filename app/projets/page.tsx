import type { Metadata } from "next";
import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "@/lib/queries";

// Projects are DB-backed and editable from the back-office → render dynamically.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Les projets",
  description:
    "Expositions, éditions et collaborations conçues par l'association Photos Parallèles.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <div className="wrap page-head">
        <p className="label eyebrow label--accent">Ce que nous faisons</p>
        <h1>Les projets</h1>
        <p>
          Expositions, éditions, workshops et rencontres — autant de passerelles
          entre les disciplines, les générations et les sensibilités, dans un
          esprit d&apos;ouverture et de partage.
        </p>
      </div>

      <main className="wrap" style={{ paddingBottom: "clamp(64px,8vw,120px)" }}>
        {projects.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Aucun projet pour le moment.</p>
        ) : (
          <div className="projects">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

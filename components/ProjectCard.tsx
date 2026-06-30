import Link from "next/link";
import type { Project } from "@/lib/content";

/** Project teaser card used on the projects grid and the home page. */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link className="project-card" href={`/projets/${project.slug}`}>
      <div className="project-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.cover} alt={project.title} />
        <span className="project-card__kind">{project.kind}</span>
      </div>
      <div className="project-card__title">{project.title}</div>
      <div className="project-card__meta">
        {[project.year, project.location].filter(Boolean).join(" · ")}
      </div>
      <p className="project-card__lead">{project.lead}</p>
    </Link>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Projet" };
  return { title: project.title, description: project.lead };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <>
      <div className="wrap" style={{ paddingTop: 28 }}>
        <p className="label">
          <Link href="/projets" style={{ color: "var(--muted)" }}>
            Projets
          </Link>
          &nbsp;·&nbsp; {project.title}
        </p>
      </div>

      <main className="wrap section" style={{ paddingTop: 28 }}>
        {project.cover && (
          <figure className="project-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.cover} alt={project.title} />
          </figure>
        )}

        <div className="detail" style={{ alignItems: "start" }}>
          <div>
            <p className="label eyebrow label--accent">{project.kind}</p>
            <h1 style={{ fontSize: "var(--step-3)", margin: "16px 0 0" }}>
              {project.title}
            </h1>
            <ul className="project-meta">
              {project.year && (
                <li>
                  Année <strong>{project.year}</strong>
                </li>
              )}
              {project.location && (
                <li>
                  Lieu <strong>{project.location}</strong>
                </li>
              )}
            </ul>
          </div>

          <div className="detail__bio project-body">
            <p className="lead">{project.lead}</p>
            <div
              className="richtext"
              dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
            />
          </div>
        </div>

        {project.gallery.length > 0 && (
          <section className="project-gallery">
            {project.gallery.map((src, i) => (
              <figure key={src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${project.title} — vue ${i + 1}`} loading="lazy" />
              </figure>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

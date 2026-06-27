import type { Metadata } from "next";
import { association } from "@/lib/content";

export const metadata: Metadata = {
  title: "L'association",
  description: association.tagline,
};

export default function AssociationPage() {
  const [lead, ...rest] = association.presentation;

  return (
    <>
      <div className="wrap page-head">
        <p className="label eyebrow label--accent">L&apos;association</p>
        <h1>Quand les regards se répondent</h1>
        <p>
          Fondée en {association.foundingYear} par {association.founders.join(" et ")},{" "}
          {association.location}.
        </p>
      </div>

      <main
        className="wrap prose"
        style={{ paddingBottom: "clamp(64px,8vw,120px)" }}
      >
        <p className="lead">{lead}</p>
        {rest.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </main>
    </>
  );
}

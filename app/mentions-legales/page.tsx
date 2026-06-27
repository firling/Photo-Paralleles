import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <div className="wrap page-head">
        <p className="label eyebrow label--accent">Informations légales</p>
        <h1>Mentions légales</h1>
        <p>Éditeur, hébergeur et informations légales de Photos Parallèles.</p>
      </div>

      <main
        className="wrap prose"
        style={{ paddingBottom: "clamp(64px,8vw,120px)" }}
      >
        <p className="lead">Contenu à fournir par le client.</p>
        <p>
          Cette page accueillera l&apos;identité de l&apos;éditeur (association
          Photos Parallèles), le directeur de la publication, les coordonnées de
          l&apos;hébergeur ainsi que les informations légales requises. Les textes
          définitifs seront ajoutés dans un prochain incrément.
        </p>
      </main>
    </>
  );
}

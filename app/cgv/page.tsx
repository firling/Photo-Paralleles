import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
};

export default function CgvPage() {
  return (
    <>
      <div className="wrap page-head">
        <p className="label eyebrow label--accent">Boutique</p>
        <h1>Conditions générales de vente</h1>
        <p>
          Conditions de vente, livraison et droit de rétractation de la boutique
          Photos Parallèles.
        </p>
      </div>

      <main
        className="wrap prose"
        style={{ paddingBottom: "clamp(64px,8vw,120px)" }}
      >
        <p className="lead">Contenu à fournir par le client.</p>
        <p>
          Cette page détaillera les modalités de commande et de paiement, les
          frais et délais de livraison (forfait unique), le droit de rétractation
          ainsi que le service après-vente. Les textes définitifs seront ajoutés
          dans un prochain incrément.
        </p>
      </main>
    </>
  );
}

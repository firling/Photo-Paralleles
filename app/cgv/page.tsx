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
        className="wrap prose richtext"
        style={{ paddingBottom: "clamp(64px,8vw,120px)" }}
      >
        <p className="lead">
          Les présentes conditions générales de vente (CGV) régissent les ventes
          de produits proposés par l&apos;association Photos Parallèles sur son
          site. Toute commande implique l&apos;acceptation sans réserve des
          présentes CGV.
        </p>

        <h2>1. Produits</h2>
        <p>
          Les produits proposés sont ceux figurant sur le site, dans la limite
          des stocks disponibles. Chaque ouvrage est édité en tirage limité. Les
          photographies et descriptifs sont fournis à titre indicatif et
          n&apos;engagent pas l&apos;éditeur en cas d&apos;erreur ou
          d&apos;omission.
        </p>

        <h2>2. Prix</h2>
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises, hors frais de
          livraison. L&apos;association se réserve le droit de modifier ses prix
          à tout moment, étant entendu que le prix applicable est celui en
          vigueur au moment de la validation de la commande.
        </p>

        <h2>3. Commande</h2>
        <p>
          La commande est validée après confirmation par l&apos;acheteur du
          récapitulatif de son panier. Un courriel de confirmation récapitulant
          la commande est adressé à l&apos;acheteur.
        </p>

        <h2>4. Paiement</h2>
        <p>
          Le règlement s&apos;effectue selon les moyens de paiement proposés lors
          de la validation de la commande. La commande n&apos;est traitée
          qu&apos;après confirmation du paiement.
        </p>

        <h2>5. Livraison</h2>
        <p>
          Les produits sont expédiés à l&apos;adresse indiquée par
          l&apos;acheteur, moyennant un forfait de livraison unique précisé lors
          de la commande. Les délais de livraison sont donnés à titre indicatif ;
          un retard ne peut donner lieu à l&apos;annulation de la commande ni au
          versement de dommages et intérêts.
        </p>

        <h2>6. Droit de rétractation</h2>
        <p>
          Conformément aux articles L.221-18 et suivants du Code de la
          consommation, l&apos;acheteur dispose d&apos;un délai de quatorze (14)
          jours à compter de la réception des produits pour exercer son droit de
          rétractation, sans avoir à justifier de motif. Les produits doivent
          être retournés en parfait état ; les frais de retour restent à la
          charge de l&apos;acheteur.
        </p>

        <h2>7. Service après-vente et réclamations</h2>
        <p>
          Toute réclamation peut être adressée via la page Contact. En cas de
          produit défectueux ou non conforme, l&apos;association procédera à
          l&apos;échange ou au remboursement dans les meilleurs délais.
        </p>

        <h2>8. Données personnelles</h2>
        <p>
          Les données collectées dans le cadre d&apos;une commande sont traitées
          conformément aux mentions légales du site et à la réglementation en
          vigueur (RGPD).
        </p>

        <h2>9. Droit applicable et litiges</h2>
        <p>
          Les présentes CGV sont soumises au droit français. En cas de litige,
          une solution amiable sera recherchée en priorité avant toute action
          judiciaire.
        </p>
      </main>
    </>
  );
}

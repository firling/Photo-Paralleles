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
        className="wrap prose richtext"
        style={{ paddingBottom: "clamp(64px,8vw,120px)" }}
      >
        <p className="lead">
          Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance
          dans l&apos;économie numérique, il est précisé aux utilisateurs du site
          les informations suivantes.
        </p>

        <h2>Éditeur du site</h2>
        <p>
          Le présent site est édité par l&apos;association Photos Parallèles,
          association régie par la loi du 1<sup>er</sup> juillet 1901, dont le
          siège social est situé aux portes d&apos;Annecy (Haute-Savoie, France).
          <br />
          Adresse : à compléter.
          <br />
          Adresse électronique : voir la page Contact.
          <br />
          Numéro RNA / SIRET : à compléter.
        </p>

        <h2>Directeur de la publication</h2>
        <p>
          Le directeur de la publication est le représentant légal de
          l&apos;association Photos Parallèles.
        </p>

        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par son prestataire d&apos;hébergement. Les
          coordonnées complètes de l&apos;hébergeur (raison sociale, adresse,
          téléphone) sont disponibles sur demande. À compléter.
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus présents sur le site (textes, images,
          photographies, logos, éléments graphiques et mise en page) est protégé
          par le droit de la propriété intellectuelle. Sauf mention contraire,
          les photographies demeurent la propriété de leurs auteurs respectifs.
          Toute reproduction, représentation, modification ou diffusion, totale
          ou partielle, sans autorisation préalable écrite est interdite et est
          susceptible de constituer une contrefaçon.
        </p>

        <h2>Données personnelles</h2>
        <p>
          Les informations collectées via le formulaire de contact ou lors
          d&apos;une commande sont utilisées uniquement pour le traitement de
          votre demande et ne sont jamais cédées à des tiers à des fins
          commerciales. Conformément au Règlement général sur la protection des
          données (RGPD) et à la loi Informatique et Libertés, vous disposez
          d&apos;un droit d&apos;accès, de rectification et de suppression des
          données vous concernant, que vous pouvez exercer via la page Contact.
        </p>

        <h2>Cookies</h2>
        <p>
          Le site a recours à une mesure d&apos;audience respectueuse de la vie
          privée, sans dépôt de cookie publicitaire ni traceur tiers à des fins
          de profilage.
        </p>

        <h2>Responsabilité</h2>
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des
          informations diffusées sur le site mais ne saurait être tenu
          responsable des erreurs, d&apos;une absence de disponibilité des
          informations ou de la présence de virus sur son site.
        </p>
      </main>
    </>
  );
}

/**
 * Canonical seed content for the Photos Parallèles catalog.
 *
 * Texts are sourced from spec.md ("Présentation de l'association", "Bios des
 * artistes", §7 collection table) and public/artists/manifest.json. This is the
 * single source of truth consumed by `prisma/seed.ts`.
 */
import type { Availability, BookSpecs, Currency } from "../lib/content";

/**
 * Authoring shapes for the seed. Long-text fields (`bio`, `description`) are
 * authored here as plain paragraph arrays; `prisma/seed.ts` converts them into
 * Tiptap documents before writing to the `Json` columns.
 */
export interface SeedArtist {
  slug: string;
  name: string;
  role: string;
  originCountry: string;
  baseCity: string;
  lead: string;
  bio: string[];
  portrait: string;
  oeuvre: string;
  bookSlug: string;
}

export interface SeedBook {
  slug: string;
  title: string;
  artistSlug: string;
  price: number;
  currency: Currency;
  availability: Availability;
  cover: string;
  specs: BookSpecs;
  description: string[];
}

/** Specs shared by every title of the collection (spec.md §7). */
const COLLECTION_SPECS: BookSpecs = {
  format: "Poche · 105 × 152 mm",
  pages: "32 pages",
  binding: "Couverture souple · reliure 2 agrafes métal",
  paper: "Arena Natural Smooth · 140 / 240 g/m²",
  printing: "Noir & blanc / Quadri",
};

const PLACEHOLDER_PRICE = 18;

export const artists: SeedArtist[] = [
  {
    slug: "giorgia-vlassich",
    name: "Giorgia Vlassich",
    role: "Artiste visuelle",
    originCountry: "Italie–Croatie",
    baseCity: "Fermo",
    lead:
      "Giorgia Vlassich (Jesi, 1982) est une artiste visuelle et photographe professionnelle italo-croate.",
    bio: [
      "Giorgia Vlassich (Jesi, 1982) est une artiste visuelle et photographe professionnelle italo-croate. Elle étudie la photographie argentique et le tirage à l'école internationale The Darkroom de Florence, avant de poursuivre et d'approfondir sa recherche artistique au cours d'un séjour déterminant à Paris.",
      "Sa pratique actuelle explore les lieux, les objets et les liens affectifs oubliés à travers un langage qui mêle performance, interventions in situ et documentation argentique. Son travail transforme l'acte artistique en un geste de soin, révélant avec délicatesse les traces de la mémoire, de l'absence et de la présence.",
    ],
    portrait: "/artists/giorgia-vlassich/portrait.jpg",
    oeuvre: "/artists/giorgia-vlassich/oeuvre.jpg",
    bookSlug: "a-travers",
  },
  {
    slug: "francois-xavier-seren",
    name: "François-Xavier Seren",
    role: "Photographe documentaire",
    originCountry: "France",
    baseCity: "Paris",
    lead:
      "Né à Marseille en 1958, François-Xavier Seren se donne pour ambition de raconter la société française à travers l'image.",
    bio: [
      "Né à Marseille en 1958, il découvre très tôt la diversité des milieux sociaux au gré des déplacements imposés par la carrière de son père. En 1979, l'arrivée de son premier appareil photo marque un tournant décisif. Nourri par les romans de Balzac et de Flaubert, il se donne pour ambition de raconter la société française à travers l'image. De la famille aux questions d'héritage et d'identité, puis aux réalités de la précarité et du déracinement, il développe une approche profondément humaine fondée sur l'observation attentive et l'immersion au sein des communautés qu'il photographie.",
      "Photographe documentaire et portraitiste remarquable, il construit une œuvre en noir et blanc où se mêlent élégance, ironie et regard social. Qu'il photographie l'aristocratie, les intellectuels, les marginaux ou les oubliés, il cherche toujours à révéler la dignité des individus sans jugement ni complaisance. Influencé par Cartier-Bresson, Martin Parr, David Goldblatt et Dorothea Lange, il poursuit tout au long de sa vie une même quête : témoigner des coutumes, des fractures et des transformations de la société française.",
    ],
    portrait: "/artists/francois-xavier-seren/portrait.jpg",
    oeuvre: "/artists/francois-xavier-seren/oeuvre.jpg",
    bookSlug: "la-comedie-humaine",
  },
  {
    slug: "ullic-morard",
    name: "Ullic Morard",
    role: "Photographe",
    originCountry: "Italie–France",
    baseCity: "Annecy",
    lead:
      "Né en France et installé en Italie depuis de nombreuses années, Ullic Morard explore par l'image les atmosphères, les émotions et les récits personnels.",
    bio: [
      "Né en France et installé en Italie depuis de nombreuses années, il a d'abord étudié l'architecture au Politecnico de Turin. C'est au cours de ce parcours qu'il découvre la photographie, qu'il approfondit à travers différents ateliers et formations, notamment auprès de l'agence américaine VII. Peu à peu, l'image devient pour lui un moyen d'explorer des atmosphères, des émotions et des récits personnels qui dépassent la simple représentation du réel.",
      "Son travail, principalement réalisé en noir et blanc, s'appuie sur une recherche sensible des contrastes entre lumière et obscurité. Marqué par un long séjour en Australie, qui donnera naissance à la série Dark Night, il développe une écriture photographique attentive aux silences, aux traces et aux espaces de transition. Exposé dans plusieurs festivals et événements internationaux en Europe, en Australie et en Amérique du Sud, il poursuit aujourd'hui une démarche où chaque image cherche à révéler la part invisible du monde ordinaire.",
    ],
    portrait: "/artists/ullic-morard/portrait.jpg",
    oeuvre: "/artists/ullic-morard/oeuvre.jpg",
    bookSlug: "aria",
  },
  {
    slug: "jean-matthieu-gosselin",
    name: "Jean-Matthieu Gosselin",
    role: "Photographe",
    originCountry: "France",
    baseCity: "Barcelone",
    lead:
      "Jean-Matthieu Gosselin est un photographe français installé à Barcelone, dont l'œuvre est profondément liée à la mémoire et à la narration visuelle.",
    bio: [
      "Jean-Matthieu Gosselin est un photographe français installé à Barcelone. Formé à l'histoire de l'art, à la muséologie et à la photographie, il développe une œuvre profondément liée à la mémoire, à la perte, aux racines et à la narration visuelle.",
      "Victime d'une amnésie totale à la suite d'un AVC, il a d'abord utilisé la photographie comme une thérapie, avant d'en faire un véritable outil de reconstruction personnelle. Ses images interrogent les mécanismes du souvenir, la fragilité de l'identité et la manière dont les lieux, les traces et les récits participent à la construction de soi.",
    ],
    portrait: "/artists/jean-matthieu-gosselin/portrait.jpg",
    oeuvre: "/artists/jean-matthieu-gosselin/oeuvre.jpg",
    bookSlug: "working-on-a-dream",
  },
  {
    slug: "maeva-benaiche",
    name: "Maëva Benaiche",
    role: "Photographe",
    originCountry: "France",
    baseCity: "Toulouse",
    lead:
      "Maëva Benaiche, née à Toulouse en 1996, explore les liens entre l'intime, la mémoire et les fragilités qui façonnent notre rapport au monde.",
    bio: [
      "Maëva Benaiche est une photographe française née à Toulouse en 1996. Son travail explore les liens entre l'intime, la mémoire et les fragilités qui façonnent notre rapport au monde. À travers la photographie, elle cherche à exprimer ce que les mots peinent parfois à révéler, transformant l'image en un espace de questionnement et de résonance personnelle.",
      "Photographe et bègue, elle développe une écriture visuelle sensible où se mêlent vulnérabilité, introspection et observation du réel. Ses images interrogent la place de l'individu dans un monde traversé par les incertitudes, les silences et les fêlures. Depuis 2023, elle est également fondatrice du magazine « Premier Exemplaire », dédié à la jeune photographie contemporaine.",
    ],
    portrait: "/artists/maeva-benaiche/portrait.jpg",
    oeuvre: "/artists/maeva-benaiche/oeuvre.jpg",
    bookSlug: "magma",
  },
  {
    slug: "rafa-badia",
    name: "Rafa Badía",
    role: "Photographe documentaire",
    originCountry: "Espagne",
    baseCity: "Barcelone",
    lead:
      "Figure majeure de la photographie documentaire et de rue en Espagne, Rafa Badía vit et travaille à Barcelone depuis 1994.",
    bio: [
      "Photographe, éditeur, historien de l'art et enseignant, il vit et travaille à Barcelone depuis 1994. Figure majeure de la photographie documentaire et de rue en Espagne, il consacre son regard à la narration visuelle et à l'exploration du quotidien.",
      "Son travail se nourrit d'une observation patiente de la vie urbaine, où chaque image s'inscrit dans un récit plus vaste. À travers la lumière, les détails, les gestes et les rencontres, il révèle la poésie discrète des rues et des instants ordinaires. Entre documentaire et fiction, ses photographies transforment le réel en un espace de résonance sensible.",
    ],
    portrait: "/artists/rafa-badia/portrait.jpg",
    oeuvre: "/artists/rafa-badia/oeuvre.jpg",
    bookSlug: "barcelona-riff",
  },
  {
    slug: "claire-amaouche",
    name: "Claire Amaouche",
    role: "Artiste visuelle",
    originCountry: "France",
    baseCity: "Berlin",
    lead:
      "Artiste visuelle basée à Berlin, Claire Amaouche pratique un art de la photographie fait de calme, de patience et de silence.",
    bio: [
      "Artiste visuelle basée à Berlin, elle a toujours dans son sac un carnet, un appareil photo et quelques pinceaux. Elle se promène d'un endroit à l'autre, essayant de saisir des instants fugaces, des fragments de vie et des histoires disséminées à travers le monde.",
      "Au fil des années, elle a pratiqué un art de la photographie fait de calme, de patience et de silence. Une discipline qui semble contre-intuitive au premier abord, mais qui ne cesse de révéler que la beauté réside souvent dans l'ordinaire.",
    ],
    portrait: "/artists/claire-amaouche/portrait.jpg",
    oeuvre: "/artists/claire-amaouche/oeuvre.jpg",
    bookSlug: "de-tous-les-chemins-sauvages",
  },
  {
    slug: "dominique-agius",
    name: "Dominique Agius",
    role: "Photographe plasticien",
    originCountry: "France",
    baseCity: "Nice",
    lead:
      "Pour Dominique Agius, la photographie est un espace d'exploration où se rencontrent le corps, la mémoire et les métamorphoses de l'identité.",
    bio: [
      "La photographie est pour moi un espace d'exploration où se rencontrent le corps, la mémoire et les métamorphoses de l'identité. Chaque série naît d'une question différente, mais toutes procèdent d'un même désir : révéler ce qui se cache sous la surface des apparences.",
      "Inspiré autant par les maîtres de la peinture classique que par les fragilités du présent, je cherche une écriture visuelle où la lumière sculpte les formes et donne une présence nouvelle à l'invisible. Du clair-obscur aux cyanotypes sur peau, des vanités aux natures mortes, mes images interrogent ce qui nous constitue, nous transforme et nous relie à notre humanité.",
    ],
    portrait: "/artists/dominique-agius/portrait.jpg",
    oeuvre: "/artists/dominique-agius/oeuvre.jpg",
    bookSlug: "id-entity",
  },
];

/** Short placeholder description derived from the collection blurb. */
function placeholderDescription(title: string, artistName: string): string[] {
  return [
    `Pensé dans l'esprit singulier de Photos Parallèles, « ${title} » s'inscrit dans la collection « Le Souffle de l'Image » : huit photobooks au format poche partageant une même identité visuelle, chacun laissant à son auteur la pleine liberté de son regard.`,
    `Le livre de ${artistName} se découvre comme un récit visuel autonome — un objet sensible à parcourir, collectionner et partager. Description complète à venir.`,
  ];
}

export const books: SeedBook[] = [
  {
    slug: "working-on-a-dream",
    title: "Working on a Dream",
    artistSlug: "jean-matthieu-gosselin",
    price: PLACEHOLDER_PRICE,
    currency: "EUR",
    availability: "AVAILABLE",
    cover: "/artists/jean-matthieu-gosselin/oeuvre.jpg",
    specs: { ...COLLECTION_SPECS, pages: "32 pages · 31 photographies" },
    description: [
      "Pensé dans l'esprit singulier de Photos Parallèles, « Working on a Dream » s'inscrit dans une ligne éditoriale exigeante. À la suite d'un accident ayant provoqué une amnésie, la photographie devient un outil de reconstruction, un fil ténu mais précieux pour retisser les contours d'une mémoire fragmentée.",
      "L'ouvrage réunit 31 photographies — une invitation à pénétrer dans un univers sensible où la photographie devient à la fois mémoire, refuge et promesse.",
    ],
  },
  {
    slug: "a-travers",
    title: "À travers",
    artistSlug: "giorgia-vlassich",
    price: PLACEHOLDER_PRICE,
    currency: "EUR",
    availability: "AVAILABLE",
    cover: "/artists/giorgia-vlassich/oeuvre.jpg",
    specs: COLLECTION_SPECS,
    description: placeholderDescription("À travers", "Giorgia Vlassich"),
  },
  {
    slug: "aria",
    title: "Aria",
    artistSlug: "ullic-morard",
    price: PLACEHOLDER_PRICE,
    currency: "EUR",
    availability: "AVAILABLE",
    cover: "/artists/ullic-morard/oeuvre.jpg",
    specs: COLLECTION_SPECS,
    description: placeholderDescription("Aria", "Ullic Morard"),
  },
  {
    slug: "la-comedie-humaine",
    title: "La Comédie humaine",
    artistSlug: "francois-xavier-seren",
    price: PLACEHOLDER_PRICE,
    currency: "EUR",
    availability: "AVAILABLE",
    cover: "/artists/francois-xavier-seren/oeuvre.jpg",
    specs: COLLECTION_SPECS,
    description: placeholderDescription("La Comédie humaine", "François-Xavier Seren"),
  },
  {
    slug: "barcelona-riff",
    title: "Barcelona Riff",
    artistSlug: "rafa-badia",
    price: PLACEHOLDER_PRICE,
    currency: "EUR",
    availability: "AVAILABLE",
    cover: "/artists/rafa-badia/oeuvre.jpg",
    specs: COLLECTION_SPECS,
    description: placeholderDescription("Barcelona Riff", "Rafa Badía"),
  },
  {
    slug: "magma",
    title: "Magma",
    artistSlug: "maeva-benaiche",
    price: PLACEHOLDER_PRICE,
    currency: "EUR",
    availability: "AVAILABLE",
    cover: "/artists/maeva-benaiche/oeuvre.jpg",
    specs: COLLECTION_SPECS,
    description: placeholderDescription("Magma", "Maëva Benaiche"),
  },
  {
    slug: "de-tous-les-chemins-sauvages",
    title: "De tous les chemins sauvages",
    artistSlug: "claire-amaouche",
    price: PLACEHOLDER_PRICE,
    currency: "EUR",
    availability: "AVAILABLE",
    cover: "/artists/claire-amaouche/oeuvre.jpg",
    specs: COLLECTION_SPECS,
    description: placeholderDescription("De tous les chemins sauvages", "Claire Amaouche"),
  },
  {
    slug: "id-entity",
    title: "ID-ENTITY",
    artistSlug: "dominique-agius",
    price: PLACEHOLDER_PRICE,
    currency: "EUR",
    availability: "AVAILABLE",
    cover: "/artists/dominique-agius/oeuvre.jpg",
    specs: COLLECTION_SPECS,
    description: placeholderDescription("ID-ENTITY", "Dominique Agius"),
  },
];

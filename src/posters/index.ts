import { drawJardin, drawTricot } from "./generators";
import collage from "./markup/collage.html?raw";
import defs from "./markup/defs.html?raw";
import fidele from "./markup/fidele.html?raw";
import gouache from "./markup/gouache.html?raw";
import jardin from "./markup/jardin.html?raw";
import lisible from "./markup/lisible.html?raw";
import tricot from "./markup/tricot.html?raw";

export type Poster = {
  slug: string;
  group: "retenues" | "nouvelles";
  title: string;
  description: string;
  inspiration?: string;
  /** Poster markup, drawn at 600 × 900. The shared illustration library is prepended so each poster is self-contained. */
  html: string;
  /** Adds the generated decoration once the markup is in the DOM. */
  draw?: (root: HTMLElement) => void;
};

/** Prepends the shared SVG library inside the poster's own root element, so exports carry their symbols. */
const withDefs = (markup: string) => markup.replace(/^(<div class="poster [^"]+">)/, `$1${defs}`);

export const POSTER_WIDTH = 600;
export const POSTER_HEIGHT = 900;

export const posters: Poster[] = [
  {
    slug: "jardin",
    group: "retenues",
    title: "Jardin de Granville",
    description:
      "Gravure vert forêt et filets dorés, texte agrandi et plus contrasté pour être lu de loin. Une couronne de feuillage et de roses encadre le titre, avec la devise de l’association, « Des fleurs avant le pain ».",
    html: withDefs(jardin),
    draw: drawJardin,
  },
  {
    slug: "fidele",
    group: "retenues",
    title: "Fidèle à l’original",
    description:
      "La mise en page de l’affiche d’origine, avec des grands-parents redessinés, une serif douce à la place de la police arrondie et un léger grain papier.",
    html: withDefs(fidele),
  },
  {
    slug: "tricot",
    group: "retenues",
    title: "Tricot d’hiver",
    description:
      "Fond rouge tricoté et bandes jacquard. Grand titre, étiquettes cousues avec une illustration en couleur par catégorie.",
    html: withDefs(tricot),
    draw: drawTricot,
  },
  {
    slug: "papier-decoupe",
    group: "nouvelles",
    title: "Papier découpé",
    description:
      "Chaque bloc est un morceau de papier déchiré, tenu par du scotch, avec une ombre portée. Un côté fait main, comme la boîte qu’on prépare soi-même.",
    inspiration: "Inspiration : l’idée de matière et de geste visible du skill canvas-design d’Anthropic.",
    html: withDefs(collage),
  },
  {
    slug: "lisible",
    group: "nouvelles",
    title: "Lisible de loin",
    description:
      "Pour un hall ou un couloir : police Atkinson Hyperlegible, conçue pour les personnes malvoyantes, une bande de couleur par catégorie et du texte très grand.",
    inspiration:
      "Inspiration : les règles de hiérarchie du skill frontend-design d’Anthropic et les normes de signalétique.",
    html: withDefs(lisible),
  },
  {
    slug: "livre-illustre",
    group: "nouvelles",
    title: "Livre illustré",
    description:
      "Une scène : les grands-parents dans leur salon, sous la lampe, autour de la boîte. Quatre teintes de gouache, des bords irréguliers et du grain, comme dans un album jeunesse.",
    inspiration:
      "Inspiration : « une direction forte, une seule audace » des skills frontend-design et artifact-design.",
    html: withDefs(gouache),
  },
];

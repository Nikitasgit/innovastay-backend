export const SEED_EMAIL_DOMAIN = "leafymap.seed";
export const DEFAULT_SEED_PASSWORD = "SeedUser!2026";
export const DEFAULT_USER_COUNT = 1500;
export const DEFAULT_EVENT_COUNT = 15000;
export const BATCH_SIZE = 500;
export const FAKER_SEED = 20260901;
export const S3_SEED_PREFIX = "images/seed/";

export const CREATOR_RATIO = 0.65;
export const PLACE_RATIO_AMONG_CREATORS = 0.75;
export const ONLINE_EVENT_RATIO = 0.1;
export const CUSTOM_LOCATION_RATIO = 0.15;
export const BOOKABLE_RATIO = 0.4;
export const CANCELLED_EVENT_RATIO = 0.03;
export const COMPLETED_EVENT_RATIO = 0.2;
export const ONGOING_EVENT_RATIO = 0.1;

export type ImageTheme =
  | "portrait"
  | "bakery"
  | "bar"
  | "market"
  | "concert"
  | "gallery"
  | "workshop"
  | "farm"
  | "brewery"
  | "restaurant";

export type ScheduleKind =
  | "bar"
  | "market"
  | "gallery"
  | "workshop"
  | "restaurant"
  | "farm"
  | "venue";

export interface GeoBounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export interface CityCluster {
  slug: string;
  label: string;
  lng: number;
  lat: number;
  weight: number;
  postalPrefix: string;
  /** Urban land box used to sample coordinates (never the sea). */
  landBounds: GeoBounds;
  /** Extra rectangles treated as water (harbours, open sea). */
  waterExclusions?: GeoBounds[];
}

function landBox(lng: number, lat: number, radiusKm: number): GeoBounds {
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    minLng: lng - dLng,
    maxLng: lng + dLng,
    minLat: lat - dLat,
    maxLat: lat + dLat,
  };
}

function town(params: {
  slug: string;
  label: string;
  lng: number;
  lat: number;
  weight: number;
  postalPrefix: string;
  radiusKm?: number;
  landBounds?: GeoBounds;
  waterExclusions?: GeoBounds[];
}): CityCluster {
  return {
    slug: params.slug,
    label: params.label,
    lng: params.lng,
    lat: params.lat,
    weight: params.weight,
    postalPrefix: params.postalPrefix,
    landBounds: params.landBounds ?? landBox(params.lng, params.lat, params.radiusKm ?? 2.4),
    waterExclusions: params.waterExclusions,
  };
}

export const CITIES: CityCluster[] = [
  town({
    slug: "paris",
    label: "Paris",
    lng: 2.3522,
    lat: 48.8566,
    weight: 20,
    postalPrefix: "750",
    landBounds: { minLng: 2.28, maxLng: 2.4, minLat: 48.83, maxLat: 48.89 },
  }),
  town({
    slug: "lyon",
    label: "Lyon",
    lng: 4.8357,
    lat: 45.764,
    weight: 6,
    postalPrefix: "690",
    landBounds: { minLng: 4.8, maxLng: 4.88, minLat: 45.74, maxLat: 45.79 },
  }),
  town({
    slug: "bordeaux",
    label: "Bordeaux",
    lng: -0.5792,
    lat: 44.8378,
    weight: 5,
    postalPrefix: "330",
    landBounds: { minLng: -0.605, maxLng: -0.56, minLat: 44.82, maxLat: 44.86 },
  }),
  town({
    slug: "marseille",
    label: "Marseille",
    lng: 5.4,
    lat: 43.32,
    weight: 5,
    postalPrefix: "130",
    landBounds: { minLng: 5.375, maxLng: 5.46, minLat: 43.3, maxLat: 43.355 },
    waterExclusions: [
      { minLng: 5.2, maxLng: 5.55, minLat: 43.1, maxLat: 43.275 },
      { minLng: 5.2, maxLng: 5.355, minLat: 43.275, maxLat: 43.305 },
    ],
  }),
  town({
    slug: "nantes",
    label: "Nantes",
    lng: -1.5536,
    lat: 47.2184,
    weight: 4,
    postalPrefix: "440",
    landBounds: { minLng: -1.6, maxLng: -1.52, minLat: 47.21, maxLat: 47.245 },
  }),
  town({
    slug: "toulouse",
    label: "Toulouse",
    lng: 1.4442,
    lat: 43.6047,
    weight: 4,
    postalPrefix: "310",
    landBounds: { minLng: 1.4, maxLng: 1.48, minLat: 43.57, maxLat: 43.64 },
  }),
  town({
    slug: "rennes",
    label: "Rennes",
    lng: -1.6778,
    lat: 48.1173,
    weight: 2,
    postalPrefix: "350",
  }),
  town({
    slug: "grenoble",
    label: "Grenoble",
    lng: 5.7245,
    lat: 45.1885,
    weight: 2,
    postalPrefix: "380",
  }),
  town({
    slug: "dijon",
    label: "Dijon",
    lng: 5.0415,
    lat: 47.322,
    weight: 2,
    postalPrefix: "210",
  }),
  town({
    slug: "angers",
    label: "Angers",
    lng: -0.5632,
    lat: 47.4784,
    weight: 2,
    postalPrefix: "490",
  }),
  town({
    slug: "tours",
    label: "Tours",
    lng: 0.6848,
    lat: 47.3941,
    weight: 2,
    postalPrefix: "370",
  }),
  town({
    slug: "reims",
    label: "Reims",
    lng: 4.0317,
    lat: 49.2583,
    weight: 2,
    postalPrefix: "511",
  }),
  town({
    slug: "aix-en-provence",
    label: "Aix-en-Provence",
    lng: 5.4474,
    lat: 43.5297,
    weight: 2,
    postalPrefix: "131",
  }),
  town({
    slug: "clermont-ferrand",
    label: "Clermont-Ferrand",
    lng: 3.087,
    lat: 45.7772,
    weight: 2,
    postalPrefix: "630",
  }),
  town({
    slug: "saint-etienne",
    label: "Saint-Étienne",
    lng: 4.3872,
    lat: 45.4397,
    weight: 2,
    postalPrefix: "420",
  }),
  town({
    slug: "orleans",
    label: "Orléans",
    lng: 1.9093,
    lat: 47.9029,
    weight: 2,
    postalPrefix: "450",
  }),
  town({
    slug: "nimes",
    label: "Nîmes",
    lng: 4.3601,
    lat: 43.8367,
    weight: 2,
    postalPrefix: "300",
  }),
  town({
    slug: "avignon",
    label: "Avignon",
    lng: 4.807,
    lat: 43.948,
    weight: 2,
    postalPrefix: "840",
    radiusKm: 1.8,
  }),
  town({
    slug: "pau",
    label: "Pau",
    lng: -0.3708,
    lat: 43.2951,
    weight: 2,
    postalPrefix: "640",
  }),
  town({
    slug: "limoges",
    label: "Limoges",
    lng: 1.2611,
    lat: 45.8336,
    weight: 2,
    postalPrefix: "870",
  }),
  town({
    slug: "amiens",
    label: "Amiens",
    lng: 2.2958,
    lat: 49.8943,
    weight: 2,
    postalPrefix: "800",
  }),
  town({
    slug: "metz",
    label: "Metz",
    lng: 6.1757,
    lat: 49.1193,
    weight: 2,
    postalPrefix: "570",
  }),
  town({
    slug: "annecy",
    label: "Annecy",
    lng: 6.121,
    lat: 45.903,
    weight: 1,
    postalPrefix: "740",
    landBounds: { minLng: 6.105, maxLng: 6.128, minLat: 45.895, maxLat: 45.915 },
    waterExclusions: [
      { minLng: 6.129, maxLng: 6.18, minLat: 45.84, maxLat: 45.91 },
    ],
  }),
  town({
    slug: "beaune",
    label: "Beaune",
    lng: 4.84,
    lat: 47.026,
    weight: 1,
    postalPrefix: "212",
    radiusKm: 1.4,
  }),
  town({
    slug: "colmar",
    label: "Colmar",
    lng: 7.3585,
    lat: 48.0794,
    weight: 1,
    postalPrefix: "680",
    radiusKm: 1.6,
  }),
  town({
    slug: "albi",
    label: "Albi",
    lng: 2.1486,
    lat: 43.9251,
    weight: 1,
    postalPrefix: "810",
    radiusKm: 1.6,
  }),
  town({
    slug: "carcassonne",
    label: "Carcassonne",
    lng: 2.351,
    lat: 43.213,
    weight: 1,
    postalPrefix: "110",
    radiusKm: 1.6,
  }),
  town({
    slug: "arles",
    label: "Arles",
    lng: 4.628,
    lat: 43.678,
    weight: 1,
    postalPrefix: "132",
    landBounds: { minLng: 4.62, maxLng: 4.645, minLat: 43.672, maxLat: 43.69 },
  }),
  town({
    slug: "uzes",
    label: "Uzès",
    lng: 4.4197,
    lat: 44.0125,
    weight: 1,
    postalPrefix: "307",
    radiusKm: 1.2,
  }),
  town({
    slug: "poitiers",
    label: "Poitiers",
    lng: 0.3404,
    lat: 46.5802,
    weight: 1,
    postalPrefix: "860",
  }),
  town({
    slug: "chartres",
    label: "Chartres",
    lng: 1.489,
    lat: 48.4439,
    weight: 1,
    postalPrefix: "280",
    radiusKm: 1.6,
  }),
  town({
    slug: "troyes",
    label: "Troyes",
    lng: 4.0744,
    lat: 48.2973,
    weight: 1,
    postalPrefix: "100",
    radiusKm: 1.6,
  }),
  town({
    slug: "valence",
    label: "Valence",
    lng: 4.8924,
    lat: 44.9334,
    weight: 1,
    postalPrefix: "260",
  }),
  town({
    slug: "chambery",
    label: "Chambéry",
    lng: 5.9178,
    lat: 45.5646,
    weight: 1,
    postalPrefix: "730",
    radiusKm: 1.6,
  }),
  town({
    slug: "besancon",
    label: "Besançon",
    lng: 6.0241,
    lat: 47.2378,
    weight: 1,
    postalPrefix: "250",
  }),
  town({
    slug: "rodez",
    label: "Rodez",
    lng: 2.5753,
    lat: 44.3494,
    weight: 1,
    postalPrefix: "120",
    radiusKm: 1.5,
  }),
  town({
    slug: "angouleme",
    label: "Angoulême",
    lng: 0.16,
    lat: 45.65,
    weight: 1,
    postalPrefix: "160",
    radiusKm: 1.6,
  }),
  town({
    slug: "le-mans",
    label: "Le Mans",
    lng: 0.1996,
    lat: 48.0061,
    weight: 1,
    postalPrefix: "720",
  }),
  town({
    slug: "macon",
    label: "Mâcon",
    lng: 4.8287,
    lat: 46.3069,
    weight: 1,
    postalPrefix: "710",
    radiusKm: 1.5,
  }),
  town({
    slug: "aurillac",
    label: "Aurillac",
    lng: 2.444,
    lat: 44.9311,
    weight: 1,
    postalPrefix: "150",
    radiusKm: 1.5,
  }),
];

export interface CreatorArchetype {
  key: string;
  userCategory: string;
  placeCategory: string | null;
  eventCategories: string[];
  imageTheme: ImageTheme;
  scheduleKind: ScheduleKind;
  nameParts: Array<{ firstname: string; lastname: string }>;
  descriptions: string[];
}

export const ARCHETYPES: CreatorArchetype[] = [
  {
    key: "baker",
    userCategory: "baker",
    placeCategory: "boutique",
    eventCategories: ["tasting", "workshop", "market"],
    imageTheme: "bakery",
    scheduleKind: "restaurant",
    nameParts: [
      { firstname: "Boulangerie", lastname: "Martin" },
      { firstname: "Au Pain", lastname: "Levé" },
      { firstname: "Fournil", lastname: "des Halles" },
    ],
    descriptions: [
      "Pain au levain, viennoiseries du matin et fournées tout au long de la journée.",
      "Boulangerie de quartier, farines locales et recettes de saison.",
    ],
  },
  {
    key: "pastry",
    userCategory: "pastry_chef",
    placeCategory: "boutique",
    eventCategories: ["tasting", "workshop"],
    imageTheme: "bakery",
    scheduleKind: "restaurant",
    nameParts: [
      { firstname: "Pâtisserie", lastname: "Céleste" },
      { firstname: "Maison", lastname: "Praline" },
    ],
    descriptions: [
      "Pâtisseries de saison, entremets et chocolats à partager sur place ou à emporter.",
    ],
  },
  {
    key: "bar",
    userCategory: "food_organizer",
    placeCategory: "bar",
    eventCategories: ["concert", "meetup", "tasting", "performance"],
    imageTheme: "bar",
    scheduleKind: "bar",
    nameParts: [
      { firstname: "Le Bar", lastname: "Perché" },
      { firstname: "Comptoir", lastname: "des Arts" },
      { firstname: "La Fine", lastname: "Bouteille" },
    ],
    descriptions: [
      "Bar de quartier, concerts acoustiques, dégustations et soirées créateurs.",
      "Cocktails, vins naturels et scène ouverte pour les artistes locaux.",
    ],
  },
  {
    key: "brewery",
    userCategory: "brewer",
    placeCategory: "brewery",
    eventCategories: ["tasting", "festival", "meetup"],
    imageTheme: "brewery",
    scheduleKind: "venue",
    nameParts: [
      { firstname: "Brasserie", lastname: "du Canal" },
      { firstname: "Houblon", lastname: "Sauvage" },
    ],
    descriptions: [
      "Bières artisanales brassées sur place, taproom et visites de la cuve.",
    ],
  },
  {
    key: "winemaker",
    userCategory: "winemaker",
    placeCategory: "tasting_room",
    eventCategories: ["tasting", "workshop", "meetup"],
    imageTheme: "brewery",
    scheduleKind: "venue",
    nameParts: [
      { firstname: "Domaine", lastname: "des Cimes" },
      { firstname: "Cave", lastname: "Saint Julien" },
    ],
    descriptions: [
      "Vins de vignerons, dégustations commentées et rencontres au chai.",
    ],
  },
  {
    key: "restaurant",
    userCategory: "food_organizer",
    placeCategory: "restaurant",
    eventCategories: ["tasting", "meetup", "workshop"],
    imageTheme: "restaurant",
    scheduleKind: "restaurant",
    nameParts: [
      { firstname: "Table", lastname: "Ouverte" },
      { firstname: "La Cuisine", lastname: "Partagée" },
    ],
    descriptions: [
      "Cuisine de marché, menus du soir et dîners avec des producteurs invités.",
    ],
  },
  {
    key: "rooftop",
    userCategory: "organizer",
    placeCategory: "rooftop",
    eventCategories: ["concert", "festival", "meetup"],
    imageTheme: "bar",
    scheduleKind: "bar",
    nameParts: [
      { firstname: "Toit", lastname: "Terrasse" },
      { firstname: "Ciel", lastname: "Ouvert" },
    ],
    descriptions: [
      "Rooftop en centre-ville, apéros, lives et projections quand le temps le permet.",
    ],
  },
  {
    key: "market",
    userCategory: "food_organizer",
    placeCategory: "food_market",
    eventCategories: ["market", "festival", "tasting"],
    imageTheme: "market",
    scheduleKind: "market",
    nameParts: [
      { firstname: "Marché", lastname: "des Halles" },
      { firstname: "Halles", lastname: "Gourmandes" },
    ],
    descriptions: [
      "Marché de producteurs, stands de saison et animations le week-end.",
    ],
  },
  {
    key: "farmers_market",
    userCategory: "farmer",
    placeCategory: "farmers_market",
    eventCategories: ["market", "tasting", "workshop"],
    imageTheme: "market",
    scheduleKind: "market",
    nameParts: [
      { firstname: "Marché", lastname: "Paysan" },
      { firstname: "Rendez-vous", lastname: "à la Ferme" },
    ],
    descriptions: [
      "Paniers de saison, maraîchage et rencontres avec les fermes du coin.",
    ],
  },
  {
    key: "farm",
    userCategory: "market_gardener",
    placeCategory: "farm",
    eventCategories: ["workshop", "tasting", "market"],
    imageTheme: "farm",
    scheduleKind: "farm",
    nameParts: [
      { firstname: "Ferme", lastname: "des Lentilles" },
      { firstname: "Jardin", lastname: "Vivant" },
    ],
    descriptions: [
      "Maraîchage bio, visites de la ferme et ateliers pour petits et grands.",
    ],
  },
  {
    key: "cheesemaker",
    userCategory: "cheesemaker",
    placeCategory: "boutique",
    eventCategories: ["tasting", "market", "workshop"],
    imageTheme: "market",
    scheduleKind: "restaurant",
    nameParts: [
      { firstname: "Fromagerie", lastname: "des Alpages" },
      { firstname: "La Cave", lastname: "à Comté" },
    ],
    descriptions: [
      "Fromages affinés, plateaux et dégustations avec les producteurs.",
    ],
  },
  {
    key: "chocolatier",
    userCategory: "chocolatier",
    placeCategory: "boutique",
    eventCategories: ["tasting", "workshop"],
    imageTheme: "bakery",
    scheduleKind: "restaurant",
    nameParts: [
      { firstname: "Chocolaterie", lastname: "Cacao" },
      { firstname: "Atelier", lastname: "Noir" },
    ],
    descriptions: [
      "Chocolat bean-to-bar, tablettes et ateliers de tempérage.",
    ],
  },
  {
    key: "coffee",
    userCategory: "coffee_roaster",
    placeCategory: "boutique",
    eventCategories: ["tasting", "meetup", "workshop"],
    imageTheme: "restaurant",
    scheduleKind: "restaurant",
    nameParts: [
      { firstname: "Torréfaction", lastname: "Lumi" },
      { firstname: "Café", lastname: "des Lices" },
    ],
    descriptions: [
      "Café de spécialité torréfié sur place, cuppings et ateliers filtre.",
    ],
  },
  {
    key: "gallery",
    userCategory: "painter",
    placeCategory: "gallery",
    eventCategories: ["exhibition", "meetup", "workshop"],
    imageTheme: "gallery",
    scheduleKind: "gallery",
    nameParts: [
      { firstname: "Galerie", lastname: "Horizon" },
      { firstname: "Espace", lastname: "Pigment" },
    ],
    descriptions: [
      "Peinture contemporaine, vernissages et ateliers dessin le week-end.",
    ],
  },
  {
    key: "photographer",
    userCategory: "photographer",
    placeCategory: "gallery",
    eventCategories: ["exhibition", "workshop", "meetup"],
    imageTheme: "gallery",
    scheduleKind: "gallery",
    nameParts: [
      { firstname: "Studio", lastname: "Lumière" },
      { firstname: "Atelier", lastname: "Argentique" },
    ],
    descriptions: [
      "Photographie documentaire et expositions tournantes d'artistes invités.",
    ],
  },
  {
    key: "ceramic",
    userCategory: "ceramic_artist",
    placeCategory: "workshop",
    eventCategories: ["workshop", "exhibition", "market"],
    imageTheme: "workshop",
    scheduleKind: "workshop",
    nameParts: [
      { firstname: "Atelier", lastname: "Luma" },
      { firstname: "Terre", lastname: "et Feu" },
    ],
    descriptions: [
      "Céramique utilitaire et sculpturale, tours et cuissons partagées.",
    ],
  },
  {
    key: "potter",
    userCategory: "potter",
    placeCategory: "artist_studio",
    eventCategories: ["workshop", "exhibition", "market"],
    imageTheme: "workshop",
    scheduleKind: "workshop",
    nameParts: [
      { firstname: "Poterie", lastname: "du Quai" },
      { firstname: "Grès", lastname: "Sauvage" },
    ],
    descriptions: [
      "Pièces en grès, initiations au tour et ventes d'atelier.",
    ],
  },
  {
    key: "jeweler",
    userCategory: "jeweler",
    placeCategory: "boutique",
    eventCategories: ["workshop", "market", "exhibition"],
    imageTheme: "workshop",
    scheduleKind: "workshop",
    nameParts: [
      { firstname: "Bijouterie", lastname: "Fil d'Or" },
      { firstname: "Atelier", lastname: "Serti" },
    ],
    descriptions: [
      "Bijoux faits main, métaux recyclés et ateliers découverte.",
    ],
  },
  {
    key: "wood",
    userCategory: "cabinetmaker",
    placeCategory: "workshop",
    eventCategories: ["workshop", "exhibition", "market"],
    imageTheme: "workshop",
    scheduleKind: "workshop",
    nameParts: [
      { firstname: "Atelier", lastname: "Chêne" },
      { firstname: "Bois", lastname: "Vivant" },
    ],
    descriptions: [
      "Ébénisterie contemporaine, restauration et cours d'initiation.",
    ],
  },
  {
    key: "music_venue",
    userCategory: "sound_artist",
    placeCategory: "music_venue",
    eventCategories: ["concert", "festival", "performance"],
    imageTheme: "concert",
    scheduleKind: "venue",
    nameParts: [
      { firstname: "Salle", lastname: "Echo" },
      { firstname: "Club", lastname: "des Ondes" },
    ],
    descriptions: [
      "Scène indépendante, concerts intimistes et résidences d'artistes.",
    ],
  },
  {
    key: "theater",
    userCategory: "performance_artist",
    placeCategory: "theater",
    eventCategories: ["performance", "festival", "meetup"],
    imageTheme: "concert",
    scheduleKind: "venue",
    nameParts: [
      { firstname: "Théâtre", lastname: "de Poche" },
      { firstname: "Scène", lastname: "Libre" },
    ],
    descriptions: [
      "Petite salle, lectures, spectacles et répétitions ouvertes.",
    ],
  },
  {
    key: "cultural_center",
    userCategory: "organizer",
    placeCategory: "cultural_center",
    eventCategories: ["festival", "conference", "meetup", "exhibition"],
    imageTheme: "gallery",
    scheduleKind: "venue",
    nameParts: [
      { firstname: "Maison", lastname: "des Arts" },
      { firstname: "Forum", lastname: "Culturel" },
    ],
    descriptions: [
      "Programmation pluridisciplinaire, ateliers et festivals de quartier.",
    ],
  },
  {
    key: "artisan_market",
    userCategory: "craft_collective",
    placeCategory: "artisan_market",
    eventCategories: ["market", "festival", "workshop"],
    imageTheme: "market",
    scheduleKind: "market",
    nameParts: [
      { firstname: "Marché", lastname: "des Créateurs" },
      { firstname: "Collectif", lastname: "Main d'Oeuvre" },
    ],
    descriptions: [
      "Collectif d'artisans, marchés mensuels et démonstrations live.",
    ],
  },
  {
    key: "popup",
    userCategory: "art_collective",
    placeCategory: "pop_up_space",
    eventCategories: ["exhibition", "meetup", "performance"],
    imageTheme: "gallery",
    scheduleKind: "gallery",
    nameParts: [
      { firstname: "Pop Up", lastname: "Rivoli" },
      { firstname: "Espace", lastname: "Éphémère" },
    ],
    descriptions: [
      "Lieu éphémère pour expositions, performances et résidences courtes.",
    ],
  },
  {
    key: "illustrator",
    userCategory: "illustrator",
    placeCategory: "artist_studio",
    eventCategories: ["workshop", "exhibition", "market"],
    imageTheme: "workshop",
    scheduleKind: "workshop",
    nameParts: [
      { firstname: "Studio", lastname: "Encre" },
      { firstname: "Atelier", lastname: "Croquis" },
    ],
    descriptions: [
      "Illustration, prints et ateliers carnet de voyage.",
    ],
  },
  {
    key: "online_creator",
    userCategory: "digital_artist",
    placeCategory: null,
    eventCategories: ["online_event", "workshop", "meetup"],
    imageTheme: "portrait",
    scheduleKind: "workshop",
    nameParts: [
      { firstname: "Studio", lastname: "Pixel" },
      { firstname: "Live", lastname: "Créatif" },
    ],
    descriptions: [
      "Ateliers en ligne, lives création et rencontres à distance.",
    ],
  },
];

export const DEMO_ACCOUNTS: Array<{
  emailLocalPart: string;
  archetypeKey: string;
  nameIndex: number;
}> = [
  { emailLocalPart: "boulangerie.martin", archetypeKey: "baker", nameIndex: 0 },
  { emailLocalPart: "le.bar.perche", archetypeKey: "bar", nameIndex: 0 },
  { emailLocalPart: "atelier.luma", archetypeKey: "ceramic", nameIndex: 0 },
];

export const EVENT_NAME_TEMPLATES: Record<string, string[]> = {
  workshop: [
    "Atelier poterie",
    "Initiation au levain",
    "Cours de dessin",
    "Atelier bijou",
    "Stage photo rue",
    "Atelier impression",
  ],
  exhibition: [
    "Expo photo",
    "Vernissage collectif",
    "Cimaises ouvertes",
    "Expo de saison",
    "Accrochage studio",
  ],
  market: [
    "Marché créateurs",
    "Marché paysan",
    "Halles du dimanche",
    "Marché de Noël",
    "Puces artisanales",
  ],
  tasting: [
    "Dégustation vins",
    "Cupper café",
    "Apéro bières",
    "Plateau fromages",
    "Atelier chocolat",
  ],
  concert: [
    "Concert acoustique",
    "Session live",
    "Jazz au comptoir",
    "Folk du soir",
    "Scène ouverte",
  ],
  festival: [
    "Fest'quartier",
    "Nuit des arts",
    "Fête des halles",
    "Week-end brassage",
  ],
  conference: [
    "Rencontre créateurs",
    "Table ronde arts",
    "Conférence métier",
  ],
  performance: [
    "Lecture spectacle",
    "Perf dansée",
    "Soirée plateau",
    "Impro sur scène",
  ],
  meetup: [
    "Apéro créateurs",
    "Afterwork atelier",
    "Café rencontre",
    "Cercle des makers",
  ],
  online_event: [
    "Live cooking",
    "Atelier visio",
    "Demo en ligne",
    "Salon virtuel",
    "Cours à distance",
  ],
};

export const CUSTOM_LOCATION_LABELS: Record<string, string[]> = {
  paris: [
    "Parc des Buttes-Chaumont, Paris",
    "Canal Saint-Martin, Paris",
    "Place de la République, Paris",
    "Jardin du Luxembourg, Paris",
  ],
  lyon: [
    "Place Bellecour, Lyon",
    "Parc de la Tête d'Or, Lyon",
    "Quais de Saône, Lyon",
  ],
  bordeaux: [
    "Place de la Bourse, Bordeaux",
    "Quai des Chartrons, Bordeaux",
    "Jardin Public, Bordeaux",
  ],
  marseille: [
    "Cours Julien, Marseille",
    "Palais Longchamp, Marseille",
    "Place Jean-Jaurès, Marseille",
  ],
  nantes: [
    "Île de Nantes, Nantes",
    "Place du Bouffay, Nantes",
    "Jardin des Plantes, Nantes",
  ],
  toulouse: [
    "Place du Capitole, Toulouse",
    "Prairie des Filtres, Toulouse",
    "Jardin des Plantes, Toulouse",
  ],
  rennes: ["Parlement de Bretagne, Rennes", "Parc du Thabor, Rennes"],
  dijon: ["Place de la Libération, Dijon", "Marché des Halles, Dijon"],
  "aix-en-provence": [
    "Cours Mirabeau, Aix-en-Provence",
    "Place de l'Hôtel de Ville, Aix-en-Provence",
  ],
  avignon: ["Place de l'Horloge, Avignon", "Jardin des Doms, Avignon"],
  beaune: ["Hôtel-Dieu, Beaune", "Place Carnot, Beaune"],
  colmar: ["Petite Venise, Colmar", "Place de la Cathédrale, Colmar"],
  annecy: ["Vieille ville, Annecy", "Jardin de l'Europe, Annecy"],
  albi: ["Place Sainte-Cécile, Albi", "Jardin national, Albi"],
  carcassonne: ["Cité de Carcassonne, Carcassonne", "Bastide Saint-Louis, Carcassonne"],
  arles: ["Place du Forum, Arles", "Jardin d'été, Arles"],
  uzes: ["Place aux Herbes, Uzès", "Duché d'Uzès, Uzès"],
  nimes: ["Jardins de la Fontaine, Nîmes", "Écusson, Nîmes"],
  rodez: ["Place du Bourg, Rodez", "Cathédrale Notre-Dame, Rodez"],
};

export const GUEST_DESCRIPTIONS = [
  "Curieuse des marchés de quartier et des concerts intimistes.",
  "Toujours partant pour une dégustation ou un atelier le week-end.",
  "Je suis les créateurs locaux et je réserve dès qu'un live s'annonce.",
  "Amatrice de galeries, de pain au levain et de toits-terrasses.",
];

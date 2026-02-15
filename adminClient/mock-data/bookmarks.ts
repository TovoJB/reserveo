export type Bookmark = {
  id: string;
  title: string;
  url: string;
  description: string;
  favicon: string;
  collectionId: string;
  tags: string[];
  createdAt: string;
  isFavorite: boolean;
  hasDarkIcon?: boolean;
  floorId?: string; // Added floorId for Excalidraw mapping
  location?: string;
};

export type Collection = {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  count: number;
};

export const collections: Collection[] = [
  {
    id: "all",
    name: "Tous les Espaces",
    icon: "bookmark",
    color: "neutral",
    count: 24,
  },
  {
    id: "prive",
    name: "Espaces Privés",
    icon: "home",
    color: "violet",
    count: 8,
  },
  { id: "public", name: "Espaces Publics", icon: "users", color: "blue", count: 12 },
  { id: "luxe", name: "Espaces de Luxe", icon: "sparkles", color: "amber", count: 6 },
];

export const tags: Tag[] = [
  {
    id: "parking",
    name: "Parking",
    color: "bg-blue-500/10 text-blue-500",
    count: 15,
  },
  {
    id: "picine",
    name: "Picine",
    color: "bg-cyan-500/10 text-cyan-500",
    count: 6,
  },
  {
    id: "marriage",
    name: "Mariage",
    color: "bg-pink-500/10 text-pink-500",
    count: 12,
  },
  {
    id: "wifi",
    name: "WiFi",
    color: "bg-indigo-500/10 text-indigo-500",
    count: 20,
  },
  {
    id: "climatisation",
    name: "Climatisation",
    color: "bg-emerald-500/10 text-emerald-500",
    count: 18,
  },
  {
    id: "restauration",
    name: "Restauration",
    color: "bg-orange-500/10 text-orange-500",
    count: 10,
  },
];

export const bookmarks: Bookmark[] = [
  {
    id: "1",
    title: "Espace Cristal - Ivato",
    url: "https://maps.google.com/?q=Espace+Cristal+Ivato",
    description: "Une salle de réception prestigieuse avec vue panoramique, idéale pour les grands mariages.",
    favicon: "https://api.dicebear.com/7.x/initials/svg?seed=EC",
    collectionId: "luxe",
    tags: ["marriage", "parking", "climatisation"],
    createdAt: "2024-01-15",
    isFavorite: true,
    floorId: "espace-cristal",
    location: "Ivato, Antananarivo"
  },
  {
    id: "2",
    title: "Jardin de l'Eden",
    url: "https://maps.google.com/?q=Jardin+Eden+Tana",
    description: "Espace extérieur verdoyant avec picine, parfait pour des cocktails ou des réceptions intimistes.",
    favicon: "https://api.dicebear.com/7.x/initials/svg?seed=JE",
    collectionId: "prive",
    tags: ["picine", "parking", "marriage"],
    createdAt: "2024-01-14",
    isFavorite: true,
    floorId: "jardin-eden",
    location: "Ambohibao"
  },
  {
    id: "3",
    title: "Salle Polyvalente - City Center",
    url: "https://maps.google.com/?q=City+Center+Tana",
    description: "Espace modulable en plein centre ville, adapté pour conférences et événements d'entreprise.",
    favicon: "https://api.dicebear.com/7.x/initials/svg?seed=SP",
    collectionId: "public",
    tags: ["wifi", "climatisation", "parking"],
    createdAt: "2024-01-13",
    isFavorite: false,
    floorId: "city-center",
    location: "Analakely"
  },
  {
    id: "4",
    title: "Villa Les Palmiers",
    url: "https://maps.google.com/?q=Villa+Palmiers+Ankadikely",
    description: "Villa luxueuse avec grand jardin et picine pour événements privés exclusifs.",
    favicon: "https://api.dicebear.com/7.x/initials/svg?seed=VP",
    collectionId: "prive",
    tags: ["picine", "parking", "wifi"],
    createdAt: "2024-01-12",
    isFavorite: true,
    floorId: "villa-palmiers",
    location: "Ankadikely"
  },
  {
    id: "5",
    title: "Espace Horizon",
    url: "https://maps.google.com/?q=Espace+Horizon+Andoharanofotsy",
    description: "Vaste espace avec plusieurs salles et un grand parking sécurisé.",
    favicon: "https://api.dicebear.com/7.x/initials/svg?seed=EH",
    collectionId: "public",
    tags: ["parking", "restauration", "climatisation"],
    createdAt: "2024-01-11",
    isFavorite: false,
    floorId: "espace-horizon",
    location: "Andoharanofotsy"
  }
];

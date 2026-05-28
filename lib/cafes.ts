export type Cafe = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  score: number;
  rating?: number;
  price?: string;
  openNow?: boolean;
  tags: string[];
  source: "osm" | "fallback";
};

export type CafeSearchPoint = {
  lat: number;
  lng: number;
};

export const TORONTO_CENTER: CafeSearchPoint = {
  lat: 43.6532,
  lng: -79.3832,
};

type FallbackCafe = Omit<Cafe, "distanceMeters" | "score" | "source"> & {
  baseScore: number;
};

const fallbackCafes: FallbackCafe[] = [
  {
    id: "fallback-pilot-ossington",
    name: "Pilot Coffee Roasters",
    address: "Ossington Avenue",
    lat: 43.6476,
    lng: -79.4207,
    rating: 4.6,
    price: "$$",
    openNow: true,
    tags: ["specialty", "roaster", "work-friendly", "pastries"],
    baseScore: 92,
  },
  {
    id: "fallback-neo-king",
    name: "Neo Coffee Bar",
    address: "King Street East",
    lat: 43.6507,
    lng: -79.3595,
    rating: 4.6,
    price: "$$",
    openNow: true,
    tags: ["matcha", "minimal", "pastries", "date spot"],
    baseScore: 90,
  },
  {
    id: "fallback-sam-james",
    name: "Sam James Coffee Bar",
    address: "Queen Street West",
    lat: 43.6486,
    lng: -79.3971,
    rating: 4.5,
    price: "$$",
    openNow: true,
    tags: ["espresso", "local", "quick stop"],
    baseScore: 88,
  },
  {
    id: "fallback-forget-me-not",
    name: "Forget Me Not Cafe",
    address: "Adelaide Street West",
    lat: 43.6489,
    lng: -79.3901,
    rating: 4.7,
    price: "$$",
    openNow: true,
    tags: ["cozy", "study", "brunch", "work-friendly"],
    baseScore: 89,
  },
  {
    id: "fallback-found",
    name: "Found Coffee",
    address: "College Street",
    lat: 43.6564,
    lng: -79.4033,
    rating: 4.7,
    price: "$$",
    openNow: true,
    tags: ["australian", "sunny", "brunch", "patio"],
    baseScore: 91,
  },
  {
    id: "fallback-fahrenheit",
    name: "Fahrenheit Coffee",
    address: "Lombard Street",
    lat: 43.6505,
    lng: -79.3751,
    rating: 4.6,
    price: "$$",
    openNow: true,
    tags: ["espresso", "small batch", "downtown"],
    baseScore: 87,
  },
  {
    id: "fallback-white-squirrel",
    name: "White Squirrel Coffee Shop",
    address: "Queen Street West",
    lat: 43.6436,
    lng: -79.4222,
    rating: 4.4,
    price: "$",
    openNow: true,
    tags: ["neighbourhood", "park stop", "casual"],
    baseScore: 84,
  },
  {
    id: "fallback-rooster",
    name: "Rooster Coffee House",
    address: "Broadview Avenue",
    lat: 43.6712,
    lng: -79.3546,
    rating: 4.5,
    price: "$$",
    openNow: true,
    tags: ["view", "work-friendly", "east end", "patio"],
    baseScore: 86,
  },
];

export function getFallbackCafes(origin: CafeSearchPoint, radiusMeters: number) {
  return fallbackCafes
    .map((cafe) => {
      const distanceMeters = Math.round(getDistanceMeters(origin, cafe));
      return {
        ...cafe,
        distanceMeters,
        score: scoreCafe(cafe.baseScore, distanceMeters, cafe.tags),
        source: "fallback" as const,
      };
    })
    .filter((cafe) => cafe.distanceMeters <= radiusMeters || radiusMeters >= 7000)
    .sort((a, b) => b.score - a.score);
}

export function getDistanceMeters(from: CafeSearchPoint, to: CafeSearchPoint) {
  const earthRadiusMeters = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function scoreCafe(baseScore: number, distanceMeters: number, tags: string[]) {
  const distanceBoost = Math.max(0, 18 - distanceMeters / 220);
  const vibeBoost = tags.reduce((total, tag) => {
    if (["specialty", "roaster", "work-friendly", "patio", "cozy"].includes(tag)) {
      return total + 2.5;
    }
    return total;
  }, 0);

  return Math.min(99, Math.round(baseScore + distanceBoost + vibeBoost));
}

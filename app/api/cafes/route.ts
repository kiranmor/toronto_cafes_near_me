import { NextResponse } from "next/server";
import {
  type Cafe,
  type CafeSearchPoint,
  getDistanceMeters,
  getFallbackCafes,
  scoreCafe,
  TORONTO_CENTER,
} from "@/lib/cafes";

type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const DEFAULT_RADIUS_METERS = 3000;
const MAX_RADIUS_METERS = 8000;

export const revalidate = 900;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getSearchPoint(searchParams);
  const radiusMeters = getRadius(searchParams);

  try {
    const cafes = await fetchOsmCafes(origin, radiusMeters);

    if (cafes.length > 0) {
      return NextResponse.json({
        cafes,
        source: "osm",
        radiusMeters,
        origin,
      });
    }
  } catch (error) {
    console.error("Cafe lookup failed", error);
  }

  return NextResponse.json({
    cafes: getFallbackCafes(origin, radiusMeters),
    source: "fallback",
    radiusMeters,
    origin,
  });
}

function getSearchPoint(searchParams: URLSearchParams): CafeSearchPoint {
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }

  return TORONTO_CENTER;
}

function getRadius(searchParams: URLSearchParams) {
  const radius = Number(searchParams.get("radius"));

  if (!Number.isFinite(radius)) {
    return DEFAULT_RADIUS_METERS;
  }

  return Math.min(MAX_RADIUS_METERS, Math.max(800, Math.round(radius)));
}

async function fetchOsmCafes(origin: CafeSearchPoint, radiusMeters: number) {
  const query = `
    [out:json][timeout:18];
    (
      node["amenity"="cafe"](around:${radiusMeters},${origin.lat},${origin.lng});
      way["amenity"="cafe"](around:${radiusMeters},${origin.lat},${origin.lng});
      relation["amenity"="cafe"](around:${radiusMeters},${origin.lat},${origin.lng});
      node["shop"="coffee"](around:${radiusMeters},${origin.lat},${origin.lng});
      way["shop"="coffee"](around:${radiusMeters},${origin.lat},${origin.lng});
      relation["shop"="coffee"](around:${radiusMeters},${origin.lat},${origin.lng});
    );
    out center tags 80;
  `;

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    body: new URLSearchParams({ data: query }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "toronto-cafe-finder/0.1",
    },
    next: {
      revalidate,
    },
  });

  if (!response.ok) {
    throw new Error(`Overpass returned ${response.status}`);
  }

  const data = (await response.json()) as OverpassResponse;
  const cafes = (data.elements ?? [])
    .map((element) => toCafe(element, origin))
    .filter((cafe): cafe is Cafe => Boolean(cafe))
    .sort((a, b) => b.score - a.score);

  return dedupeCafes(cafes).slice(0, 24);
}

function toCafe(element: OverpassElement, origin: CafeSearchPoint): Cafe | null {
  const tags = element.tags ?? {};
  const name = tags.name?.trim();
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;

  if (!name || !lat || !lng || isChainCafe(name)) {
    return null;
  }

  const distanceMeters = Math.round(getDistanceMeters(origin, { lat, lng }));
  const cafeTags = getCafeTags(tags);
  const dataScore =
    58 +
    (tags.website || tags["contact:website"] ? 6 : 0) +
    (tags.opening_hours ? 5 : 0) +
    (tags.outdoor_seating === "yes" ? 5 : 0) +
    (tags.internet_access === "wlan" ? 5 : 0);

  return {
    id: `${element.type}-${element.id}`,
    name,
    address: formatAddress(tags),
    lat,
    lng,
    distanceMeters,
    score: scoreCafe(dataScore, distanceMeters, cafeTags),
    price: tags["payment:cash"] === "no" ? "$$" : undefined,
    openNow: tags.opening_hours ? undefined : undefined,
    tags: cafeTags,
    source: "osm",
  };
}

function getCafeTags(tags: Record<string, string>) {
  const cafeTags = new Set<string>();

  if (tags.cuisine?.includes("coffee")) cafeTags.add("coffee");
  if (tags.outdoor_seating === "yes") cafeTags.add("patio");
  if (tags.internet_access === "wlan") cafeTags.add("wifi");
  if (tags.roastery === "yes" || tags.craft === "coffee_roaster") cafeTags.add("roaster");
  if (tags.takeaway === "yes") cafeTags.add("takeaway");
  if (tags.name?.toLowerCase().includes("roaster")) cafeTags.add("specialty");
  if (tags.name?.toLowerCase().includes("espresso")) cafeTags.add("espresso");
  if (tags.opening_hours) cafeTags.add("hours listed");

  if (cafeTags.size === 0) {
    cafeTags.add("local cafe");
  }

  return Array.from(cafeTags).slice(0, 5);
}

function formatAddress(tags: Record<string, string>) {
  const streetNumber = tags["addr:housenumber"];
  const street = tags["addr:street"];
  const neighbourhood = tags["addr:neighbourhood"];

  if (streetNumber && street) return `${streetNumber} ${street}`;
  if (street) return street;
  if (neighbourhood) return neighbourhood;
  return "Address available in map";
}

function dedupeCafes(cafes: Cafe[]) {
  const seen = new Set<string>();

  return cafes.filter((cafe) => {
    const key = cafe.name.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isChainCafe(name: string) {
  const normalized = name.toLowerCase();
  return [
    "au pain dore",
    "au pain doré",
    "aroma espresso bar",
    "chatime",
    "coffee time",
    "good earth",
    "incha",
    "mcdonald",
    "pret a manger",
    "second cup",
    "starbucks",
    "tim hortons",
    "timothy",
    "tiger sugar",
  ].some((chain) => normalized.includes(chain));
}

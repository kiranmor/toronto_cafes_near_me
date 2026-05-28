"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Coffee,
  Crosshair,
  Filter,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Wifi,
} from "lucide-react";
import type { Cafe, CafeSearchPoint } from "@/lib/cafes";
import { TORONTO_CENTER } from "@/lib/cafes";

type ApiResponse = {
  cafes: Cafe[];
  source: "osm" | "fallback";
  radiusMeters: number;
  origin: CafeSearchPoint;
};

type FilterKey = "all" | "work" | "patio" | "specialty" | "closest";

const radiusOptions = [1500, 3000, 5000, 8000];
const defaultRadius = 3000;

const areaPresets = [
  { label: "Downtown", lat: 43.6532, lng: -79.3832 },
  { label: "West End", lat: 43.648, lng: -79.43 },
  { label: "East End", lat: 43.6712, lng: -79.3546 },
  { label: "Midtown", lat: 43.7044, lng: -79.3987 },
];

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Best" },
  { key: "work", label: "Work" },
  { key: "patio", label: "Patio" },
  { key: "specialty", label: "Specialty" },
  { key: "closest", label: "Closest" },
];

const cafePhotos = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1514066558159-fc8c737ef259?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=900&q=80",
];

export default function CafeFinder() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [source, setSource] = useState<ApiResponse["source"]>("fallback");
  const [origin, setOrigin] = useState<CafeSearchPoint>(TORONTO_CENTER);
  const [radius, setRadius] = useState(defaultRadius);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Finding cafes");
  const [isLoading, setIsLoading] = useState(true);
  const [locationLabel, setLocationLabel] = useState("Toronto");

  useEffect(() => {
    void loadCafes(TORONTO_CENTER, defaultRadius, "Toronto");
  }, []);

  const filteredCafes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visible = cafes.filter((cafe) => {
      const searchable = `${cafe.name} ${cafe.address} ${cafe.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesFilter =
        activeFilter === "all" ||
        activeFilter === "closest" ||
        (activeFilter === "work" &&
          cafe.tags.some((tag) => ["wifi", "work-friendly", "study"].includes(tag))) ||
        (activeFilter === "patio" && cafe.tags.includes("patio")) ||
        (activeFilter === "specialty" &&
          cafe.tags.some((tag) => ["specialty", "roaster", "espresso"].includes(tag)));

      return matchesQuery && matchesFilter;
    });

    if (activeFilter === "closest") {
      return [...visible].sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    return visible;
  }, [activeFilter, cafes, query]);

  async function loadCafes(point: CafeSearchPoint, selectedRadius: number, label: string) {
    setIsLoading(true);
    setStatus("Finding cafes");

    try {
      const params = new URLSearchParams({
        lat: String(point.lat),
        lng: String(point.lng),
        radius: String(selectedRadius),
      });
      const response = await fetch(`/api/cafes?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Cafe lookup failed");
      }

      const data = (await response.json()) as ApiResponse;
      setCafes(data.cafes);
      setSource(data.source);
      setOrigin(data.origin);
      setLocationLabel(label);
      setStatus(data.source === "osm" ? "Live cafe results" : "Toronto fallback results");
    } catch {
      setStatus("Showing saved Toronto cafes");
    } finally {
      setIsLoading(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setStatus("Location is not available in this browser");
      return;
    }

    setIsLoading(true);
    setStatus("Locating");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        void loadCafes(point, radius, "Near you");
      },
      () => {
        setIsLoading(false);
        setStatus("Location blocked, showing Toronto");
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 300000 },
    );
  }

  function changeRadius(nextRadius: number) {
    setRadius(nextRadius);
    void loadCafes(origin, nextRadius, locationLabel);
  }

  return (
    <main className="min-h-screen bg-[#fff4f0] text-[#241814]">
      <section className="relative isolate overflow-hidden border-b border-black/10 bg-[#5b2f35] text-white">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(65,31,35,.94), rgba(120,58,66,.56)), url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="mx-auto grid min-h-[520px] max-w-7xl content-end gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
          <div className="max-w-3xl pb-4">
            <div className="mb-5 inline-flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-2 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Toronto coffee guide
            </div>
            <h1 className="text-5xl font-semibold leading-none tracking-normal sm:text-7xl lg:text-8xl">
              Cool cafes near you
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-7 text-white/82 sm:text-xl">
              Independent-feeling coffee spots ranked by distance, useful tags, and cafe signals from live map data.
            </p>
          </div>

          <div className="self-end border border-white/18 bg-[#fff7f2]/94 p-4 text-[#241814] shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4">
              <div>
                <p className="text-sm text-black/55">Current area</p>
                <p className="text-2xl font-semibold">{locationLabel}</p>
              </div>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="inline-flex h-11 items-center gap-2 bg-[#bf5a6a] px-4 text-sm font-medium text-white transition hover:bg-[#9e3f4e]"
              >
                <LocateFixed className="h-4 w-4" />
                Near me
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {areaPresets.map((area) => (
                <button
                  key={area.label}
                  type="button"
                  onClick={() => void loadCafes(area, radius, area.label)}
                  className="border border-black/10 bg-white px-3 py-3 text-sm font-medium transition hover:border-[#bf5a6a] hover:text-[#9e3f4e]"
                >
                  {area.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#fff9f3]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:px-10">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/42" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cafes, streets, tags"
              className="h-12 w-full border border-black/12 bg-white pl-11 pr-4 text-base outline-none transition placeholder:text-black/42 focus:border-[#bf5a6a]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 items-center gap-2 px-1 text-sm font-medium text-black/62">
              <Filter className="h-4 w-4" />
              Filter
            </span>
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`h-10 border px-4 text-sm font-medium transition ${
                  activeFilter === filter.key
                    ? "border-[#5b2f35] bg-[#5b2f35] text-white"
                    : "border-black/12 bg-white text-black/68 hover:border-[#5b2f35]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 items-center gap-2 px-1 text-sm font-medium text-black/62">
              <SlidersHorizontal className="h-4 w-4" />
              Radius
            </span>
            {radiusOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeRadius(option)}
                className={`h-10 border px-3 text-sm font-medium transition ${
                  radius === option
                    ? "border-[#bf5a6a] bg-[#bf5a6a] text-white"
                    : "border-black/12 bg-white text-black/68 hover:border-[#bf5a6a]"
                }`}
              >
                {formatDistance(option)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-10">
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-normal text-[#9e3f4e]">
                {isLoading ? "Loading" : `${filteredCafes.length} cafes`}
              </p>
              <h2 className="mt-1 text-3xl font-semibold">Ranked cafe picks</h2>
            </div>
            <p className="text-sm text-black/55">
              {status} - {source === "osm" ? "OpenStreetMap" : "saved list"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <CafeSkeleton key={index} />)
              : filteredCafes.map((cafe, index) => <CafeCard cafe={cafe} index={index} key={cafe.id} />)}
          </div>

          {!isLoading && filteredCafes.length === 0 ? (
            <div className="border border-black/12 bg-white p-8 text-center">
              <Coffee className="mx-auto h-8 w-8 text-[#bf5a6a]" />
              <p className="mt-3 text-lg font-semibold">No cafes match this view</p>
              <p className="mt-1 text-sm text-black/56">Try a wider radius or clear the search text.</p>
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden border border-black/12 bg-[#5b2f35] text-white">
            <div className="relative h-[430px] bg-[#70434a]">
              <div className="absolute inset-0 opacity-65 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[#bf5a6a] shadow-xl">
                <Crosshair className="h-7 w-7" />
              </div>
              {filteredCafes.slice(0, 8).map((cafe, index) => (
                <a
                  key={cafe.id}
                  href={getMapUrl(cafe)}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute flex h-9 w-9 items-center justify-center bg-[#fff9f3] text-[#5b2f35] shadow-lg transition hover:scale-110"
                  style={getPinPosition(index)}
                  aria-label={`Open ${cafe.name} in maps`}
                >
                  <MapPin className="h-5 w-5" />
                </a>
              ))}
            </div>
            <div className="border-t border-white/15 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/62">Map preview</p>
                  <p className="text-lg font-semibold">{locationLabel}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/cafes/@${origin.lat},${origin.lng},14z`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 bg-white px-3 text-sm font-medium text-[#5b2f35] transition hover:bg-[#f5dbe0]"
                >
                  <Navigation className="h-4 w-4" />
                  Maps
                </a>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function CafeCard({ cafe, index }: { cafe: Cafe; index: number }) {
  const imageUrl = cafePhotos[index % cafePhotos.length];

  return (
    <article className="overflow-hidden border border-black/12 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className="h-36 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(91,47,53,.05), rgba(91,47,53,.36)), url('${imageUrl}')`,
        }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold">{cafe.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-black/55">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{cafe.address}</span>
            </p>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center bg-[#5b2f35] text-white">
            <span className="text-lg font-semibold">{cafe.score}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Metric icon={<Navigation className="h-4 w-4" />} label={formatDistance(cafe.distanceMeters)} />
          {cafe.rating ? <Metric icon={<Star className="h-4 w-4" />} label={cafe.rating.toFixed(1)} /> : null}
          {cafe.tags.includes("wifi") || cafe.tags.includes("work-friendly") ? (
            <Metric icon={<Wifi className="h-4 w-4" />} label="Work" />
          ) : null}
        </div>

        <div className="mt-4 flex min-h-8 flex-wrap gap-2">
          {cafe.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="border border-[#f0cbd1] bg-[#fff9f3] px-2.5 py-1 text-xs font-medium text-black/62">
              {tag}
            </span>
          ))}
        </div>

        <a
          href={getMapUrl(cafe)}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 bg-[#bf5a6a] px-4 text-sm font-semibold text-white transition hover:bg-[#9e3f4e]"
        >
          Open directions
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

function Metric({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 border border-black/10 px-2.5 text-sm font-medium text-black/64">
      {icon}
      {label}
    </span>
  );
}

function CafeSkeleton() {
  return (
    <div className="overflow-hidden border border-black/10 bg-white">
      <div className="h-36 animate-pulse bg-black/10" />
      <div className="space-y-4 p-4">
        <div className="h-6 w-2/3 animate-pulse bg-black/10" />
        <div className="h-4 w-1/2 animate-pulse bg-black/10" />
        <div className="flex gap-2">
          <div className="h-8 w-20 animate-pulse bg-black/10" />
          <div className="h-8 w-16 animate-pulse bg-black/10" />
        </div>
      </div>
    </div>
  );
}

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

function getMapUrl(cafe: Cafe) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${cafe.name} ${cafe.lat},${cafe.lng}`,
  )}`;
}

function getPinPosition(index: number) {
  const positions = [
    { left: "58%", top: "28%" },
    { left: "33%", top: "34%" },
    { left: "69%", top: "47%" },
    { left: "42%", top: "59%" },
    { left: "22%", top: "51%" },
    { left: "76%", top: "66%" },
    { left: "49%", top: "76%" },
    { left: "61%", top: "58%" },
  ];

  return positions[index % positions.length];
}

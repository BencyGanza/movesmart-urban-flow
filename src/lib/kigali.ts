// Places across Rwanda (Kigali in detail, plus towns in every province), distance and fare helpers. Fares in RWF.

export type VehicleType = "bus" | "taxi" | "motorbike";

export interface Place {
  name: string;
  lat: number;
  lng: number;
}

export const KIGALI_CENTER: Place = { name: "Kigali City Centre", lat: -1.9441, lng: 30.0619 };

/** Rwanda's extent as [west, south, east, north], used to frame and limit maps. */
export const RWANDA_BOUNDS: [number, number, number, number] = [28.85, -2.84, 30.9, -1.05];
export const RWANDA_CENTER = { lat: -1.94, lng: 29.88 };

export type Province = "Kigali" | "Northern" | "Southern" | "Eastern" | "Western";

export interface Town extends Place {
  province: Province;
  kind: "city" | "town" | "park";
}

/** Main towns and destinations in every province (approximate centre points). */
export const RWANDA_TOWNS: Town[] = [
  { name: "Kigali", lat: -1.9441, lng: 30.0619, province: "Kigali", kind: "city" },
  { name: "Musanze (Ruhengeri)", lat: -1.4996, lng: 29.6344, province: "Northern", kind: "town" },
  { name: "Gicumbi (Byumba)", lat: -1.5763, lng: 30.0675, province: "Northern", kind: "town" },
  { name: "Kinigi (Volcanoes National Park)", lat: -1.43, lng: 29.595, province: "Northern", kind: "park" },
  { name: "Huye (Butare)", lat: -2.5967, lng: 29.7394, province: "Southern", kind: "town" },
  { name: "Muhanga (Gitarama)", lat: -2.0845, lng: 29.7565, province: "Southern", kind: "town" },
  { name: "Nyanza", lat: -2.3517, lng: 29.7509, province: "Southern", kind: "town" },
  { name: "Nyamagabe (Gikongoro)", lat: -2.478, lng: 29.566, province: "Southern", kind: "town" },
  { name: "Nyungwe National Park (Uwinka)", lat: -2.48, lng: 29.2, province: "Southern", kind: "park" },
  { name: "Rwamagana", lat: -1.9487, lng: 30.4347, province: "Eastern", kind: "town" },
  { name: "Kayonza", lat: -1.8989, lng: 30.5094, province: "Eastern", kind: "town" },
  { name: "Nyagatare", lat: -1.2938, lng: 30.3275, province: "Eastern", kind: "town" },
  { name: "Ngoma (Kibungo)", lat: -2.1597, lng: 30.5427, province: "Eastern", kind: "town" },
  { name: "Bugesera (Nyamata)", lat: -2.149, lng: 30.093, province: "Eastern", kind: "town" },
  { name: "Kirehe (Nyakarambi)", lat: -2.27, lng: 30.7, province: "Eastern", kind: "town" },
  { name: "Akagera National Park (entrance)", lat: -1.88, lng: 30.71, province: "Eastern", kind: "park" },
  { name: "Rubavu (Gisenyi)", lat: -1.6944, lng: 29.2564, province: "Western", kind: "town" },
  { name: "Karongi (Kibuye)", lat: -2.0603, lng: 29.3478, province: "Western", kind: "town" },
  { name: "Rusizi (Kamembe)", lat: -2.4846, lng: 28.9075, province: "Western", kind: "town" },
];

// Well-known Kigali places, used for quick search when the map service is unavailable
export const KIGALI_PLACES: Place[] = [
  { name: "Kigali City Tower (Downtown)", lat: -1.9441, lng: 30.0619 },
  { name: "Nyabugogo Bus Park", lat: -1.9395, lng: 30.0445 },
  { name: "Kimironko Market", lat: -1.9496, lng: 30.126 },
  { name: "Remera (Giporoso)", lat: -1.9585, lng: 30.112 },
  { name: "Kicukiro Centre", lat: -1.974, lng: 30.103 },
  { name: "Nyamirambo", lat: -1.978, lng: 30.042 },
  { name: "Kimihurura", lat: -1.953, lng: 30.089 },
  { name: "Kacyiru", lat: -1.9437, lng: 30.0866 },
  { name: "Kigali Convention Centre", lat: -1.9545, lng: 30.0934 },
  { name: "Amahoro Stadium", lat: -1.9563, lng: 30.1171 },
  { name: "Kigali International Airport (Kanombe)", lat: -1.9686, lng: 30.1395 },
  { name: "Kibagabaga", lat: -1.9306, lng: 30.1166 },
  { name: "Gisozi (Genocide Memorial)", lat: -1.9306, lng: 30.0606 },
  { name: "Kanombe", lat: -1.9744, lng: 30.1358 },
  { name: "Gikondo", lat: -1.9729, lng: 30.0717 },
  { name: "Kinamba", lat: -1.9387, lng: 30.0572 },
  { name: "University of Rwanda (Nyarugenge)", lat: -1.9584, lng: 30.0636 },
  { name: "Kigali Heights", lat: -1.9534, lng: 30.0927 },
];

export const VEHICLE_OPTIONS: { type: VehicleType; label: string; description: string }[] = [
  { type: "motorbike", label: "Moto", description: "Fastest, 1 passenger" },
  { type: "taxi", label: "Taxi", description: "Comfortable, up to 4" },
  { type: "bus", label: "Bus", description: "Cheapest, shared" },
];

// Fare rules: base fare + price per km, with a minimum fare.
// speedKmh is for city traffic; longer trips between towns use highwayKmh.
const FARE_RULES: Record<VehicleType, { base: number; perKm: number; min: number; speedKmh: number; highwayKmh: number }> = {
  bus: { base: 200, perKm: 25, min: 250, speedKmh: 20, highwayKmh: 50 },
  taxi: { base: 1000, perKm: 600, min: 1500, speedKmh: 25, highwayKmh: 60 },
  motorbike: { base: 300, perKm: 250, min: 500, speedKmh: 30, highwayKmh: 45 },
};

/** Trips longer than this are treated as travel between towns. */
export const INTERCITY_KM = 25;

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Road distance is longer than a straight line: about 1.3x in the city, and 1.4x between
// towns because Rwanda's roads wind around the hills.
export function roadDistanceKm(a: Place, b: Place): number {
  const d = distanceKm(a, b);
  return Math.max(0.5, d * (d > INTERCITY_KM / 1.3 ? 1.4 : 1.3));
}

export function estimateFare(type: VehicleType, km: number): number {
  const r = FARE_RULES[type];
  const raw = r.base + r.perKm * km;
  return Math.max(r.min, Math.round(raw / 50) * 50);
}

export function estimateMinutes(type: VehicleType, km: number): number {
  const r = FARE_RULES[type];
  if (km <= INTERCITY_KM) return Math.max(3, Math.round((km / r.speedKmh) * 60));
  // The first ~10 km (getting out of town) at city speed, the rest at highway speed
  const cityKm = 10;
  return Math.round((cityKm / r.speedKmh + (km - cityKm) / r.highwayKmh) * 60);
}

export function formatRwf(amount: number | null | undefined): string {
  return `RWF ${Math.round(Number(amount || 0)).toLocaleString("en-US")}`;
}

/** Every place the app knows without a map service: Kigali landmarks plus towns across Rwanda. */
export const ALL_PLACES: Place[] = [
  ...KIGALI_PLACES,
  ...RWANDA_TOWNS.filter((t) => t.kind !== "city").map(({ name, lat, lng }) => ({ name, lat, lng })),
];

export function searchLocalPlaces(query: string): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...KIGALI_PLACES.slice(0, 4), ...ALL_PLACES.slice(KIGALI_PLACES.length, KIGALI_PLACES.length + 3)];
  return ALL_PLACES.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
}

/** Human-friendly travel time, e.g. "45 min" or "2 h 10 min". */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

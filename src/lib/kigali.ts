// Kigali locations, distance and fare helpers (all fares in RWF)

export type VehicleType = "bus" | "taxi" | "motorbike";

export interface Place {
  name: string;
  lat: number;
  lng: number;
}

export const KIGALI_CENTER: Place = { name: "Kigali City Centre", lat: -1.9441, lng: 30.0619 };

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

// Fare rules: base fare + price per km, with a minimum fare
const FARE_RULES: Record<VehicleType, { base: number; perKm: number; min: number; speedKmh: number }> = {
  bus: { base: 200, perKm: 25, min: 250, speedKmh: 20 },
  taxi: { base: 1000, perKm: 600, min: 1500, speedKmh: 25 },
  motorbike: { base: 300, perKm: 250, min: 500, speedKmh: 30 },
};

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Road distance is longer than a straight line; 1.3 is a common city approximation
export function roadDistanceKm(a: Place, b: Place): number {
  return Math.max(0.5, distanceKm(a, b) * 1.3);
}

export function estimateFare(type: VehicleType, km: number): number {
  const r = FARE_RULES[type];
  const raw = r.base + r.perKm * km;
  return Math.max(r.min, Math.round(raw / 50) * 50);
}

export function estimateMinutes(type: VehicleType, km: number): number {
  return Math.max(3, Math.round((km / FARE_RULES[type].speedKmh) * 60));
}

export function formatRwf(amount: number | null | undefined): string {
  return `RWF ${Math.round(Number(amount || 0)).toLocaleString("en-US")}`;
}

export function searchLocalPlaces(query: string): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return KIGALI_PLACES.slice(0, 6);
  return KIGALI_PLACES.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
}

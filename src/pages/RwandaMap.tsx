import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  createRwandaMap,
  makeMarkerEl,
  maplibregl,
  RWANDA_VIEW_BOUNDS,
  setLayerVisible,
  setSatellite,
  setTerrainEnabled,
  type LngLat,
} from "@/features/map/rwandaMap";
import {
  KIGALI_CENTER,
  RWANDA_TOWNS,
  type Town,
  estimateFare,
  estimateMinutes,
  formatMinutes,
  formatRwf,
  roadDistanceKm,
} from "@/lib/kigali";
import { AlertCircle, Loader2, X } from "lucide-react";

type Region = { id: string; label: string; bounds: [LngLat, LngLat] };

const REGIONS: Region[] = [
  { id: "all", label: "All of Rwanda", bounds: RWANDA_VIEW_BOUNDS },
  { id: "kigali", label: "Kigali", bounds: [[29.98, -2.05], [30.2, -1.88]] },
  { id: "north", label: "Northern: Musanze and the volcanoes", bounds: [[29.35, -1.65], [30.15, -1.38]] },
  { id: "west", label: "Western: Lake Kivu", bounds: [[28.85, -2.6], [29.45, -1.6]] },
  { id: "south", label: "Southern: Huye and Nyungwe", bounds: [[29.1, -2.75], [29.85, -2.0]] },
  { id: "east", label: "Eastern: Akagera", bounds: [[30.25, -2.4], [30.9, -1.1]] },
];

/** Hospital names are real; positions are approximate. */
const HOSPITALS: { name: string; lat: number; lng: number }[] = [
  { name: "King Faisal Hospital", lat: -1.9445, lng: 30.0937 },
  { name: "University Teaching Hospital of Kigali (CHUK)", lat: -1.9447, lng: 30.0593 },
  { name: "Rwanda Military Hospital", lat: -1.964, lng: 30.135 },
  { name: "Kibagabaga Hospital", lat: -1.931, lng: 30.1125 },
  { name: "University Teaching Hospital of Butare (CHUB)", lat: -2.596, lng: 29.74 },
  { name: "Ruhengeri Referral Hospital", lat: -1.499, lng: 29.633 },
  { name: "Gisenyi District Hospital", lat: -1.7, lng: 29.26 },
  { name: "Kibuye Referral Hospital", lat: -2.06, lng: 29.348 },
  { name: "Nyagatare District Hospital", lat: -1.296, lng: 30.327 },
  { name: "Rwamagana Provincial Hospital", lat: -1.95, lng: 30.44 },
  { name: "Gihundwe District Hospital", lat: -2.486, lng: 28.905 },
  { name: "Kabgayi Hospital", lat: -2.092, lng: 29.755 },
];

const TOWN_COLOR: Record<Town["kind"], string> = { city: "#0078A8", town: "#20603D", park: "#7a5c3a" };
const VEHICLE = { bus: { badge: "B", color: "#0078A8" }, taxi: { badge: "T", color: "#102A43" }, motorbike: { badge: "M", color: "#c27c00" } };

type Selected =
  | { kind: "town"; town: Town }
  | { kind: "hospital"; name: string }
  | { kind: "vehicle"; label: string; type: string };

type LayerKey = "towns" | "routes" | "vehicles" | "hospitals";

const RwandaMap = () => {
  const navigate = useNavigate();
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Record<LayerKey, maplibregl.Marker[]>>({ towns: [], routes: [], vehicles: [], hospitals: [] });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [terrain, setTerrain] = useState(true);
  const [satellite, setSat] = useState(false);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ towns: true, routes: true, vehicles: true, hospitals: true });
  const [counts, setCounts] = useState({ routes: 0, vehicles: 0 });
  const [selected, setSelected] = useState<Selected | null>(null);

  useEffect(() => {
    if (!box.current) return;
    const map = createRwandaMap(box.current, {
      onReady: async (m) => {
        setStatus("ready");
        m.fitBounds(RWANDA_VIEW_BOUNDS, { padding: { top: 90, bottom: 40, left: 40, right: 60 }, pitch: 55, bearing: -15, duration: 0 });

        // Towns
        for (const t of RWANDA_TOWNS) {
          const el = makeMarkerEl({ label: t.name.replace(/ \(.*\)$/, ""), color: TOWN_COLOR[t.kind], size: t.kind === "city" ? 18 : 13, title: t.name });
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelected({ kind: "town", town: t });
            m.flyTo({ center: [t.lng, t.lat], zoom: t.kind === "city" ? 12 : 12.5, pitch: 60, essential: true });
          });
          markers.current.towns.push(new maplibregl.Marker({ element: el, anchor: "bottom", opacityWhenCovered: "1" }).setLngLat([t.lng, t.lat]).addTo(m));
        }

        // Hospitals
        for (const h of HOSPITALS) {
          const el = makeMarkerEl({ badge: "H", color: "#d62828", size: 18, title: h.name });
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelected({ kind: "hospital", name: h.name });
          });
          markers.current.hospitals.push(new maplibregl.Marker({ element: el, opacityWhenCovered: "0.6" }).setLngLat([h.lng, h.lat]).addTo(m));
        }

        // Bus routes and vehicles from the MoveSmart database
        const [routesRes, vehiclesRes] = await Promise.all([
          supabase.from("routes").select("*").eq("is_active", true),
          supabase.from("vehicles").select("id,license_plate,model,vehicle_type,current_latitude,current_longitude").eq("is_active", true),
        ]);
        if (!mapRef.current) return;
        const routes = routesRes.data || [];
        m.addSource("bus-routes", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: routes.map((r) => ({
              type: "Feature",
              properties: { name: r.name, intercity: Number(r.distance_km) > 25 },
              geometry: { type: "LineString", coordinates: [[r.start_longitude, r.start_latitude], [r.end_longitude, r.end_latitude]] },
            })),
          },
        });
        m.addLayer({
          id: "bus-routes",
          type: "line",
          source: "bus-routes",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": ["case", ["get", "intercity"], "#c2417a", "#0078A8"],
            "line-width": ["interpolate", ["linear"], ["zoom"], 7, 2.5, 12, 5],
            "line-dasharray": [2, 1.5],
            "line-opacity": 0.9,
          },
        });
        const vehicles = (vehiclesRes.data || []).filter((v) => v.current_latitude != null);
        for (const v of vehicles) {
          const style = VEHICLE[v.vehicle_type as keyof typeof VEHICLE] ?? VEHICLE.taxi;
          const el = makeMarkerEl({ badge: style.badge, color: style.color, size: 18, title: `${v.model} · ${v.license_plate}` });
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelected({ kind: "vehicle", label: `${v.model} · ${v.license_plate}`, type: v.vehicle_type });
          });
          markers.current.vehicles.push(new maplibregl.Marker({ element: el, opacityWhenCovered: "0.6" }).setLngLat([v.current_longitude!, v.current_latitude!]).addTo(m));
        }
        setCounts({ routes: routes.length, vehicles: vehicles.length });
      },
      onError: (msg) => {
        setStatus("error");
        setErrorMsg(msg);
      },
    });
    mapRef.current = map;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(box.current);
    return () => {
      ro.disconnect();
      mapRef.current = null;
      map.remove();
    };
  }, []);

  const toggleLayer = (key: LayerKey, on: boolean) => {
    setLayers((l) => ({ ...l, [key]: on }));
    const map = mapRef.current;
    if (!map) return;
    if (key === "routes") setLayerVisible(map, "bus-routes", on);
    for (const mk of markers.current[key]) mk.getElement().style.display = on ? "" : "none";
  };

  const goTo = (r: Region) => {
    setSelected(null);
    mapRef.current?.fitBounds(r.bounds, { padding: 50, pitch: 60, bearing: -20, duration: 2200, essential: true });
  };

  const book = (town: Town, dir: "from" | "to") => {
    const p = new URLSearchParams();
    const set = (k: string, pl: { name: string; lat: number; lng: number }) => {
      p.set(k, pl.name);
      p.set(`${k}Lat`, String(pl.lat));
      p.set(`${k}Lng`, String(pl.lng));
    };
    if (dir === "to") {
      set("from", KIGALI_CENTER);
      set("to", town);
    } else {
      set("from", town);
    }
    navigate(`/dashboard?${p.toString()}`);
  };

  const townInfo = (t: Town) => {
    const km = roadDistanceKm(KIGALI_CENTER, t);
    return { km, fare: estimateFare("bus", km), time: estimateMinutes("bus", km) };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 flex flex-col lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Side panel */}
        <aside className="order-2 lg:order-1 border-r bg-card lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <div className="p-5 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Rwanda in 3D</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Real terrain of the land of a thousand hills, with towns, bus routes, vehicles and hospitals.
                Right-drag or use two fingers to tilt and rotate.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="sw-terrain">3D terrain</Label>
                <Switch
                  id="sw-terrain"
                  checked={terrain}
                  onCheckedChange={(on) => {
                    setTerrain(on);
                    if (mapRef.current) setTerrainEnabled(mapRef.current, on);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sw-sat">Satellite imagery</Label>
                <Switch
                  id="sw-sat"
                  checked={satellite}
                  onCheckedChange={(on) => {
                    setSat(on);
                    if (mapRef.current) setSatellite(mapRef.current, on);
                  }}
                />
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold">Show on the map</h2>
              <div className="mt-3 space-y-3">
                {(
                  [
                    ["towns", "Towns and parks", RWANDA_TOWNS.length],
                    ["routes", "Bus routes", counts.routes],
                    ["vehicles", "Available vehicles", counts.vehicles],
                    ["hospitals", "Hospitals", HOSPITALS.length],
                  ] as [LayerKey, string, number][]
                ).map(([key, label, n]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`ly-${key}`} className="font-normal">
                      {label} <span className="text-muted-foreground">({n})</span>
                    </Label>
                    <Switch id={`ly-${key}`} checked={layers[key]} onCheckedChange={(on) => toggleLayer(key, on)} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold">Go to</h2>
              <div className="mt-3 grid gap-2">
                {REGIONS.map((r) => (
                  <Button key={r.id} variant="outline" className="justify-start h-auto py-2 text-left whitespace-normal" onClick={() => goTo(r)}>
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="inline-block h-2 w-5 rounded align-middle mr-1" style={{ background: "#0078A8" }} /> City bus route
                <span className="inline-block h-2 w-5 rounded align-middle ml-3 mr-1" style={{ background: "#c2417a" }} /> Intercity bus
              </p>
              <p>Bus routes are drawn as straight lines between their stops. Hospital positions are approximate.</p>
            </div>
          </div>
        </aside>

        {/* Map */}
        <div className="order-1 lg:order-2 relative h-[70vh] lg:h-[calc(100vh-4rem)]">
          <div ref={box} className="h-full w-full" />

          {status === "loading" && (
            <div className="absolute inset-0 grid place-items-center bg-muted/60 pointer-events-none">
              <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading the map of Rwanda…</p>
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-x-4 top-4 rounded-lg border bg-card p-4 text-sm flex gap-2 shadow">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" /> {errorMsg}
            </div>
          )}

          {selected && (
            <div className="absolute left-4 bottom-10 w-[min(340px,calc(100%-2rem))] rounded-xl border bg-card p-4 shadow-lg">
              <button className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground" aria-label="Close" onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </button>
              {selected.kind === "town" && (() => {
                const t = selected.town;
                const info = townInfo(t);
                return (
                  <>
                    <h3 className="font-semibold pr-6">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.province === "Kigali" ? "City of Kigali" : `${t.province} Province`}
                      {t.kind === "park" ? " · National park" : ""}
                    </p>
                    {t.province !== "Kigali" && (
                      <p className="mt-2 text-sm">
                        From Kigali: about {Math.round(info.km)} km, {formatMinutes(info.time)} by bus, {formatRwf(info.fare)}.
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.province !== "Kigali" && (
                        <Button size="sm" onClick={() => book(t, "to")}>Book from Kigali</Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => book(t, "from")}>Ride from here</Button>
                    </div>
                  </>
                );
              })()}
              {selected.kind === "hospital" && (
                <>
                  <h3 className="font-semibold pr-6">{selected.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Position approximate. Ambulance: 912 · Emergency: 112</p>
                </>
              )}
              {selected.kind === "vehicle" && (
                <>
                  <h3 className="font-semibold pr-6">{selected.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground capitalize">
                    {selected.type === "motorbike" ? "Moto" : selected.type} · available (demo vehicle)
                  </p>
                  <Button size="sm" className="mt-3" onClick={() => navigate("/dashboard")}>Book a ride</Button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RwandaMap;

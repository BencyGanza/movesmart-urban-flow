import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { RWANDA_BOUNDS } from "@/lib/kigali";

/**
 * Free map sources, no API key needed:
 * - OpenFreeMap "liberty": streets, places and 3D buildings (OpenStreetMap data)
 * - AWS Terrain Tiles (Terrarium): real elevation for 3D terrain and hill shading
 * - Esri World Imagery: optional satellite view
 */
export const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
export const TERRAIN_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
export const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export const TERRAIN_EXAGGERATION = 1.6;

export type LngLat = [number, number];

export interface RwandaMapOptions {
  center?: LngLat;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  /** Called once the map, terrain and satellite layers are ready. */
  onReady?: (map: maplibregl.Map) => void;
  /** Called when the base map cannot be loaded (for example, no internet). */
  onError?: (message: string) => void;
}

/** Rwanda's bounds with some margin so the edges of the country stay reachable. */
const MAX_BOUNDS: [LngLat, LngLat] = [
  [RWANDA_BOUNDS[0] - 0.9, RWANDA_BOUNDS[1] - 0.7],
  [RWANDA_BOUNDS[2] + 0.9, RWANDA_BOUNDS[3] + 0.7],
];

export const RWANDA_VIEW_BOUNDS: [LngLat, LngLat] = [
  [RWANDA_BOUNDS[0], RWANDA_BOUNDS[1]],
  [RWANDA_BOUNDS[2], RWANDA_BOUNDS[3]],
];

function firstSymbolLayerId(map: maplibregl.Map): string | undefined {
  return map.getStyle().layers?.find((l) => l.type === "symbol")?.id;
}

function addTerrainAndImagery(map: maplibregl.Map) {
  if (!map.getSource("terrain-dem")) {
    map.addSource("terrain-dem", {
      type: "raster-dem",
      tiles: [TERRAIN_TILES],
      encoding: "terrarium",
      tileSize: 256,
      maxzoom: 14,
      attribution: '<a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Terrain Tiles (Mapzen / AWS)</a>',
    });
  }
  // A separate source for hill shading renders more reliably than sharing the terrain source.
  if (!map.getSource("hillshade-dem")) {
    map.addSource("hillshade-dem", { type: "raster-dem", tiles: [TERRAIN_TILES], encoding: "terrarium", tileSize: 256, maxzoom: 14 });
  }
  if (!map.getSource("satellite")) {
    map.addSource("satellite", {
      type: "raster",
      tiles: [SATELLITE_TILES],
      tileSize: 256,
      maxzoom: 18,
      attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
    });
  }
  const beforeId = firstSymbolLayerId(map);
  if (!map.getLayer("satellite")) {
    map.addLayer({ id: "satellite", type: "raster", source: "satellite", layout: { visibility: "none" } }, beforeId);
  }
  if (!map.getLayer("hillshade")) {
    map.addLayer(
      {
        id: "hillshade",
        type: "hillshade",
        source: "hillshade-dem",
        paint: { "hillshade-exaggeration": 0.45, "hillshade-shadow-color": "#2f3d33", "hillshade-highlight-color": "#ffffff" },
      },
      beforeId,
    );
  }
  map.setTerrain({ source: "terrain-dem", exaggeration: TERRAIN_EXAGGERATION });
}

/** Create a 3D map of Rwanda in the given element. Call map.remove() to clean up. */
export function createRwandaMap(container: HTMLElement, opts: RwandaMapOptions = {}): maplibregl.Map {
  const map = new maplibregl.Map({
    container,
    style: STYLE_URL,
    center: opts.center ?? [29.88, -1.94],
    zoom: opts.zoom ?? 7.6,
    pitch: opts.pitch ?? 55,
    bearing: opts.bearing ?? -15,
    maxPitch: 80,
    maxBounds: MAX_BOUNDS,
    attributionControl: { compact: true },
  });
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
  map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");

  let ready = false;
  map.on("load", () => {
    try {
      addTerrainAndImagery(map);
    } catch (e) {
      console.warn("Terrain could not be added", e);
    }
    ready = true;
    opts.onReady?.(map);
  });
  map.on("error", (e) => {
    // Missing single tiles are normal at the edges; only report when the base map never loads.
    if (!ready && opts.onError) {
      opts.onError("The map could not load. Check your internet connection and refresh the page.");
    }
    if (e?.error) console.warn("Map error:", e.error.message);
  });
  return map;
}

export function setTerrainEnabled(map: maplibregl.Map, on: boolean) {
  if (on) {
    if (map.getSource("terrain-dem")) map.setTerrain({ source: "terrain-dem", exaggeration: TERRAIN_EXAGGERATION });
    map.easeTo({ pitch: Math.max(map.getPitch(), 55), duration: 800 });
  } else {
    map.setTerrain(null);
    map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
  }
}

export function setSatellite(map: maplibregl.Map, on: boolean) {
  if (map.getLayer("satellite")) map.setLayoutProperty("satellite", "visibility", on ? "visible" : "none");
}

export function setLayerVisible(map: maplibregl.Map, id: string, on: boolean) {
  if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
}

/** A small HTML marker: a coloured dot or badge with an optional label. */
export function makeMarkerEl(opts: { label?: string; badge?: string; color: string; size?: number; title?: string }): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "ms-marker";
  el.title = opts.title ?? opts.label ?? "";
  el.setAttribute("aria-label", opts.title ?? opts.label ?? "Map marker");
  const size = opts.size ?? 14;
  const dot = document.createElement("span");
  dot.className = "ms-marker-dot";
  dot.style.cssText = `width:${size}px;height:${size}px;background:${opts.color}`;
  if (opts.badge) {
    dot.textContent = opts.badge;
    dot.classList.add("ms-marker-badge");
  }
  el.appendChild(dot);
  if (opts.label) {
    const lab = document.createElement("span");
    lab.className = "ms-marker-label";
    lab.textContent = opts.label;
    el.appendChild(lab);
  }
  return el;
}

export { maplibregl };

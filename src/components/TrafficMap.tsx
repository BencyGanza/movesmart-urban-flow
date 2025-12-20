import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Navigation, Loader2, MapPin } from "lucide-react";
import { useMapboxToken } from "@/hooks/useMapboxToken";

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

interface TrafficData {
  intersections: Array<{
    id: string;
    name: string;
    position: [number, number];
    congestion: "low" | "medium" | "high";
    vehicles: number;
  }>;
  routes: Array<{
    id: string;
    coordinates: [number, number][];
    congestion: "low" | "medium" | "high";
  }>;
  incidents: Array<{
    id: string;
    position: [number, number];
    type: string;
    description: string;
  }>;
}

const TrafficMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { token, loading: tokenLoading, error: tokenError } = useMapboxToken();

  const [trafficData] = useState<TrafficData>({
    intersections: [
      { id: "int_001", name: "Uhuru Highway", position: [-1.2864, 36.8172], congestion: "high", vehicles: 156 },
      { id: "int_002", name: "Moi Avenue", position: [-1.2841, 36.8155], congestion: "medium", vehicles: 89 },
      { id: "int_003", name: "Ngong Road", position: [-1.2921, 36.7820], congestion: "low", vehicles: 42 },
      { id: "int_004", name: "Thika Road", position: [-1.2195, 36.8917], congestion: "high", vehicles: 203 }
    ],
    routes: [
      {
        id: "route_001",
        coordinates: [[-1.2864, 36.8172], [-1.2841, 36.8155], [-1.2921, 36.7820]],
        congestion: "medium"
      },
      {
        id: "route_002",
        coordinates: [[-1.2841, 36.8155], [-1.2195, 36.8917]],
        congestion: "high"
      }
    ],
    incidents: [
      { id: "inc_001", position: [-1.2800, 36.8200], type: "Accident", description: "Minor collision" }
    ]
  });

  const getCongestionColor = (level: string) => {
    switch (level) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#22c55e";
      default: return "#6b7280";
    }
  };

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocationError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("Unknown location error");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !token || map.current) return;

    mapboxgl.accessToken = token;

    const center: [number, number] = userLocation 
      ? [userLocation.lng, userLocation.lat] 
      : [36.8219, -1.2864];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      if (!map.current) return;

      // Add traffic intersections
      trafficData.intersections.forEach((intersection) => {
        const el = document.createElement("div");
        el.className = "intersection-marker";
        el.style.cssText = `
          width: 24px;
          height: 24px;
          background-color: ${getCongestionColor(intersection.congestion)};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        `;

        new mapboxgl.Marker({ element: el })
          .setLngLat([intersection.position[1], intersection.position[0]])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 8px; min-width: 150px;">
                <strong>${intersection.name}</strong><br/>
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; margin-top: 4px; background: ${getCongestionColor(intersection.congestion)}20; color: ${getCongestionColor(intersection.congestion)};">
                  ${intersection.congestion.toUpperCase()}
                </span>
                <p style="font-size: 12px; color: #666; margin-top: 4px;">
                  🚗 ${intersection.vehicles} vehicles
                </p>
              </div>
            `)
          )
          .addTo(map.current!);
      });

      // Add incidents
      trafficData.incidents.forEach((incident) => {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="width: 32px; height: 32px; background-color: #dc2626; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;">
            <span style="color: white; font-size: 16px;">⚠</span>
          </div>
        `;

        new mapboxgl.Marker({ element: el })
          .setLngLat([incident.position[1], incident.position[0]])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 8px; min-width: 150px;">
                <strong>⚠️ ${incident.type}</strong>
                <p style="font-size: 12px; color: #666; margin-top: 4px;">${incident.description}</p>
              </div>
            `)
          )
          .addTo(map.current!);
      });

      // Add route lines
      trafficData.routes.forEach((route, index) => {
        map.current!.addSource(`route-${index}`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route.coordinates.map(coord => [coord[1], coord[0]])
            }
          }
        });

        map.current!.addLayer({
          id: `route-${index}`,
          type: "line",
          source: `route-${index}`,
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": getCongestionColor(route.congestion),
            "line-width": 5,
            "line-opacity": 0.7
          }
        });
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [token, trafficData]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    if (!userMarker.current) {
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 48px; height: 48px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: pulse 2s ease-in-out infinite;"></div>
          <div style="width: 16px; height: 16px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(59,130,246,0.5); z-index: 10;"></div>
        </div>
      `;

      userMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <strong>Your Location</strong><br/>
              <span style="font-size: 12px; color: #666;">
                ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}<br/>
                Accuracy: ±${Math.round(userLocation.accuracy)}m
              </span>
            </div>
          `)
        )
        .addTo(map.current);

      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        essential: true
      });
    } else {
      userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    }
  }, [userLocation]);

  if (tokenLoading) {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden border bg-muted flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
          <p className="text-sm text-muted-foreground">Map configuration error</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border shadow-card relative">
      {locationError && (
        <div className="absolute top-4 left-4 z-10 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
          <Navigation className="w-4 h-4" />
          {locationError}
        </div>
      )}
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default TrafficMap;
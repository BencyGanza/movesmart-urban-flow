import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { AlertTriangle, Car, Navigation } from "lucide-react";

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

// Component to recenter map on user location
const RecenterMap = ({ position, shouldRecenter }: { position: [number, number] | null; shouldRecenter: boolean }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position && shouldRecenter) {
      map.setView(position, 14, { animate: true });
    }
  }, [position, shouldRecenter, map]);
  
  return null;
};

const TrafficMap = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData>({
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
        setInitialLocationSet(true);
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

  const getCongestionColor = (level: string) => {
    switch (level) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#22c55e";
      default: return "#6b7280";
    }
  };

  const getMarkerIcon = (congestion: string) => {
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${getCongestionColor(congestion)}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const userLocationIcon = L.divIcon({
    className: "user-location-marker",
    html: `<div style="position: relative;">
      <div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 10px rgba(59,130,246,0.5); animation: pulse 2s infinite;"></div>
      <div style="position: absolute; top: -2px; left: -2px; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #3b82f6; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const incidentIcon = L.divIcon({
    className: "incident-marker",
    html: `<div style="background-color: #dc2626; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 4l8 15H4l8-15z"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border shadow-card">
      {locationError && (
        <div className="absolute top-4 left-4 z-[1000] bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
          <Navigation className="w-4 h-4" />
          {locationError}
        </div>
      )}
      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lng] : [-1.2864, 36.8219]}
        zoom={userLocation ? 14 : 12}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Recenter map on first location */}
        <RecenterMap 
          position={userLocation ? [userLocation.lat, userLocation.lng] : null} 
          shouldRecenter={!initialLocationSet && !!userLocation}
        />
        
        {/* User's current location */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userLocation.accuracy}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.15,
                weight: 2
              }}
            />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-base">Your Location</h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Lat: {userLocation.lat.toFixed(6)}</p>
                    <p>Lng: {userLocation.lng.toFixed(6)}</p>
                    <p>Accuracy: ±{Math.round(userLocation.accuracy)}m</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}
        
        {trafficData.intersections.map((intersection) => (
          <Marker
            key={intersection.id}
            position={intersection.position}
            icon={getMarkerIcon(intersection.congestion)}
          >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <h3 className="font-semibold mb-2 text-base">{intersection.name}</h3>
                <div className="space-y-2 text-sm">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    intersection.congestion === "high" 
                      ? "bg-red-100 text-red-800" 
                      : intersection.congestion === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {intersection.congestion.toUpperCase()}
                  </span>
                  <p className="flex items-center gap-1 text-gray-600">
                    <span>🚗</span>
                    {intersection.vehicles} vehicles
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {trafficData.intersections.map((intersection) => (
          <Circle
            key={`circle_${intersection.id}`}
            center={intersection.position}
            radius={intersection.congestion === "high" ? 500 : intersection.congestion === "medium" ? 300 : 200}
            pathOptions={{
              color: getCongestionColor(intersection.congestion),
              fillColor: getCongestionColor(intersection.congestion),
              fillOpacity: 0.2,
              weight: 2
            }}
          />
        ))}
        {trafficData.routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={{
              color: getCongestionColor(route.congestion),
              weight: 5,
              opacity: 0.7
            }}
          />
        ))}
        {trafficData.incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={incident.position}
            icon={incidentIcon}
          >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-500">⚠️</span>
                  <h3 className="font-semibold text-base">{incident.type}</h3>
                </div>
                <p className="text-sm text-gray-600">{incident.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TrafficMap;

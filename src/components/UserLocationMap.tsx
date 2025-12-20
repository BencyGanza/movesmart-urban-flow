import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { Navigation, Loader2, MapPin, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

// Component to recenter map on user location
const RecenterControl = ({ 
  position, 
  onRecenter 
}: { 
  position: [number, number] | null;
  onRecenter: () => void;
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, 16, { animate: true });
    }
  }, [position, map]);
  
  return null;
};

const UserLocationMap = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [mapKey, setMapKey] = useState(0);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
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
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("Unable to get your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const userLocationIcon = L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 48px; height: 48px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: pulse 2s ease-in-out infinite;"></div>
        <div style="width: 16px; height: 16px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(59,130,246,0.5); z-index: 10;"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

  const handleRecenter = () => {
    if (userLocation) {
      setMapKey(prev => prev + 1);
    }
  };

  if (isLocating) {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Getting your location...</p>
        </div>
      </div>
    );
  }

  if (locationError && !userLocation) {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden border bg-muted flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
          <p className="text-sm text-muted-foreground">{locationError}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border shadow-card relative">
      {/* Recenter Button */}
      <Button
        size="icon"
        variant="secondary"
        className="absolute top-3 right-3 z-[1000] shadow-lg"
        onClick={handleRecenter}
      >
        <Locate className="h-4 w-4" />
      </Button>

      {/* Location Info Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-full">
            <Navigation className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Your Current Location</p>
            {userLocation && (
              <p className="text-xs text-muted-foreground">
                {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)} • ±{Math.round(userLocation.accuracy)}m
              </p>
            )}
          </div>
        </div>
      </div>

      <MapContainer
        key={mapKey}
        center={userLocation ? [userLocation.lat, userLocation.lng] : [-1.9403, 29.8739]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {userLocation && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={userLocation.accuracy}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.1,
              weight: 1
            }}
          />
        )}
        
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-sm">You are here</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Latitude: {userLocation.lat.toFixed(6)}</p>
                  <p>Longitude: {userLocation.lng.toFixed(6)}</p>
                  <p>Accuracy: ±{Math.round(userLocation.accuracy)} meters</p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default UserLocationMap;
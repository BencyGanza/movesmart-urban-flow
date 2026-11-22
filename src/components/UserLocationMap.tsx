import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Navigation, Loader2, MapPin, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapboxToken } from "@/hooks/useMapboxToken";

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

const UserLocationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const { token, loading: tokenLoading, error: tokenError } = useMapboxToken();

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !token || map.current) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userLocation ? [userLocation.lng, userLocation.lat] : [30.0619, -1.9441],
      zoom: 15,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-left");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [token]);

  // Update marker when location changes
  useEffect(() => {
    if (!map.current || !userLocation) return;

    if (!marker.current) {
      // Create custom marker element
      const el = document.createElement("div");
      el.className = "user-marker";
      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 48px; height: 48px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: pulse 2s ease-in-out infinite;"></div>
          <div style="width: 16px; height: 16px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(59,130,246,0.5); z-index: 10;"></div>
        </div>
      `;

      marker.current = new mapboxgl.Marker({ element: el })
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
    } else {
      marker.current.setLngLat([userLocation.lng, userLocation.lat]);
    }

    map.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 15,
      essential: true
    });
  }, [userLocation]);

  const handleRecenter = () => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        essential: true
      });
    }
  };

  if (tokenLoading || isLocating) {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            {tokenLoading ? "Loading map..." : "Getting your location..."}
          </p>
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
        className="absolute top-3 right-3 z-10 shadow-lg"
        onClick={handleRecenter}
      >
        <Locate className="h-4 w-4" />
      </Button>

      {/* Location Info Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-10 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
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

      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default UserLocationMap;
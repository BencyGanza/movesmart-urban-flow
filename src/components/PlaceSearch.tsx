import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { useMapboxToken } from "@/hooks/useMapboxToken";
import { KIGALI_CENTER, Place, searchLocalPlaces } from "@/lib/kigali";

interface PlaceSearchProps {
  id: string;
  label: string;
  placeholder: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  allowCurrentLocation?: boolean;
  icon?: React.ReactNode;
}

const PlaceSearch = ({ id, label, placeholder, value, onChange, allowCurrentLocation, icon }: PlaceSearchProps) => {
  const { token } = useMapboxToken();
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value?.name ?? "");
  }, [value]);

  // Close the suggestion list when clicking elsewhere
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search: well-known Kigali places first, then Mapbox (limited to Rwanda)
  useEffect(() => {
    if (!open) return;
    const local = searchLocalPlaces(query);
    setResults(local);
    if (!token || query.trim().length < 3) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const url =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
          `?access_token=${token}&country=rw&proximity=${KIGALI_CENTER.lng},${KIGALI_CENTER.lat}&limit=5`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const remote: Place[] = (data.features || []).map((f: any) => ({
          name: f.place_name?.replace(/, Rwanda$/, "") ?? f.text,
          lng: f.center[0],
          lat: f.center[1],
        }));
        const names = new Set(local.map((p) => p.name));
        setResults([...local, ...remote.filter((p) => !names.has(p.name))].slice(0, 8));
      } catch {
        // Keep the local suggestions if the map service is unreachable
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, token, open]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Your browser can't share location.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ name: "My current location", lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        setOpen(false);
      },
      () => {
        setLocError("Couldn't get your location. Please search for a place instead.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2" ref={boxRef}>
      <label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            id={id}
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (value) onChange(null);
            }}
          />
          {allowCurrentLocation && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={useCurrentLocation}
              disabled={locating}
              aria-label="Use my current location"
              title="Use my current location"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            </Button>
          )}
        </div>
        {open && results.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-popover shadow-lg">
            {results.map((p) => (
              <li key={`${p.name}-${p.lat}-${p.lng}`}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted flex items-start gap-2"
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                >
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <span>{p.name}</span>
                </button>
              </li>
            ))}
            {searching && (
              <li className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Searching more places…
              </li>
            )}
          </ul>
        )}
      </div>
      {locError && <p className="text-xs text-destructive">{locError}</p>}
    </div>
  );
};

export default PlaceSearch;

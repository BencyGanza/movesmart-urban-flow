import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, Bus, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ALL_PLACES,
  VehicleType,
  estimateFare,
  estimateMinutes,
  formatMinutes,
  formatRwf,
  roadDistanceKm,
} from "@/lib/kigali";

const FROM = ALL_PLACES.find((p) => p.name.startsWith("Nyabugogo"))!;
const DESTINATIONS = [
  "Kimironko Market",
  "Remera (Giporoso)",
  "Kicukiro Centre",
  "Kigali International Airport (Kanombe)",
  "Nyamirambo",
  "Musanze (Ruhengeri)",
  "Huye (Butare)",
].map((n) => ALL_PLACES.find((p) => p.name === n)!);

const shortName = (name: string) => name.replace(/ \(.*\)$/, "").replace(" International", "");

const rows: { type: VehicleType; label: string; Icon: typeof Bike }[] = [
  { type: "motorbike", label: "Moto", Icon: Bike },
  { type: "taxi", label: "Taxi", Icon: Car },
  { type: "bus", label: "Bus", Icon: Bus },
];

/** A ride ticket that prices a real trip with the same rules the app uses. */
export const FareTicket = () => {
  const navigate = useNavigate();
  const [to, setTo] = useState(DESTINATIONS[0]);
  const km = useMemo(() => roadDistanceKm(FROM, to), [to]);

  return (
    <div className="ticket relative w-full max-w-sm rounded-2xl bg-white text-foreground shadow-[0_24px_60px_-20px_hsl(210_61%_16%/0.45)]">
      <div className="rounded-t-2xl bg-accent px-5 py-3 flex items-center justify-between">
        <span className="font-semibold">Fare check</span>
        <span className="text-sm">{km.toFixed(1)} km by road</span>
      </div>

      <div className="px-5 pt-4 pb-5 space-y-4">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <span className="text-muted-foreground">From</span>
          <span className="font-medium">{shortName(FROM.name)}</span>
          <span className="text-muted-foreground">To</span>
          <span className="font-medium">{shortName(to.name)}</span>
        </div>

        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Destination">
          {DESTINATIONS.map((d) => {
            const active = d.name === to.name;
            return (
              <button
                key={d.name}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTo(d)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"
                }`}
              >
                {shortName(d.name)}
              </button>
            );
          })}
        </div>

        <div className="ticket-tear" aria-hidden />

        <ul className="space-y-2.5">
          {rows.map(({ type, label, Icon }) => (
            <li key={type} className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-muted text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">about {formatMinutes(estimateMinutes(type, km))}</span>
              </span>
              <span className="font-semibold tabular-nums">{formatRwf(estimateFare(type, km))}</span>
            </li>
          ))}
        </ul>

        <Button className="w-full" size="lg" onClick={() => navigate("/dashboard")}>
          Book this trip
        </Button>
      </div>
    </div>
  );
};

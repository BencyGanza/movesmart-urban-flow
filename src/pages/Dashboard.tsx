import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRides } from "@/hooks/useRides";
import { RideService } from "@/services";
import { Header } from "@/components/Header";
import UserLocationMap from "@/components/UserLocationMap";
import PlaceSearch from "@/components/PlaceSearch";
import { PaymentDialog, RateDialog, ShareDialog, SafetyDialog } from "@/components/RideDialogs";
import {
  Place,
  VehicleType,
  VEHICLE_OPTIONS,
  estimateFare,
  estimateMinutes,
  formatMinutes,
  formatRwf,
  roadDistanceKm,
} from "@/lib/kigali";
import {
  Bike,
  Bus,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Share2,
  ShieldAlert,
  Star,
  XCircle,
} from "lucide-react";

const vehicleIcon = (type?: string, cls = "h-5 w-5") =>
  type === "bus" ? <Bus className={cls} /> : type === "motorbike" ? <Bike className={cls} /> : <Car className={cls} />;

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    pending: { label: "Finding driver", variant: "outline" },
    active: { label: "On the way", variant: "default" },
    completed: { label: "Completed", variant: "secondary" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };
  const s = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rides, loading: ridesLoading, refetch } = useRides();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<{ vehicles: number; routes: number; byType: Record<string, number> } | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const placeFromParams = (key: string): Place | null => {
    const name = searchParams.get(key);
    const lat = Number(searchParams.get(`${key}Lat`));
    const lng = Number(searchParams.get(`${key}Lng`));
    return name && Number.isFinite(lat) && Number.isFinite(lng) && lat && lng ? { name, lat, lng } : null;
  };
  const [pickup, setPickup] = useState<Place | null>(() => placeFromParams("from"));
  const [dropoff, setDropoff] = useState<Place | null>(() => placeFromParams("to"));

  // A trip handed over from the journey planner arrives in the address bar; keep the URL clean afterwards.
  useEffect(() => {
    if (searchParams.get("from") || searchParams.get("to")) {
      if (pickup && dropoff) toast({ title: "Trip loaded from the planner", description: `${pickup.name} to ${dropoff.name}. Choose a vehicle and book.` });
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [vehicleType, setVehicleType] = useState<VehicleType>("motorbike");
  const [booking, setBooking] = useState(false);
  const [busyRide, setBusyRide] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [payRide, setPayRide] = useState<any>(null);
  const [rateRide, setRateRide] = useState<any>(null);
  const [shareRide, setShareRide] = useState<any>(null);
  const [safetyRide, setSafetyRide] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        setProfile(data);
      }
      try {
        setStats(await RideService.getNetworkStats());
      } catch {
        setStats({ vehicles: 0, routes: 0, byType: {} });
      }
    })();
  }, []);

  const estimate = useMemo(() => {
    if (!pickup || !dropoff) return null;
    const km = roadDistanceKm(pickup, dropoff);
    return { km, minutes: estimateMinutes(vehicleType, km), fare: estimateFare(vehicleType, km) };
  }, [pickup, dropoff, vehicleType]);

  const activeRides = rides.filter((r) => r.status === "active" || r.status === "pending");
  const pastRides = rides.filter((r) => r.status === "completed" || r.status === "cancelled");

  const handleBook = async () => {
    if (!pickup || !dropoff || !estimate) {
      toast({ title: "Choose your trip", description: "Pick both a pickup point and a destination from the list." });
      return;
    }
    if (estimate.km < 0.6 && pickup.name === dropoff.name) {
      toast({ title: "Same place", description: "Pickup and destination can't be the same.", variant: "destructive" });
      return;
    }
    setBooking(true);
    try {
      const { vehicle } = await RideService.bookRide(
        {
          pickup_address: pickup.name,
          dropoff_address: dropoff.name,
          pickup_latitude: pickup.lat,
          pickup_longitude: pickup.lng,
          dropoff_latitude: dropoff.lat,
          dropoff_longitude: dropoff.lng,
          estimated_fare: estimate.fare,
          estimated_duration_minutes: estimate.minutes,
        },
        vehicleType
      );
      if (vehicle) {
        const eta = Math.max(2, Math.round((vehicle.distance * 1.3 / 25) * 60));
        toast({
          title: "Driver on the way",
          description: `${vehicle.model} (${vehicle.license_plate}) will reach you in about ${eta} min.`,
        });
      } else {
        toast({ title: "Ride requested", description: "No driver is free right now. We'll keep looking." });
      }
      setPickup(null);
      setDropoff(null);
      refetch();
    } catch (e: any) {
      toast({ title: "Booking failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setBusyRide(cancelTarget.id);
    try {
      await RideService.cancelRide(cancelTarget.id);
      toast({ title: "Ride cancelled" });
      refetch();
    } catch (e: any) {
      toast({ title: "Couldn't cancel", description: e?.message, variant: "destructive" });
    } finally {
      setBusyRide(null);
      setCancelTarget(null);
    }
  };

  const handleComplete = async (ride: any) => {
    setBusyRide(ride.id);
    try {
      const fare = Number(ride.estimated_fare);
      await RideService.completeRide(ride.id, fare);
      toast({ title: "You've arrived", description: `Trip fare: ${formatRwf(fare)}` });
      await refetch();
      setPayRide({ ...ride, status: "completed", actual_fare: fare });
    } catch (e: any) {
      toast({ title: "Couldn't finish the trip", description: e?.message, variant: "destructive" });
    } finally {
      setBusyRide(null);
    }
  };

  const paymentOf = (ride: any) => (ride.payments || [])[0];

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Muraho{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-muted-foreground">Where are you going today?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Book a ride */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" /> Book a ride
                </CardTitle>
                <CardDescription>Search a place anywhere in Rwanda or use your current location.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PlaceSearch
                  id="pickup"
                  label="Pickup"
                  placeholder="e.g. Nyabugogo Bus Park"
                  value={pickup}
                  onChange={setPickup}
                  allowCurrentLocation
                  icon={<MapPin className="h-4 w-4 text-primary" />}
                />
                <PlaceSearch
                  id="dropoff"
                  label="Destination"
                  placeholder="e.g. Kimironko Market or Musanze"
                  value={dropoff}
                  onChange={setDropoff}
                  icon={<Navigation className="h-4 w-4 text-secondary" />}
                />

                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Vehicle type">
                  {VEHICLE_OPTIONS.map((o) => {
                    const selected = vehicleType === o.type;
                    const km = estimate?.km;
                    return (
                      <button
                        key={o.type}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setVehicleType(o.type)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold">
                          {vehicleIcon(o.type, "h-4 w-4")} {o.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {km ? formatRwf(estimateFare(o.type, km)) : o.description}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {estimate && (
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="font-semibold">{estimate.km.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-semibold">~{formatMinutes(estimate.minutes)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated fare</p>
                      <p className="font-bold text-primary">{formatRwf(estimate.fare)}</p>
                    </div>
                  </div>
                )}

                <Button onClick={handleBook} className="w-full" size="lg" disabled={booking || !pickup || !dropoff}>
                  {booking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding the nearest driver…
                    </>
                  ) : (
                    <>Book {VEHICLE_OPTIONS.find((o) => o.type === vehicleType)?.label}</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Active rides */}
            {activeRides.map((ride) => (
              <Card key={ride.id} className="border-primary/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">Current trip</CardTitle>
                    {statusBadge(ride.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" /> {ride.pickup_address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-secondary shrink-0" /> {ride.dropoff_address}
                    </p>
                  </div>
                  {ride.vehicle ? (
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">{vehicleIcon(ride.vehicle.vehicle_type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{ride.vehicle.model}</p>
                        <p className="text-sm text-muted-foreground">Plate {ride.vehicle.license_plate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatRwf(ride.estimated_fare)}</p>
                        <p className="text-xs text-muted-foreground">{ride.estimated_duration_minutes ? `~${formatMinutes(ride.estimated_duration_minutes)}` : ""}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Looking for a free driver nearby…
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ride.status === "active" && (
                      <Button onClick={() => handleComplete(ride)} disabled={busyRide === ride.id} className="col-span-2 sm:col-span-1">
                        {busyRide === ride.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
                        I've arrived
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setShareRide(ride)}>
                      <Share2 className="mr-1 h-4 w-4" /> Share
                    </Button>
                    <Button variant="outline" onClick={() => setSafetyRide(ride)}>
                      <ShieldAlert className="mr-1 h-4 w-4" /> Report
                    </Button>
                    <Button variant="ghost" className="text-destructive" onClick={() => setCancelTarget(ride)}>
                      <XCircle className="mr-1 h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle>Trip history</CardTitle>
                <CardDescription>Your past trips, payments and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                {ridesLoading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : pastRides.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <RouteIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium text-foreground">No trips yet</p>
                    <p className="text-sm">Book your first ride above. It only takes a few seconds.</p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {pastRides.map((ride) => {
                      const payment = paymentOf(ride);
                      const rated = (ride.ratings || []).length > 0;
                      return (
                        <li key={ride.id} className="py-4 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {ride.pickup_address} → {ride.dropoff_address}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(ride.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                                {ride.vehicle && <> · {ride.vehicle.license_plate}</>}
                              </p>
                            </div>
                            <div className="text-right shrink-0 space-y-1">
                              <p className="font-semibold">{formatRwf(ride.actual_fare || ride.estimated_fare)}</p>
                              {statusBadge(ride.status)}
                            </div>
                          </div>
                          {ride.status === "completed" && (
                            <div className="flex flex-wrap items-center gap-2">
                              {payment ? (
                                <Badge variant="outline" className="gap-1">
                                  <CreditCard className="h-3 w-3" />
                                  {payment.payment_method === "cash"
                                    ? "Cash"
                                    : payment.payment_method === "mtn_momo"
                                    ? "MTN MoMo"
                                    : "Airtel Money"}{" "}
                                  · {payment.payment_status === "completed" ? "Paid" : "Pay driver"}
                                </Badge>
                              ) : (
                                <Button size="sm" onClick={() => setPayRide(ride)}>
                                  <CreditCard className="mr-1 h-4 w-4" /> Pay now
                                </Button>
                              )}
                              {rated ? (
                                <Badge variant="outline" className="gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {ride.ratings[0].rating}/5
                                </Badge>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => setRateRide(ride)}>
                                  <Star className="mr-1 h-4 w-4" /> Rate trip
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => setSafetyRide(ride)}>
                                <ShieldAlert className="mr-1 h-4 w-4" /> Report issue
                              </Button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side column */}
          <div className="space-y-6 min-w-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Your location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[280px] rounded-b-lg overflow-hidden">
                  <UserLocationMap />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">MoveSmart network</CardTitle>
                <CardDescription>Vehicles and routes available right now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {!stats ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <>
                    {[
                      { label: "Motos available", value: stats.byType.motorbike ?? 0, icon: vehicleIcon("motorbike", "h-4 w-4") },
                      { label: "Taxis available", value: stats.byType.taxi ?? 0, icon: vehicleIcon("taxi", "h-4 w-4") },
                      { label: "Buses in service", value: stats.byType.bus ?? 0, icon: vehicleIcon("bus", "h-4 w-4") },
                      { label: "Active bus routes", value: stats.routes, icon: <RouteIcon className="h-4 w-4" /> },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between rounded-lg bg-muted p-3">
                        <span className="text-sm flex items-center gap-2">
                          {s.icon} {s.label}
                        </span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </>
                )}
                <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/traffic-control")}>
                  Traffic control centre (concept demo)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget?.pickup_address} → {cancelTarget?.dropoff_address}. Your driver will be released.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep trip</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentDialog ride={payRide} onClose={() => setPayRide(null)} onDone={refetch} />
      <RateDialog ride={rateRide} onClose={() => setRateRide(null)} onDone={refetch} />
      <ShareDialog ride={shareRide} onClose={() => setShareRide(null)} onDone={refetch} />
      <SafetyDialog ride={safetyRide} onClose={() => setSafetyRide(null)} onDone={refetch} />
    </div>
  );
};

export default Dashboard;

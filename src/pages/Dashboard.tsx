import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRides } from "@/hooks/useRides";
import { Car, MapPin, Navigation, Clock, CheckCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rides, loading: ridesLoading } = useRides();
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleBookRide = async () => {
    if (!pickupAddress || !dropoffAddress) {
      toast({
        title: "Missing Information",
        description: "Please enter both pickup and dropoff addresses",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Mock coordinates for demo
    const pickupLat = -1.2921 + (Math.random() - 0.5) * 0.1;
    const pickupLng = 36.8219 + (Math.random() - 0.5) * 0.1;
    const dropoffLat = -1.2921 + (Math.random() - 0.5) * 0.1;
    const dropoffLng = 36.8219 + (Math.random() - 0.5) * 0.1;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("rides").insert({
      passenger_id: user?.id,
      pickup_latitude: pickupLat,
      pickup_longitude: pickupLng,
      dropoff_latitude: dropoffLat,
      dropoff_longitude: dropoffLng,
      pickup_address: pickupAddress,
      dropoff_address: dropoffAddress,
      estimated_fare: 500 + Math.random() * 1000,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ride Booked!",
        description: "Finding you a driver...",
      });
      setPickupAddress("");
      setDropoffAddress("");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      accepted: "secondary",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">MoveSmart</h1>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6 shadow-card">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Book a Ride</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="pickup" className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Pickup Location
                </Label>
                <Input
                  id="pickup"
                  placeholder="Enter pickup address"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dropoff" className="flex items-center gap-2 mb-2">
                  <Navigation className="h-4 w-4 text-secondary" />
                  Dropoff Location
                </Label>
                <Input
                  id="dropoff"
                  placeholder="Enter dropoff address"
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleBookRide} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Booking..." : "Book Ride"}
              </Button>
            </div>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 text-foreground">Estimated Fare</h3>
                <p className="text-2xl font-bold text-primary">KES 500 - 1,500</p>
                <p className="text-sm text-muted-foreground mt-1">Based on distance and traffic</p>
              </div>
            </Card>

            {/* Recent Rides */}
            <Card className="p-6 shadow-card">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Recent Rides</h2>
              
              {ridesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : rides.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No rides yet. Book your first ride!
                </div>
              ) : (
                <div className="space-y-4">
                  {rides.slice(0, 5).map((ride) => (
                    <div
                      key={ride.id}
                      className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">{ride.pickup_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-secondary" />
                            <span className="font-medium text-sm">{ride.dropoff_address}</span>
                          </div>
                        </div>
                        {getStatusBadge(ride.status)}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(ride.created_at).toLocaleDateString()}
                        </div>
                        <div className="font-bold text-primary">
                          KES {ride.actual_fare || ride.estimated_fare}
                        </div>
                      </div>
                      
                      {ride.status === "completed" && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Map */}
          <Card className="p-6 shadow-card overflow-hidden h-fit sticky top-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Live Map</h2>
            <div className="rounded-lg overflow-hidden border border-border" style={{ height: '600px' }}>
              <MapContainer
                center={[-1.2921, 36.8219] as [number, number]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[-1.2921, 36.8219] as [number, number]}>
                  <Popup>Your Location</Popup>
                </Marker>
              </MapContainer>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

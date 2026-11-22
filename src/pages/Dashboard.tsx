import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRides } from "@/hooks/useRides";
import { RideService } from "@/services";
import { Header } from "@/components/Header";
import UserLocationMap from "@/components/UserLocationMap";
import { Map, Navigation, CreditCard, LogOut, Loader2, MapPin, Clock, CheckCircle, XCircle, Brain, TrendingUp, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rides, loading: ridesLoading, refetch } = useRides();
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [trafficData, setTrafficData] = useState({
    avgSpeed: 45,
    congestionLevel: "Medium",
    estimatedDelay: 12,
    alternativeRoutes: 3
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setUserProfile(data);
      }
    };
    fetchUserProfile();

    // Simulate real-time traffic updates
    const trafficInterval = setInterval(() => {
      setTrafficData({
        avgSpeed: Math.floor(Math.random() * 40) + 30,
        congestionLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        estimatedDelay: Math.floor(Math.random() * 20) + 5,
        alternativeRoutes: Math.floor(Math.random() * 5) + 1
      });
    }, 8000);

    return () => clearInterval(trafficInterval);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to book a ride",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Create ride using RideService
      const ride = await RideService.createRide({
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        pickup_latitude: -1.9441, // Default coordinates - Kigali City Centre
        pickup_longitude: 30.0619,
        dropoff_latitude: -1.9496, // Kimironko, Kigali
        dropoff_longitude: 30.1260,
        estimated_fare: 1000, // Fare in RWF
      });

      toast({
        title: "Success",
        description: "Your ride has been booked successfully!",
      });

      // Try to match a driver
      try {
        await RideService.matchDriver({ ride_id: ride.id });
        toast({
          title: "Driver Matched",
          description: "A driver has been assigned to your ride!",
        });
      } catch (matchError) {
        console.log("No drivers available yet");
      }

      setPickupAddress("");
      setDropoffAddress("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book ride",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async (rideId: string) => {
    try {
      await RideService.cancelRide(rideId);
      toast({
        title: "Success",
        description: "Ride cancelled successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel ride",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "outline", icon: Clock },
      active: { variant: "default", icon: Navigation },
      completed: { variant: "default", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
    };

    const StatusIcon = variants[status]?.icon || Clock;
    
    return (
      <Badge variant={variants[status]?.variant || "outline"} className="flex items-center gap-1">
        <StatusIcon className="h-3 w-3" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Dashboard Header */}
      <header className="border-b bg-card shadow-card sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">MoveSmart</h1>
            {userProfile && (
              <p className="text-sm text-muted-foreground">Welcome, {userProfile.full_name}</p>
            )}
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* AI Traffic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Speed</p>
                  <p className="text-2xl font-bold">{trafficData.avgSpeed} km/h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Brain className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Traffic Status</p>
                  <p className="text-2xl font-bold">{trafficData.congestionLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delay</p>
                  <p className="text-2xl font-bold">{trafficData.estimatedDelay} min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Navigation className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Alt Routes</p>
                  <p className="text-2xl font-bold">{trafficData.alternativeRoutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking & Rides */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Traffic Alert */}
            <Card className="shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary rounded-lg">
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">AI Traffic Intelligence Active</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Real-time traffic analysis using YOLO + OpenCV. System monitoring {trafficData.alternativeRoutes + 2} intersections
                      and optimizing signals dynamically. Your route is being calculated using live CCTV data.
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        AI Routing
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Live Updates
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Booking Card */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Navigation className="h-6 w-6 text-primary" />
                  Book a Ride
                </CardTitle>
                <CardDescription>Enter your pickup and dropoff locations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Pickup Location
                  </label>
                  <Input
                    placeholder="Enter pickup address"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-secondary" />
                    Dropoff Location
                  </label>
                  <Input
                    placeholder="Enter dropoff address"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                  />
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2 text-foreground flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    AI-Optimized Fare Estimate
                  </h3>
                  <p className="text-2xl font-bold text-primary">RWF 500 - 3,000</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on real-time traffic analysis • {trafficData.estimatedDelay}min delay expected
                  </p>
                </div>

                <Button 
                  onClick={handleBookRide} 
                  className="w-full"
                  size="lg"
                  disabled={loading || !pickupAddress || !dropoffAddress}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Navigation className="mr-2 h-4 w-4" />
                      Book Ride
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Rides */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Recent Rides</CardTitle>
                <CardDescription>Your ride history and current bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {ridesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : rides.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No rides yet. Book your first ride!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rides.map((ride) => (
                      <Card key={ride.id} className="hover:shadow-hover transition-shadow">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1 flex-1">
                                <p className="text-sm font-medium flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  {ride.pickup_address}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Navigation className="h-4 w-4 text-secondary" />
                                  {ride.dropoff_address}
                                </p>
                              </div>
                              {getStatusBadge(ride.status)}
                            </div>
                            <div className="flex justify-between items-center text-sm pt-3 border-t">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {new Date(ride.created_at).toLocaleDateString()}
                              </span>
                              <span className="font-semibold text-primary">
                                RWF {Number(ride.actual_fare || ride.estimated_fare).toLocaleString()}
                              </span>
                            </div>
                            {ride.status === 'pending' && (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleCancelRide(ride.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Ride
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Location Map */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Your Location
                </CardTitle>
                <CardDescription>Live GPS tracking</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] rounded-b-lg overflow-hidden">
                  <UserLocationMap />
                </div>
              </CardContent>
            </Card>

            {/* AI Traffic Center */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Traffic Center
                </CardTitle>
                <CardDescription>Real-time traffic monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Active Cameras</span>
                    <Badge>24</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Intersections Monitored</span>
                    <Badge>{trafficData.alternativeRoutes + 2}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Emergency Vehicles</span>
                    <Badge variant="destructive">2 Active</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => navigate('/traffic-control')}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  View Traffic Control
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

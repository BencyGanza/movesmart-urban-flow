import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { 
  Camera, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Car,
  MapPin,
  Zap,
  Brain,
  Timer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrafficIntersection {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  vehicle_count: number;
  congestion_level: "low" | "medium" | "high";
  signal_status: "green" | "yellow" | "red";
  avg_wait_time: number;
  cameras_active: number;
  ai_optimized: boolean;
}

const TrafficControl = () => {
  const { toast } = useToast();
  const [intersections, setIntersections] = useState<TrafficIntersection[]>([
    {
      id: "int_001",
      name: "Kigali City Tower Roundabout (KN 4 Ave)",
      location: { lat: -1.9441, lng: 30.0619 },
      vehicle_count: 156,
      congestion_level: "high",
      signal_status: "red",
      avg_wait_time: 45,
      cameras_active: 4,
      ai_optimized: true
    },
    {
      id: "int_002",
      name: "Nyabugogo Junction (KN 1 Rd)",
      location: { lat: -1.9395, lng: 30.0445 },
      vehicle_count: 89,
      congestion_level: "medium",
      signal_status: "green",
      avg_wait_time: 28,
      cameras_active: 3,
      ai_optimized: true
    },
    {
      id: "int_003",
      name: "Nyamirambo (KN 2 Ave)",
      location: { lat: -1.9780, lng: 30.0420 },
      vehicle_count: 42,
      congestion_level: "low",
      signal_status: "green",
      avg_wait_time: 15,
      cameras_active: 2,
      ai_optimized: false
    },
    {
      id: "int_004",
      name: "Kimironko Junction (KG 11 Ave)",
      location: { lat: -1.9496, lng: 30.1260 },
      vehicle_count: 203,
      congestion_level: "high",
      signal_status: "yellow",
      avg_wait_time: 52,
      cameras_active: 5,
      ai_optimized: true
    }
  ]);

  const [systemStats, setSystemStats] = useState({
    total_intersections: 4,
    ai_active: 3,
    avg_reduction: 32,
    emergency_active: 0
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setIntersections(prev => prev.map(int => ({
        ...int,
        vehicle_count: Math.max(20, int.vehicle_count + Math.floor(Math.random() * 20 - 10)),
        avg_wait_time: Math.max(10, int.avg_wait_time + Math.floor(Math.random() * 10 - 5)),
        signal_status: ['green', 'yellow', 'red'][Math.floor(Math.random() * 3)] as any,
        congestion_level: int.vehicle_count > 150 ? 'high' : int.vehicle_count > 80 ? 'medium' : 'low'
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getCongestionColor = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "outline";
    }
  };

  const getSignalColor = (status: string) => {
    switch (status) {
      case "green": return "bg-green-500";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleOptimizeAll = () => {
    setIntersections(prev => prev.map(int => ({ ...int, ai_optimized: true })));
    toast({
      title: "AI Optimization Activated",
      description: "All intersections now using adaptive signal control",
    });
  };

  const handleEmergencyOverride = (intersectionId: string) => {
    toast({
      title: "Emergency Override Activated",
      description: "Priority lane cleared for emergency vehicle",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Traffic Control Header */}
      <header className="border-b bg-card shadow-card sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Brain className="h-8 w-8" />
                AI Traffic Control Center
              </h1>
              <p className="text-sm text-muted-foreground">MoveSmart Intelligent Traffic Management System</p>
            </div>
            <Button onClick={handleOptimizeAll} className="gap-2">
              <Zap className="h-4 w-4" />
              Optimize All
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                Active Intersections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{systemStats.total_intersections}</div>
              <p className="text-xs text-muted-foreground">Monitored 24/7</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-secondary" />
                AI Optimized
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{systemStats.ai_active}</div>
              <p className="text-xs text-muted-foreground">Adaptive control active</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Avg. Time Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{systemStats.avg_reduction}%</div>
              <p className="text-xs text-muted-foreground">Per journey</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Emergency Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{systemStats.emergency_active}</div>
              <p className="text-xs text-muted-foreground">Priority vehicles</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Intersections */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Live Traffic Intersections
            </CardTitle>
            <CardDescription>Real-time monitoring with computer vision AI (OpenCV + YOLO)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {intersections.map((intersection) => (
                <Card key={intersection.id} className="hover:shadow-hover transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          {intersection.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {intersection.cameras_active} cameras active • YOLO detection enabled
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getCongestionColor(intersection.congestion_level)}>
                          {intersection.congestion_level.toUpperCase()}
                        </Badge>
                        {intersection.ai_optimized && (
                          <Badge variant="outline" className="gap-1">
                            <Brain className="h-3 w-3" />
                            AI Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Vehicles</p>
                          <p className="text-lg font-semibold">{intersection.vehicle_count}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Wait</p>
                          <p className="text-lg font-semibold">{intersection.avg_wait_time}s</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded-full ${getSignalColor(intersection.signal_status)}`} />
                        <div>
                          <p className="text-xs text-muted-foreground">Signal</p>
                          <p className="text-lg font-semibold capitalize">{intersection.signal_status}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Cameras</p>
                          <p className="text-lg font-semibold">{intersection.cameras_active}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEmergencyOverride(intersection.id)}
                        className="gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Emergency Override
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-2">
                        <Activity className="h-4 w-4" />
                        View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI System Info */}
        <Card className="mt-8 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              AI Traffic Management System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Computer Vision Technology
                  </h4>
                  <ul className="text-sm space-y-1 ml-7 text-muted-foreground">
                    <li>• OpenCV image processing for real-time analysis</li>
                    <li>• YOLO object detection for vehicle counting</li>
                    <li>• Lane occupancy detection and classification</li>
                    <li>• Emergency vehicle identification (ambulances, police)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Adaptive Signal Control
                  </h4>
                  <ul className="text-sm space-y-1 ml-7 text-muted-foreground">
                    <li>• Dynamic timing based on real-time traffic density</li>
                    <li>• Predictive congestion management</li>
                    <li>• Coordinated signal synchronization across city</li>
                    <li>• Automatic priority for emergency vehicles</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    MoveSmart Integration
                  </h4>
                  <ul className="text-sm space-y-1 ml-7 text-muted-foreground">
                    <li>• Real-time traffic data pushed to user apps</li>
                    <li>• GPS-based intelligent route optimization</li>
                    <li>• Instant alerts for congestion and incidents</li>
                    <li>• Bi-directional data sharing with field conditions</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Smart City Benefits
                  </h4>
                  <ul className="text-sm space-y-1 ml-7 text-muted-foreground">
                    <li>• 32% average reduction in travel time</li>
                    <li>• 40% decrease in fuel consumption</li>
                    <li>• Reduced CO2 emissions and air pollution</li>
                    <li>• Enhanced safety and emergency response</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TrafficControl;

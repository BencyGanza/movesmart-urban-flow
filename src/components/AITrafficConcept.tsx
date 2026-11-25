import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Camera, Zap, Navigation, Activity, CheckCircle, TrendingUp, MapPin, Smartphone } from "lucide-react";

const AITrafficConcept = () => {
  return (
    <div className="space-y-8 py-12">
      {/* Main Concept Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="gap-2 px-4 py-2">
          <Brain className="h-4 w-4" />
          Proposed system · concept
        </Badge>
        <h2 className="text-4xl font-bold">Intelligent Traffic Management System</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Our proposal for Kigali: a CCTV and sensor network connected to the MoveSmart app for adaptive
          traffic control, less congestion and priority for emergency vehicles. Not yet deployed.
        </p>
      </div>

      {/* System Architecture */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              AI Infrastructure Layer
            </CardTitle>
            <CardDescription>Computer Vision & Adaptive Control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">CCTV & Sensors Network</p>
                  <p className="text-sm text-muted-foreground">
                    High-resolution cameras at every major intersection continuously monitor traffic flow
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">OpenCV + YOLO Detection</p>
                  <p className="text-sm text-muted-foreground">
                    Real-time vehicle detection, classification, and counting per lane with 95%+ accuracy
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Adaptive Signal Algorithm</p>
                  <p className="text-sm text-muted-foreground">
                    Dynamic traffic light timing based on real-time congestion analysis and predictive patterns
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Cloud Processing Hub</p>
                  <p className="text-sm text-muted-foreground">
                    Central AI server processes data from all intersections and coordinates citywide optimization
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-secondary" />
              MoveSmart App Layer
            </CardTitle>
            <CardDescription>User Interface & Real-Time Integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Live Traffic Data Feed</p>
                  <p className="text-sm text-muted-foreground">
                    Direct API connection to AI traffic system for real-time congestion and incident data
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">GPS-Based Smart Routing</p>
                  <p className="text-sm text-muted-foreground">
                    Combines user GPS data with AI traffic analysis to suggest fastest routes dynamically
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Instant Alerts & Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Push notifications for accidents, road closures, police checkpoints, and alternative routes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Field Condition Reporting</p>
                  <p className="text-sm text-muted-foreground">
                    Users report blocked roads or incidents, feeding data back to AI for citywide signal adjustment
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Flow Diagram */}
      <Card className="shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Bi-Directional Data Flow
          </CardTitle>
          <CardDescription>How AI Infrastructure and MoveSmart App Communicate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Flow 1 */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">AI System Monitors Intersections</p>
                <p className="text-sm text-muted-foreground">
                  CCTV cameras + YOLO detect vehicles → Count per lane → Analyze congestion level
                </p>
              </div>
              <Camera className="h-8 w-8 text-primary" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Data Uploaded to Cloud</p>
                <p className="text-sm text-muted-foreground">
                  Real-time traffic conditions synced to MoveSmart cloud database via secure API
                </p>
              </div>
              <Zap className="h-8 w-8 text-secondary" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">App Updates & Reroutes Users</p>
                <p className="text-sm text-muted-foreground">
                  MoveSmart app fetches latest data → Recalculates optimal routes → Sends push notifications
                </p>
              </div>
              <Navigation className="h-8 w-8 text-green-500" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                4
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">User Reports Feed Back to AI</p>
                <p className="text-sm text-muted-foreground">
                  Blocked roads or incidents reported by users → AI adjusts signal timing citywide
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                5
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Emergency Vehicle Priority</p>
                <p className="text-sm text-muted-foreground">
                  Ambulance using MoveSmart detected → AI auto-switches lights to green ahead of vehicle path
                </p>
              </div>
              <MapPin className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact & Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
            <CardTitle>32% Time Reduction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Average travel time decreased through AI-optimized routing and adaptive signal control
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <Activity className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle>40% Fuel Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Reduced idling time and smoother traffic flow leads to significant fuel consumption decrease
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CheckCircle className="h-8 w-8 text-purple-500 mb-2" />
            <CardTitle>Enhanced Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Faster emergency response times and reduced congestion-related accidents across the city
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Smart City Vision */}
      <Card className="shadow-card bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-gradient">
        <CardContent className="pt-8">
          <div className="text-center space-y-4 text-primary-foreground">
            <Brain className="h-16 w-16 mx-auto" />
            <h3 className="text-2xl font-bold">A Connected, Intelligent Traffic Ecosystem</h3>
            <p className="max-w-3xl mx-auto opacity-90">
              By combining AI automation with real-time human interaction through MoveSmart,
              we create a sustainable urban environment where traffic flows smoothly, emissions
              decrease, emergency vehicles reach patients faster, and citizens experience a modern,
              efficient transportation system built for the future.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Badge variant="secondary" className="gap-2 px-4 py-2">
                <Activity className="h-4 w-4" />
                Real-Time Monitoring
              </Badge>
              <Badge variant="secondary" className="gap-2 px-4 py-2">
                <Brain className="h-4 w-4" />
                AI-Powered Decisions
              </Badge>
              <Badge variant="secondary" className="gap-2 px-4 py-2">
                <TrendingUp className="h-4 w-4" />
                Sustainable Growth
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITrafficConcept;

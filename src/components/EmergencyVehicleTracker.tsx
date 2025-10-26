import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Activity, Navigation, CheckCircle, Siren } from "lucide-react";

interface EmergencyVehicle {
  id: string;
  type: "ambulance" | "police" | "fire";
  location: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  status: "active" | "responding" | "arrived";
  priority: number;
  eta: number;
  signalsCleared: number;
}

const EmergencyVehicleTracker = () => {
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>([
    {
      id: "emg_001",
      type: "ambulance",
      location: { lat: -1.2864, lng: 36.8172 },
      destination: { lat: -1.2921, lng: 36.7820 },
      status: "responding",
      priority: 1,
      eta: 8,
      signalsCleared: 4
    },
    {
      id: "emg_002",
      type: "police",
      location: { lat: -1.2841, lng: 36.8155 },
      destination: { lat: -1.2195, lng: 36.8917 },
      status: "active",
      priority: 2,
      eta: 12,
      signalsCleared: 2
    }
  ]);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "ambulance": return "🚑";
      case "police": return "🚓";
      case "fire": return "🚒";
      default: return "🚨";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "responding":
        return <Badge variant="destructive" className="gap-1"><Activity className="h-3 w-3" />Responding</Badge>;
      case "active":
        return <Badge variant="secondary" className="gap-1"><Navigation className="h-3 w-3" />En Route</Badge>;
      case "arrived":
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Arrived</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Siren className="h-6 w-6 text-red-500" />
          Emergency Vehicle Priority System
        </CardTitle>
        <CardDescription>
          AI automatically clears traffic signals for emergency vehicles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getVehicleIcon(vehicle.type)}</span>
                    <div>
                      <h4 className="font-semibold capitalize">{vehicle.type}</h4>
                      <p className="text-sm text-muted-foreground">Priority {vehicle.priority} • ID: {vehicle.id}</p>
                    </div>
                  </div>
                  {getStatusBadge(vehicle.status)}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ETA</p>
                    <p className="text-2xl font-bold text-red-500">{vehicle.eta} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Signals Cleared</p>
                    <p className="text-2xl font-bold text-green-500">{vehicle.signalsCleared}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">AI Status</p>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">🟢 AI Traffic Priority Active</p>
                  <p className="text-xs text-muted-foreground">
                    Signals ahead automatically switching to green. Real-time path optimization in progress.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {vehicles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No emergency vehicles currently active</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyVehicleTracker;

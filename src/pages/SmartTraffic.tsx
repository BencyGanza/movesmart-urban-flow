import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AITrafficConcept from "@/components/AITrafficConcept";
import EmergencyVehicleTracker from "@/components/EmergencyVehicleTracker";

/** Public page presenting the AI traffic management proposal (simulated data). */
const SmartTraffic = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 pt-24 pb-16 space-y-12">
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        This is a proposal. The numbers and vehicles below are simulated to show how the system would work in Kigali.
      </div>
      <AITrafficConcept />
      <EmergencyVehicleTracker />
    </main>
    <Footer />
  </div>
);

export default SmartTraffic;

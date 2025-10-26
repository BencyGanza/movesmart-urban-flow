import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { AdminPreview } from "@/components/AdminPreview";
import { Footer } from "@/components/Footer";
import AITrafficConcept from "@/components/AITrafficConcept";
import EmergencyVehicleTracker from "@/components/EmergencyVehicleTracker";
import TrafficMap from "@/components/TrafficMap";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* AI Traffic Management Concept */}
      <section className="container mx-auto px-4 py-16">
        <AITrafficConcept />
      </section>

      {/* Live Traffic Map */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Live Smart City Traffic Network</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time visualization of AI-monitored intersections with adaptive signal control
          </p>
        </div>
        <div className="h-[600px] rounded-lg overflow-hidden">
          <TrafficMap />
        </div>
      </section>

      {/* Emergency Vehicle Tracking */}
      <section className="container mx-auto px-4 py-16">
        <EmergencyVehicleTracker />
      </section>

      <Features />
      <HowItWorks />
      <AdminPreview />
      <Footer />
    </div>
  );
};

export default Index;

import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { AdminPreview } from "@/components/AdminPreview";
import { Footer } from "@/components/Footer";
import AITrafficConcept from "@/components/AITrafficConcept";
import EmergencyVehicleTracker from "@/components/EmergencyVehicleTracker";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* AI Traffic Management Concept */}
      <section className="container mx-auto px-4 py-16">
        <AITrafficConcept />
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

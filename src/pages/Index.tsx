import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { AdminPreview } from "@/components/AdminPreview";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <AdminPreview />
      <Footer />
    </div>
  );
};

export default Index;

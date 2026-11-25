import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Bike, CreditCard, Map, Route, ShieldCheck, TrafficCone } from "lucide-react";

const features = [
  { Icon: Bike, title: "Moto, taxi and bus in one app", body: "Book the nearest available vehicle, with the fare in RWF shown before you confirm." },
  { Icon: Route, title: "Journey planner", body: "Compare the fastest, safest and best-balanced routes, with traffic, rain and road hazards along the way." },
  { Icon: CreditCard, title: "Pay the local way", body: "MTN MoMo, Airtel Money or cash. Mobile money is simulated in this demo version." },
  { Icon: ShieldCheck, title: "Safety built in", body: "Share your trip on WhatsApp, report problems, rate drivers and reach 112 quickly." },
  { Icon: Map, title: "Community Eyes", body: "Riders report flooding, accidents and road damage, and others confirm or clear them." },
  { Icon: TrafficCone, title: "Smart traffic proposal", body: "A concept for adaptive traffic signals and emergency-vehicle priority in Kigali." },
];

const guide = [
  { page: "Home", what: "An overview of MoveSmart and a quick fare check." },
  { page: "Journey planner", what: "Plan a trip, compare routes, check conditions and try What-If scenarios. No account needed." },
  { page: "My rides", what: "Book a ride, follow your current trip, pay, rate and see your history. Needs an account." },
  { page: "Smart traffic", what: "Our proposal for AI-assisted traffic management, shown with simulated data." },
  { page: "Traffic control", what: "The operator control centre concept for transport companies." },
  { page: "Help", what: "Common questions and a built-in assistant." },
];

const goals = [
  { value: "30%", label: "shorter travel times through smart routing" },
  { value: "40%", label: "faster emergency vehicle response" },
  { value: "35%", label: "lower CO₂ emissions from idling traffic" },
];

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHeader
        title="About MoveSmart"
        description="MoveSmart makes getting around Kigali simpler and safer: fair prices you can see, the nearest driver, and the information you need before you set off."
      />

      <main>
        <section className="container mx-auto px-4 py-16 grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Our mission</h2>
            <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed max-w-xl">
              <p>
                Every day thousands of people in Kigali negotiate moto fares, wait for buses without knowing when they
                will come, and get caught by rain on flood-prone roads. MoveSmart brings booking, fares, route planning
                and safety tools together in one place.
              </p>
              <p>
                We support Rwanda's Vision 2050 goals for smart cities, cashless payments and sustainable urban
                mobility.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8">
            {features.map(({ Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <Icon className="h-6 w-6 shrink-0 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted">
          <div className="container mx-auto px-4 py-16">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Finding your way around the app</h2>
            <dl className="mt-8 grid md:grid-cols-2 gap-x-12 gap-y-6">
              {guide.map((g) => (
                <div key={g.page} className="border-l-4 border-primary pl-4">
                  <dt className="font-semibold">{g.page}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{g.what}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Our goals for Kigali</h2>
          <p className="mt-2 text-muted-foreground">
            Targets for when the smart traffic system is in place. They are goals, not measured results.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border">
            {goals.map((g) => (
              <div key={g.label} className="bg-card p-6">
                <p className="text-4xl font-semibold text-primary">{g.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">Target: {g.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate("/dashboard")}>Book a ride</Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/planner")}>Plan a journey</Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

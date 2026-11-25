import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckCircle2,
  Bike,
  CreditCard,
  History,
  LocateFixed,
  MapPinned,
  Phone,
  Route,
  Share2,
  ShieldAlert,
  Siren,
  Star,
  TrafficCone,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FareTicket } from "@/components/home/FareTicket";

const HERO_BG = "hsl(197 100% 24%)";

const steps = [
  {
    title: "Say where you're going",
    body: "Search any place in Rwanda, from a Kigali street to a town upcountry, or use your current location.",
  },
  {
    title: "Pick moto, taxi or bus",
    body: "Each option shows the distance, travel time and fare in RWF before you book.",
  },
  {
    title: "Ride and pay your way",
    body: "The nearest free driver is assigned. Pay with MTN MoMo, Airtel Money or cash when you arrive.",
  },
];

const features = [
  { Icon: LocateFixed, title: "Places across Rwanda", body: "Kigali landmarks, bus parks and towns in every province, or your GPS location." },
  { Icon: CreditCard, title: "Fare shown up front", body: "Prices in Rwandan francs for each vehicle type, so there's no haggling." },
  { Icon: Bike, title: "Nearest driver", body: "Your request goes to the closest available moto, taxi or bus." },
  { Icon: History, title: "Trip history", body: "Every ride, payment and rating in one place." },
  { Icon: Route, title: "City and intercity buses", body: "Kigali city routes plus buses to Musanze, Huye, Rubavu, Rwamagana, Nyagatare and Rusizi." },
  { Icon: MapPinned, title: "3D map of Rwanda", body: "Explore the hills, lakes and towns in 3D, with vehicles and bus routes on the map." },
];

const safety = [
  { Icon: Share2, title: "Share your trip", body: "Send the route and vehicle plate to a friend on WhatsApp." },
  { Icon: ShieldAlert, title: "Report a problem", body: "Flag unsafe driving, harassment or overcharging from the trip." },
  { Icon: Star, title: "Rate every ride", body: "Ratings keep drivers accountable." },
  { Icon: Phone, title: "Emergency: 112", body: "The Rwanda National Police number is shown in the app." },
];

const plannerPoints = [
  "Three routes side by side, each explaining why it was recommended",
  "Best time to leave in the next three hours, and a preparation checklist",
  "What-If simulator: heavy rain, a blocked road, flooding or an accident",
  "Community Eyes: report and confirm road problems with other riders",
  "Nearby hospitals, police and emergency numbers 112, 912, 113 and 111",
];

const plannerRoutes = [
  { name: "Fastest", color: "#2563eb", note: "Via Airport Road, passes one road works notice", time: "31 min" },
  { name: "Safest estimated", color: "#0e9f8e", note: "Avoids the flood-prone Nyabugogo valley", time: "36 min" },
  { name: "Balanced", color: "#c2417a", note: "Best mix of time and exposure", time: "33 min" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section
        className="relative overflow-hidden pt-16 text-white"
        style={{ background: HERO_BG, ["--notch" as string]: HERO_BG }}
      >
        <div className="container mx-auto px-4 pt-14 pb-40 md:pt-20 md:pb-48 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-semibold leading-[1.05] tracking-tight text-balance">
              Moto, taxi or bus across Rwanda, priced before you go.
            </h1>
            <p className="mt-6 text-lg text-white/85 leading-relaxed">
              MoveSmart finds the nearest driver, shows the fare in Rwandan francs and lets you pay with MTN MoMo,
              Airtel Money or cash.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                onClick={() => navigate("/dashboard")}
              >
                Book a ride
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                See how it works
              </Button>
            </div>
            <p className="mt-5 text-sm text-white/70">
              Presenting or trying it out? Use the demo account on the sign-in page.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <FareTicket />
          </div>
        </div>

        {/* Kigali's hills with a route running across them */}
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-48 md:h-60"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0 120 C 180 60, 300 150, 480 100 S 820 40, 1000 110 S 1300 70, 1440 100 V240 H0Z" fill="hsl(160 45% 30%)" />
          <path d="M0 170 C 220 120, 380 190, 600 150 S 980 110, 1180 160 S 1380 140, 1440 150 V240 H0Z" fill="hsl(147 50% 25%)" />
          <path
            d="M40 190 C 240 150, 380 200, 560 168 S 900 120, 1100 170 S 1340 150, 1420 160"
            fill="none"
            stroke="hsl(51 100% 49%)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="2 14"
            className="route-dash"
          />
          {[
            [40, 190, "Nyabugogo"],
            [560, 168, "Downtown"],
            [1100, 170, "Remera"],
            [1420, 160, "Kimironko"],
          ].map(([x, y, label]) => (
            <g key={label as string}>
              <circle cx={x as number} cy={y as number} r="8" fill="white" stroke="hsl(51 100% 49%)" strokeWidth="4" />
            </g>
          ))}
          <path d="M0 215 C 300 200, 600 230, 900 212 S 1300 205, 1440 215 V240 H0Z" fill="hsl(0 0% 100%)" />
        </svg>
      </section>

      {/* Payments */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
          <p className="font-medium shrink-0">Pay the way you already do</p>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-lg px-4 py-2 font-semibold" style={{ background: "#FFCC00", color: "#102A43" }}>
              MTN MoMo
            </span>
            <span className="rounded-lg px-4 py-2 font-semibold text-white" style={{ background: "#D8232A" }}>
              Airtel Money
            </span>
            <span className="rounded-lg px-4 py-2 font-semibold bg-muted">Cash to driver</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="container mx-auto px-4 py-20 md:py-24">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl">Book in three steps</h2>
          <ol className="mt-12 grid md:grid-cols-3 gap-10 md:gap-8">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground text-lg font-semibold">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed max-w-sm">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted scroll-mt-20">
        <div className="container mx-auto px-4 py-20 md:py-24 grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
          <div className="max-w-md">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Built for getting around Rwanda</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Everything you need for a daily commute in Kigali or a trip upcountry, from the bus park to the lake.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => navigate("/dashboard")}>Open my rides</Button>
              <Button variant="outline" onClick={() => navigate("/map")}>Explore the 3D map</Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
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
        </div>
      </section>

      {/* Journey planner */}
      <section id="planner" className="scroll-mt-20">
        <div className="container mx-auto px-4 py-20 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">See the journey before you take it</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The journey planner compares the fastest, safest and best-balanced routes across Kigali, with traffic, rain,
              flood-prone roads and road works along the way. It tells you the best time to leave and what to prepare.
            </p>
            <ul className="mt-6 space-y-3">
              {plannerPoints.map((pt) => (
                <li key={pt} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-8" size="lg" onClick={() => navigate("/planner")}>
              Open the journey planner
            </Button>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-[0_24px_60px_-30px_hsl(210_61%_16%/0.35)]">
            <p className="text-sm text-muted-foreground">Nyabugogo bus park to Kigali International Airport</p>
            <div className="mt-4 space-y-3">
              {plannerRoutes.map((r) => (
                <div key={r.name} className="flex items-center gap-4 rounded-xl border p-4" style={{ borderLeft: `5px solid ${r.color}` }}>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: r.color }}>{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.note}</p>
                  </div>
                  <p className="text-xl font-semibold tabular-nums">{r.time}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Example with sample traffic and weather data.</p>
          </div>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="bg-secondary text-secondary-foreground scroll-mt-20">
        <div className="container mx-auto px-4 py-20 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Someone always knows where you are</h2>
            <p className="mt-4 text-secondary-foreground/80 leading-relaxed">
              Safety tools are one tap away during and after every trip.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/15 rounded-xl overflow-hidden">
            {safety.map(({ Icon, title, body }) => (
              <div key={title} className="bg-secondary p-6">
                <Icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-secondary-foreground/80 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart traffic proposal + operators */}
      <section>
        <div className="container mx-auto px-4 py-20 md:py-24 grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border p-8 md:p-10">
            <TrafficCone className="h-8 w-8 text-primary" />
            <h2 className="mt-5 text-2xl md:text-3xl font-semibold tracking-tight">A smarter traffic system for Kigali</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Our proposal connects traffic cameras and signals to MoveSmart, so lights adapt to real congestion and
              ambulances get a clear road. Explore the concept with a simulated demo.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Siren className="h-4 w-4 text-destructive" /> Emergency vehicle priority
              </span>
              <span className="flex items-center gap-2">
                <TrafficCone className="h-4 w-4 text-primary" /> Adaptive signals
              </span>
            </div>
            <Button variant="outline" className="mt-8" onClick={() => navigate("/smart-traffic")}>
              Explore the concept
            </Button>
          </div>

          <div className="rounded-2xl bg-foreground text-background p-8 md:p-10">
            <Users className="h-8 w-8 text-accent" />
            <h2 className="mt-5 text-2xl md:text-3xl font-semibold tracking-tight">For transport operators</h2>
            <p className="mt-3 text-background/75 leading-relaxed">
              Bus companies and moto cooperatives can watch their fleet, routes and service quality from one control
              centre.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-background/85">
              <li className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-accent" /> Fleet and route overview</li>
              <li className="flex items-center gap-2"><Star className="h-4 w-4 text-accent" /> Driver ratings and safety reports</li>
              <li className="flex items-center gap-2"><Route className="h-4 w-4 text-accent" /> Route and fare management</li>
            </ul>
            <Button className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/traffic-control")}>
              Open the control centre
            </Button>
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="bg-muted">
        <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Ready for your next trip?</h2>
            <p className="mt-2 text-muted-foreground">Create a free account or sign in with the demo account.</p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" onClick={() => navigate("/auth")}>Create account</Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/help")}>Get help</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { mountPlanner } from "@/features/planner/engine";
import { reportsApi } from "@/features/planner/reportsApi";
import "@/features/planner/planner.css";

/** Journey planner: routes, conditions, services, What-If simulator and Community Eyes. */
const Planner = () => {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!ref.current) return;
    const cleanup = mountPlanner(ref.current, {
      reports: reportsApi,
      onBook: (from, to) => {
        const p = new URLSearchParams({
          from: from.name,
          fromLat: String(from.lat),
          fromLng: String(from.lng),
          to: to.name,
          toLat: String(to.lat),
          toLng: String(to.lng),
        });
        navigate(`/dashboard?${p.toString()}`);
      },
      onNeedSignIn: () =>
        toast({ title: "Sign in to take part", description: "Posting and voting on reports needs a MoveSmart account." }),
    });
    return cleanup;
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div ref={ref} className="nx" />
      </main>
      <Footer />
    </div>
  );
};

export default Planner;

import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import movesmartLogo from "@/assets/movesmart-logo.png";

const columns = [
  {
    title: "Ride",
    links: [
      { to: "/dashboard", label: "Book a ride" },
      { to: "/planner", label: "Journey planner" },
      { to: "/map", label: "3D map of Rwanda" },
      { to: "/#how-it-works", label: "How it works" },
      { to: "/#features", label: "Features" },
      { to: "/#safety", label: "Safety" },
    ],
  },
  {
    title: "MoveSmart",
    links: [
      { to: "/about", label: "About us" },
      { to: "/smart-traffic", label: "Smart traffic proposal" },
      { to: "/traffic-control", label: "Operator control centre" },
      { to: "/help", label: "Help and FAQ" },
    ],
  },
];

export const Footer = () => (
  <footer className="bg-foreground text-background">
    <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
      <div className="max-w-xs">
        <div className="flex items-center gap-2.5">
          <img src={movesmartLogo} alt="" className="w-9 h-9 rounded-md object-contain bg-white" />
          <span className="text-xl font-semibold">MoveSmart</span>
        </div>
        <p className="mt-4 text-sm text-background/70 leading-relaxed">
          Moto, taxi and bus rides across Rwanda, with fares you can see before you go.
        </p>
      </div>

      {columns.map((c) => (
        <div key={c.title}>
          <h3 className="font-semibold mb-4">{c.title}</h3>
          <ul className="space-y-2.5 text-sm">
            {c.links.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-background/70 hover:text-background transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <h3 className="font-semibold mb-4">Contact</h3>
        <ul className="space-y-2.5 text-sm text-background/70">
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Kigali, Rwanda</li>
          <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@movesmart.rw</li>
          <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +250 788 000 000</li>
          <li className="pt-2 text-background/90">Emergency: call 112</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-background/15">
      <div className="container mx-auto px-4 py-5 text-xs text-background/60">
        © {new Date().getFullYear()} MoveSmart. Demo project; mobile money payments are simulated.
      </div>
    </div>
  </footer>
);

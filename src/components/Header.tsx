import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import movesmartLogo from "@/assets/movesmart-logo.png";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/planner", label: "Journey planner" },
  { to: "/smart-traffic", label: "Smart traffic" },
  { to: "/about", label: "About" },
  { to: "/help", label: "Help" },
];
const privateLinks = [
  { to: "/dashboard", label: "My rides" },
  { to: "/traffic-control", label: "Traffic control" },
];

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsAuthenticated(!!session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setIsAuthenticated(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    setOpen(false);
    navigate("/");
  };

  const links = isAuthenticated ? [...publicLinks, ...privateLinks] : publicLinks;
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-foreground/80"}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={movesmartLogo} alt="" className="w-9 h-9 object-contain rounded-md" />
            <span className="text-xl font-semibold tracking-tight">MoveSmart</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Sign in
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Book a ride
                </Button>
              </>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="text-left">Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2.5 text-base ${isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted"}`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-6 border-t pt-6">
                {isAuthenticated ? (
                  <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setOpen(false);
                      navigate("/auth");
                    }}
                  >
                    Sign in to book a ride
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";

const DEMO_EMAIL = "demo@movesmart.rw";
const DEMO_PASSWORD = "MoveSmart@2026";

const benefits = [
  "See the fare in RWF before you book",
  "Get the nearest moto, taxi or bus",
  "Pay with MTN MoMo, Airtel Money or cash",
  "Share your trip and report problems",
];

const friendlyAuthError = (message = "") => {
  if (/invalid login credentials/i.test(message)) return "The email or password is wrong. Check them and try again.";
  if (/already registered|already been registered/i.test(message)) return "An account with this email already exists. Sign in instead.";
  if (/email not confirmed/i.test(message)) return "Confirm your email first using the link we sent you.";
  if (/network|fetch/i.test(message)) return "Can't reach MoveSmart. Check your internet connection and try again.";
  return message || "Something went wrong. Please try again.";
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const from: string = (location.state as { from?: string } | null)?.from || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tab, setTab] = useState("signin");

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(from, { replace: true });
      setCheckingAuth(false);
    });
  }, [navigate, from]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword.length < 6) {
      toast({ title: "Choose a longer password", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        options: {
          emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}dashboard`,
          data: { full_name: fullName.trim(), phone_number: phoneNumber.trim() },
        },
      });
      if (error) throw error;
      if (data.session) {
        toast({ title: "Account created", description: `Welcome to MoveSmart, ${fullName.split(" ")[0]}.` });
        navigate(from, { replace: true });
      } else {
        toast({ title: "Check your email", description: "We sent you a link to confirm your account." });
        setTab("signin");
        setSignInEmail(signUpEmail.trim());
      }
    } catch (error: any) {
      toast({ title: "Couldn't create your account", description: friendlyAuthError(error?.message), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: signInEmail.trim(), password: signInPassword });
      if (error) throw error;
      toast({ title: "Signed in", description: "Welcome back to MoveSmart." });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({ title: "Couldn't sign in", description: friendlyAuthError(error?.message), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="min-h-screen pt-16 grid lg:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden lg:flex flex-col justify-center px-16 text-white" style={{ background: "hsl(197 100% 24%)" }}>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight max-w-md">
            Getting around Kigali, made simple.
          </h1>
          <ul className="mt-8 space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-white/90">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" /> {b}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-white/70 max-w-sm">
            Just looking? The <Link to="/planner" className="underline underline-offset-2 text-white">journey planner</Link>{" "}
            works without an account.
          </p>
        </div>

        {/* Form */}
        <div className="flex items-center justify-center px-4 py-12 bg-muted/40">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-semibold tracking-tight">{tab === "signin" ? "Sign in" : "Create your account"}</h2>
            <p className="mt-1 text-muted-foreground">
              {from !== "/dashboard" ? "Sign in to continue where you left off." : "Book rides, pay and track your trips."}
            </p>

            <Tabs value={tab} onValueChange={setTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 rounded-xl border bg-card p-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" autoComplete="email" placeholder="you@example.com"
                      value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" autoComplete="current-password"
                      value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
                  </Button>
                </form>

                <div className="mt-4 rounded-xl border border-dashed bg-card p-4 text-sm">
                  <p className="font-medium">Demo account</p>
                  <p className="mt-1 text-muted-foreground">
                    {DEMO_EMAIL} · {DEMO_PASSWORD}
                  </p>
                  <Button type="button" variant="outline" className="mt-3 w-full"
                    onClick={() => { setSignInEmail(DEMO_EMAIL); setSignInPassword(DEMO_PASSWORD); }}>
                    Use demo account
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 rounded-xl border bg-card p-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full name</Label>
                    <Input id="fullname" autoComplete="name" placeholder="e.g. Aline Uwase"
                      value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" type="tel" autoComplete="tel" placeholder="+250 788 123 456"
                      value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com"
                      value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" autoComplete="new-password" minLength={6}
                      value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
                    <p className="text-xs text-muted-foreground">At least 6 characters.</p>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</> : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

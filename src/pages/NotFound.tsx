import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 pt-40 pb-24 max-w-xl text-center">
      <p className="text-6xl font-semibold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">This page took a wrong turn</h1>
      <p className="mt-2 text-muted-foreground">The address may be mistyped, or the page has moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/">Go to the homepage</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/planner">Plan a journey</Link>
        </Button>
      </div>
    </main>
  </div>
);

export default NotFound;

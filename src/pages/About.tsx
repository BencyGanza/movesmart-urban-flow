import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Shield, CreditCard, Zap, TrendingUp } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: MapPin,
      title: "Real-Time GPS Tracking",
      description: "Track your ride in real-time with accurate GPS positioning and live driver location updates."
    },
    {
      icon: Users,
      title: "Smart Matching",
      description: "Our AI algorithm instantly matches you with the nearest available driver for quick pickups."
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Enhanced safety features including driver verification, emergency alerts, and trip sharing."
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      description: "Multiple payment options including mobile money (MTN MoMo, Airtel Money) and cash."
    },
    {
      icon: Zap,
      title: "AI Traffic Management",
      description: "Intelligent traffic control system that optimizes routes and reduces congestion."
    },
    {
      icon: TrendingUp,
      title: "Route Optimization",
      description: "Smart routing algorithms that find the fastest path to your destination."
    }
  ];

  const navigationGuide = [
    {
      section: "Home",
      description: "Learn about MoveSmart's features, see how it works, and explore our AI traffic management system."
    },
    {
      section: "Sign In / Sign Up",
      description: "Create an account or sign in to start booking rides and accessing all features."
    },
    {
      section: "Dashboard",
      description: "Book rides, track your trips, view ride history, and manage your profile."
    },
    {
      section: "Traffic Control",
      description: "View real-time traffic conditions, emergency vehicle tracking, and smart routing."
    },
    {
      section: "Help",
      description: "Get assistance from our AI-powered chatbot for any questions or issues."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            About MoveSmart
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Revolutionizing public transportation in Rwanda with smart technology, 
            AI-powered traffic management, and seamless ride-hailing services.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                MoveSmart is committed to transforming public transportation in Rwanda by providing 
                a reliable, safe, and efficient ride-hailing platform that connects passengers with 
                drivers while reducing traffic congestion through intelligent AI systems.
              </p>
              <p>
                We align with Rwanda's Vision 2050 goals by supporting smart city technology, 
                promoting cashless transactions, and contributing to sustainable urban mobility solutions.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Navigation Guide */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Navigation Guide</h2>
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardDescription>
                Here's how to navigate through the MoveSmart app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {navigationGuide.map((item, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="font-semibold text-lg mb-1">{item.section}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Impact Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Our Impact in Rwanda</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg text-center">
              <CardHeader>
                <CardTitle className="text-4xl text-primary">30%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Reduction in travel time through smart routing</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg text-center">
              <CardHeader>
                <CardTitle className="text-4xl text-primary">40%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Faster emergency vehicle response</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg text-center">
              <CardHeader>
                <CardTitle className="text-4xl text-primary">35%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Reduction in CO2 emissions</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

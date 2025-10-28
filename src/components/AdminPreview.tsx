import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, MapPinned, TrendingUp, Shield, Settings, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const adminFeatures = [
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Monitor traffic patterns, peak hours, and revenue in real-time.",
  },
  {
    icon: Users,
    title: "Driver Management",
    description: "Track performance, ratings, and manage driver profiles efficiently.",
  },
  {
    icon: MapPinned,
    title: "Route Optimization",
    description: "Analyze and optimize routes based on traffic data and demand.",
  },
  {
    icon: TrendingUp,
    title: "Performance Metrics",
    description: "Access detailed reports on service quality and operational efficiency.",
  },
];

export const AdminPreview = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-6 py-2 text-accent mb-4">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">For Transport Managers</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Powerful Admin Dashboard
          </h2>
          <p className="text-lg text-muted-foreground">
            Take control of your transport network with comprehensive management tools 
            and real-time insights.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {adminFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-card border-border hover:shadow-card transition-all duration-300 hover:border-primary/50 cursor-pointer group"
              onClick={() => navigate("/auth")}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-bold text-card-foreground flex items-center justify-between">
                    {feature.title}
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* CTA Card */}
        <Card className="p-8 md:p-12 bg-gradient-hero text-primary-foreground text-center max-w-3xl mx-auto shadow-hover">
          <Settings className="w-12 h-12 mx-auto mb-6 opacity-90" />
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Transform Your Transport Network?
          </h3>
          <p className="text-primary-foreground/90 mb-8 text-lg">
            Join forward-thinking transport managers who are already using MoveSmart 
            to create more efficient, transparent, and profitable operations.
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            className="shadow-hover hover:scale-105 transition-transform min-w-[250px]"
            onClick={() => navigate("/auth")}
          >
            Request Admin Access
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Card>
      </div>
    </section>
  );
};

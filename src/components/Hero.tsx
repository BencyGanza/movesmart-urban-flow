import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Shield } from "lucide-react";
import heroImage from "@/assets/hero-transport.jpg";

export const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-accent/60 to-primary/80" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm border border-background/20 rounded-full px-6 py-2 text-primary-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Smart Public Transport Solution</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
            Move Smarter,
            <br />
            <span className="bg-gradient-to-r from-secondary to-primary-glow bg-clip-text text-transparent">
              Travel Better
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
            Real-time tracking, smart routes, and secure payments—all in one app. 
            Experience the future of public transport.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="hero" size="lg" className="min-w-[200px]">
              <Navigation className="w-5 h-5" />
              Start Your Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="min-w-[200px] bg-background/10 backdrop-blur-sm border-background/30 text-primary-foreground hover:bg-background/20"
            >
              <Shield className="w-5 h-5" />
              Learn More
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">1000+</div>
              <div className="text-sm text-primary-foreground/80">Active Vehicles</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">50K+</div>
              <div className="text-sm text-primary-foreground/80">Daily Rides</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">4.8★</div>
              <div className="text-sm text-primary-foreground/80">User Rating</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/30 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl animate-pulse-glow" />
    </div>
  );
};

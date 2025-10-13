import { Card } from "@/components/ui/card";
import { MapPin, CreditCard, Shield, Route, Clock, Star } from "lucide-react";
import trackingImage from "@/assets/feature-tracking.jpg";
import paymentImage from "@/assets/feature-payment.jpg";
import safetyImage from "@/assets/feature-safety.jpg";

const features = [
  {
    icon: MapPin,
    title: "Live GPS Tracking",
    description: "See all nearby buses, taxis, and motorbikes in real-time on an interactive map with accurate arrival times.",
    image: trackingImage,
  },
  {
    icon: Route,
    title: "Smart Route Planning",
    description: "Get the fastest and cheapest routes instantly. Compare options and choose what works best for you.",
    image: trackingImage,
  },
  {
    icon: CreditCard,
    title: "Digital Payments",
    description: "Pay securely via MTN MoMo or Airtel Money. No cash needed—just tap and go.",
    image: paymentImage,
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Share your live trip with trusted contacts and report unsafe rides instantly for peace of mind.",
    image: safetyImage,
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Track your ride's movement on the map from pickup to destination with live ETAs.",
    image: trackingImage,
  },
  {
    icon: Star,
    title: "Driver Ratings",
    description: "Rate your driver and provide feedback after every trip to maintain service quality.",
    image: safetyImage,
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Everything You Need,
            <span className="bg-gradient-hero bg-clip-text text-transparent"> One App</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            MoveSmart brings together cutting-edge technology and user-friendly design 
            to revolutionize your daily commute.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group p-8 bg-gradient-card border-border hover:shadow-hover transition-all duration-300 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon with Image Background */}
              <div className="relative mb-6">
                <div 
                  className="w-16 h-16 rounded-2xl bg-cover bg-center opacity-20 absolute"
                  style={{ backgroundImage: `url(${feature.image})` }}
                />
                <div className="relative w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-card-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

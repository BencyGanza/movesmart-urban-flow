import { Search, MapPin, CreditCard, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Search Your Route",
    description: "Enter your starting point and destination to see all available transport options.",
  },
  {
    icon: MapPin,
    number: "02",
    title: "Track in Real-Time",
    description: "Watch your ride approach on the live map with accurate arrival times.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Pay Securely",
    description: "Complete your payment via mobile money—quick, safe, and cashless.",
  },
  {
    icon: Star,
    number: "04",
    title: "Rate Your Experience",
    description: "Share feedback and help us maintain the best service quality.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Getting started with MoveSmart is simple. Follow these four easy steps 
            to experience smarter commuting.
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Line (hidden on mobile) */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-hero opacity-30" 
               style={{ width: 'calc(100% - 8rem)', left: '4rem' }} 
          />
          
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative text-center space-y-4 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Number Badge */}
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute w-24 h-24 bg-gradient-hero opacity-20 rounded-full blur-xl" />
                <div className="relative w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-hover">
                  {step.number}
                </div>
              </div>
              
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-background rounded-xl shadow-card flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">MoveSmart</span>
            </div>
            <p className="text-background/70 text-sm">
              Revolutionizing public transport with smart technology, real-time tracking, 
              and seamless payments.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Home</a></li>
              <li><a href="#features" className="text-background/70 hover:text-background transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-background/70 hover:text-background transition-colors">How It Works</a></li>
              <li><a href="#admin" className="text-background/70 hover:text-background transition-colors">Admin Dashboard</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Help Center</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-background/70">
                <Mail className="w-4 h-4" />
                <span>support@movesmart.app</span>
              </li>
              <li className="flex items-center gap-2 text-background/70">
                <Phone className="w-4 h-4" />
                <span>+256 700 000 000</span>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-9 h-9 bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10 text-center text-sm text-background/60">
          <p>&copy; 2025 MoveSmart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

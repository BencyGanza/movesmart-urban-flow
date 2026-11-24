import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const HELP_TOPICS: { keys: string[]; answer: string }[] = [
  { keys: ["book", "ride", "order", "request", "trip"], answer: "To book: sign in, open My rides, choose your pickup (or tap the location button) and destination, pick moto, taxi or bus, check the fare and tap Book. The nearest free driver is assigned straight away." },
  { keys: ["price", "fare", "cost", "how much", "expensive", "cheap", "rwf"], answer: "Fares are shown in RWF before you book. They depend on distance and vehicle: a bus is cheapest, a moto is fast and affordable, and a taxi costs more but carries up to 4 people. Example: Nyabugogo to Kimironko is about RWF 500 by bus, RWF 3,250 by moto and RWF 8,100 by taxi." },
  { keys: ["pay", "momo", "mtn", "airtel", "cash", "money", "payment"], answer: "After the trip tap Pay now and choose MTN MoMo, Airtel Money or cash. For mobile money enter your number (e.g. 078 812 3456). In this demo, mobile money payments are simulated and no real money is charged." },
  { keys: ["cancel"], answer: "You can cancel a trip from the Current trip card on My rides. You'll be asked to confirm before it's cancelled." },
  { keys: ["share", "family", "friend", "whatsapp"], answer: "During a trip tap Share and enter a contact's phone number. MoveSmart opens WhatsApp with your route and the vehicle's plate number so they know where you are." },
  { keys: ["safe", "safety", "danger", "harass", "report", "police", "emergency", "112"], answer: "In immediate danger, call the Rwanda National Police on 112. To report unsafe driving, harassment, overcharging or a vehicle problem, tap Report on your trip. Our team reviews every report." },
  { keys: ["rate", "rating", "review", "star"], answer: "After a completed trip, tap Rate trip in your trip history and give 1 to 5 stars with an optional comment." },
  { keys: ["driver", "match", "nearest", "wait"], answer: "When you book, MoveSmart assigns the nearest available vehicle of the type you chose. You'll see the vehicle model and plate number on the Current trip card." },
  { keys: ["account", "sign", "login", "log in", "password", "register", "demo"], answer: "Create an account on the Sign in page with your name, email and phone number. For a quick demo use demo@movesmart.rw with password MoveSmart@2026, or tap 'Use demo account'." },
  { keys: ["bus", "route", "nyabugogo", "kimironko", "remera", "kicukiro", "nyamirambo"], answer: "MoveSmart covers Kigali bus routes such as Nyabugogo to Kimironko, Remera to Downtown, Kicukiro to Nyamirambo, Nyabugogo to Kicukiro and Downtown to Kimihurura." },
  { keys: ["traffic", "ai", "camera", "signal", "ambulance"], answer: "The smart traffic system is our proposal for Kigali: cameras and signals connected to MoveSmart to ease congestion and give emergency vehicles a clear road. The Smart traffic page shows a simulated demo." },
  { keys: ["location", "gps", "map"], answer: "Allow location access in your browser to see yourself on the map and to use your current location as the pickup point." },
];

const answerQuestion = (question: string): string => {
  const q = question.toLowerCase();
  let best = { score: 0, answer: "" };
  for (const t of HELP_TOPICS) {
    const score = t.keys.filter((k) => q.includes(k)).length;
    if (score > best.score) best = { score, answer: t.answer };
  }
  if (/^(hi|hello|hey|muraho|bonjour|amakuru)\b/.test(q.trim()) && best.score === 0) {
    return "Muraho! Ask me about booking a ride, fares, payments, safety or your account.";
  }
  return best.score > 0
    ? best.answer
    : "I'm not sure about that one. Try asking about booking, fares, payments, cancelling, sharing a trip or safety. You can also email support@movesmart.rw.";
};

const Help = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm the MoveSmart assistant. How can I help you today? You can ask me about booking rides, payments, safety features, or anything else related to the app."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Answer from MoveSmart's own help topics (no external AI service needed)
    await new Promise((r) => setTimeout(r, 350));
    setMessages(prev => [...prev, { role: "assistant", content: answerQuestion(userMessage.content) }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const faqItems = [
    {
      question: "How do I book a ride?",
      answer: "Sign in, open My rides, choose your pickup and destination, pick moto, taxi or bus, then tap Book."
    },
    {
      question: "What payment methods are supported?",
      answer: "We support MTN MoMo, Airtel Money, and cash payments."
    },
    {
      question: "How do I track my ride?",
      answer: "Once a driver is matched to your ride, you'll see the vehicle and plate number on your Current trip card."
    },
    {
      question: "Is it safe to use MoveSmart?",
      answer: "You can share your trip on WhatsApp, report a problem from any trip, and rate every driver. In an emergency call 112."
    },
    {
      question: "How does the AI traffic system work?",
      answer: "It is our proposal for Kigali: cameras and signals connected to MoveSmart to ease congestion and clear the way for ambulances. The Smart traffic page shows a simulated demo."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            How Can We Help?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ask the assistant or browse the most common questions
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* FAQ Section */}
          <section>
            <Card className="border-none shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                <CardDescription>Quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="font-semibold mb-2">{item.question}</h3>
                      <p className="text-muted-foreground text-sm">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Chatbot Section */}
          <section>
            <Card className="border-none shadow-lg h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
                  MoveSmart assistant
                </CardTitle>
                <CardDescription>Ask me anything about MoveSmart</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4 mb-4" style={{ height: "400px" }} ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-secondary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="rounded-lg px-4 py-2 bg-muted">
                          <p className="text-sm">Typing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;

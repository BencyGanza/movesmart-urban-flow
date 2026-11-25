import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RideService, PaymentMethod } from "@/services/rideService";
import { formatRwf } from "@/lib/kigali";

interface BaseProps {
  ride: any | null;
  onClose: () => void;
  onDone: () => void;
}

const friendly = (e: any) => e?.message || "Something went wrong. Please try again.";
const validRwPhone = (p: string) => /^(\+?250|0)?7[2389]\d{7}$/.test(p.replace(/\s/g, ""));

export const PaymentDialog = ({ ride, onClose, onDone }: BaseProps) => {
  const { toast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>("mtn_momo");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const amount = Number(ride?.actual_fare || ride?.estimated_fare || 0);

  const pay = async () => {
    if (method !== "cash" && !validRwPhone(phone)) {
      toast({ title: "Check the phone number", description: "Use a Rwandan mobile number, e.g. 078 812 3456.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await RideService.payRide(ride.id, amount, method, phone);
      toast({
        title: method === "cash" ? "Cash payment noted" : "Payment successful",
        description: method === "cash" ? `Please pay the driver ${formatRwf(amount)}.` : `${formatRwf(amount)} paid (demo payment).`,
      });
      onDone();
      onClose();
    } catch (e) {
      toast({ title: "Payment failed", description: friendly(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!ride} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay for your trip</DialogTitle>
          <DialogDescription>
            Amount due: <span className="font-semibold text-foreground">{formatRwf(amount)}</span>
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="grid gap-2">
          {[
            { v: "mtn_momo", l: "MTN Mobile Money" },
            { v: "airtel_money", l: "Airtel Money" },
            { v: "cash", l: "Cash to driver" },
          ].map((o) => (
            <Label key={o.v} htmlFor={`pm-${o.v}`} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer has-[:checked]:border-primary">
              <RadioGroupItem id={`pm-${o.v}`} value={o.v} />
              {o.l}
            </Label>
          ))}
        </RadioGroup>
        {method !== "cash" && (
          <div className="space-y-2">
            <Label htmlFor="pay-phone">Mobile money number</Label>
            <Input id="pay-phone" inputMode="tel" placeholder="078 812 3456" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              Demo mode: no real money is charged until an MTN MoMo / Airtel Money account is connected.
            </p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={pay} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {method === "cash" ? "Confirm cash" : `Pay ${formatRwf(amount)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const RateDialog = ({ ride, onClose, onDone }: BaseProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await RideService.rateRide(ride.id, rating, comment, ride?.vehicle?.driver_id);
      toast({ title: "Thanks for your feedback!" });
      onDone();
      onClose();
    } catch (e) {
      toast({ title: "Couldn't save your rating", description: friendly(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!ride} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate your trip</DialogTitle>
          <DialogDescription>How was your ride with {ride?.vehicle?.license_plate ?? "your driver"}?</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)} className="p-1">
              <Star className={`h-8 w-8 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <Textarea placeholder="Anything to add? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ShareDialog = ({ ride, onClose, onDone }: BaseProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const share = async () => {
    if (!validRwPhone(phone)) {
      toast({ title: "Check the phone number", description: "Use a Rwandan mobile number, e.g. 078 812 3456.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await RideService.shareTrip(ride.id, name, phone);
      const text =
        `I'm on a MoveSmart trip from ${ride.pickup_address} to ${ride.dropoff_address}` +
        (ride?.vehicle ? ` in ${ride.vehicle.model} (${ride.vehicle.license_plate})` : "") +
        `. Expected travel time: about ${ride.estimated_duration_minutes ?? "?"} min.`;
      const digits = phone.replace(/\D/g, "").replace(/^0/, "250");
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      toast({ title: "Trip shared", description: `${name || "Your contact"} can follow your trip details.` });
      onDone();
      onClose();
    } catch (e) {
      toast({ title: "Couldn't share the trip", description: friendly(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!ride} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your trip</DialogTitle>
          <DialogDescription>Send your trip details to someone you trust via WhatsApp.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="share-name">Contact name</Label>
            <Input id="share-name" placeholder="e.g. Aline" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="share-phone">Phone number</Label>
            <Input id="share-phone" inputMode="tel" placeholder="078 812 3456" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={share} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Share trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const SafetyDialog = ({ ride, onClose, onDone }: BaseProps) => {
  const { toast } = useToast();
  const [type, setType] = useState("unsafe_driving");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (description.trim().length < 5) {
      toast({ title: "Add a short description", description: "Tell us briefly what happened.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await RideService.reportSafety(ride.id, type, description, ride?.vehicle?.driver_id, {
        lat: ride.pickup_latitude,
        lng: ride.pickup_longitude,
      });
      toast({ title: "Report received", description: "Our safety team will review it." });
      onDone();
      onClose();
    } catch (e) {
      toast({ title: "Couldn't send the report", description: friendly(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!ride} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a safety issue</DialogTitle>
          <DialogDescription>
            In immediate danger? Call the Rwanda National Police on <span className="font-semibold">112</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>What happened?</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unsafe_driving">Unsafe driving</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="vehicle_condition">Vehicle condition</SelectItem>
                <SelectItem value="route_deviation">Driver left the route</SelectItem>
                <SelectItem value="overcharging">Overcharging</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea placeholder="Describe what happened" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={submit} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

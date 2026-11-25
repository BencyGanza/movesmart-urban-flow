// Centralized ride management service
import { supabase } from "@/integrations/supabase/client";
import { distanceKm, VehicleType } from "@/lib/kigali";
import type { RideRequest } from "./types";

export type PaymentMethod = "mtn_momo" | "airtel_money" | "cash";

async function requireUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in again to continue.");
  return user;
}

export class RideService {
  /**
   * Create a ride and assign the nearest active vehicle of the requested type.
   * Returns the ride and the matched vehicle (null if none is available).
   */
  static async bookRide(rideData: RideRequest, vehicleType: VehicleType) {
    const user = await requireUser();

    const { data: ride, error } = await supabase
      .from("rides")
      .insert({ passenger_id: user.id, ...rideData, status: "pending" })
      .select()
      .single();
    if (error) throw error;

    const vehicle = await this.findNearestVehicle(
      { lat: rideData.pickup_latitude, lng: rideData.pickup_longitude },
      vehicleType
    );
    if (!vehicle) return { ride, vehicle: null };

    const { error: matchError } = await supabase
      .from("rides")
      .update({ vehicle_id: vehicle.id, status: "active", started_at: new Date().toISOString() })
      .eq("id", ride.id);
    if (matchError) throw matchError;

    return { ride, vehicle };
  }

  static async findNearestVehicle(pickup: { lat: number; lng: number }, vehicleType: VehicleType) {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("is_active", true)
      .eq("vehicle_type", vehicleType)
      .not("current_latitude", "is", null);
    if (error) throw error;
    if (!data?.length) return null;

    // Only offer vehicles close enough to come and pick the rider up
    const MAX_PICKUP_KM = 30;
    const nearest = data
      .map((v) => ({ ...v, distance: distanceKm(pickup, { lat: v.current_latitude!, lng: v.current_longitude! }) }))
      .sort((a, b) => a.distance - b.distance)[0];
    return nearest && nearest.distance <= MAX_PICKUP_KM ? nearest : null;
  }

  static async getUserRides(userId: string) {
    const { data, error } = await supabase
      .from("rides")
      .select(`*, vehicle:vehicles(*), payments(*), ratings(*)`)
      .eq("passenger_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  static async cancelRide(rideId: string) {
    const { error } = await supabase.from("rides").update({ status: "cancelled" }).eq("id", rideId);
    if (error) throw error;
  }

  static async completeRide(rideId: string, fare: number) {
    const { error } = await supabase
      .from("rides")
      .update({ status: "completed", completed_at: new Date().toISOString(), actual_fare: fare })
      .eq("id", rideId);
    if (error) throw error;
  }

  /**
   * Record a payment for a completed ride.
   * Mobile money is simulated until a real MTN MoMo / Airtel Money API is connected.
   */
  static async payRide(rideId: string, amount: number, method: PaymentMethod, phone?: string) {
    const user = await requireUser();
    const isCash = method === "cash";
    const { data, error } = await supabase
      .from("payments")
      .insert({
        ride_id: rideId,
        user_id: user.id,
        amount,
        payment_method: method,
        phone_number: isCash ? null : phone,
        payment_status: isCash ? "pending" : "completed",
        transaction_id: isCash ? null : `SIM-${Date.now().toString(36).toUpperCase()}`,
        completed_at: isCash ? null : new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async rateRide(rideId: string, rating: number, comment: string, driverId?: string | null) {
    const user = await requireUser();
    const { error } = await supabase.from("ratings").insert({
      ride_id: rideId,
      user_id: user.id,
      driver_id: driverId ?? null,
      rating,
      comment: comment.trim() || null,
    });
    if (error) throw error;
  }

  static async shareTrip(rideId: string, name: string, phone: string) {
    const user = await requireUser();
    const { data, error } = await supabase
      .from("shared_trips")
      .insert({
        ride_id: rideId,
        shared_by: user.id,
        shared_with_name: name.trim() || null,
        shared_with_phone: phone.trim(),
        expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async reportSafety(
    rideId: string,
    reportType: string,
    description: string,
    driverId?: string | null,
    location?: { lat: number; lng: number }
  ) {
    const user = await requireUser();
    const { error } = await supabase.from("safety_reports").insert({
      ride_id: rideId,
      reporter_id: user.id,
      driver_id: driverId ?? null,
      report_type: reportType,
      description: description.trim(),
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,
      status: "open",
    });
    if (error) throw error;
  }

  /** Network numbers shown on the dashboard, read from the database. */
  static async getNetworkStats() {
    const [vehicles, routes] = await Promise.all([
      supabase.from("vehicles").select("vehicle_type", { count: "exact" }).eq("is_active", true),
      supabase.from("routes").select("id", { count: "exact" }).eq("is_active", true),
    ]);
    const byType: Record<string, number> = { bus: 0, taxi: 0, motorbike: 0 };
    (vehicles.data || []).forEach((v: any) => (byType[v.vehicle_type] = (byType[v.vehicle_type] || 0) + 1));
    return { vehicles: vehicles.count ?? (vehicles.data || []).length, routes: routes.count ?? (routes.data || []).length, byType };
  }
}

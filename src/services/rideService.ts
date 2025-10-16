// Centralized ride management service
import { supabase } from "@/integrations/supabase/client";
import type {
  RideRequest,
  MatchDriverRequest,
  MatchDriverResponse,
  UpdateRideStatusRequest,
  UpdateRideStatusResponse,
} from "./types";

export class RideService {
  /**
   * Create a new ride request
   */
  static async createRide(rideData: RideRequest) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("rides")
      .insert({
        passenger_id: user.id,
        ...rideData,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Match a driver to a ride
   */
  static async matchDriver(request: MatchDriverRequest): Promise<MatchDriverResponse> {
    const { data, error } = await supabase.functions.invoke("match-driver", {
      body: request,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Update ride status
   */
  static async updateRideStatus(request: UpdateRideStatusRequest): Promise<UpdateRideStatusResponse> {
    const { data, error } = await supabase.functions.invoke("update-ride-status", {
      body: request,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get user's rides
   */
  static async getUserRides(userId: string) {
    const { data, error } = await supabase
      .from("rides")
      .select(`
        *,
        vehicle:vehicles(
          *,
          driver:profiles!vehicles_driver_id_fkey(*)
        ),
        passenger:profiles!rides_passenger_id_fkey(*)
      `)
      .eq("passenger_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get ride by ID
   */
  static async getRideById(rideId: string) {
    const { data, error } = await supabase
      .from("rides")
      .select(`
        *,
        vehicle:vehicles(
          *,
          driver:profiles!vehicles_driver_id_fkey(*)
        ),
        passenger:profiles!rides_passenger_id_fkey(*)
      `)
      .eq("id", rideId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cancel a ride
   */
  static async cancelRide(rideId: string) {
    return this.updateRideStatus({
      ride_id: rideId,
      status: "cancelled",
    });
  }
}

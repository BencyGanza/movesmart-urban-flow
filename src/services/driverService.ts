// Centralized driver management service
import { supabase } from "@/integrations/supabase/client";
import type {
  GetNearbyDriversRequest,
  GetNearbyDriversResponse,
  UpdateDriverLocationRequest,
  UpdateDriverLocationResponse,
} from "./types";

export class DriverService {
  /**
   * Get nearby drivers
   */
  static async getNearbyDrivers(request: GetNearbyDriversRequest): Promise<GetNearbyDriversResponse> {
    const { data, error } = await supabase.functions.invoke("get-nearby-drivers", {
      body: request,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Update driver location
   */
  static async updateDriverLocation(request: UpdateDriverLocationRequest): Promise<UpdateDriverLocationResponse> {
    const { data, error } = await supabase.functions.invoke("update-driver-location", {
      body: request,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get all active drivers
   */
  static async getActiveDrivers() {
    const { data, error } = await supabase
      .from("vehicles")
      .select(`
        *,
        driver:profiles!vehicles_driver_id_fkey(*)
      `)
      .eq("is_active", true);

    if (error) throw error;
    return data;
  }

  /**
   * Get driver profile
   */
  static async getDriverProfile(driverId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", driverId)
      .single();

    if (error) throw error;
    return data;
  }
}

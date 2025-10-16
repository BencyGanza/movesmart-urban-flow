// Centralized payment management service
import { supabase } from "@/integrations/supabase/client";
import type {
  ProcessPaymentRequest,
  ProcessPaymentResponse,
} from "./types";

export class PaymentService {
  /**
   * Process a payment
   */
  static async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    const { data, error } = await supabase.functions.invoke("process-payment", {
      body: request,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get payment by ride ID
   */
  static async getPaymentByRideId(rideId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("ride_id", rideId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's payment history
   */
  static async getUserPayments(userId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        ride:rides(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get payment by ID
   */
  static async getPaymentById(paymentId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        ride:rides(*)
      `)
      .eq("id", paymentId)
      .single();

    if (error) throw error;
    return data;
  }
}

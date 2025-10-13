export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          phone_number: string | null
          ride_id: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          phone_number?: string | null
          ride_id?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          phone_number?: string | null
          ride_id?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          driver_rating: number | null
          full_name: string
          id: string
          is_driver: boolean | null
          phone_number: string | null
          total_rides: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          driver_rating?: number | null
          full_name: string
          id: string
          is_driver?: boolean | null
          phone_number?: string | null
          total_rides?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          driver_rating?: number | null
          full_name?: string
          id?: string
          is_driver?: boolean | null
          phone_number?: string | null
          total_rides?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          driver_id: string | null
          id: string
          rating: number
          ride_id: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          rating: number
          ride_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          rating?: number
          ride_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          actual_fare: number | null
          completed_at: string | null
          created_at: string | null
          dropoff_address: string | null
          dropoff_latitude: number
          dropoff_longitude: number
          estimated_duration_minutes: number | null
          estimated_fare: number
          id: string
          passenger_id: string | null
          pickup_address: string | null
          pickup_latitude: number
          pickup_longitude: number
          route_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["ride_status"] | null
          vehicle_id: string | null
        }
        Insert: {
          actual_fare?: number | null
          completed_at?: string | null
          created_at?: string | null
          dropoff_address?: string | null
          dropoff_latitude: number
          dropoff_longitude: number
          estimated_duration_minutes?: number | null
          estimated_fare: number
          id?: string
          passenger_id?: string | null
          pickup_address?: string | null
          pickup_latitude: number
          pickup_longitude: number
          route_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ride_status"] | null
          vehicle_id?: string | null
        }
        Update: {
          actual_fare?: number | null
          completed_at?: string | null
          created_at?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number
          dropoff_longitude?: number
          estimated_duration_minutes?: number | null
          estimated_fare?: number
          id?: string
          passenger_id?: string | null
          pickup_address?: string | null
          pickup_latitude?: number
          pickup_longitude?: number
          route_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ride_status"] | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          base_fare: number
          created_at: string | null
          distance_km: number
          end_latitude: number
          end_longitude: number
          end_point: string
          estimated_duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          start_latitude: number
          start_longitude: number
          start_point: string
        }
        Insert: {
          base_fare: number
          created_at?: string | null
          distance_km: number
          end_latitude: number
          end_longitude: number
          end_point: string
          estimated_duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          start_latitude: number
          start_longitude: number
          start_point: string
        }
        Update: {
          base_fare?: number
          created_at?: string | null
          distance_km?: number
          end_latitude?: number
          end_longitude?: number
          end_point?: string
          estimated_duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          start_latitude?: number
          start_longitude?: number
          start_point?: string
        }
        Relationships: []
      }
      safety_reports: {
        Row: {
          created_at: string | null
          description: string
          driver_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          report_type: string
          reporter_id: string | null
          resolved_at: string | null
          ride_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          driver_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          report_type: string
          reporter_id?: string | null
          resolved_at?: string | null
          ride_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          driver_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          report_type?: string
          reporter_id?: string | null
          resolved_at?: string | null
          ride_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_reports_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_reports_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_trips: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          ride_id: string | null
          share_token: string | null
          shared_by: string | null
          shared_with_name: string | null
          shared_with_phone: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          ride_id?: string | null
          share_token?: string | null
          shared_by?: string | null
          shared_with_name?: string | null
          shared_with_phone: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          ride_id?: string | null
          share_token?: string | null
          shared_by?: string | null
          shared_with_name?: string | null
          shared_with_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_trips_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_trips_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          capacity: number
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          driver_id: string | null
          id: string
          is_active: boolean | null
          last_location_update: string | null
          license_plate: string
          model: string
          updated_at: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          capacity: number
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          driver_id?: string | null
          id?: string
          is_active?: boolean | null
          last_location_update?: string | null
          license_plate: string
          model: string
          updated_at?: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          capacity?: number
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          driver_id?: string | null
          id?: string
          is_active?: boolean | null
          last_location_update?: string | null
          license_plate?: string
          model?: string
          updated_at?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      payment_method: "mtn_momo" | "airtel_money" | "cash"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      ride_status: "pending" | "active" | "completed" | "cancelled"
      vehicle_type: "bus" | "taxi" | "motorbike"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_method: ["mtn_momo", "airtel_money", "cash"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      ride_status: ["pending", "active", "completed", "cancelled"],
      vehicle_type: ["bus", "taxi", "motorbike"],
    },
  },
} as const

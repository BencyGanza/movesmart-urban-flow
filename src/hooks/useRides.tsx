import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRides = () => {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRides = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("rides")
        .select(`
          *,
          vehicle:vehicles(
            *,
            driver:profiles!vehicles_driver_id_fkey(*)
          )
        `)
        .eq("passenger_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRides(data || []);
    } catch (error: any) {
      console.error("Error fetching rides:", error);
      toast({
        title: "Error",
        description: "Failed to fetch rides",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("rides-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rides",
        },
        () => {
          fetchRides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { rides, loading, refetch: fetchRides };
};

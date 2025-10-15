import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { latitude, longitude, radius_km = 5 } = await req.json();

    if (!latitude || !longitude) {
      throw new Error('latitude and longitude are required');
    }

    console.log('Getting nearby drivers:', { latitude, longitude, radius_km });

    // Get active vehicles
    // In production, use PostGIS for efficient geospatial queries
    const { data: vehicles, error: vehiclesError } = await supabaseClient
      .from('vehicles')
      .select(`
        *,
        driver:profiles!vehicles_driver_id_fkey(*)
      `)
      .eq('is_active', true)
      .not('current_latitude', 'is', null)
      .not('current_longitude', 'is', null);

    if (vehiclesError) throw vehiclesError;

    // Calculate distances (simplified Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Filter and sort by distance
    const nearbyDrivers = vehicles
      ?.map(vehicle => ({
        ...vehicle,
        distance: calculateDistance(
          latitude,
          longitude,
          parseFloat(vehicle.current_latitude),
          parseFloat(vehicle.current_longitude)
        )
      }))
      .filter(v => v.distance <= radius_km)
      .sort((a, b) => a.distance - b.distance) || [];

    console.log(`Found ${nearbyDrivers.length} drivers within ${radius_km}km`);

    return new Response(
      JSON.stringify({
        success: true,
        drivers: nearbyDrivers,
        count: nearbyDrivers.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error getting nearby drivers:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

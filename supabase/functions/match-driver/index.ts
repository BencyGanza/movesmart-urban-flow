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

    const { ride_id } = await req.json();

    if (!ride_id) {
      throw new Error('ride_id is required');
    }

    console.log('Matching driver for ride:', ride_id);

    // Get ride details
    const { data: ride, error: rideError } = await supabaseClient
      .from('rides')
      .select('*')
      .eq('id', ride_id)
      .single();

    if (rideError) throw rideError;

    // Find available vehicles near pickup location
    // In production, you'd use PostGIS for geospatial queries
    const { data: vehicles, error: vehiclesError } = await supabaseClient
      .from('vehicles')
      .select('*')
      .eq('is_active', true)
      .limit(10);

    if (vehiclesError) throw vehiclesError;

    if (!vehicles || vehicles.length === 0) {
      console.log('No available vehicles found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No drivers available at the moment' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select closest vehicle (simplified - just pick first one)
    const selectedVehicle = vehicles[0];

    // Update ride with matched vehicle
    const { error: updateError } = await supabaseClient
      .from('rides')
      .update({
        vehicle_id: selectedVehicle.id,
        status: 'accepted',
        started_at: new Date().toISOString(),
      })
      .eq('id', ride_id);

    if (updateError) throw updateError;

    console.log('Driver matched successfully:', selectedVehicle.id);

    return new Response(
      JSON.stringify({
        success: true,
        vehicle: selectedVehicle,
        message: 'Driver matched successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error matching driver:', error);
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

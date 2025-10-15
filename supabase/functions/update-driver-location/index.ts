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

    const { vehicle_id, latitude, longitude } = await req.json();

    if (!vehicle_id || !latitude || !longitude) {
      throw new Error('vehicle_id, latitude, and longitude are required');
    }

    console.log('Updating driver location:', { vehicle_id, latitude, longitude });

    // Update vehicle location
    const { data: vehicle, error: updateError } = await supabaseClient
      .from('vehicles')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
        last_location_update: new Date().toISOString(),
      })
      .eq('id', vehicle_id)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('Location updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        vehicle,
        message: 'Location updated successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating location:', error);
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

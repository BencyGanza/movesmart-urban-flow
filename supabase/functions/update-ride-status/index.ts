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

    const { ride_id, status, actual_fare } = await req.json();

    if (!ride_id || !status) {
      throw new Error('ride_id and status are required');
    }

    console.log('Updating ride status:', { ride_id, status });

    const updateData: any = { status };

    // If completing the ride, set completion time and fare
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      if (actual_fare) {
        updateData.actual_fare = actual_fare;
      }
    }

    // Update ride status
    const { data: ride, error: updateError } = await supabaseClient
      .from('rides')
      .update(updateData)
      .eq('id', ride_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // If ride is completed, create payment record
    if (status === 'completed' && actual_fare) {
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          ride_id: ride_id,
          user_id: ride.passenger_id,
          amount: actual_fare,
          payment_method: 'cash',
          payment_status: 'pending',
        });

      if (paymentError) {
        console.error('Error creating payment:', paymentError);
      }
    }

    console.log('Ride status updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        ride,
        message: 'Ride status updated successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating ride status:', error);
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

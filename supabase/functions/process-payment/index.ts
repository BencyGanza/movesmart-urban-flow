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

    const { payment_id, phone_number, payment_method } = await req.json();

    if (!payment_id) {
      throw new Error('payment_id is required');
    }

    console.log('Processing payment:', payment_id);

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (paymentError) throw paymentError;

    // In production, integrate with mobile money API (M-Pesa, Airtel Money, etc.)
    // For now, simulate payment processing
    const transaction_id = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Update payment record
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        payment_status: 'completed',
        payment_method: payment_method || 'mobile_money',
        phone_number: phone_number,
        transaction_id: transaction_id,
        completed_at: new Date().toISOString(),
      })
      .eq('id', payment_id);

    if (updateError) throw updateError;

    console.log('Payment processed successfully:', transaction_id);

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id,
        message: 'Payment processed successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing payment:', error);
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

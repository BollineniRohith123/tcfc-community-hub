import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { amount, booking_id, membership_id } = await req.json();

    // Get auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error("Unauthorized");
    }

    console.log("Mock PhonePe Payment - User:", user.id, "Amount:", amount);

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        booking_id: booking_id || null,
        amount,
        payment_gateway: "phonepe_mock",
        status: "pending",
        metadata: {
          mock: true,
          membership_id: membership_id || null,
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      throw paymentError;
    }

    // Generate unique transaction ID
    const transactionId = `MOCK_TXN_${payment.id.substring(0, 8)}_${Date.now()}`;

    // Update payment with transaction ID
    await supabaseClient
      .from("payments")
      .update({ transaction_id: transactionId })
      .eq("id", payment.id);

    // Create a mock payment URL that will redirect to our callback
    const mockPaymentUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/phonepe-callback-mock?txn=${transactionId}&status=success`;

    console.log("Mock payment created:", {
      paymentId: payment.id,
      transactionId,
      amount,
    });

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: mockPaymentUrl,
        transactionId,
        mock: true,
        message: "Mock payment - will auto-succeed in 2 seconds",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in phonepe-payment-mock:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});


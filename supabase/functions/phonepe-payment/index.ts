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

    const { amount, booking_id } = await req.json();

    // Get auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error("Unauthorized");
    }

    // PhonePe API configuration
    const PHONEPE_MERCHANT_ID = Deno.env.get("PHONEPE_MERCHANT_ID");
    const PHONEPE_SALT_KEY = Deno.env.get("PHONEPE_SALT_KEY");
    const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") || "1";
    const PHONEPE_API_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

    if (!PHONEPE_MERCHANT_ID || !PHONEPE_SALT_KEY) {
      console.error("PhonePe credentials not configured");
      throw new Error("Payment gateway not configured");
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        booking_id,
        amount,
        payment_gateway: "phonepe",
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Generate unique transaction ID
    const transactionId = `TXN_${payment.id.substring(0, 8)}_${Date.now()}`;

    // Create PhonePe payment request
    const paymentPayload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: user.id,
      amount: Math.round(amount * 100), // Convert to paise
      redirectUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/phonepe-callback`,
      redirectMode: "POST",
      callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/phonepe-callback`,
      mobileNumber: "9999999999", // Should be fetched from user profile
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Encode payload
    const base64Payload = btoa(JSON.stringify(paymentPayload));

    // Generate checksum
    const checksumString = `${base64Payload}/pg/v1/pay${PHONEPE_SALT_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(checksumString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const xVerify = `${checksum}###${PHONEPE_SALT_INDEX}`;

    // Make request to PhonePe
    const phonePeResponse = await fetch(PHONEPE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    });

    const phonePeData = await phonePeResponse.json();

    if (!phonePeData.success) {
      throw new Error("PhonePe payment initiation failed");
    }

    // Update payment with transaction ID
    await supabaseClient
      .from("payments")
      .update({ transaction_id: transactionId })
      .eq("id", payment.id);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: phonePeData.data.instrumentResponse.redirectInfo.url,
        transactionId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in phonepe-payment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

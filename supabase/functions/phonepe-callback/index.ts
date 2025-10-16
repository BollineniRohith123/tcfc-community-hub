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

    const body = await req.json();
    
    // Verify PhonePe callback
    const PHONEPE_SALT_KEY = Deno.env.get("PHONEPE_SALT_KEY");
    const PHONEPE_SALT_INDEX = Deno.env.get("PHONEPE_SALT_INDEX") || "1";

    // Decode the response
    const base64Response = body.response;
    const decodedResponse = JSON.parse(atob(base64Response));

    // Verify checksum
    const xVerifyHeader = req.headers.get("X-VERIFY");
    const [receivedChecksum] = xVerifyHeader?.split("###") || [""];

    const checksumString = `${base64Response}${PHONEPE_SALT_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(checksumString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedChecksum = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (receivedChecksum !== calculatedChecksum) {
      console.error("Checksum verification failed");
      throw new Error("Invalid callback signature");
    }

    const transactionId = decodedResponse.data.merchantTransactionId;
    const paymentStatus = decodedResponse.code === "PAYMENT_SUCCESS" ? "success" : "failed";

    // Update payment status
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .update({
        status: paymentStatus,
        metadata: decodedResponse,
      })
      .eq("transaction_id", transactionId)
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update booking status
    if (payment.booking_id && paymentStatus === "success") {
      await supabaseClient
        .from("event_bookings")
        .update({ status: "confirmed" })
        .eq("id", payment.booking_id);
    }

    // Redirect user
    const redirectUrl = paymentStatus === "success" 
      ? `${Deno.env.get("SITE_URL")}/profile?payment=success`
      : `${Deno.env.get("SITE_URL")}/profile?payment=failed`;

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: redirectUrl,
      },
    });
  } catch (error) {
    console.error("Error in phonepe-callback:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

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

    // Get transaction ID from query params
    const url = new URL(req.url);
    const transactionId = url.searchParams.get("txn");
    const status = url.searchParams.get("status") || "success";

    console.log("Mock PhonePe Callback - Transaction:", transactionId, "Status:", status);

    if (!transactionId) {
      throw new Error("Transaction ID not provided");
    }

    // Find payment by transaction ID
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (paymentError || !payment) {
      console.error("Payment not found:", paymentError);
      throw new Error("Payment not found");
    }

    // Update payment status
    const paymentStatus = status === "success" ? "success" : "failed";
    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({ 
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Payment update error:", updateError);
      throw updateError;
    }

    // If payment is successful, update booking or membership
    if (paymentStatus === "success") {
      // Check if this is for an event booking
      if (payment.booking_id) {
        const { error: bookingError } = await supabaseClient
          .from("event_bookings")
          .update({ status: "confirmed" })
          .eq("id", payment.booking_id);

        if (bookingError) {
          console.error("Booking update error:", bookingError);
        } else {
          console.log("Event booking confirmed:", payment.booking_id);
        }
      }

      // Check if this is for a membership purchase
      if (payment.metadata?.membership_id) {
        const membershipId = payment.metadata.membership_id;
        
        // Get membership details
        const { data: membership } = await supabaseClient
          .from("memberships")
          .select("*")
          .eq("id", membershipId)
          .single();

        if (membership) {
          // Create user membership
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year validity

          const { error: userMembershipError } = await supabaseClient
            .from("user_memberships")
            .insert({
              user_id: payment.user_id,
              membership_id: membershipId,
              status: "active",
              start_date: new Date().toISOString(),
              end_date: expiryDate.toISOString(),
            });

          if (userMembershipError) {
            console.error("User membership creation error:", userMembershipError);
          } else {
            console.log("User membership created for user:", payment.user_id);
          }
        }
      }
    }

    // Redirect to success/failure page
    const redirectUrl = paymentStatus === "success" 
      ? `${Deno.env.get("PUBLIC_APP_URL") || "http://localhost:8080"}/payment-success?txn=${transactionId}`
      : `${Deno.env.get("PUBLIC_APP_URL") || "http://localhost:8080"}/payment-failed?txn=${transactionId}`;

    console.log("Mock payment processed successfully, redirecting to:", redirectUrl);

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": redirectUrl,
      },
    });
  } catch (error) {
    console.error("Error in phonepe-callback-mock:", error);
    
    // Redirect to error page
    const errorUrl = `${Deno.env.get("PUBLIC_APP_URL") || "http://localhost:8080"}/payment-failed?error=${encodeURIComponent(error instanceof Error ? error.message : "Unknown error")}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": errorUrl,
      },
    });
  }
});


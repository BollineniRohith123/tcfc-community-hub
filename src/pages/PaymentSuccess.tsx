import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("txn");
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transactionId) {
      fetchPaymentDetails();
    }
  }, [transactionId]);

  const fetchPaymentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("transaction_id", transactionId)
        .single();

      if (error) throw error;
      setPayment(data);
    } catch (error) {
      console.error("Error fetching payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading payment details...</p>
          ) : payment ? (
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm">{payment.transaction_id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">₹{payment.amount}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 font-semibold capitalize">{payment.status}</span>
              </div>
              {payment.booking_id && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold">Event Booking</span>
                </div>
              )}
              {payment.metadata?.membership_id && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold">Membership Purchase</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Payment details not found</p>
          )}
          
          <div className="pt-4 space-y-2">
            <Button 
              onClick={() => navigate("/profile")} 
              className="w-full bg-gradient-to-r from-primary to-accent"
            >
              View My Profile
            </Button>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;


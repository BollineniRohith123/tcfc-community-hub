import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const Memberships = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [userMembership, setUserMembership] = useState<any>(null);

  useEffect(() => {
    fetchMemberships();
    if (user) {
      checkUserMembership();
    }
  }, [user]);

  const fetchMemberships = async () => {
    const { data, error } = await supabase
      .from("memberships")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      console.error("Error fetching memberships:", error);
    } else {
      setMemberships(data || []);
    }
  };

  const checkUserMembership = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_memberships")
      .select("*, membership:memberships(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!error && data) {
      setUserMembership(data);
    }
  };

  const handleChooseMembership = async (tierName: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user already has an active membership
    if (userMembership) {
      toast.error("You already have an active membership!");
      return;
    }

    setLoading(tierName);

    try {
      // Find membership by tier name
      const membership = memberships.find(
        (m) => m.tier.toLowerCase() === tierName.toLowerCase()
      );

      if (!membership) {
        throw new Error("Membership not found");
      }

      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // TEMPORARY CLIENT-SIDE MOCK PAYMENT (simplified version)
      // Note: In production, this should use edge functions with proper payment gateway

      toast.success("Processing mock payment...");

      // Simulate payment processing
      setTimeout(async () => {
        try {
          // Create user membership directly (skipping payment record due to RLS)
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);

          const { error: membershipError } = await supabase
            .from("user_memberships")
            .insert({
              user_id: user.id,
              membership_id: membership.id,
              start_date: new Date().toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              is_active: true,
            });

          if (membershipError) throw membershipError;

          // Generate mock transaction ID
          const mockTxnId = `MOCK_TXN_${Date.now()}`;

          // Redirect to success page
          window.location.href = `/payment-success?txn=${mockTxnId}&amount=${membership.price}&type=membership&tier=${tierName}`;
        } catch (error) {
          console.error("Payment completion error:", error);
          // Redirect to failure page
          const mockTxnId = `MOCK_TXN_${Date.now()}`;
          window.location.href = `/payment-failed?txn=${mockTxnId}&error=${encodeURIComponent(error.message || 'Unknown error')}`;
        }
      }, 2000);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setLoading(null);
    }
  };

  const tiers = [
    {
      name: "Gold",
      price: "₹15,000",
      description: "Perfect for families starting their journey with TCFC",
      benefits: [
        "Access to all public events",
        "Standard booking priority",
        "Community access",
        "Event notifications",
        "1 year membership",
      ],
      color: "from-yellow-500 to-yellow-600",
    },
    {
      name: "Diamond",
      price: "₹30,000",
      description: "Great value for active families",
      benefits: [
        "All Gold benefits",
        "Early event access",
        "Special diamond-only events",
        "Community networking sessions",
        "Discounted meal prices",
        "Priority customer support",
      ],
      color: "from-cyan-500 to-blue-600",
      popular: true,
    },
    {
      name: "Platinum",
      price: "₹50,000",
      description: "Premium experience for families who want the best",
      benefits: [
        "All Diamond benefits",
        "Priority event booking",
        "Exclusive platinum-only events",
        "VIP seating at all events",
        "Complimentary refreshments",
        "Dedicated relationship manager",
        "Extended family member access",
      ],
      color: "from-purple-600 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Choose Your <span className="text-primary">Membership</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect tier for your family and unlock exclusive benefits
            tailored to your lifestyle
          </p>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden ${
                  tier.popular
                    ? "border-primary shadow-elegant scale-105"
                    : "hover:shadow-elegant"
                } transition-all duration-300`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tier.color} mx-auto mb-4 flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-3xl font-bold text-white">
                      {tier.name[0]}
                    </span>
                  </div>
                  <CardTitle className="text-3xl mb-2">{tier.name}</CardTitle>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {tier.price}
                  </div>
                  <CardDescription className="text-base mt-2">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleChooseMembership(tier.name)}
                    className={`w-full ${
                      tier.popular
                        ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        : ""
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                    disabled={loading === tier.name || !!userMembership}
                  >
                    {loading === tier.name ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : userMembership ? (
                      "Already a Member"
                    ) : (
                      `Choose ${tier.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Can I upgrade my membership later?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade your membership tier at any time. The price
                  difference will be prorated based on your current membership period.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major payment methods including UPI, credit/debit cards,
                  and net banking through our secure PhonePe payment gateway.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  How many family members can join?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All membership tiers cover immediate family members (parents and
                  children). Platinum members get extended family access as well.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Memberships;

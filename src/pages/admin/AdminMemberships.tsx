import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Membership {
  id: string;
  tier: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  created_at: string;
}

export default function AdminMemberships() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  async function fetchMemberships() {
    try {
      const { data, error } = await supabase
        .from("memberships")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;
      setMemberships(data || []);
    } catch (error: any) {
      console.error("Error fetching memberships:", error);
      toast.error("Failed to load memberships");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading memberships...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Memberships</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {memberships.map((membership) => (
          <Card key={membership.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{membership.name}</CardTitle>
                  <p className="text-3xl font-bold text-primary mt-2">
                    ₹{membership.price.toLocaleString()}
                  </p>
                </div>
                <Link to={`/admin/memberships/${membership.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {membership.description}
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">Benefits:</h4>
                <ul className="space-y-1">
                  {membership.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Tier: <span className="font-semibold">{membership.tier}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {memberships.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No memberships found.</p>
        </div>
      )}
    </div>
  );
}


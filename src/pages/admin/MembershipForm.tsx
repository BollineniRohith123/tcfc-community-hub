import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface MembershipFormData {
  name: string;
  price: number;
  description: string;
  benefits: string[];
}

export default function MembershipForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MembershipFormData>({
    name: "",
    price: 0,
    description: "",
    benefits: [],
  });
  const [benefitsText, setBenefitsText] = useState("");

  useEffect(() => {
    if (id) {
      fetchMembership();
    }
  }, [id]);

  async function fetchMembership() {
    try {
      const { data, error } = await supabase
        .from("memberships")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const benefitsArray = Array.isArray(data.benefits) ? data.benefits as string[] : [];
      setFormData({
        name: data.name,
        price: data.price,
        description: data.description,
        benefits: benefitsArray,
      });
      setBenefitsText(benefitsArray.join("\n"));
    } catch (error: any) {
      console.error("Error fetching membership:", error);
      toast.error("Failed to load membership");
      navigate("/admin/memberships");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse benefits from textarea (one per line)
      const benefits = benefitsText
        .split("\n")
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      const updateData = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        benefits,
      };

      const { error } = await supabase
        .from("memberships")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast.success("Membership updated successfully!");
      navigate("/admin/memberships");
    } catch (error: any) {
      console.error("Error updating membership:", error);
      toast.error(error.message || "Failed to update membership");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/memberships")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Membership</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membership Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Membership Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                required
                min="0"
                step="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">
                Benefits (one per line)
              </Label>
              <Textarea
                id="benefits"
                value={benefitsText}
                onChange={(e) => setBenefitsText(e.target.value)}
                required
                rows={8}
                placeholder="Access to all public events&#10;Standard booking priority&#10;Community access"
              />
              <p className="text-sm text-muted-foreground">
                Enter each benefit on a new line
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/memberships")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


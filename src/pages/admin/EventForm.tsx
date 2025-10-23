import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    venue: string;
    venue_map_link: string;
    image_url: string;
    max_capacity: number;
    lunch_price: number;
    dinner_price: number;
    is_free: boolean;
    status: "draft" | "published" | "cancelled" | "completed";
    allowed_tiers: ("platinum" | "diamond" | "gold")[];
  }>({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    venue: "",
    venue_map_link: "",
    image_url: "",
    max_capacity: 100,
    lunch_price: 0,
    dinner_price: 0,
    is_free: false,
    status: "draft",
    allowed_tiers: ["platinum", "diamond", "gold"],
  });

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          ...data,
          allowed_tiers: (data.allowed_tiers || ["platinum", "diamond", "gold"]) as ("platinum" | "diamond" | "gold")[],
        });
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({ title: "Error loading event", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        const { error } = await supabase
          .from("events")
          .update(formData)
          .eq("id", id);

        if (error) throw error;
        toast({ title: "Event updated successfully" });
      } else {
        const { error } = await supabase
          .from("events")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Event created successfully" });
      }

      navigate("/admin/events");
    } catch (error) {
      console.error("Error saving event:", error);
      toast({ title: "Error saving event", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleTierToggle = (tier: "platinum" | "diamond" | "gold") => {
    setFormData((prev) => ({
      ...prev,
      allowed_tiers: prev.allowed_tiers.includes(tier)
        ? prev.allowed_tiers.filter((t) => t !== tier)
        : [...prev.allowed_tiers, tier] as ("platinum" | "diamond" | "gold")[],
    }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{id ? "Edit Event" : "Create Event"}</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_map_link">Google Maps Link (Optional)</Label>
              <Input
                id="venue_map_link"
                value={formData.venue_map_link || ""}
                onChange={(e) => setFormData({ ...formData, venue_map_link: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url || ""}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked as boolean })}
                />
                <Label htmlFor="is_free" className="cursor-pointer font-semibold">
                  Free Event (No payment required)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Check this box if this event is free and does not require any payment
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_capacity">Max Capacity</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lunch_price">Lunch Price (₹)</Label>
                <Input
                  id="lunch_price"
                  type="number"
                  value={formData.lunch_price}
                  onChange={(e) => setFormData({ ...formData, lunch_price: parseFloat(e.target.value) })}
                  disabled={formData.is_free}
                />
                {formData.is_free && <p className="text-xs text-muted-foreground">Disabled for free events</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dinner_price">Dinner Price (₹)</Label>
                <Input
                  id="dinner_price"
                  type="number"
                  value={formData.dinner_price}
                  onChange={(e) => setFormData({ ...formData, dinner_price: parseFloat(e.target.value) })}
                  disabled={formData.is_free}
                />
                {formData.is_free && <p className="text-xs text-muted-foreground">Disabled for free events</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Allowed Membership Tiers</Label>
              <div className="flex gap-4">
                {(["platinum", "diamond", "gold"] as const).map((tier) => (
                  <div key={tier} className="flex items-center space-x-2">
                    <Checkbox
                      id={tier}
                      checked={formData.allowed_tiers.includes(tier)}
                      onCheckedChange={() => handleTierToggle(tier)}
                    />
                    <Label htmlFor={tier} className="capitalize cursor-pointer">
                      {tier}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as "draft" | "published" | "cancelled" | "completed" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : id ? "Update Event" : "Create Event"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/events")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EventForm;

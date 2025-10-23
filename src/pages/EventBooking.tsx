import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Calendar, MapPin, Clock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  image_url: string;
  lunch_price: number;
  dinner_price: number;
  max_capacity: number;
  is_free: boolean;
}

const EventBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    num_adults: 1,
    num_children: 0,
    include_lunch: false,
    include_dinner: false,
  });
  const [childrenAges, setChildrenAges] = useState<number[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchEvent();
  }, [id, user]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({ title: "Event not found", variant: "destructive" });
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!event) return 0;
    if (event.is_free) return 0;
    
    let total = 0;
    const totalPeople = formData.num_adults + formData.num_children;
    
    if (formData.include_lunch) {
      total += event.lunch_price * totalPeople;
    }
    if (formData.include_dinner) {
      total += event.dinner_price * totalPeople;
    }
    
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;

    // Validate children ages if children are included
    if (formData.num_children > 0 && childrenAges.length !== formData.num_children) {
      toast({ title: "Please provide ages for all children", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const totalAmount = calculateTotal();

      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("event_bookings")
        .insert([
          {
            event_id: event.id,
            user_id: user.id,
            ...formData,
            children_ages: childrenAges,
            total_amount: totalAmount,
            status: event.is_free ? "confirmed" : "pending",
          },
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // If event is free, redirect to success page directly
      if (event.is_free) {
        toast({ title: "Booking confirmed!", description: "You have successfully registered for this free event." });
        navigate("/profile");
        return;
      }

      // Initiate payment for paid events
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "phonepe-payment",
        {
          body: {
            amount: totalAmount,
            booking_id: bookingData.id,
          },
        }
      );

      if (paymentError) throw paymentError;

      // Redirect to payment gateway
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({ title: "Error processing booking", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!event) {
    return null;
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {event.image_url && (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            
            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
            <p className="text-muted-foreground mb-6">{event.description}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>{event.start_time} - {event.end_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Book Your Spot</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="num_adults">Number of Adults</Label>
                  <Input
                    id="num_adults"
                    type="number"
                    min={1}
                    value={formData.num_adults}
                    onChange={(e) =>
                      setFormData({ ...formData, num_adults: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num_children">Number of Children</Label>
                  <Input
                    id="num_children"
                    type="number"
                    min={0}
                    value={formData.num_children}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, num_children: count });
                      // Reset children ages array to match new count
                      setChildrenAges(new Array(count).fill(0));
                    }}
                  />
                </div>

                {formData.num_children > 0 && (
                  <div className="space-y-3">
                    <Label>Children Ages (in years)</Label>
                    {Array.from({ length: formData.num_children }).map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Label className="w-20">Child {index + 1}:</Label>
                        <Input
                          type="number"
                          min={0}
                          max={18}
                          placeholder="Age"
                          value={childrenAges[index] || ''}
                          onChange={(e) => {
                            const newAges = [...childrenAges];
                            newAges[index] = parseInt(e.target.value) || 0;
                            setChildrenAges(newAges);
                          }}
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                {event.lunch_price > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include_lunch"
                      checked={formData.include_lunch}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, include_lunch: checked as boolean })
                      }
                    />
                    <Label htmlFor="include_lunch" className="cursor-pointer">
                      Include Lunch (₹{event.lunch_price} per person)
                    </Label>
                  </div>
                )}

                {event.dinner_price > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include_dinner"
                      checked={formData.include_dinner}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, include_dinner: checked as boolean })
                      }
                    />
                    <Label htmlFor="include_dinner" className="cursor-pointer">
                      Include Dinner (₹{event.dinner_price} per person)
                    </Label>
                  </div>
                )}

                <div className="border-t pt-4">
                  {event.is_free ? (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">FREE EVENT</p>
                      <p className="text-sm text-muted-foreground mt-1">No payment required</p>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span>Total:</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Processing..." : event.is_free ? "Confirm Registration" : "Proceed to Payment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventBooking;

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Events = () => {
  // This will be replaced with actual data from database
  const sampleEvents = [
    {
      id: "1",
      title: "Summer Family Picnic",
      description: "Join us for a fun-filled day at the park with games, food, and great company!",
      date: "2025-11-15",
      time: "10:00 AM - 4:00 PM",
      venue: "Green Valley Park, Tirupati",
      image: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800",
      capacity: 100,
      registered: 45,
    },
    {
      id: "2",
      title: "Festival Celebration Night",
      description: "Experience the joy of our cultural festival with music, dance, and traditional food.",
      date: "2025-11-20",
      time: "6:00 PM - 10:00 PM",
      venue: "TCFC Community Hall, Tirupati",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
      capacity: 150,
      registered: 89,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Upcoming <span className="text-primary">Events</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and book your spot at our exciting family events designed to create
            unforgettable memories
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-elegant transition-all duration-300">
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="text-base">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      {event.registered} / {event.capacity} registered
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/auth" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      Book Now
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {sampleEvents.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No events scheduled yet</h3>
              <p className="text-muted-foreground">
                Check back soon for exciting upcoming events!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;

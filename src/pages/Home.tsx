import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Award, Heart, Star, TrendingUp, Smile } from "lucide-react";
import heroImage from "@/assets/hero-family.jpg";

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: "Exclusive Events",
      description: "Curated family events and activities designed to create lasting memories",
    },
    {
      icon: Users,
      title: "Community Network",
      description: "Connect with like-minded families and build meaningful relationships",
    },
    {
      icon: Award,
      title: "Tiered Benefits",
      description: "Choose from Platinum, Diamond, or Gold memberships to suit your family",
    },
    {
      icon: Heart,
      title: "Family First",
      description: "Every event is thoughtfully planned with families at the center",
    },
  ];

  const stats = [
    { icon: Users, value: "500+", label: "Happy Families" },
    { icon: Calendar, value: "100+", label: "Events Hosted" },
    { icon: Star, value: "4.9/5", label: "Member Rating" },
    { icon: TrendingUp, value: "95%", label: "Renewal Rate" },
  ];

  const testimonials = [
    {
      name: "Priya & Rajesh Kumar",
      role: "Platinum Members",
      content: "TCFC has transformed our family life! The events are well-organized and our kids have made wonderful friends. It's more than a club - it's a family.",
      rating: 5,
    },
    {
      name: "Lakshmi Reddy",
      role: "Diamond Member",
      content: "Being part of TCFC has been an incredible experience. The community is warm, welcoming, and the events are always memorable. Highly recommend!",
      rating: 5,
    },
    {
      name: "Venkat & Sita Sharma",
      role: "Gold Members",
      content: "We joined TCFC last year and it's been amazing. Our children look forward to every event and we've built lasting friendships with other families.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Building Stronger{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Families
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Join Tirupati's premier family community club. Create lasting memories,
                strengthen bonds, and connect with families who share your values.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/memberships">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 hover:scale-105 transition-all shadow-elegant text-lg px-8 w-full sm:w-auto"
                  >
                    Join Now
                  </Button>
                </Link>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="text-lg px-8 hover:scale-105 transition-all w-full sm:w-auto">
                    View Events
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-in fade-in slide-in-from-right duration-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl animate-pulse" />
              <img
                src={heroImage}
                alt="Families enjoying together"
                className="relative rounded-3xl shadow-elegant w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="h-10 w-10 mx-auto mb-3 opacity-90" />
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm lg:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Why Choose <span className="text-primary">TCFC</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the difference of a community built for families, by families
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card hover:shadow-elegant hover:scale-105 transition-all duration-300 border-border animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center hover:rotate-12 transition-transform">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              What Our <span className="text-primary">Families</span> Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from members who have experienced the TCFC difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-card hover:shadow-elegant hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  <div className="pt-4 border-t">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-elegant hover:shadow-2xl transition-all duration-500 animate-in fade-in zoom-in">
            <CardContent className="p-12 text-center">
              <Smile className="h-16 w-16 mx-auto mb-6 animate-bounce" />
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Join Our Community?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Start your journey with TCFC today and give your family the gift of
                connection and memorable experiences.
              </p>
              <Link to="/memberships">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 shadow-lg hover:scale-110 transition-transform"
                >
                  Explore Memberships
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;

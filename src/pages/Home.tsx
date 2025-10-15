import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Award, Heart } from "lucide-react";
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
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
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-elegant text-lg px-8"
                  >
                    Join Now
                  </Button>
                </Link>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    View Events
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Families enjoying together"
                className="relative rounded-3xl shadow-elegant w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
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
                className="bg-card hover:shadow-elegant transition-all duration-300 border-border"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-elegant">
            <CardContent className="p-12 text-center">
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
                  className="text-lg px-8 shadow-lg"
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

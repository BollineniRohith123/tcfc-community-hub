import { Card, CardContent } from "@/components/ui/card";
import { Heart, Target, Users, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Community",
      description: "Building strong bonds between families and creating a supportive network",
    },
    {
      icon: Users,
      title: "Family",
      description: "Putting families first in everything we do, from event planning to experiences",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Delivering high-quality events and services that exceed expectations",
    },
    {
      icon: Target,
      title: "Inclusivity",
      description: "Creating a welcoming space for all families regardless of background",
    },
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & President",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    },
    {
      name: "Priya Sharma",
      role: "Event Coordinator",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    },
    {
      name: "Arun Reddy",
      role: "Community Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            About <span className="text-primary">TCFC</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building a vibrant community where families connect, celebrate, and create
            lasting memories together
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-none shadow-elegant">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4 text-primary">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To create a thriving community where families in Tirupati can connect,
                  celebrate, and grow together through meaningful experiences and shared
                  values. We strive to strengthen family bonds and foster lasting
                  relationships within our community.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-none shadow-elegant">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4 text-accent">Our Vision</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To be Tirupati's premier family-focused community club, recognized for
                  fostering meaningful relationships and creating unforgettable
                  experiences that bring families closer and build a stronger, more
                  connected community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <value.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Meet Our Team</h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Dedicated professionals committed to making your family experiences
            exceptional
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-elegant transition-all duration-300"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">Our Story</h2>
            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  Founded in 2024, the Tirupati Community Family Club emerged from a simple
                  idea: families in Tirupati needed a dedicated space to connect, celebrate,
                  and create lasting memories together.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  What started as small gatherings in local parks has grown into a thriving
                  community of families who share common values and a desire to strengthen
                  family bonds. Today, TCFC hosts dozens of events throughout the year,
                  bringing together families from all walks of life.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our commitment remains the same: to provide high-quality, family-focused
                  experiences that foster community, celebrate togetherness, and create
                  memories that last a lifetime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

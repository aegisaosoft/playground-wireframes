import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/Navigation";
import { TicketTierDisplay } from "@/components/TicketTierDisplay";
import retreatBali from "@/assets/retreat-bali.jpg";
import retreatCostaRica from "@/assets/retreat-costa-rica.jpg";
import retreatTulum from "@/assets/retreat-tulum.jpg";

const experiences = [
  {
    id: 1,
    title: "Desert Code Camp",
    location: "Joshua Tree, CA",
    duration: "5 days",
    dates: "March 15-20, 2024",
    description: "Build your startup under the stars. Code by day, campfire talks by night. This immersive experience combines the raw beauty of the Mojave Desert with intensive development sessions.",
    highlights: [
      "Star-gazing sessions",
      "Sunrise yoga",
      "Technical workshops",
      "1-on-1 mentorship",
      "Desert hiking trails",
      "Community campfire talks"
    ],
    image: retreatBali,
    category: { name: "Hacker House", color: "pink" as const },
    organizer: {
      name: "Alex Chen",
      avatar: "/placeholder.svg",
      bio: "Former Silicon Valley engineer turned desert philosopher. Founder of multiple startups."
    },
    agenda: [
      {
        day: "Day 1",
        items: [
          { time: "09:00", activity: "Arrival & Setup", description: "Welcome circle and camp setup" },
          { time: "11:00", activity: "Desert Orientation Walk" },
          { time: "14:00", activity: "Lunch & Project Planning" },
          { time: "16:00", activity: "Coding Session #1" },
          { time: "19:00", activity: "Campfire Dinner" },
          { time: "21:00", activity: "Stargazing & Networking" }
        ]
      },
      {
        day: "Day 2",
        items: [
          { time: "06:30", activity: "Sunrise Yoga" },
          { time: "08:00", activity: "Breakfast" },
          { time: "09:30", activity: "Technical Workshop: Distributed Systems" },
          { time: "12:00", activity: "Project Work Time" },
          { time: "18:00", activity: "Demo Presentations" }
        ]
      }
    ],
    ticketTiers: [
      {
        id: "free-intro", 
        name: "Free Intro Session",
        price_cents: 0,
        quantity: 5,
        description: "Experience the first day for free"
      },
      {
        id: "early-bird",
        name: "Early Bird",
        price_cents: 89900,
        quantity: 15,
        description: "Full experience access"
      },
      {
        id: "premium",
        name: "Premium",
        price_cents: 129900,
        quantity: 5,
        description: "Enhanced experience"
      }
    ],
    faq: [
      {
        question: "What should I bring?",
        answer: "We'll provide a detailed packing list, but essentials include laptop, warm clothes for desert nights, and an open mind."
      },
      {
        question: "Is this suitable for beginners?",
        answer: "While we welcome all skill levels, some programming experience is recommended to get the most out of the technical workshops."
      }
    ],
    gallery: [retreatBali, retreatCostaRica, retreatTulum]
  },
  {
    id: 2,
    title: "Tokyo Street Tech",
    location: "Shibuya, Japan",
    duration: "7 days",
    dates: "April 1-8, 2024",
    description: "Immerse in Tokyo's underground tech scene. Street art meets code in this urban adventure through Japan's capital.",
    highlights: [
      "Underground tech tours",
      "Local maker spaces",
      "Neon district exploration",
      "Izakaya networking",
      "Akihabara deep dive",
      "Startup scene insights"
    ],
    image: retreatCostaRica,
    category: { name: "Creative Collective", color: "cyan" as const },
    organizer: {
      name: "Yuki Tanaka",
      avatar: "/placeholder.svg",
      bio: "Tokyo native and tech community organizer. Expert in Japanese startup ecosystem."
    },
    agenda: [
      {
        day: "Day 1",
        items: [
          { time: "10:00", activity: "Shibuya Welcome Meet", description: "Iconic scramble crossing introduction" },
          { time: "12:00", activity: "Tokyo Tech Tour", description: "Visit leading startups" },
          { time: "18:00", activity: "Izakaya Networking", description: "Traditional Japanese networking" }
        ]
      }
    ],
    ticketTiers: [
      {
        id: "explorer",
        name: "Explorer",
        price_cents: 129900,
        quantity: 10,
        description: "Core Tokyo experience"
      }
    ],
    faq: [
      {
        question: "Do I need to speak Japanese?",
        answer: "Not at all! Our local guides speak perfect English and will help you navigate."
      }
    ],
    gallery: [retreatCostaRica, retreatBali, retreatTulum]
  },
  {
    id: 3,
    title: "Bali Builder Retreat",
    location: "Canggu, Bali",
    duration: "14 days",
    dates: "May 1-15, 2024",
    description: "Tropical productivity paradise. Build your next big thing by the beach while surrounded by like-minded creators.",
    highlights: [
      "Beachside coworking",
      "Sunset surfing",
      "Meditation sessions",
      "Local culture immersion",
      "Healthy Balinese cuisine",
      "Productivity workshops"
    ],
    image: retreatTulum,
    category: { name: "Digital Nomad Hub", color: "yellow" as const },
    organizer: {
      name: "Maya Patel",
      avatar: "/placeholder.svg",
      bio: "Digital nomad veteran and wellness advocate. Building the future of remote work."
    },
    agenda: [
      {
        day: "Week 1",
        items: [
          { time: "07:00", activity: "Beach Sunrise Yoga" },
          { time: "09:00", activity: "Coworking Session" },
          { time: "16:00", activity: "Surf Lessons" },
          { time: "18:00", activity: "Sunset Meditation" }
        ]
      }
    ],
    ticketTiers: [
      {
        id: "creator",
        name: "Creator", 
        price_cents: 189900,
        quantity: 8,
        description: "Full Bali experience"
      }
    ],
    faq: [
      {
        question: "What's the accommodation like?",
        answer: "Beautiful shared villas with private rooms, pools, and dedicated coworking spaces."
      }
    ],
    gallery: [retreatTulum, retreatBali, retreatCostaRica]
  }
];

const categoryColors = {
  pink: 'bg-neon-pink text-background',
  cyan: 'bg-neon-cyan text-background', 
  yellow: 'bg-neon-yellow text-background',
  purple: 'bg-neon-purple text-background',
  green: 'bg-neon-green text-background',
  orange: 'bg-neon-orange text-background'
};

const ExperienceDetail = () => {
  const { experienceId } = useParams();
  const navigate = useNavigate();

  const experience = experiences.find(exp => exp.id === parseInt(experienceId || '0'));

  if (!experience) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Experience Not Found</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-gray-400 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Experiences
        </Button>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <img 
            src={experience.image} 
            alt={experience.title}
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Hero Content */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge className={`${categoryColors[experience.category.color]} font-medium`}>
                {experience.category.name}
              </Badge>
              <Badge variant="secondary" className="bg-background/80 text-foreground">
                {experience.duration}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {experience.title}
            </h1>
            
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{experience.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{experience.dates}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-8 right-8 flex gap-3">
            {/* Mock approved user - in real app, check user's approval status */}
            <Button 
              size="sm" 
              onClick={() => navigate(`/experience/portal/${experience.id}`)}
              className="bg-neon-green hover:bg-neon-green/90 text-background font-medium"
            >
              Enter Portal
            </Button>
            <Button size="sm" variant="secondary" className="bg-background/80 hover:bg-background/90">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" className="bg-background/80 hover:bg-background/90">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Experience</h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                {experience.description}
              </p>
            </section>

            {/* Highlights */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">What You'll Do</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {experience.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-gray-800">
                    <div className="w-2 h-2 bg-neon-pink rounded-full" />
                    <span className="text-gray-300">{highlight}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Agenda */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Schedule</h2>
              <div className="space-y-6">
                {experience.agenda.map((day, dayIndex) => (
                  <div key={dayIndex} className="bg-card border border-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-neon-cyan mb-4">{day.day}</h3>
                    <div className="space-y-3">
                      {day.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex gap-4">
                          <div className="text-sm font-mono text-neon-yellow bg-gray-800 px-2 py-1 rounded">
                            {item.time}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{item.activity}</div>
                            {item.description && (
                              <div className="text-sm text-gray-400">{item.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Gallery */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {experience.gallery.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${experience.title} gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {experience.faq.map((item, index) => (
                  <div key={index} className="bg-card border border-gray-800 rounded-lg p-6">
                    <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                    <p className="text-gray-400">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer */}
            <div className="bg-card border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hosted by</h3>
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={experience.organizer.avatar} 
                  alt={experience.organizer.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-medium text-foreground">{experience.organizer.name}</div>
                  <Button variant="link" className="p-0 h-auto text-neon-cyan text-sm">
                    View Profile
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                {experience.organizer.bio}
              </p>
            </div>

            {/* Ticket Tiers */}
            <div className="bg-card border border-gray-800 rounded-lg p-6">
              <TicketTierDisplay 
                tiers={experience.ticketTiers}
                experienceId={experience.id.toString()}
                hostPayoutsEnabled={true} // Mock - in real app, get from organizer settings
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExperienceDetail;
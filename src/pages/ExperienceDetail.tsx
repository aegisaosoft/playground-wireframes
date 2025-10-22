import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Heart, Share2, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TicketTierDisplay } from "@/components/TicketTierDisplay";
import { useToast } from "@/hooks/use-toast";
import { experiencesService } from "@/services/experiences.service";
import { getAvatarList } from "@/lib/avatars";
import { userService } from "@/services/user.service";
import { brandsService } from "@/services/brands.service";
import { resolveApiResourceUrl } from "@/lib/api-client";
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
      avatar: "/swfault_awatar.png",
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
      avatar: "/swfault_awatar.png",
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
      avatar: "/swfault_awatar.png",
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
  const location = useLocation();
  const { toast } = useToast();
  
  const [experience, setExperience] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Load experience from API
  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) {
        navigate('/experiences');
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch experience from API
        const data = await experiencesService.getById(experienceId);
        
        
        // Figure out organizer avatar
        let organizerAvatar: string | null = data.host?.profileImageUrl || null;
        if (!organizerAvatar && data.hostId) {
          try {
            const hostProfile = await userService.getUserProfile(data.hostId);
            if (hostProfile?.profileImageUrl) {
              organizerAvatar = hostProfile.profileImageUrl;
            }
          } catch {}
        }
        if (!organizerAvatar && data.hostName) {
          try {
            const slug = String(data.hostName).toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/^-+|-+$/g, '');
            if (slug) {
              const brand = await brandsService.getBrandBySlug(slug);
              if (brand?.logo) {
                organizerAvatar = brand.logo;
              }
            }
          } catch {}
        }
        if (!organizerAvatar) {
          const list = await getAvatarList();
          organizerAvatar = list[0];
        }

        // Use only real data from database (no mock data)
        const transformedExperience = {
          ...data,
          // Organizer from database
          organizer: {
            name: data.hostName || 'Host',
            avatar: resolveApiResourceUrl(organizerAvatar) || organizerAvatar,
            bio: data.host?.bio || 'Experience host'
          },
          // Category from database
          category: {
            name: data.category || 'Uncategorized',
            color: 'cyan'
          },
          // Format dates from database
          dates: data.startDate && data.endDate 
            ? `${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}`
            : 'Dates TBA',
          duration: data.startDate && data.endDate
            ? `${Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
            : 'TBA',
          // Use real image from database or placeholder
          image: data.featuredImageUrl || data.image || '/default-retreat-banner.png',
          // Use real data from database
          agenda: data.agenda ? (typeof data.agenda === 'string' ? JSON.parse(data.agenda) : data.agenda) : [],
          highlights: data.highlights || [],
          gallery: data.gallery || [], // ✅ Load from API
          faq: data.faq || [],
          resources: data.resources || [],
          // Sort ticket tiers by price (ascending: free first, then by price)
          ticketTiers: (data.ticketTiers || [])
            .map((tier: any) => ({
              ...tier,
              price_cents: tier.priceCents || tier.price_cents || (tier.price ? tier.price * 100 : 0)
            }))
            .sort((a: any, b: any) => a.price_cents - b.price_cents),
          // Logistics information
          meetupInstructions: data.meetupInstructions || '',
          checkInNotes: data.checkInNotes || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
          additionalInfo: data.additionalInfo || ''
        };
        
        
        setExperience(transformedExperience);
        
        // Check if current user owns this experience
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setIsOwner(data.hostId === user.id);
        }
        
      } catch (error) {
        toast({
          title: "Experience Not Found",
          description: "The experience you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/experiences');
      } finally {
        setIsLoading(false);
      }
    };

    loadExperience();
  }, [experienceId, navigate, toast]);
  
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      // Link copied successfully - no toast needed
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  const handleBack = () => {
    const origin = location.state?.origin;
    
    if (origin === 'hosting') {
      navigate('/account?tab=hosting');
    } else {
      // Fallback to hosting tab for deep links
      navigate('/account?tab=hosting');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Loading experience...</h1>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Experience Not Found</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-6 text-gray-400 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Hero Section - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Banner Image */}
          <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <img 
              src={experience.image} 
              alt={experience.title}
              className="w-full h-full object-cover"
            />
            
            {/* Owner Edit Control - Top left of image */}
            {isOwner && (
              <div className="absolute top-4 left-4">
                <Button 
                  onClick={() => navigate(`/experiences/${experience.id}/edit`)}
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            )}

            {/* Action Buttons - Top right of image */}
            <div className="absolute top-4 right-4 flex gap-2">
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
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-background/80 hover:bg-background/90"
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right: Key Information */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${categoryColors[experience.category.color]} font-medium`}>
                  {experience.category.name}
                </Badge>
                <Badge variant="secondary" className="bg-card text-foreground border border-border">
                  {experience.duration}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {experience.title}
              </h1>

              <div className="flex flex-col gap-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-neon-cyan" />
                  <span className="text-lg">{experience.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-neon-yellow" />
                  <span className="text-lg">{experience.dates}</span>
                </div>
              </div>

              <p className="text-gray-400 text-lg leading-relaxed">
                {experience.description}
              </p>
            </div>

            {/* Organizer Card - Compact */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <img 
                  src={experience.organizer.avatar} 
                  alt={experience.organizer.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="text-sm text-muted-foreground">Hosted by</div>
                  <div className="font-medium text-foreground">{experience.organizer.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            {experience.highlights && experience.highlights.length > 0 && (
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
            )}

            {/* Agenda */}
            {experience.agenda && experience.agenda.length > 0 && (
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
            )}

            {/* Gallery */}
            {experience.gallery && experience.gallery.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {experience.gallery.map((image: any, index: number) => (
                  <div key={image.id || index} className="relative group">
                    <img 
                      src={image.url || image} 
                      alt={image.alt || `${experience.title} gallery ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                    />
                    {image.alt && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        {image.alt}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            )}

            {/* FAQ */}
            {experience.faq && experience.faq.length > 0 && (
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
            )}

            {/* Resources */}
            {experience.resources && experience.resources.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Resources</h2>
              <div className="space-y-3">
                {experience.resources.map((resource, index) => (
                  <a 
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-card border border-gray-800 rounded-lg hover:border-neon-cyan transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center text-neon-cyan group-hover:bg-neon-cyan/20 transition-colors">
                      {resource.type === 'file' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-neon-cyan transition-colors">
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className="text-sm text-gray-400 mt-1">{resource.description}</p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-neon-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
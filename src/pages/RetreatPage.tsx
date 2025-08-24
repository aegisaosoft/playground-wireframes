import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, MapPin, Users, Clock, Heart, UserPlus, UserCheck, ArrowLeft } from "lucide-react";
import { RichContentDisplay } from "@/components/RichContentDisplay";
import { RetreatDetail } from "@/components/RetreatDetailsModal";
import { Retreat } from "@/components/RetreatGrid";
import { ContentBlock } from "@/components/RichContentEditor";

import { ApplicationPreviewModal, TicketTier, ApplicationField } from "@/components/ApplicationPreviewModal";
import retreatBali from "@/assets/retreat-bali.jpg";
import retreatCostaRica from "@/assets/retreat-costa-rica.jpg";
import retreatTulum from "@/assets/retreat-tulum.jpg";
import retreatPortugal from "@/assets/retreat-portugal.jpg";
import retreatSwitzerland from "@/assets/retreat-switzerland.jpg";
import retreatGreece from "@/assets/retreat-greece.jpg";

// Get retreat data from the main app - this should ideally come from a shared data source or API
const getRetreatData = (): RetreatDetail[] => {
  // Import the actual retreat data from Index.tsx
  const retreatData: RetreatDetail[] = [
    {
      id: 1,
      image: retreatBali,
      location: "Bali",
      date: "Jan 15–22",
      title: "7-Day Digital Detox & Mindfulness Retreat in Ubud",
      description: "Disconnect from technology and reconnect with yourself in the heart of Bali. This transformative retreat combines mindfulness practices, yoga sessions, and cultural immersion in a serene jungle setting.",
      capacity: 12,
      spotsRemaining: 3,
      price: 1200,
      requiresApplication: true,
      agendaVisibility: 'public',
      agenda: [
        {
          date: "January 15",
          activities: [
            { time: "09:00", title: "Welcome Circle & Introductions", description: "Meet your fellow retreaters and set intentions" },
            { time: "11:00", title: "Mindful Walking in Rice Paddies" },
            { time: "14:00", title: "Lunch & Rest" },
            { time: "16:00", title: "Evening Yoga & Meditation" }
          ]
        },
        {
          date: "January 16",
          activities: [
            { time: "07:00", title: "Sunrise Meditation" },
            { time: "09:00", title: "Breakfast & Journaling Time" },
            { time: "10:30", title: "Local Village Tour" },
            { time: "15:00", title: "Afternoon Rest" },
            { time: "17:00", title: "Sound Healing Session" }
          ]
        }
      ],
      organizer: {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face"
      },
      extendedContent: [
        {
          id: '1',
          type: 'text',
          content: "This retreat is designed for those seeking to deepen their mindfulness practice while experiencing the magical energy of Bali. Our carefully curated program combines meditation, yoga, cultural immersion, and personal reflection in one of the world's most spiritually rich destinations.",
          order: 0
        },
        {
          id: '2',
          type: 'text',
          content: "You'll stay in a beautiful eco-resort surrounded by rice paddies and tropical gardens, with accommodations that blend traditional Balinese architecture with modern comfort. All meals are included, featuring fresh, organic ingredients sourced from local farms.",
          order: 1
        }
      ],
      ticketTiers: [
        {
          id: '1',
          name: 'Standard Retreat',
          price: 1200,
          quantity: 12,
          description: 'Shared accommodation with all meals and activities included'
        }
      ],
      applicationForm: [
        {
          id: '1',
          type: 'short_answer',
          label: 'What brings you to this mindfulness retreat?',
          required: true
        },
        {
          id: '2',
          type: 'multiple_choice',
          label: 'What is your experience level with meditation?',
          required: true,
          options: ['Complete beginner', 'Some experience', 'Regular practice', 'Advanced practitioner']
        },
        {
          id: '3',
          type: 'text',
          label: 'Do you have any dietary restrictions or food allergies we should know about?',
          required: false
        }
      ]
    },
    {
      id: 2,
      image: retreatCostaRica,
      location: "Costa Rica",
      date: "Feb 10–17",
      title: "Adventure & Wellness Retreat in Manuel Antonio",
      description: "Experience the perfect blend of adventure and relaxation in Costa Rica's stunning Manuel Antonio National Park.",
      capacity: 16,
      spotsRemaining: 8,
      price: 1650,
      requiresApplication: false,
      agendaVisibility: 'public',
      agenda: [
        {
          date: "February 10",
          activities: [
            { time: "10:00", title: "Arrival & Check-in" },
            { time: "15:00", title: "Beach Yoga Session" },
            { time: "18:00", title: "Welcome Dinner" }
          ]
        }
      ],
      organizer: {
        name: "Carlos Rodriguez",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      extendedContent: [
        {
          id: '1',
          type: 'text',
          content: "Costa Rica offers the perfect setting for an adventure wellness retreat. From zip-lining through cloud forests to surfing pristine beaches, this retreat combines thrilling activities with restorative wellness practices.",
          order: 0
        }
      ]
    },
    {
      id: 3,
      image: retreatTulum,
      location: "Tulum, Mexico",
      date: "Mar 5–12",
      title: "Yoga & Cenote Healing Retreat",
      description: "Immerse yourself in the ancient wisdom of the Mayan culture while practicing yoga and swimming in sacred cenotes.",
      capacity: 10,
      spotsRemaining: 2,
      price: 1480,
      requiresApplication: true,
      agendaVisibility: 'private',
      organizer: {
        name: "Maria Gonzalez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      extendedContent: [
        {
          id: '1',
          type: 'text',
          content: "Discover the mystical energy of Tulum through yoga practices and cenote ceremonies. This retreat honors the ancient Mayan traditions while providing modern comfort and expert guidance.",
          order: 0
        }
      ],
      ticketTiers: [
        {
          id: '1',
          name: 'Early Bird',
          price: 1280,
          quantity: 5,
          description: 'Limited early bird pricing with shared room'
        },
        {
          id: '2',
          name: 'Regular',
          price: 1480,
          quantity: 5,
          description: 'Standard pricing with shared accommodation'
        }
      ],
      applicationForm: [
        {
          id: '1',
          type: 'short_answer',
          label: 'What draws you to Mayan culture and traditions?',
          required: true
        },
        {
          id: '2',
          type: 'multiple_choice',
          label: 'Swimming comfort level for cenote activities?',
          required: true,
          options: ['Not comfortable in water', 'Basic swimmer', 'Confident swimmer', 'Advanced swimmer']
        }
      ]
    },
    {
      id: 4,
      image: retreatPortugal,
      location: "Portugal", 
      date: "Apr 8–15",
      title: "Surf & Meditation Retreat in Ericeira",
      description: "Combine the thrill of surfing with mindful meditation practices on Portugal's stunning coastline.",
      capacity: 14,
      spotsRemaining: 6,
      price: 1380,
      requiresApplication: false,
      agendaVisibility: 'public',
      organizer: {
        name: "João Silva",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      extendedContent: [
        {
          id: '1',
          type: 'text',
          content: "Portugal's Atlantic coast provides the perfect backdrop for combining surfing and meditation. Whether you're a beginner or experienced surfer, this retreat offers something for everyone.",
          order: 0
        }
      ]
    },
    {
      id: 5,
      image: retreatSwitzerland,
      location: "Swiss Alps",
      date: "May 12–19",
      title: "Mountain Meditation & Hiking Retreat",
      description: "Find inner peace surrounded by the majestic Swiss Alps through guided meditation and mountain hiking.",
      capacity: 8,
      spotsRemaining: 4,
      price: 2200,
      requiresApplication: true,
      agendaVisibility: 'public',
      organizer: {
        name: "Hans Mueller",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
      },
      extendedContent: [
        {
          id: '1',
          type: 'text',
          content: "Experience the transformative power of mountain meditation in one of the world's most beautiful settings. This retreat combines gentle hiking with deep contemplative practices.",
          order: 0
        }
      ]
    },
    {
      id: 6,
      image: retreatGreece,
      location: "Santorini, Greece",
      date: "Jun 3–10", 
      title: "Mediterranean Wellness & Culture Retreat",
      description: "Explore ancient Greek wisdom while enjoying the beauty of Santorini's volcanic landscape and azure waters.",
      capacity: 12,
      spotsRemaining: 1,
      price: 1950,
      requiresApplication: false,
      agendaVisibility: 'public',
      organizer: {
        name: "Elena Papadopoulos",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
      },
      extendedContent: [
        {
          id: '1',
          type: 'text',
          content: "Santorini's unique energy and stunning sunsets create the perfect environment for wellness and cultural exploration. This retreat honors the philosophical traditions of ancient Greece.",
          order: 0
        }
      ]
    }
  ];
  return retreatData;
};

export default function RetreatPage() {
  const { retreatId } = useParams();
  const navigate = useNavigate();
  const [retreat, setRetreat] = useState<RetreatDetail | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [savedRetreats, setSavedRetreats] = useState<number[]>([]);
  const [followedHosts, setFollowedHosts] = useState<string[]>([]);
  const [userRetreats] = useState<Retreat[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedSavedRetreats = localStorage.getItem('savedRetreats');
    if (storedSavedRetreats) {
      setSavedRetreats(JSON.parse(storedSavedRetreats));
    }

    const storedFollowedHosts = localStorage.getItem('followedHosts');
    if (storedFollowedHosts) {
      setFollowedHosts(JSON.parse(storedFollowedHosts));
    }
  }, []);

  useEffect(() => {
    if (retreatId) {
      const retreats = getRetreatData();
      const foundRetreat = retreats.find(r => r.id === parseInt(retreatId));
      setRetreat(foundRetreat || null);
    }
  }, [retreatId]);

  const handleSaveClick = () => {
    if (!user || !retreat) {
      alert('Please log in to save retreats');
      return;
    }
    
    const newSavedRetreats = savedRetreats.includes(retreat.id)
      ? savedRetreats.filter(id => id !== retreat.id)
      : [...savedRetreats, retreat.id];
    
    setSavedRetreats(newSavedRetreats);
    localStorage.setItem('savedRetreats', JSON.stringify(newSavedRetreats));
  };

  const handleFollowClick = () => {
    if (!user || !retreat?.organizer) {
      alert('Please log in to follow hosts');
      return;
    }
    
    const newFollowedHosts = followedHosts.includes(retreat.organizer.name)
      ? followedHosts.filter(name => name !== retreat.organizer.name)
      : [...followedHosts, retreat.organizer.name];
    
    setFollowedHosts(newFollowedHosts);
    localStorage.setItem('followedHosts', JSON.stringify(newFollowedHosts));
  };

  const handleApply = () => {
    if (!user) {
      alert('Please log in to apply');
      return;
    }
    // Show preview modal first
    setIsPreviewModalOpen(true);
  };

  const handleContinueToApply = async () => {
    setIsPreviewModalOpen(false);
    setIsApplying(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsApplying(false);
    // Handle actual application logic here
    console.log('Applied to retreat:', retreat?.title);
  };

  const handleHostClick = () => {
    if (retreat?.organizer) {
      const hostId = retreat.organizer.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/host/${hostId}`);
    }
  };

  const handleCreateRetreat = () => {
    // Placeholder for retreat creation
  };

  const handleBackClick = () => {
    // Check if there's actual history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to homepage if no history (e.g., direct link)
      navigate('/');
    }
  };

  if (!retreat) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Retreat not found</h1>
            <p className="text-muted-foreground">The retreat you're looking for doesn't exist or may have been removed.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Browse All Retreats
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isSaved = savedRetreats.includes(retreat.id);
  const isFollowing = followedHosts.includes(retreat.organizer?.name || '');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBackClick}
          className="mb-6 text-foreground hover:text-coral"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="space-y-8">
          {/* Hero Image */}
          <div className="relative h-96 overflow-hidden rounded-xl">
            <img
              src={retreat.image}
              alt={retreat.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute top-4 right-4">
              {retreat.spotsRemaining && retreat.spotsRemaining <= 5 && (
                <Badge className="bg-destructive/90 text-white">
                  Only {retreat.spotsRemaining} spots left
                </Badge>
              )}
            </div>
          </div>

          {/* Retreat Overview */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                {retreat.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  <span>{retreat.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-5 h-5" />
                  <span>{retreat.date}</span>
                </div>
                {retreat.capacity && (
                  <div className="flex items-center gap-1">
                    <Users className="w-5 h-5" />
                    <span>{retreat.capacity} spots total</span>
                  </div>
                )}
              </div>

              {/* Action Section */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex flex-col">
                  {retreat.price && (
                    <span className="text-3xl font-bold text-primary">
                      ${retreat.price}
                    </span>
                  )}
                  {retreat.spotsRemaining && (
                    <span className="text-muted-foreground">
                      {retreat.spotsRemaining} spots remaining
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleApply}
                    disabled={isApplying}
                    size="lg"
                    className="bg-coral hover:bg-coral-dark text-white px-8"
                  >
                    {isApplying 
                      ? "Processing..." 
                      : retreat.requiresApplication 
                        ? "Apply Now" 
                        : "Purchase Ticket"
                    }
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleSaveClick}
                    className="border-coral text-coral hover:bg-coral hover:text-white"
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            {retreat.description && (
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground leading-relaxed text-lg">
                  {retreat.description}
                </p>
              </div>
            )}

            {/* Meet Your Host */}
            {retreat.organizer && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Meet Your Host</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 cursor-pointer" onClick={handleHostClick}>
                      <AvatarImage src={retreat.organizer.avatar} alt={retreat.organizer.name} />
                      <AvatarFallback className="text-lg">
                        {retreat.organizer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <button 
                        onClick={handleHostClick}
                        className="text-xl font-medium text-coral hover:text-coral-dark transition-colors text-left"
                      >
                        {retreat.organizer.name}
                      </button>
                      <p className="text-muted-foreground">Retreat Organizer</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant={isFollowing ? "default" : "outline"}
                      onClick={handleFollowClick}
                      className={isFollowing ? "bg-coral hover:bg-coral-dark text-white" : "border-coral text-coral hover:bg-coral hover:text-white"}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleHostClick}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Extended Content */}
            {retreat.extendedContent && retreat.extendedContent.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">More About This Retreat</h2>
                <div className="prose prose-lg max-w-none">
                  <RichContentDisplay blocks={retreat.extendedContent} />
                </div>
              </Card>
            )}

            {/* Agenda */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">📅 Agenda</h2>
              {retreat.agendaVisibility === 'private' ? (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg">Agenda available to confirmed guests</p>
                  </CardContent>
                </Card>
              ) : retreat.agenda && retreat.agenda.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {retreat.agenda.map((day, index) => (
                    <AccordionItem key={index} value={`day-${index}`} className="border rounded-lg mb-3">
                      <AccordionTrigger className="px-4 font-semibold text-foreground hover:no-underline">
                        {day.date}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          {day.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="flex gap-4">
                              <div className="flex-shrink-0">
                                <Badge variant="outline" className="font-mono">
                                  {activity.time}
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground">
                                  {activity.title}
                                </h4>
                                {activity.description && (
                                  <p className="text-muted-foreground mt-1">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg">Detailed agenda coming soon</p>
                  </CardContent>
                </Card>
              )}
            </Card>
          </div>
        </div>

        {/* Application Preview Modal */}
        <ApplicationPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          onContinueToApply={handleContinueToApply}
          retreatTitle={retreat?.title || ''}
          selectedTicketTier={retreat?.ticketTiers?.[0]} // Use first tier as default, or implement tier selection
          applicationFields={retreat?.applicationForm || []}
          mode="apply" // Users are applying, not previewing
        />
      </div>
    </div>
  );
}
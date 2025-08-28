import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, MapPin, Users, Clock, Heart, UserPlus, UserCheck, ArrowLeft, Star, Camera, MessageCircle } from "lucide-react";
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
      date: "Feb 20–27",
      title: "Pura Vida Adventure & Wellness Retreat",
      description: "Experience the pure life of Costa Rica through adventure activities, wellness practices, and sustainable living workshops.",
      capacity: 15,
      spotsRemaining: 8,
      price: 950,
      requiresApplication: false,
      agendaVisibility: 'private',
      organizer: {
        name: "Carlos Rodriguez",
        avatar: "/placeholder.svg"
      },
      extendedContent: [],
      ticketTiers: [],
      applicationForm: []
    },
    {
      id: 3,
      image: retreatTulum,
      location: "Tulum",
      date: "Mar 10–17",
      title: "Beachfront Yoga & Cenote Healing Experience",
      description: "Combine ancient Mayan wisdom with modern wellness practices on the stunning Caribbean coast.",
      capacity: 20,
      spotsRemaining: 12,
      price: 800,
      requiresApplication: false,
      agendaVisibility: 'public',
      agenda: [
        {
          date: "March 10",
          activities: [
            { time: "08:00", title: "Beach Sunrise Yoga" },
            { time: "10:00", title: "Cenote Swimming & Meditation" }
          ]
        }
      ],
      organizer: {
        name: "Sofia Martinez",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      },
      extendedContent: [],
      ticketTiers: [],
      applicationForm: []
    },
    {
      id: 4,
      image: retreatPortugal,
      location: "Portugal",
      date: "Apr 1–8",
      title: "Creative Writing & Wine Retreat in Douro Valley",
      description: "Unleash your creativity while enjoying world-class wines in one of Portugal's most beautiful regions.",
      capacity: 10,
      spotsRemaining: 2,
      price: 1400,
      requiresApplication: true,
      agendaVisibility: 'public',
      extendedContent: [],
      ticketTiers: [],
      applicationForm: []
    },
    {
      id: 5,
      image: retreatSwitzerland,
      location: "Switzerland",
      date: "Apr 3–10",
      title: "Alpine Startup Founder Retreat",
      description: "Network with fellow entrepreneurs while enjoying the stunning Swiss Alps and world-class business workshops.",
      capacity: 8,
      spotsRemaining: 1,
      price: 2200,
      requiresApplication: true,
      agendaVisibility: 'private',
      extendedContent: [],
      ticketTiers: [],
      applicationForm: []
    },
    {
      id: 6,
      image: retreatGreece,
      location: "Greece",
      date: "Apr 5–12",
      title: "Digital Nomad Retreat in Mediterranean Paradise",
      description: "Work remotely while enjoying the Greek islands, with coworking sessions and networking opportunities.",
      capacity: 25,
      spotsRemaining: 18,
      price: 650,
      requiresApplication: false,
      agendaVisibility: 'public',
      extendedContent: [],
      ticketTiers: [],
      applicationForm: []
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
    setIsPreviewModalOpen(true);
  };

  const handleContinueToApply = async () => {
    setIsPreviewModalOpen(false);
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsApplying(false);
    console.log('Applied to retreat:', retreat?.title);
  };

  const handleHostClick = () => {
    if (retreat?.organizer) {
      const hostId = retreat.organizer.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/host/${hostId}`);
    }
  };

  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  if (!retreat) {
    return (
      <div className="min-h-screen bg-[#0b0b12] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4 text-white">Retreat not found</h1>
            <p className="text-gray-400">The retreat you're looking for doesn't exist or may have been removed.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mt-4 border-white/20 text-white hover:bg-white/10"
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
    <div className="min-h-screen bg-[#0b0b12] text-white">
      {/* Navigation with Back Button */}
      <nav className="sticky top-0 z-50 bg-black/40 border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBackClick}
            className="text-white hover:bg-white/10 border-white/20 hover:border-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Experiences
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSaveClick}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Heart 
                className={`w-5 h-5 mr-2 ${
                  isSaved ? 'fill-neon-pink text-neon-pink' : 'text-white'
                }`}
              />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden rounded-2xl mb-8">
          <img
            src={retreat.image}
            alt={retreat.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Floating Info Cards */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{retreat.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{retreat.date}</span>
                </div>
                {retreat.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{retreat.capacity} spots total</span>
                  </div>
                )}
              </div>
              
              {retreat.spotsRemaining && retreat.spotsRemaining <= 5 && (
                <Badge className="bg-neon-pink/20 text-neon-pink border border-neon-pink/30 mb-2">
                  Only {retreat.spotsRemaining} spots left
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Title and Organizer */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent leading-tight">
              {retreat.title}
            </h1>
            
            {retreat.organizer && (
              <div className="flex items-center gap-4">
                <Avatar 
                  className="w-16 h-16 border-2 border-neon-purple/30 cursor-pointer hover:border-neon-purple/60 transition-colors"
                  onClick={handleHostClick}
                >
                  <AvatarImage src={retreat.organizer.avatar} alt={retreat.organizer.name} />
                  <AvatarFallback className="bg-neon-purple/20 text-neon-purple">
                    {retreat.organizer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-gray-300">Hosted by</p>
                  <button 
                    onClick={handleHostClick}
                    className="text-neon-pink hover:text-neon-purple font-semibold text-lg transition-colors"
                  >
                    {retreat.organizer.name}
                  </button>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-neon-yellow text-neon-yellow" />
                      <span className="text-sm text-gray-400">4.9</span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-400">12 experiences</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {retreat.description && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-neon-cyan mb-4">About This Experience</h2>
                <p className="text-gray-300 leading-relaxed">{retreat.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Extended Content */}
          {retreat.extendedContent && retreat.extendedContent.length > 0 && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-neon-cyan mb-4">What to Expect</h2>
                <RichContentDisplay blocks={retreat.extendedContent} />
              </CardContent>
            </Card>
          )}

          {/* Agenda */}
          {retreat.agenda && retreat.agenda.length > 0 && retreat.agendaVisibility === 'public' && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-neon-cyan mb-6">Daily Agenda</h2>
                <div className="space-y-6">
                  {retreat.agenda.map((day, dayIndex) => (
                    <div key={dayIndex} className="border-l-2 border-neon-purple/30 pl-6">
                      <h3 className="text-lg font-semibold text-neon-pink mb-4">{day.date}</h3>
                      <div className="space-y-3">
                        {day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex items-start gap-4">
                            <div className="text-sm text-neon-cyan bg-neon-cyan/10 px-3 py-1 rounded-full">
                              {activity.time}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{activity.title}</h4>
                              {activity.description && (
                                <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket Tiers */}
          {retreat.ticketTiers && retreat.ticketTiers.length > 0 && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-neon-cyan mb-6">Pricing & Tickets</h2>
                <div className="space-y-4">
                  {retreat.ticketTiers.map((tier) => (
                    <div key={tier.id} className="border border-white/10 rounded-xl p-4 bg-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white">{tier.name}</h3>
                        <span className="text-xl font-bold text-neon-pink">${tier.price}</span>
                      </div>
                      {tier.description && (
                        <p className="text-sm text-gray-400 mb-3">{tier.description}</p>
                      )}
                      <p className="text-xs text-gray-500">{tier.quantity} spots available</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Section */}
          <Card className="bg-gradient-to-r from-neon-pink/10 to-neon-purple/10 border-neon-pink/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  {retreat.price && (
                    <span className="text-3xl font-bold text-neon-pink">
                      ${retreat.price}
                    </span>
                  )}
                  {retreat.spotsRemaining && (
                    <p className="text-gray-300 mt-1">
                      {retreat.spotsRemaining} spots remaining
                    </p>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {retreat.organizer && (
                    <Button
                      onClick={handleFollowClick}
                      variant={isFollowing ? "default" : "outline"}
                      className={
                        isFollowing 
                          ? "bg-neon-purple hover:bg-neon-purple/80 text-white border-0" 
                          : "border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                      }
                    >
                      {isFollowing ? <UserCheck className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                      {isFollowing ? 'Following' : 'Follow Host'}
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleApply}
                    disabled={isApplying}
                    size="lg"
                    className="bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-bold px-8 border-0"
                  >
                    {isApplying ? 'Processing...' : retreat.requiresApplication ? 'Apply Now' : 'Reserve Spot'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Preview Modal */}
      {isPreviewModalOpen && retreat && (
        <ApplicationPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          onContinueToApply={handleContinueToApply}
          retreatTitle={retreat.title}
          applicationFields={retreat.applicationForm || []}
        />
      )}
    </div>
  );
}

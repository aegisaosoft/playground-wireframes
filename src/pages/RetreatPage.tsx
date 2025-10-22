import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, MapPin, Users, Clock, Heart, UserPlus, UserCheck, ArrowLeft, Loader2 } from "lucide-react";
import { RichContentDisplay } from "@/components/RichContentDisplay";
import { RetreatDetail } from "@/components/RetreatDetailsModal";
import { ApplicationPreviewModal, TicketTier, ApplicationField } from "@/components/ApplicationPreviewModal";
import { GoogleMapPreview } from "@/components/ExperiencePortal/GoogleMapPreview";
import { experiencesService } from '@/services/experiences.service';
import { userService } from '@/services/user.service';
import { brandsService } from '@/services/brands.service';
import { resolveApiResourceUrl } from '@/lib/api-client';
import { getAvatarList } from '@/lib/avatars';
import { bookmarksService } from '@/services/bookmarks.service';
import { followsService } from '@/services/follows.service';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

export default function RetreatPage() {
  const { retreatId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [retreatData, setRetreatData] = useState<RetreatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    const loadRetreatData = async () => {
      if (!retreatId) {
        setError('Retreat not found');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('📥 Loading retreat:', retreatId);
        
        // Fetch experience from API
        const experience = await experiencesService.getById(retreatId);
        
        if (!experience) {
          setError('Retreat not found');
          return;
        }

        console.log('✅ Experience loaded:', experience);
        
        // Transform API data to RetreatDetail format
        const retreatDetail: RetreatDetail = {
          id: parseInt(experience.id),
          title: experience.title,
          location: experience.location,
          date: experience.startDate ? new Date(experience.startDate).toLocaleDateString() : 'TBA',
          description: experience.description,
          image: experience.featuredImageUrl || '/default-retreat-banner.png',
          capacity: experience.totalCapacity || 10,
          spotsRemaining: (experience.totalCapacity || 10) - (experience.spotsTaken || 0),
          price: experience.basePriceCents ? experience.basePriceCents / 100 : 0,
          requiresApplication: experience.requiresApproval || false,
          agendaVisibility: 'public',
          
          // Transform agenda from API format
          agenda: experience.agenda ? experience.agenda.map((day: any, index: number) => ({
            date: day.day || `Day ${index + 1}`,
            activities: day.items ? day.items.map((item: any) => ({
              time: item.time,
              title: item.activity,
              description: item.description || ''
            })) : []
          })) : [],
          
          // Transform highlights
          highlights: experience.highlights || [],
          
          // Transform FAQ
          faq: experience.faq ? experience.faq.map((item: any) => ({
            question: item.question,
            answer: item.answer
          })) : [],
          
          // Transform resources
          resources: experience.resources ? experience.resources.map((item: any) => ({
            title: item.title,
            url: item.url,
            description: item.description
          })) : [],
          
          // Host information
          organizer: {
            name: experience.hostName || experience.host?.name || 'Unknown Host',
            avatar: experience.host?.profileImageUrl || '/avatars/default-avatar.png',
            bio: experience.host?.bio || '',
            socialAccounts: experience.host?.socialAccounts || {}
          },
          
          // Ticket tiers
          ticketTiers: experience.ticketTiers ? experience.ticketTiers.map((tier: any) => ({
            name: tier.name,
            description: tier.description,
            price: tier.price || tier.priceCents / 100,
            quantity: tier.quantity || tier.capacity,
            benefits: tier.benefits || [],
            isPopular: tier.isPopular || false
          })) : []
        };

        setRetreatData(retreatDetail);

        // Fallback: if organizer avatar missing, fetch by hostId
        if ((!retreatDetail.organizer.avatar) && (experience.hostId || experience.host?.id)) {
          try {
            const hostProfile = await userService.getUserProfile(experience.hostId || experience.host.id);
            if (hostProfile?.profileImageUrl) {
              setRetreatData(prev => prev ? {
                ...prev,
                organizer: {
                  ...prev.organizer,
                  avatar: resolveApiResourceUrl(hostProfile.profileImageUrl) as string
                }
              } : prev);
            } else {
              // No avatar in profile: use default preset
              const list = await getAvatarList();
              setRetreatData(prev => prev ? {
                ...prev,
                organizer: {
                  ...prev.organizer,
                  avatar: list[0]
                }
              } : prev);
            }
          } catch (e) {
            // Try find user by name when host is a user
            if ((experience as any)?.hostType !== 'brand' && experience.hostName) {
              try {
                const results = await userService.searchUsers(String(experience.hostName));
                if (results && results.length > 0) {
                  const match = results.find(r => r.name?.toLowerCase() === String(experience.hostName).toLowerCase()) || results[0];
                  if (match?.avatarUrl) {
                    setRetreatData(prev => prev ? {
                      ...prev,
                      organizer: { ...prev.organizer, avatar: match.avatarUrl }
                    } : prev);
                  }
                }
              } catch {}
            }
            // Only try brand lookup if API says hostType is brand
            if ((experience as any)?.hostType === 'brand') {
              try {
                const slug = (experience.hostName || '').toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/^-+|-+$/g, '');
                if (slug) {
                  const brand = await brandsService.getBrandBySlug(slug);
                  if (brand?.logo) {
                    setRetreatData(prev => prev ? {
                      ...prev,
                      organizer: {
                        ...prev.organizer,
                        avatar: resolveApiResourceUrl(brand.logo) as string
                      }
                    } : prev);
                  } else {
                    const list = await getAvatarList();
                    setRetreatData(prev => prev ? {
                      ...prev,
                      organizer: {
                        ...prev.organizer,
                        avatar: list[1] || list[0]
                      }
                    } : prev);
                  }
                }
              } catch {}
            }
          }
        }

        // Final fallback: if current user is the host, use local profile image
        if ((!retreatDetail.organizer.avatar) && user?.profile?.profileImageUrl) {
          const sameUser = (user?.name || '').toLowerCase() === (retreatDetail.organizer.name || '').toLowerCase();
          if (sameUser) {
            setRetreatData(prev => prev ? {
              ...prev,
              organizer: {
                ...prev.organizer,
                avatar: resolveApiResourceUrl(user.profile.profileImageUrl) as string
              }
            } : prev);
          }
        }
        
        // Check if user has bookmarked this experience
        if (user) {
          try {
            const bookmarks = await bookmarksService.getMyBookmarks();
            const isBookmarked = bookmarks.some(bookmark => bookmark.experienceId === experience.id);
            setIsBookmarked(isBookmarked);
          } catch (bookmarkError) {
            console.warn('Could not check bookmark status:', bookmarkError);
          }
          
          // Check if user is following the host
          try {
            const follows = await followsService.getMyFollows();
            const isFollowingHost = follows.some(follow => 
              follow.userId === experience.hostId || follow.userId === experience.host?.id
            );
            setIsFollowing(isFollowingHost);
          } catch (followError) {
            console.warn('Could not check follow status:', followError);
          }
        }
        
        console.log('✅ Retreat data transformed:', retreatDetail);
        
      } catch (err) {
        console.error('❌ Failed to load retreat data:', err);
        setError('Failed to load retreat details');
        toast({
          title: "Error",
          description: "Failed to load retreat details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRetreatData();
  }, [retreatId, navigate, toast, user]);

  const handleToggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark retreats",
        variant: "destructive",
      });
      return;
    }

    if (!retreatData) return;

    try {
      if (isBookmarked) {
        await bookmarksService.removeBookmark(retreatData.id.toString());
        setIsBookmarked(false);
        toast({
          title: "Bookmark Removed",
          description: "Retreat removed from your bookmarks",
        });
      } else {
        await bookmarksService.createBookmark({ experienceId: retreatData.id.toString() });
        setIsBookmarked(true);
        toast({
          title: "Bookmarked",
          description: "Retreat added to your bookmarks",
        });
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow hosts",
        variant: "destructive",
      });
      return;
    }

    if (!retreatData?.organizer) return;

    try {
      if (isFollowing) {
        // This would need the host ID - would need to get from experience data
        // await followsService.unfollowUser(hostId);
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You're no longer following ${retreatData.organizer.name}`,
        });
      } else {
        // This would need the host ID - would need to get from experience data
        // await followsService.createFollow({ followedUserId: hostId });
        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You're now following ${retreatData.organizer.name}`,
        });
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyNow = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for this retreat",
        variant: "destructive",
      });
      return;
    }

    setShowApplicationModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-neon-cyan" />
          <p className="text-muted-foreground">Loading retreat details...</p>
        </div>
      </div>
    );
  }

  if (error || !retreatData) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Retreat Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The requested retreat could not be found.'}</p>
          <Button onClick={() => navigate('/experiences')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Experiences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/experiences')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Experiences
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleBookmark}
              className={isBookmarked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
            >
              <Heart className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="relative">
              <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden">
                <img 
                  src={retreatData.image} 
                  alt={retreatData.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {retreatData.spotsRemaining} spots remaining
                </Badge>
              </div>
            </div>

            {/* Title and Description */}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {retreatData.title}
              </h1>
              <div className="flex items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {retreatData.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {retreatData.date}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {retreatData.capacity} participants
                </div>
              </div>
              <RichContentDisplay content={retreatData.description} />
            </div>

            {/* Agenda */}
            {retreatData.agenda && retreatData.agenda.length > 0 && (
              <Card className="bg-background border-border">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Retreat Schedule</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {retreatData.agenda.map((day, index) => (
                      <AccordionItem key={index} value={`day-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-neon-cyan" />
                            {day.date}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {day.activities.map((activity, activityIndex) => (
                              <div key={activityIndex} className="flex gap-4 p-3 bg-gray-900/50 rounded-lg">
                                <div className="text-sm font-medium text-neon-cyan w-16">
                                  {activity.time}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{activity.title}</h4>
                                  {activity.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
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
                </CardContent>
              </Card>
            )}

            {/* Highlights */}
            {retreatData.highlights && retreatData.highlights.length > 0 && (
              <Card className="bg-background border-border">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">What's Included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {retreatData.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-neon-cyan rounded-full mt-2 flex-shrink-0"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQ */}
            {retreatData.faq && retreatData.faq.length > 0 && (
              <Card className="bg-background border-border">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {retreatData.faq.map((item, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="bg-background border-border sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-neon-cyan mb-2">
                    ${retreatData.price}
                  </div>
                  <div className="text-sm text-muted-foreground">per person</div>
                </div>

                <Button 
                  onClick={handleApplyNow}
                  className="w-full mb-4 bg-neon-cyan hover:bg-neon-cyan/90 text-black"
                >
                  Apply Now
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group size:</span>
                    <span>{retreatData.capacity} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Availability:</span>
                    <span>{retreatData.spotsRemaining} spots left</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Host Card */}
            <Card className="bg-background border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={retreatData.organizer.avatar} alt={retreatData.organizer.name} />
                    <AvatarFallback>{retreatData.organizer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{retreatData.organizer.name}</h3>
                    <p className="text-sm text-muted-foreground">Host</p>
                  </div>
                </div>
                
                {retreatData.organizer.bio && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {retreatData.organizer.bio}
                  </p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFollow}
                  className={`w-full ${isFollowing ? 'bg-coral text-white hover:bg-coral/90' : 'border-coral text-coral hover:bg-coral hover:text-white'}`}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Application Modal */}
      {showApplicationModal && retreatData && (
        <ApplicationPreviewModal
          retreat={retreatData}
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          onSubmit={(applicationData) => {
            console.log('Application submitted:', applicationData);
            setShowApplicationModal(false);
            toast({
              title: "Application Submitted",
              description: "Your application has been submitted successfully!",
            });
          }}
        />
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useUser } from "@/contexts/UserContext";
import PlaygroundHero from "@/components/PlaygroundHero";
import ExperiencesSection from "@/components/ExperiencesSection";
import { RetreatGrid, Retreat } from "@/components/RetreatGrid";
import { RetreatDetailsModal, RetreatDetail } from "@/components/RetreatDetailsModal";
import { RetreatEditor, RetreatDetails } from "@/components/RetreatEditor";
import { BrandSuccessModal } from "@/components/BrandSuccessModal";
import { BrandEditor, BrandData } from "@/components/BrandEditor";
import { experiencesService } from '@/services/experiences.service';
import { bookmarksService } from '@/services/bookmarks.service';
import { followsService } from '@/services/follows.service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { formatExperienceDates } from '@/utils/dateFormatter';

const Index = () => {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'editor'>('home');
  const [editingRetreat, setEditingRetreat] = useState<RetreatDetails | null>(null);
  const [selectedRetreat, setSelectedRetreat] = useState<RetreatDetail | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [savedRetreats, setSavedRetreats] = useState<number[]>([]);
  const [followedHosts, setFollowedHosts] = useState<string[]>([]);
  const [showBrandSuccessModal, setShowBrandSuccessModal] = useState(false);
  const [showBrandEditor, setShowBrandEditor] = useState(false);
  // Use UserContext for brand data and user info
  const { user, brandPreferences, updateBrandPreferences } = useUser();
  const [userBrandData, setUserBrandData] = useState<BrandData | null>(null);
  const { toast } = useToast();

  // Load retreats from API
  useEffect(() => {
    const loadRetreats = async () => {
      setLoading(true);
      try {
        const experiences = await experiencesService.getAll();
        
        // Transform API experiences to Retreat format
        const transformedRetreats: Retreat[] = experiences.map(exp => ({
          id: parseInt(exp.id),
          image: exp.featuredImageUrl || '/placeholder.svg',
          location: exp.location,
          date: formatExperienceDates(exp.startDate, exp.endDate, exp.date),
          title: exp.title,
          description: exp.description,
          capacity: exp.totalCapacity || 10,
          spotsRemaining: (exp.totalCapacity || 10) - (exp.spotsTaken || 0),
          price: exp.basePriceCents ? exp.basePriceCents / 100 : 0,
          requiresApplication: exp.requiresApproval || false,
          agendaVisibility: 'public',
          organizer: {
            name: exp.hostName || exp.host?.name || 'Unknown Host',
            avatar: exp.host?.profileImageUrl || '/placeholder.svg',
            profileLink: `/host/${exp.hostId || exp.host?.id}`
          }
        }));
        
        setRetreats(transformedRetreats);
        
        // Load user's saved retreats and followed hosts if authenticated
        if (user) {
          try {
            const bookmarks = await bookmarksService.getMyBookmarks();
            const savedIds = bookmarks.map(bookmark => parseInt(bookmark.experienceId));
            setSavedRetreats(savedIds);
            
            const follows = await followsService.getMyFollows();
            const followedIds = follows.map(follow => follow.userId);
            setFollowedHosts(followedIds);
          } catch (error) {
          }
        }
        
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load experiences. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRetreats();
  }, [user, toast]);

  // Load brand data from API when user context loads
  useEffect(() => {
    if (brandPreferences) {
      // Transform API brand preferences to local BrandData format
      const brandData: BrandData = {
        name: brandPreferences.name || 'Your Brand',
        description: brandPreferences.description || '',
        logo: brandPreferences.logoUrl || null,
        coverImage: brandPreferences.coverImageUrl || null,
        website: brandPreferences.website || '',
        instagram: brandPreferences.instagram || '',
        twitter: brandPreferences.twitter || '',
        linkedin: brandPreferences.linkedin || '',
        facebook: brandPreferences.facebook || '',
        youtube: brandPreferences.youtube || '',
        tiktok: brandPreferences.tiktok || '',
        followers: 124, // This would come from API
        rating: 4.9,
        experiencesCount: 2,
        participantsCount: 45
      };
      setUserBrandData(brandData);
    }
  }, [brandPreferences]);

  const handleCreateRetreat = (newRetreat: Omit<Retreat, 'id'>) => {
    
    const retreat: Retreat = {
      ...newRetreat,
      id: Math.max(...retreats.map(r => r.id), 0) + 1,
      organizer: {
        name: userBrandData?.name || user?.name || "Unknown Host",
        avatar: userBrandData?.logo || "/placeholder.svg"
      }
    };
    setRetreats([retreat, ...retreats]);
    
    // Show brand success modal if user doesn't have brand data
    if (!userBrandData && user) {
      setShowBrandSuccessModal(true);
    }
    
    // Automatically open the editor for the new retreat
    const retreatDetails: RetreatDetails = {
      id: retreat.id.toString(),
      name: retreat.title,
      location: retreat.location,
      startDate: retreat.date.split('–')[0],
      endDate: retreat.date.split('–')[1] || retreat.date.split('–')[0],
      description: retreat.description || '',
      image: retreat.image,
      capacity: 0,
      agenda: [],
      ticketTiers: [],
      applicationForm: [],
      extendedContent: [],
      isPublic: false,
      isPublished: false // New retreats start as drafts
    };
    
    setEditingRetreat(retreatDetails);
    setCurrentView('editor');
  };

  const handleEditRetreat = (retreat: RetreatDetails) => {
    setEditingRetreat(retreat);
    setCurrentView('editor');
  };

  const handleSaveRetreat = (retreat: RetreatDetails) => {
    // Update retreat in the list
    const updatedRetreat: Retreat = {
      id: parseInt(retreat.id),
      image: retreat.image,
      location: retreat.location,
      date: `${retreat.startDate}–${retreat.endDate}`,
      title: retreat.name,
      description: retreat.description,
      isPublished: retreat.isPublished,
      isPublic: retreat.isPublic
    };
    
    setRetreats(prev => 
      prev.map(r => r.id === updatedRetreat.id ? updatedRetreat : r)
    );
    setCurrentView('home');
    setEditingRetreat(null);
  };

  const handleRetreatClick = (retreat: Retreat) => {
    // Convert Retreat to RetreatDetail for the modal
    const retreatDetail: RetreatDetail = {
      ...retreat,
      // All properties are already compatible
    };
    setSelectedRetreat(retreatDetail);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRetreat(null);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setEditingRetreat(null);
  };

  const handleToggleSaveRetreat = async (retreatId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark retreats",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCurrentlySaved = savedRetreats.includes(retreatId);
      
      if (isCurrentlySaved) {
        await bookmarksService.removeBookmark(retreatId.toString());
        setSavedRetreats(prev => prev.filter(id => id !== retreatId));
        toast({
          title: "Bookmark Removed",
          description: "Retreat removed from your bookmarks",
        });
      } else {
        await bookmarksService.createBookmark({ experienceId: retreatId.toString() });
        setSavedRetreats(prev => [...prev, retreatId]);
        toast({
          title: "Bookmarked",
          description: "Retreat added to your bookmarks",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFollowHost = async (hostName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow hosts",
        variant: "destructive",
      });
      return;
    }

    // Find the host ID from the retreats data
    const hostRetreat = retreats.find(r => r.organizer.name === hostName);
    const hostId = hostRetreat?.organizer.profileLink?.split('/').pop();
    
    if (!hostId) {
      toast({
        title: "Error",
        description: "Could not find host information",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCurrentlyFollowing = followedHosts.includes(hostName);
      
      if (isCurrentlyFollowing) {
        await followsService.unfollowUser(hostId);
        setFollowedHosts(prev => prev.filter(name => name !== hostName));
        toast({
          title: "Unfollowed",
          description: "You're no longer following this host",
        });
      } else {
        await followsService.createFollow({ followedUserId: hostId });
        setFollowedHosts(prev => [...prev, hostName]);
        toast({
          title: "Following",
          description: "You're now following this host",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCustomizeBrand = () => {
    setShowBrandSuccessModal(false);
    setShowBrandEditor(true);
  };

  const handleSaveBrandData = async (brandData: BrandData) => {
    setUserBrandData(brandData);
    
    // Save to API via UserContext
    try {
      await updateBrandPreferences({
        name: brandData.name,
        description: brandData.description,
        logoUrl: brandData.logo,
        coverImageUrl: brandData.coverImage,
        website: brandData.website,
        instagram: brandData.instagram,
        twitter: brandData.twitter,
        linkedin: brandData.linkedin,
        facebook: brandData.facebook,
        youtube: brandData.youtube,
        tiktok: brandData.tiktok
      });
    } catch (error) {
      // Fallback: still update local state even if API fails
    }
  };

  // Filter retreats to show only user's retreats (for demo purposes, we'll show all)
  const userRetreats = retreats;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-neon-cyan" />
          <p className="text-muted-foreground">Loading experiences...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'editor' && editingRetreat) {
    return (
      <RetreatEditor
        retreat={editingRetreat}
        onSave={handleSaveRetreat}
        onClose={handleBackToHome}
        isOpen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <PlaygroundHero />

        {/* Experiences Section */}
        <ExperiencesSection />
      </main>

      {/* Retreat Details Modal */}
      <RetreatDetailsModal
        retreat={selectedRetreat}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        savedRetreats={savedRetreats}
        onToggleSaveRetreat={handleToggleSaveRetreat}
        followedHosts={followedHosts}
        onToggleFollowHost={handleToggleFollowHost}
      />

      {/* Brand Success Modal */}
      <BrandSuccessModal
        isOpen={showBrandSuccessModal}
        onClose={() => setShowBrandSuccessModal(false)}
        onCustomizeBrand={handleCustomizeBrand}
        hostName={user?.name || "Host"}
      />

      {/* Brand Editor */}
      <BrandEditor
        isOpen={showBrandEditor}
        onClose={() => setShowBrandEditor(false)}
        onSave={handleSaveBrandData}
        hostName={user?.name || "Host"}
        initialData={userBrandData || undefined}
      />
    </div>
  );
};

export default Index;
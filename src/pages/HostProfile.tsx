
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RetreatCard } from "@/components/RetreatCard";
import { RetreatDetailsModal, RetreatDetail } from "@/components/RetreatDetailsModal";
import { ArrowLeft, UserPlus, UserCheck, ExternalLink } from "lucide-react";
import { Retreat } from "@/components/RetreatGrid";
import { SocialLinksDisplay } from "@/components/SocialLinksDisplay";
import { useUser } from '@/contexts/UserContext';
import { experiencesService } from '@/services/experiences.service';
import { followsService } from '@/services/follows.service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface HostProfileProps {
  // Removed props - now using API calls
}

const HostProfile = ({}: HostProfileProps) => {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [hostData, setHostData] = useState<any>(null);
  const [hostExperiences, setHostExperiences] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRetreat, setSelectedRetreat] = useState<RetreatDetail | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const loadHostData = async () => {
      if (!hostId) {
        navigate('/experiences');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('📥 Loading host profile:', hostId);
        
        // Fetch all experiences to find host data
        const experiences = await experiencesService.getAll();
        
        // Find experiences by this host
        const hostExp = experiences.find(exp => 
          exp.hostId === hostId || 
          exp.host?.id === hostId ||
          exp.hostName?.toLowerCase().replace(/\s+/g, '-') === hostId
        );
        
        if (!hostExp) {
          setError('Host not found');
          return;
        }

        // Get all experiences by this host
        const allHostExperiences = experiences.filter(exp => 
          exp.hostId === hostExp.hostId || 
          exp.host?.id === hostExp.hostId
        );

        setHostData({
          id: hostExp.hostId || hostExp.host?.id,
          name: hostExp.hostName || hostExp.host?.name,
          email: hostExp.host?.email,
          bio: hostExp.host?.bio || '',
          profileImageUrl: hostExp.host?.profileImageUrl,
          socialAccounts: hostExp.host?.socialAccounts || {}
        });

        setHostExperiences(allHostExperiences);
        
        // Check if current user is following this host
        if (user) {
          try {
            const follows = await followsService.getMyFollows();
            const isFollowingHost = follows.some(follow => 
              follow.userId === hostExp.hostId || follow.userId === hostExp.host?.id
            );
            setIsFollowing(isFollowingHost);
          } catch (followError) {
            console.warn('Could not check follow status:', followError);
          }
        }
        
        console.log('✅ Host data loaded:', hostData);
        
      } catch (err) {
        console.error('❌ Failed to load host data:', err);
        setError('Failed to load host profile');
        toast({
          title: "Error",
          description: "Failed to load host profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadHostData();
  }, [hostId, navigate, toast, user]);

  const handleToggleFollow = async () => {
    if (!hostData || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow hosts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFollowing) {
        await followsService.unfollowUser(hostData.id);
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You're no longer following ${hostData.name}`,
        });
      } else {
        await followsService.createFollow({ followedUserId: hostData.id });
        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You're now following ${hostData.name}`,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-neon-cyan" />
          <p className="text-muted-foreground">Loading host profile...</p>
        </div>
      </div>
    );
  }

  if (error || !hostData) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Host Not Found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleRetreatClick = (experience: any) => {
    const retreatDetail: RetreatDetail = {
      id: experience.id,
      title: experience.title,
      location: experience.location,
      date: experience.startDate ? new Date(experience.startDate).toLocaleDateString() : 'TBA',
      image: experience.featuredImageUrl || experience.image,
      description: experience.description,
      organizer: {
        name: hostData.name,
        avatar: hostData.profileImageUrl
      },
      price: experience.basePriceCents ? `$${(experience.basePriceCents / 100).toFixed(0)}` : 'Free',
      category: experience.category || 'General',
      highlights: experience.highlights || [],
      agenda: experience.agenda || [],
      faq: experience.faq || [],
      resources: experience.resources || []
    };
    setSelectedRetreat(retreatDetail);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRetreat(null);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Host Profile Section */}
        <div className="bg-background rounded-2xl shadow-sm border border-border p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={hostData.profileImageUrl} alt={hostData.name} />
              <AvatarFallback className="text-2xl">
                {hostData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {hostData.name}
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                Experience Host
              </p>
              <p className="text-foreground leading-relaxed max-w-2xl">
                {hostData.bio || 'Creating meaningful experiences for the community.'}
              </p>
              
              {/* Social Links */}
              <div className="mt-4">
                <SocialLinksDisplay socialAccounts={hostData.socialAccounts || {}} />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <Button 
                variant={isFollowing ? "default" : "outline"}
                onClick={handleToggleFollow}
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
              
              {host.profileLink && (
                <Button variant="outline" size="sm" asChild>
                  <a href={host.profileLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contact
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Experiences Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Experiences by {hostData.name} ({hostExperiences.length})
          </h2>
          
          {hostExperiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hostExperiences.map((experience) => (
                <RetreatCard
                  key={experience.id}
                  image={experience.featuredImageUrl || experience.image}
                  location={experience.location}
                  date={experience.startDate ? new Date(experience.startDate).toLocaleDateString() : 'TBA'}
                  title={experience.title}
                  onClick={() => handleRetreatClick(experience)}
                  isSaved={false} // Would need to implement saved experiences
                  onToggleSave={() => {}} // Would need to implement save functionality
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-background rounded-2xl border border-border">
              <p className="text-muted-foreground text-lg">
                No public experiences available at this time.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Experience Details Modal */}
      <RetreatDetailsModal
        retreat={selectedRetreat}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        savedRetreats={[]} // Would need to implement saved experiences
        onToggleSaveRetreat={() => {}} // Would need to implement save functionality
        followedHosts={[]} // Would need to implement followed hosts
        onToggleFollowHost={() => {}} // Would need to implement follow functionality
      />
    </div>
  );
};

export default HostProfile;

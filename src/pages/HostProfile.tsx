
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RetreatCard } from "@/components/RetreatCard";
import { RetreatDetailsModal, RetreatDetail } from "@/components/RetreatDetailsModal";
import { ArrowLeft, UserPlus, UserCheck, ExternalLink } from "lucide-react";
import { Retreat } from "@/components/RetreatGrid";
import { SocialLinksDisplay } from "@/components/SocialLinksDisplay";

interface HostProfileProps {
  retreats: Retreat[];
  savedRetreats: number[];
  onToggleSaveRetreat: (retreatId: number) => void;
  followedHosts: string[];
  onToggleFollowHost: (hostName: string) => void;
}

const HostProfile = ({ retreats, savedRetreats, onToggleSaveRetreat, followedHosts, onToggleFollowHost }: HostProfileProps) => {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [selectedRetreat, setSelectedRetreat] = useState<RetreatDetail | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Find host retreats and host info
  const hostRetreats = retreats.filter(retreat => 
    retreat.organizer?.name.toLowerCase().replace(/\s+/g, '-') === hostId
  );

  const host = hostRetreats[0]?.organizer;

  // Mock social accounts for demo - in real app this would come from database
  const mockSocialAccounts = {
    linkedinUrl: 'https://www.linkedin.com/in/retreat-organizer',
    instagramUrl: 'https://www.instagram.com/mindfulretreats',
    twitterUrl: 'https://twitter.com/wellnessjourney'
  };

  if (!host) {
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

  const isFollowing = followedHosts.includes(host.name);

  const handleFollowClick = () => {
    if (!user) {
      alert('Please log in to follow hosts');
      return;
    }
    onToggleFollowHost(host.name);
  };

  const handleRetreatClick = (retreat: Retreat) => {
    const retreatDetail: RetreatDetail = {
      ...retreat,
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
              <AvatarImage src={host.avatar} alt={host.name} />
              <AvatarFallback className="text-2xl">
                {host.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {host.name}
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                Retreat Organizer & Wellness Coach
              </p>
              <p className="text-foreground leading-relaxed max-w-2xl">
                Creating transformative experiences that connect mind, body, and spirit. 
                Join me on a journey of self-discovery and personal growth.
              </p>
              
              {/* Social Links */}
              <div className="mt-4">
                <SocialLinksDisplay socialAccounts={mockSocialAccounts} />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
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

        {/* Retreats Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Retreats by {host.name} ({hostRetreats.length})
          </h2>
          
          {hostRetreats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hostRetreats.map((retreat) => (
                <RetreatCard
                  key={retreat.id}
                  image={retreat.image}
                  location={retreat.location}
                  date={retreat.date}
                  title={retreat.title}
                  onClick={() => handleRetreatClick(retreat)}
                  isSaved={savedRetreats.includes(retreat.id)}
                  onToggleSave={() => onToggleSaveRetreat(retreat.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-background rounded-2xl border border-border">
              <p className="text-muted-foreground text-lg">
                No public retreats available at this time.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Retreat Details Modal */}
      <RetreatDetailsModal
        retreat={selectedRetreat}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        savedRetreats={savedRetreats}
        onToggleSaveRetreat={onToggleSaveRetreat}
        followedHosts={followedHosts}
        onToggleFollowHost={onToggleFollowHost}
      />
    </div>
  );
};

export default HostProfile;

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/AuthModal";
import { AccountModal } from "@/components/AccountModal";
import { RetreatCreationModal } from "@/components/RetreatCreationModal";
import { VoiceOnboardingModal } from "@/components/VoiceOnboarding";
import { Retreat } from "@/components/RetreatGrid";
import { RetreatEditor, RetreatDetails } from "@/components/RetreatEditor";
import { BrandData } from "@/components/BrandEditor";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { BrandLogo } from "@/components/BrandLogo";

interface NavigationProps {
  onCreateRetreat?: (retreat: Omit<Retreat, 'id'>) => void;
  userRetreats?: Retreat[];
  currentView?: 'home' | 'editor';
  onViewChange?: (view: 'home' | 'editor') => void;
  editingRetreat?: RetreatDetails | null;
  onEditRetreat?: (retreat: RetreatDetails) => void;
  savedRetreats?: number[];
  followedHosts?: string[];
  retreats?: Retreat[];
  userBrandData?: BrandData;
  onSaveBrandData?: (brandData: BrandData) => void;
}

export const Navigation = ({ 
  onCreateRetreat, 
  userRetreats = [], 
  currentView = 'home', 
  onViewChange, 
  editingRetreat, 
  onEditRetreat, 
  savedRetreats = [], 
  followedHosts = [], 
  retreats = [], 
  userBrandData, 
  onSaveBrandData 
}: NavigationProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isRetreatModalOpen, setIsRetreatModalOpen] = useState(false);
  const [isVoiceOnboardingOpen, setIsVoiceOnboardingOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; profile?: any } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: { name: string; email: string; profile?: any }, isFirstSignIn = false) => {
    setUser(userData);
    
    // Show voice onboarding for first-time sign-ins if no profile exists
    if (isFirstSignIn && !userData.profile?.onboardingCompleted) {
      setIsVoiceOnboardingOpen(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    navigate('/');
  };

  const handleUpdateUser = (userData: { name: string; email: string }) => {
    setUser(userData);
  };

  const handleBecomeHost = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsRetreatModalOpen(true);
    }
  };

  const handleEditRetreat = (retreat: Retreat) => {
    // Convert Retreat to RetreatDetails for editing
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
      isPublished: false // Start as draft when editing existing retreat
    };
    
    if (onEditRetreat) {
      onEditRetreat(retreatDetails);
    }
    setIsAccountModalOpen(false);
  };
  return (
    <nav className="w-full bg-background border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <BrandLogo />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-6">
          <Link to="/experiences" className="text-foreground hover:text-neon-cyan transition-colors font-medium">
            Experiences
          </Link>
          <Link to="/community" className="text-foreground hover:text-neon-cyan transition-colors font-medium">
            Community
          </Link>
          
          {/* Create Experience Button */}
          {user ? (
            <Link to="/create">
              <Button 
                variant="outline" 
                className="bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background transition-all font-semibold"
              >
                Create Experience
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline" 
              className="bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background transition-all font-semibold"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Create Experience
            </Button>
          )}
          
          {/* Notification Bell - only show when user is logged in */}
          {user && <NotificationDropdown />}
          
          {user ? (
            <Link to="/account">
              <Button 
                variant="default" 
                className="bg-neon-pink text-background hover:bg-neon-purple shadow-neon"
              >
                My Account
              </Button>
            </Link>
          ) : (
            <Button 
              variant="default" 
              className="bg-neon-pink text-background hover:bg-neon-purple shadow-neon font-bold px-6"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Get Early Access
            </Button>
          )}

          {/* Auth control (top-right): Login or Logout */}
          {user ? (
            <Button
              variant="outline"
              className="bg-transparent border-white/20 text-foreground hover:bg-white/10"
              onClick={handleLogout}
            >
              Log out
            </Button>
          ) : (
            <Button
              variant="outline"
              className="bg-transparent border-white/20 text-foreground hover:bg-white/10"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Log in
            </Button>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin}
      />
      
      <VoiceOnboardingModal
        isOpen={isVoiceOnboardingOpen}
        onClose={() => setIsVoiceOnboardingOpen(false)}
        onComplete={() => setIsVoiceOnboardingOpen(false)}
        isFirstSignIn={true}
      />

      <AccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
        user={user}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
        userRetreats={userRetreats}
        onEditRetreat={handleEditRetreat}
        savedRetreats={savedRetreats}
        followedHosts={followedHosts}
        retreats={retreats}
        userBrandData={userBrandData}
        onSaveBrandData={onSaveBrandData}
      />
      
      <RetreatCreationModal 
        isOpen={isRetreatModalOpen} 
        onClose={() => setIsRetreatModalOpen(false)} 
        onCreateRetreat={onCreateRetreat}
      />
    </nav>
  );
};
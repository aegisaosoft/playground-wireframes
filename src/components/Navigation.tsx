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
import { useUser } from "@/contexts/UserContext";
import { Settings } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout: contextLogout, login } = useUser();
  const navigate = useNavigate();

  const handleLogin = (userData: { name: string; email: string; profile?: any }, isFirstSignIn = false) => {
    // Transform userData to match UserProfile interface
    const userProfile = {
      id: userData.email, // Use email as ID for now
      email: userData.email,
      name: userData.name,
      role: userData.profile?.role || 'user',
      isEmailVerified: userData.profile?.isEmailVerified || false,
      isActive: userData.profile?.isActive || true,
      createdAt: new Date().toISOString(),
      profileImageUrl: userData.profile?.profileImageUrl
    };
    
    login(userProfile);
    
    // Show voice onboarding for first-time sign-ins if no profile exists
    if (isFirstSignIn && !userData.profile?.onboardingCompleted) {
      setIsVoiceOnboardingOpen(true);
    }
  };

  const handleLogout = () => {
    contextLogout(); // Use context logout
    navigate('/');
  };

  const handleUpdateUser = (userData: { name: string; email: string }) => {
    // Update user data through the context
    if (user) {
      login({ ...user, name: userData.name, email: userData.email });
    }
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
  const isAdmin = !!(user && (
    (/admin/i.test((user as any).role || '')) ||
    (/admin/i.test((user as any).profile?.role || ''))
  ));
  return (
    <nav className="w-full bg-background border-b border-border px-4 py-3 md:px-6 md:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <BrandLogo />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
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

          {/* Admin Settings button (between Create Experience and login) */}
          {user && isAdmin && (
            <Link to="/settings" title="Settings">
              <Button variant="ghost" className="p-2 hover:bg-white/10 text-foreground">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          )}
          
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
            <div className="flex flex-col items-start">
              <Button
                variant="outline"
                className="bg-transparent border-white/20 text-foreground hover:bg-white/10"
                onClick={handleLogout}
              >
                Log out
              </Button>
              <span className="text-xs text-white/70 mt-1">
                {user.name}
              </span>
            </div>
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

        {/* Mobile: hamburger + condensed actions */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <Link to="/account">
              <Button 
                variant="default" 
                className="bg-neon-pink text-background hover:bg-neon-purple shadow-neon h-9 px-3"
              >
                Account
              </Button>
            </Link>
          )}
          <button
            aria-label="Open menu"
            className="p-2 rounded-md border border-white/20 text-foreground"
            onClick={() => setIsMobileMenuOpen(v => !v)}
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
            <Link
              to="/experiences"
              className="block text-foreground hover:text-neon-cyan font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Experiences
            </Link>
            <Link
              to="/community"
              className="block text-foreground hover:text-neon-cyan font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Community
            </Link>

            {/* Create Experience */}
            {user ? (
              <Link to="/create" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background transition-all font-semibold"
                >
                  Create Experience
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                className="w-full bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background transition-all font-semibold"
                onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
              >
                Create Experience
              </Button>
            )}

            {/* Admin settings */}
            {user && isAdmin && (
              <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-white/10">
                  Settings
                </Button>
              </Link>
            )}

            {/* Auth controls */}
            {user ? (
              <Button
                variant="outline"
                className="w-full bg-transparent border-white/20 text-foreground hover:bg-white/10"
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              >
                Log out
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full bg-transparent border-white/20 text-foreground hover:bg-white/10"
                onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
              >
                Log in
              </Button>
            )}
          </div>
        </div>
      )}

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
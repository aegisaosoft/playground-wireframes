import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/AuthModal";
import { AccountModal } from "@/components/AccountModal";
import { RetreatCreationModal } from "@/components/RetreatCreationModal";
import { Retreat } from "@/components/RetreatGrid";
import { RetreatEditor, RetreatDetails } from "@/components/RetreatEditor";
import { BrandData } from "@/components/BrandEditor";
import { NotificationDropdown } from "@/components/NotificationDropdown";

interface NavigationProps {
  onCreateRetreat: (retreat: Omit<Retreat, 'id'>) => void;
  userRetreats: Retreat[];
  currentView: 'home' | 'editor';
  onViewChange: (view: 'home' | 'editor') => void;
  editingRetreat?: RetreatDetails | null;
  onEditRetreat?: (retreat: RetreatDetails) => void;
  savedRetreats: number[];
  followedHosts: string[];
  retreats: Retreat[];
  userBrandData?: BrandData;
  onSaveBrandData?: (brandData: BrandData) => void;
}

export const Navigation = ({ onCreateRetreat, userRetreats, currentView, onViewChange, editingRetreat, onEditRetreat, savedRetreats, followedHosts, retreats, userBrandData, onSaveBrandData }: NavigationProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isRetreatModalOpen, setIsRetreatModalOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
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
    <nav className="w-full bg-background border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-foreground hover:text-neon-pink transition-colors">
            <span className="text-neon-pink">Play</span>ground
          </Link>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-6">
          <Link to="#" className="text-foreground hover:text-neon-cyan transition-colors font-medium">
            Experiences
          </Link>
          <Link to="#" className="text-foreground hover:text-neon-cyan transition-colors font-medium">
            Community
          </Link>
          <Link to="#" className="text-foreground hover:text-neon-cyan transition-colors font-medium">
            About
          </Link>
          
          {/* Notification Bell - only show when user is logged in */}
          {user && <NotificationDropdown />}
          
          {user ? (
            <Button 
              variant="default" 
              className="bg-neon-pink text-background hover:bg-neon-purple shadow-neon"
              onClick={() => setIsAccountModalOpen(true)}
            >
              My Account
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="bg-neon-pink text-background hover:bg-neon-purple shadow-neon font-bold px-6"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Join the Waitlist
            </Button>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin}
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
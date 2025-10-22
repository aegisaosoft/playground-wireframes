import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BrandPage } from "@/pages/BrandPage";

// Mock data - in a real app this would come from a context or props
const mockRetreats = [
  {
    id: 1,
    title: "Mindful Mountain Retreat",
    location: "Swiss Alps",
    date: "March 15-22, 2024",
    image: "/default-retreat-banner.png",
    organizer: {
      name: "Mindful Wellness Co.",
      avatar: "/avatars/default-avatar.png"
    }
  },
  {
    id: 2,
    title: "Ocean Meditation Escape",
    location: "Bali, Indonesia",
    date: "April 10-17, 2024",
    image: "/default-retreat-banner.png",
    organizer: {
      name: "Mindful Wellness Co.",
      avatar: "/avatars/default-avatar.png"
    }
  }
];

export const BrandPageWrapper = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const [savedRetreats, setSavedRetreats] = useState<number[]>([]);
  const [followedHosts, setFollowedHosts] = useState<string[]>([]);
  
  console.log('BrandPageWrapper mounted with brandId:', brandId);

  useEffect(() => {
    // Load user preferences from localStorage
    const storedSavedRetreats = localStorage.getItem('savedRetreats');
    if (storedSavedRetreats) {
      setSavedRetreats(JSON.parse(storedSavedRetreats));
    }

    const storedFollowedHosts = localStorage.getItem('followedHosts');
    if (storedFollowedHosts) {
      setFollowedHosts(JSON.parse(storedFollowedHosts));
    }
  }, []);

  const handleToggleSaveRetreat = (retreatId: number) => {
    const newSavedRetreats = savedRetreats.includes(retreatId)
      ? savedRetreats.filter(id => id !== retreatId)
      : [...savedRetreats, retreatId];
    
    setSavedRetreats(newSavedRetreats);
    localStorage.setItem('savedRetreats', JSON.stringify(newSavedRetreats));
  };

  const handleToggleFollowHost = (hostName: string) => {
    const newFollowedHosts = followedHosts.includes(hostName)
      ? followedHosts.filter(name => name !== hostName)
      : [...followedHosts, hostName];
    
    setFollowedHosts(newFollowedHosts);
    localStorage.setItem('followedHosts', JSON.stringify(newFollowedHosts));
  };

  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };
  
  return (
    <div>
      {/* Back Button */}
      <div className="container mx-auto px-6 py-4">
        <Button 
          variant="ghost" 
          onClick={handleBackClick}
          className="text-foreground hover:text-coral"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      
      <BrandPage
        retreats={mockRetreats}
        savedRetreats={savedRetreats}
        followedHosts={followedHosts}
        onToggleSaveRetreat={handleToggleSaveRetreat}
        onToggleFollowHost={handleToggleFollowHost}
      />
    </div>
  );
};
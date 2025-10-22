import { ReactNode, useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Retreat } from "@/components/RetreatGrid";
import { RetreatDetails } from "@/components/RetreatEditor";
import { BrandData } from "@/components/BrandEditor";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [userRetreats, setUserRetreats] = useState<Retreat[]>([]);
  const [savedRetreats, setSavedRetreats] = useState<number[]>([]);
  const [followedHosts, setFollowedHosts] = useState<string[]>([]);
  const [userBrandData, setUserBrandData] = useState<BrandData>();

  // Mock retreats data for navigation
  const mockRetreats: Retreat[] = [
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
    }
  ];

  useEffect(() => {
    // Load user data from localStorage
    const storedSavedRetreats = localStorage.getItem('savedRetreats');
    if (storedSavedRetreats) {
      setSavedRetreats(JSON.parse(storedSavedRetreats));
    }

    const storedFollowedHosts = localStorage.getItem('followedHosts');
    if (storedFollowedHosts) {
      setFollowedHosts(JSON.parse(storedFollowedHosts));
    }
  }, []);

  const handleCreateRetreat = (retreat: Omit<Retreat, 'id'>) => {
    const newRetreat: Retreat = {
      ...retreat,
      id: Date.now() // Simple ID generation for demo
    };
    setUserRetreats(prev => [...prev, newRetreat]);
  };

  const handleEditRetreat = (retreat: RetreatDetails) => {
    // Handle retreat editing logic
    console.log('Edit retreat:', retreat);
  };

  const handleSaveBrandData = (brandData: BrandData) => {
    setUserBrandData(brandData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onCreateRetreat={handleCreateRetreat}
        userRetreats={userRetreats}
        currentView="home"
        onViewChange={() => {}}
        savedRetreats={savedRetreats}
        followedHosts={followedHosts}
        retreats={mockRetreats}
        userBrandData={userBrandData}
        onSaveBrandData={handleSaveBrandData}
        onEditRetreat={handleEditRetreat}
      />
      <main>
        {children}
      </main>
    </div>
  );
};
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import PlaygroundHero from "@/components/PlaygroundHero";
import ExperiencesSection from "@/components/ExperiencesSection";
import { RetreatGrid, Retreat } from "@/components/RetreatGrid";
import { RetreatDetailsModal, RetreatDetail } from "@/components/RetreatDetailsModal";
import { RetreatEditor, RetreatDetails } from "@/components/RetreatEditor";
import { BrandSuccessModal } from "@/components/BrandSuccessModal";
import { BrandEditor, BrandData } from "@/components/BrandEditor";
import retreatBali from "@/assets/retreat-bali.jpg";
import retreatCostaRica from "@/assets/retreat-costa-rica.jpg";
import retreatTulum from "@/assets/retreat-tulum.jpg";
import retreatPortugal from "@/assets/retreat-portugal.jpg";
import retreatSwitzerland from "@/assets/retreat-switzerland.jpg";
import retreatGreece from "@/assets/retreat-greece.jpg";

const initialRetreats: Retreat[] = [
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
      name: "Sarah Williams",
      avatar: "/placeholder.svg",
      profileLink: "#"
    }
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
    }
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
    ]
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
    agendaVisibility: 'public'
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
    agendaVisibility: 'private'
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
    agendaVisibility: 'public'
  }
];

const Index = () => {
  const [retreats, setRetreats] = useState<Retreat[]>(initialRetreats);
  const [currentView, setCurrentView] = useState<'home' | 'editor'>('home');
  const [editingRetreat, setEditingRetreat] = useState<RetreatDetails | null>(null);
  const [selectedRetreat, setSelectedRetreat] = useState<RetreatDetail | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [savedRetreats, setSavedRetreats] = useState<number[]>([]);
  const [followedHosts, setFollowedHosts] = useState<string[]>([]);
  const [showBrandSuccessModal, setShowBrandSuccessModal] = useState(false);
  const [showBrandEditor, setShowBrandEditor] = useState(false);
  const [userBrandData, setUserBrandData] = useState<BrandData | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  // Load brand data from localStorage on app start
  useEffect(() => {
    const storedBrandData = localStorage.getItem('userBrandData');
    if (storedBrandData) {
      setUserBrandData(JSON.parse(storedBrandData));
    }
  }, []);

  const handleCreateRetreat = (newRetreat: Omit<Retreat, 'id'>) => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    setCurrentUser(user);
    
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

  const handleToggleSaveRetreat = (retreatId: number) => {
    setSavedRetreats(prev => 
      prev.includes(retreatId) 
        ? prev.filter(id => id !== retreatId)
        : [...prev, retreatId]
    );
  };

  const handleToggleFollowHost = (hostName: string) => {
    setFollowedHosts(prev => 
      prev.includes(hostName) 
        ? prev.filter(name => name !== hostName)
        : [...prev, hostName]
    );
  };

  const handleCustomizeBrand = () => {
    setShowBrandSuccessModal(false);
    setShowBrandEditor(true);
  };

  const handleSaveBrandData = (brandData: BrandData) => {
    setUserBrandData(brandData);
    // In a real app, this would save to backend/localStorage
    localStorage.setItem('userBrandData', JSON.stringify(brandData));
  };

  // Filter retreats to show only user's retreats (for demo purposes, we'll show all)
  const userRetreats = retreats;

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
        hostName={currentUser?.name || "Host"}
      />

      {/* Brand Editor */}
      <BrandEditor
        isOpen={showBrandEditor}
        onClose={() => setShowBrandEditor(false)}
        onSave={handleSaveBrandData}
        hostName={currentUser?.name || "Host"}
        initialData={userBrandData || undefined}
      />
    </div>
  );
};

export default Index;
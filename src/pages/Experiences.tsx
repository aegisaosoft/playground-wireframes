import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User, Plus, Loader2 } from "lucide-react";
import { VoiceExperienceModal } from '@/components/VoiceExperienceCreation';
import { VoiceExperienceDraft } from '@/types/voiceExperienceCreation';
import { AuthModal } from '@/components/AuthModal';
import { searchExperiences } from '@/utils/searchExperiences';
import { HomeSearchBar } from '@/components/HomeSearchBar';
import { experiencesService } from '@/services/experiences.service';
import { useToast } from '@/hooks/use-toast';

// Mock data for experiences
const mockExperiences = [
  {
    id: "1",
    title: "Hacker House Bali",
    location: "Ubud, Bali",
    dates: "Mar 15-22, 2024",
    host: { name: "TechCorp", id: "techcorp" },
    image: "/src/assets/retreat-bali.jpg",
    description: "7-day intensive coding retreat in tropical paradise. Build, ship, and network with fellow developers.",
    category: "Tech",
    price: "$899"
  },
  {
    id: "2", 
    title: "Yoga & Meditation Retreat",
    location: "Rishikesh, India",
    dates: "Apr 10-17, 2024",
    host: { name: "Mindful Journey", id: "mindful" },
    image: "/src/assets/retreat-greece.jpg",
    description: "Ancient wisdom meets modern wellness. Transform your practice in the yoga capital of the world.",
    category: "Wellness",
    price: "$599"
  },
  {
    id: "3",
    title: "Digital Nomad Mastermind",
    location: "Lisbon, Portugal", 
    dates: "May 5-12, 2024",
    host: { name: "Remote Collective", id: "remote-collective" },
    image: "/src/assets/retreat-portugal.jpg",
    description: "Level up your remote business while exploring Europe's most vibrant startup city.",
    category: "Business",
    price: "$750"
  },
  {
    id: "4",
    title: "Alpine Adventure Camp",
    location: "Zermatt, Switzerland",
    dates: "Jun 20-27, 2024", 
    host: { name: "Mountain Guides", id: "mountain-guides" },
    image: "/src/assets/retreat-switzerland.jpg",
    description: "Epic hiking, climbing, and outdoor adventures in the heart of the Swiss Alps.",
    category: "Adventure",
    price: "$1200"
  },
  {
    id: "5",
    title: "Wellness & Sacred Geometry",
    location: "Tulum, Mexico",
    dates: "Jul 8-15, 2024",
    host: { name: "Sacred Spaces", id: "sacred-spaces" },
    image: "/src/assets/retreat-tulum.jpg", 
    description: "Healing arts, sound baths, and consciousness expansion in a magical jungle setting.",
    category: "Wellness",
    price: "$850"
  },
  {
    id: "6",
    title: "Mediterranean Culinary Journey",
    location: "Santorini, Greece",
    dates: "Aug 12-19, 2024",
    host: { name: "Chef Masters", id: "chef-masters" },
    image: "/src/assets/retreat-costa-rica.jpg",
    description: "Master Mediterranean cuisine while island-hopping through Greece's most beautiful destinations.",
    category: "Culinary", 
    price: "$950"
  }
];

const categoryColors = {
  Tech: "bg-neon-cyan text-background",
  Wellness: "bg-neon-green text-background", 
  Business: "bg-neon-purple text-background",
  Adventure: "bg-neon-orange text-background",
  Culinary: "bg-neon-yellow text-background"
};

export default function Experiences() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [experiences, setExperiences] = useState<any[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<any[]>([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; profile?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchExperiences = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch from real API
      const data = await experiencesService.getAll();
      
      // Transform API data to match the component's expected format
      const transformedData = data.map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        location: exp.location,
        dates: exp.date || exp.dates || 'TBA',
        host: { 
          name: exp.hostName || exp.host?.name || 'Unknown Host', 
          id: exp.hostId || exp.host?.id || 'unknown' 
        },
        image: exp.image || exp.featuredImageUrl || null,
        description: exp.description || '',
        category: exp.category || 'Tech',
        price: exp.price ? `$${(exp.price / 100).toFixed(0)}` : 'Free'
      }));

      setExperiences(transformedData);
      setFilteredExperiences(transformedData);
      
      // Only show success toast if we have data
      if (transformedData.length > 0) {
        toast({
          title: "Experiences Loaded",
          description: `Loaded ${transformedData.length} experiences from API`,
        });
      }
    } catch (err) {
      console.error('Failed to fetch experiences:', err);
      setError('Failed to load experiences from API');
      
      // Set empty arrays instead of falling back to mock data
      setExperiences([]);
      setFilteredExperiences([]);
      
      toast({
        title: "API Error",
        description: "Could not connect to API. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData: { name: string; email: string; profile?: any }) => {
    setUser(userData);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredExperiences(experiences);
      return;
    }

    try {
      // Try to search via API
      const results = await experiencesService.search(query);
      
      // Transform API results
      const transformedResults = results.map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        location: exp.location,
        dates: exp.date || exp.dates || 'TBA',
        host: { 
          name: exp.hostName || exp.host?.name || 'Unknown Host', 
          id: exp.hostId || exp.host?.id || 'unknown' 
        },
        image: exp.image || '/src/assets/retreat-bali.jpg',
        description: exp.description || '',
        category: exp.category || 'Tech',
        price: exp.price ? `$${(exp.price / 100).toFixed(0)}` : 'Free'
      }));
      
      setFilteredExperiences(transformedResults);
    } catch (err) {
      console.error('Search failed, using local filter:', err);
      // Fallback to local search if API fails
      const filtered = searchExperiences(query, experiences);
      setFilteredExperiences(filtered);
    }
  };

  const handleCreateExperience = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      window.location.href = '/create';
    }
  };

  const handleVoiceExperience = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowVoiceModal(true);
    }
  };

  const handleVoiceDraftCreated = (draft: VoiceExperienceDraft) => {
    // Store the draft and navigate to builder
    localStorage.setItem('voiceExperienceDraft', JSON.stringify(draft));
    window.location.href = '/experience-builder?fromVoice=true';
  };

  // Fetch experiences from API on mount
  useEffect(() => {
    fetchExperiences();
  }, []);

  // Handle URL search params
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Check for query parameter from URL
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setSearchQuery(urlQuery);
      void handleSearch(urlQuery);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-dark">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-neon bg-clip-text text-transparent">
                Discover Experiences
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find your next transformative journey. From tech retreats to wellness escapes, 
              discover unique experiences crafted by inspiring hosts worldwide.
            </p>
          </div>

          {/* Create Experience CTAs */}
          <div className="flex justify-center mb-8">
            <Button 
              onClick={handleCreateExperience}
              className="bg-gradient-neon text-background hover:opacity-90 shadow-neon px-8"
            > 
              <Plus className="w-4 h-4 mr-2" />
              Create Experience
            </Button>
          </div>

          {/* Search Bar */}
          <HomeSearchBar />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-neon-cyan mb-4" />
            <p className="text-muted-foreground">Loading experiences from API...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-red-500 mb-2">API Connection Issue</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={fetchExperiences}
              className="mt-4 bg-neon-cyan text-background"
            >
              Retry Connection
            </Button>
          </div>
        )}

        {/* Search Results Header */}
        {!isLoading && searchQuery && (
          <div className="mb-8">
            <p className="text-muted-foreground">
              {filteredExperiences.length} results for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Experiences Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExperiences.map((experience) => (
            <Card key={experience.id} className="bg-card border-gray-800 hover:border-neon-cyan/50 transition-all duration-300 group overflow-hidden">
              {experience.image ? (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={experience.image} 
                    alt={experience.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={categoryColors[experience.category as keyof typeof categoryColors]}>
                      {experience.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-black/70 text-white border-0">
                      {experience.price}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-background to-muted flex items-center justify-center">
                  <div className="text-muted-foreground text-4xl">📸</div>
                  <div className="absolute top-4 left-4">
                    <Badge className={categoryColors[experience.category as keyof typeof categoryColors]}>
                      {experience.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-black/70 text-white border-0">
                      {experience.price}
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-xl group-hover:text-neon-cyan transition-colors">
                  <Link to={`/experience/${experience.id}`}>
                    {experience.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {experience.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-neon-cyan" />
                    {experience.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 text-neon-purple" />
                    {experience.dates}
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-neon-pink" />
                    <span className="text-muted-foreground">by </span>
                    <Link 
                      to={`/host/${experience.host.id}`}
                      className="text-neon-pink hover:text-neon-purple transition-colors ml-1"
                    >
                      {experience.host.name}
                    </Link>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={`/experience/${experience.id}`}>
                    <Button 
                      className="w-full bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background transition-all"
                      variant="outline"
                    >
                      View Experience
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && filteredExperiences.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold mb-4">No experiences found</h3>
            <p className="text-muted-foreground mb-8">
              Try adjusting your search terms or browse all experiences below.
            </p>
            <Button 
              onClick={() => handleSearch("")}
              className="bg-neon-pink text-background hover:bg-neon-purple"
            >
              Show All Experiences
            </Button>
          </div>
        )}

        {/* No Experiences Available Message */}
        {!isLoading && !error && filteredExperiences.length === 0 && !searchQuery && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-neon flex items-center justify-center">
                <Plus className="w-12 h-12 text-background" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">No experiences yet</h3>
              <p className="text-muted-foreground mb-8">
                Be the first to create an amazing experience and inspire others to join your journey.
              </p>
              <Button 
                onClick={handleCreateExperience}
                className="bg-gradient-neon text-background hover:opacity-90 shadow-neon px-8"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Experience
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Creation Modal */}
      <VoiceExperienceModal 
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onPrefillBuilder={handleVoiceDraftCreated}
      />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
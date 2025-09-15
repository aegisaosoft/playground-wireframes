import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, User, Mic, Plus } from "lucide-react";
import { VoiceExperienceModal } from '@/components/VoiceExperienceCreation';
import { VoiceExperienceDraft } from '@/types/voiceExperienceCreation';

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExperiences, setFilteredExperiences] = useState(mockExperiences);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredExperiences(mockExperiences);
      return;
    }

    // Simple mock search that matches title, location, description, or category
    const filtered = mockExperiences.filter(exp => 
      exp.title.toLowerCase().includes(query.toLowerCase()) ||
      exp.location.toLowerCase().includes(query.toLowerCase()) ||
      exp.description.toLowerCase().includes(query.toLowerCase()) ||
      exp.category.toLowerCase().includes(query.toLowerCase()) ||
      exp.host.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredExperiences(filtered);
  };

  const handleVoiceDraftCreated = (draft: VoiceExperienceDraft) => {
    // Store the draft and navigate to builder
    localStorage.setItem('voiceExperienceDraft', JSON.stringify(draft));
    window.location.href = '/experience-builder?fromVoice=true';
  };

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
          <div className="flex gap-4 justify-center mb-8">
            <Link to="/experience-builder">
              <Button className="bg-gradient-neon text-background hover:opacity-90 shadow-neon px-8">
                <Plus className="w-4 h-4 mr-2" />
                Create Experience
              </Button>
            </Link>
            <Button 
              onClick={() => setShowVoiceModal(true)}
              variant="outline" 
              className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 px-8"
            >
              <Mic className="w-4 h-4 mr-2" />
              Create with Voice
            </Button>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for experiences... (e.g., 'hacker house in Bali', 'yoga retreat India')"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-card border-gray-800 focus:border-neon-cyan focus:ring-neon-cyan/20"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {searchQuery && (
          <div className="mb-8">
            <p className="text-muted-foreground">
              {filteredExperiences.length} results for "{searchQuery}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExperiences.map((experience) => (
            <Card key={experience.id} className="bg-card border-gray-800 hover:border-neon-cyan/50 transition-all duration-300 group overflow-hidden">
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

        {filteredExperiences.length === 0 && searchQuery && (
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
      </div>

      {/* Voice Creation Modal */}
      <VoiceExperienceModal 
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onPrefillBuilder={handleVoiceDraftCreated}
      />
    </div>
  );
}
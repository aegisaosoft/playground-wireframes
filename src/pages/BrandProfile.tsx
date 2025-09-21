import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Globe, Instagram, Twitter, Heart, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SocialLinksDisplay } from "@/components/SocialLinksDisplay";

// Mock AI review summary data
const mockAISummary = {
  "techcorp": {
    summary: "Participants consistently praise TechCorp's hands-on approach to learning and the high-quality mentorship provided. The combination of intensive coding sessions with beautiful locations creates an inspiring environment that enhances both productivity and networking opportunities.",
    keywords: ["hands-on learning", "great mentorship", "inspiring environment", "strong community", "practical skills", "excellent networking"]
  },
  "mindful": {
    summary: "Reviews highlight the authentic and transformative nature of Mindful Journey's experiences. Participants appreciate the genuine spiritual guidance, peaceful settings, and the lasting impact on their meditation practice and overall well-being.",
    keywords: ["transformative", "authentic guidance", "peaceful settings", "spiritual growth", "lasting impact", "genuine teaching"]
  },
  "remote-collective": {
    summary: "The Remote Collective excels at creating valuable connections between digital nomads and remote professionals. Participants value the business insights, cultural immersion, and the supportive community that continues beyond the experience.",
    keywords: ["valuable connections", "business insights", "cultural immersion", "supportive community", "professional growth", "ongoing relationships"]
  },
  "mountain-guides": {
    summary: "Mountain Guides consistently receives praise for their safety standards, expert knowledge, and ability to create confidence-building experiences. Participants highlight the professional guidance and the personal growth achieved through challenging adventures.",
    keywords: ["excellent safety", "expert knowledge", "confidence building", "professional guidance", "personal growth", "challenging adventures"]
  },
  "sacred-spaces": {
    summary: "Participants describe Sacred Spaces experiences as deeply meaningful and consciousness-expanding. The authentic shamanic practices, healing environments, and personal transformation aspects are frequently highlighted in reviews.",
    keywords: ["deeply meaningful", "consciousness expanding", "authentic practices", "healing environment", "personal transformation", "spiritual connection"]
  },
  "chef-masters": {
    summary: "Chef Masters delivers exceptional culinary education with authentic local ingredients and traditional techniques. Participants appreciate the cultural immersion, hands-on cooking, and the lasting culinary skills gained.",
    keywords: ["exceptional education", "authentic ingredients", "traditional techniques", "cultural immersion", "hands-on learning", "lasting skills"]
  }
};

// Mock host data
const mockHosts = {
  "techcorp": {
    id: "techcorp",
    name: "TechCorp",
    type: "company",
    avatar: "/placeholder.svg",
    coverImage: "/src/assets/retreat-bali.jpg",
    bio: "Building the future of remote work through immersive tech experiences. We bring together developers, designers, and entrepreneurs for transformative coding retreats.",
    mission: "Empowering the next generation of digital creators through hands-on learning, community building, and innovative project development.",
    website: "https://techcorp.dev", 
    social: {
      instagram: "@techcorp_retreats",
      twitter: "@techcorp"
    },
    followers: 2840,
    rating: 4.9,
    totalReviews: 127
  },
  "mindful": {
    id: "mindful", 
    name: "Mindful Journey",
    type: "individual",
    avatar: "/placeholder.svg",
    coverImage: "/src/assets/retreat-greece.jpg",
    bio: "Certified yoga instructor and meditation guide with 15+ years of experience. Passionate about sharing ancient wisdom through modern wellness practices.",
    mission: "Creating sacred spaces for personal transformation and spiritual growth through authentic yoga and meditation experiences.",
    website: "https://mindfuljourney.com",
    social: {
      instagram: "@mindful_journey",
      twitter: "@mindfulyoga"
    },
    followers: 1560,
    rating: 5.0,
    totalReviews: 89
  },
  "remote-collective": {
    id: "remote-collective",
    name: "Remote Collective",
    type: "company",
    avatar: "/placeholder.svg",
    coverImage: "/src/assets/retreat-portugal.jpg",
    bio: "A global community of digital nomads, entrepreneurs, and remote workers building the future of location-independent work.",
    mission: "Connecting remote professionals worldwide through immersive experiences that combine business growth with cultural exploration.",
    website: "https://remotecollective.co",
    social: {
      instagram: "@remote_collective",
      twitter: "@remotecollective"
    },
    followers: 3200,
    rating: 4.8,
    totalReviews: 156
  },
  "mountain-guides": {
    id: "mountain-guides",
    name: "Mountain Guides",
    type: "company",
    avatar: "/placeholder.svg",
    coverImage: "/src/assets/retreat-switzerland.jpg",
    bio: "Professional mountain guides with over 20 years of experience leading expeditions in the world's most stunning alpine environments.",
    mission: "Sharing the transformative power of mountains through safe, inspiring, and unforgettable outdoor adventures.",
    website: "https://mountainguides.ch",
    social: {
      instagram: "@mountain_guides_swiss",
      twitter: "@mountainguides"
    },
    followers: 1890,
    rating: 4.9,
    totalReviews: 203
  },
  "sacred-spaces": {
    id: "sacred-spaces",
    name: "Sacred Spaces",
    type: "individual",
    avatar: "/placeholder.svg",
    coverImage: "/src/assets/retreat-tulum.jpg",
    bio: "Shamanic practitioner and consciousness facilitator creating healing experiences in sacred locations around the world.",
    mission: "Awakening human potential through ancient wisdom practices, sound healing, and connection with sacred geometry.",
    website: "https://sacredspaces.mx",
    social: {
      instagram: "@sacred_spaces_tulum",
      twitter: "@sacredspaces"
    },
    followers: 2100,
    rating: 4.7,
    totalReviews: 98
  },
  "chef-masters": {
    id: "chef-masters",
    name: "Chef Masters",
    type: "company",
    avatar: "/placeholder.svg",
    coverImage: "/src/assets/retreat-costa-rica.jpg",
    bio: "Award-winning culinary experts offering immersive cooking experiences in the world's most beautiful destinations.",
    mission: "Celebrating cultural heritage through authentic cuisine while creating unforgettable culinary journeys.",
    website: "https://chefmasters.gr",
    social: {
      instagram: "@chef_masters_greece",
      twitter: "@chefmasters"
    },
    followers: 2650,
    rating: 4.8,
    totalReviews: 134
  }
};

// Dynamic experiences based on host
const getExperiencesForHost = (hostId: string) => {
  const experiencesByHost = {
    "techcorp": {
      upcoming: [
        {
          id: "1",
          title: "Hacker House Bali", 
          location: "Ubud, Bali",
          dates: "Mar 15-22, 2024",
          image: "/src/assets/retreat-bali.jpg",
          category: "Tech",
          price: "$899",
          status: "Available"
        },
        {
          id: "7",
          title: "AI & Machine Learning Bootcamp",
          location: "San Francisco, CA", 
          dates: "Sep 10-17, 2024",
          image: "/src/assets/retreat-portugal.jpg",
          category: "Tech",
          price: "$1299",
          status: "Early Bird"
        }
      ],
      past: [
        {
          id: "8",
          title: "Blockchain Developer Workshop",
          location: "Miami, FL",
          dates: "Jan 8-15, 2024",
          image: "/src/assets/retreat-costa-rica.jpg", 
          category: "Tech",
          price: "$799"
        },
        {
          id: "9", 
          title: "React Native Intensive",
          location: "Austin, TX",
          dates: "Nov 12-19, 2023",
          image: "/src/assets/retreat-switzerland.jpg",
          category: "Tech", 
          price: "$699"
        }
      ]
    },
    "mindful": {
      upcoming: [
        {
          id: "2",
          title: "Yoga & Meditation Retreat",
          location: "Rishikesh, India",
          dates: "Apr 10-17, 2024",
          image: "/src/assets/retreat-greece.jpg",
          category: "Wellness",
          price: "$599",
          status: "Available"
        }
      ],
      past: [
        {
          id: "10",
          title: "Mindfulness & Breathwork",
          location: "Bali, Indonesia",
          dates: "Feb 5-12, 2024",
          image: "/src/assets/retreat-bali.jpg",
          category: "Wellness",
          price: "$649"
        }
      ]
    },
    "remote-collective": {
      upcoming: [
        {
          id: "3",
          title: "Digital Nomad Mastermind",
          location: "Lisbon, Portugal", 
          dates: "May 5-12, 2024",
          image: "/src/assets/retreat-portugal.jpg",
          category: "Business",
          price: "$750",
          status: "Available"
        }
      ],
      past: [
        {
          id: "11",
          title: "Remote Work Summit",
          location: "Barcelona, Spain",
          dates: "Jan 15-22, 2024",
          image: "/src/assets/retreat-greece.jpg",
          category: "Business",
          price: "$699"
        }
      ]
    },
    "mountain-guides": {
      upcoming: [
        {
          id: "4",
          title: "Alpine Adventure Camp",
          location: "Zermatt, Switzerland",
          dates: "Jun 20-27, 2024", 
          image: "/src/assets/retreat-switzerland.jpg",
          category: "Adventure",
          price: "$1200",
          status: "Available"
        }
      ],
      past: [
        {
          id: "12",
          title: "Mont Blanc Expedition",
          location: "Chamonix, France",
          dates: "Aug 5-12, 2023",
          image: "/src/assets/retreat-costa-rica.jpg",
          category: "Adventure",
          price: "$1099"
        }
      ]
    },
    "sacred-spaces": {
      upcoming: [
        {
          id: "5",
          title: "Wellness & Sacred Geometry",
          location: "Tulum, Mexico",
          dates: "Jul 8-15, 2024",
          image: "/src/assets/retreat-tulum.jpg", 
          category: "Wellness",
          price: "$850",
          status: "Available"
        }
      ],
      past: [
        {
          id: "13",
          title: "Shamanic Journey Intensive",
          location: "Sedona, Arizona",
          dates: "Dec 10-17, 2023",
          image: "/src/assets/retreat-greece.jpg",
          category: "Wellness",
          price: "$799"
        }
      ]
    },
    "chef-masters": {
      upcoming: [
        {
          id: "6",
          title: "Mediterranean Culinary Journey",
          location: "Santorini, Greece",
          dates: "Aug 12-19, 2024",
          image: "/src/assets/retreat-costa-rica.jpg",
          category: "Culinary", 
          price: "$950",
          status: "Available"
        }
      ],
      past: [
        {
          id: "14",
          title: "Italian Cooking Masterclass",
          location: "Tuscany, Italy",
          dates: "Oct 8-15, 2023",
          image: "/src/assets/retreat-portugal.jpg",
          category: "Culinary",
          price: "$899"
        }
      ]
    }
  };

  return experiencesByHost[hostId as keyof typeof experiencesByHost] || { upcoming: [], past: [] };
};

const mockReviews = [
  {
    id: "1",
    author: "Sarah Chen",
    avatar: "/placeholder.svg",
    date: "2 weeks ago",
    experience: "Hacker House Bali",
    content: "Absolutely incredible experience! The combination of focused coding time and the beautiful Bali setting created the perfect environment for productivity and inspiration. Made lifelong connections with fellow developers."
  },
  {
    id: "2", 
    author: "Marcus Rodriguez",
    avatar: "/placeholder.svg",
    date: "1 month ago", 
    experience: "Blockchain Developer Workshop",
    content: "TechCorp's approach to hands-on learning is unmatched. Walked away with real skills and a deployed DApp. The mentorship was top-notch and the community aspect made it even better."
  },
  {
    id: "3",
    author: "Emily Foster", 
    avatar: "/placeholder.svg",
    date: "2 months ago",
    experience: "React Native Intensive", 
    content: "Great content and excellent instructors. The pace was challenging but manageable. Austin was a fantastic location and the networking opportunities were valuable."
  }
];

const categoryColors = {
  Tech: "bg-neon-cyan text-background",
  Wellness: "bg-neon-green text-background",
  Business: "bg-neon-purple text-background", 
  Adventure: "bg-neon-orange text-background",
  Culinary: "bg-neon-yellow text-background"
};

export default function BrandProfile() {
  const { hostId } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  
  const host = hostId ? mockHosts[hostId as keyof typeof mockHosts] : null;
  const hostExperiences = hostId ? getExperiencesForHost(hostId) : { upcoming: [], past: [] };

  // Mock social accounts for demo - in real app this would come from user data
  const mockSocialAccounts = {
    linkedinUrl: 'https://www.linkedin.com/in/sarah-wellness',
    instagramUrl: 'https://www.instagram.com/zenretreatspace',
    xUrl: 'https://x.com/techcorpevents'
  };

  if (!host) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Host Not Found</h1>
          <p className="text-muted-foreground mb-8">The host you're looking for doesn't exist.</p>
          <Link to="/experiences">
            <Button className="bg-neon-pink text-background hover:bg-neon-purple">
              Browse Experiences
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "Unfollowed" : "Following " + host.name);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link to="/experiences" className="inline-flex items-center text-muted-foreground hover:text-neon-cyan transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Experiences
        </Link>
      </div>

      {/* Cover Image & Profile Header */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={host.coverImage}
          alt={`${host.name} cover`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:w-1/3">
            <Card className="bg-card border-gray-800">
              <CardHeader className="text-center pb-4">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-neon-pink shadow-neon">
                  <AvatarImage src={host.avatar} alt={host.name} />
                  <AvatarFallback className="text-2xl bg-neon-pink text-background">
                    {host.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <CardTitle className="text-2xl">{host.name}</CardTitle>
                
                <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 text-neon-pink mr-1" />
                    {host.followers} followers
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={handleFollow}
                    className={isFollowing 
                      ? "flex-1 bg-gray-800 text-foreground hover:bg-gray-700" 
                      : "flex-1 bg-neon-pink text-background hover:bg-neon-purple"
                    }
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">{host.bio}</p>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h4 className="font-semibold mb-2">Connect</h4>
                    <SocialLinksDisplay socialAccounts={mockSocialAccounts} size="sm" />
                  </div>

                  <Separator className="bg-gray-800" />

                  <div>
                    <h4 className="font-semibold mb-2">Mission</h4>
                    <p className="text-sm text-muted-foreground">{host.mission}</p>
                  </div>

                  <Separator className="bg-gray-800" />

                  <div>
                    <h4 className="font-semibold mb-2">Connect</h4>
                    <div className="space-y-2">
                      <a 
                        href={host.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-neon-cyan hover:text-neon-purple transition-colors"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </a>
                      <a 
                        href={`https://instagram.com/${host.social.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-neon-cyan hover:text-neon-purple transition-colors"
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        {host.social.instagram}
                      </a>
                      <a 
                        href={`https://twitter.com/${host.social.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-neon-cyan hover:text-neon-purple transition-colors"
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        {host.social.twitter}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Content */}
          <div className="lg:w-2/3">
            {/* AI Review Summary */}
            <Card className="bg-card/50 border-gray-800 mb-8">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-neon-purple" />
                  <CardTitle className="text-xl">What people are saying</CardTitle>
                </div>
                <CardDescription className="text-foreground leading-relaxed">
                  {mockAISummary[hostId as keyof typeof mockAISummary]?.summary || "Great experiences with positive feedback from participants."}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-4">
                  {mockAISummary[hostId as keyof typeof mockAISummary]?.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-800 text-neon-cyan border-gray-700">
                      {keyword}
                    </Badge>
                  )) || []}
                </div>
              </CardHeader>
            </Card>

            {/* Upcoming Experiences */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Upcoming Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hostExperiences.upcoming.map((experience) => (
                  <Card key={experience.id} className="bg-card border-gray-800 hover:border-neon-cyan/50 transition-all group">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img 
                        src={experience.image}
                        alt={experience.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={`${categoryColors[experience.category as keyof typeof categoryColors]} text-xs`}>
                          {experience.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <Badge className="bg-background/80 text-neon-pink text-xs">
                          {experience.price}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg group-hover:text-neon-cyan transition-colors">
                          {experience.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2 text-neon-pink" />
                          {experience.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2 text-neon-purple" />
                          {experience.dates}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Past Experiences */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Past Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hostExperiences.past.map((experience) => (
                  <Card key={experience.id} className="bg-card border-gray-800 hover:border-gray-700 transition-all group">
                    <CardHeader className="flex-row items-start gap-4 pb-4">
                      <img 
                        src={experience.image}
                        alt={experience.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="space-y-2">
                        <Badge className={`${categoryColors[experience.category as keyof typeof categoryColors]} text-xs`}>
                          {experience.category}
                        </Badge>
                        <h3 className="font-semibold group-hover:text-neon-cyan transition-colors">
                          {experience.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2 text-neon-pink" />
                          {experience.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2 text-neon-purple" />
                          {experience.dates}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Reviews</h2>
              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <Card key={review.id} className="bg-card border-gray-800">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.avatar} alt={review.author} />
                          <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{review.author}</h4>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <span>{review.experience}</span>
                            <span>•</span>
                            <span>{review.date}</span>
                          </div>
                          
                          <p className="text-muted-foreground leading-relaxed">
                            {review.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
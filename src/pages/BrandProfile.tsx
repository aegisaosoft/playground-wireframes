import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Star, Globe, Instagram, Twitter, Heart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
  }
};

const mockExperiences = {
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
      price: "$799",
      rating: 4.8,
      reviews: 23
    },
    {
      id: "9", 
      title: "React Native Intensive",
      location: "Austin, TX",
      dates: "Nov 12-19, 2023",
      image: "/src/assets/retreat-switzerland.jpg",
      category: "Tech", 
      price: "$699",
      rating: 4.9,
      reviews: 31
    }
  ]
};

const mockReviews = [
  {
    id: "1",
    author: "Sarah Chen",
    avatar: "/placeholder.svg",
    rating: 5,
    date: "2 weeks ago",
    experience: "Hacker House Bali",
    content: "Absolutely incredible experience! The combination of focused coding time and the beautiful Bali setting created the perfect environment for productivity and inspiration. Made lifelong connections with fellow developers."
  },
  {
    id: "2", 
    author: "Marcus Rodriguez",
    avatar: "/placeholder.svg",
    rating: 5,
    date: "1 month ago", 
    experience: "Blockchain Developer Workshop",
    content: "TechCorp's approach to hands-on learning is unmatched. Walked away with real skills and a deployed DApp. The mentorship was top-notch and the community aspect made it even better."
  },
  {
    id: "3",
    author: "Emily Foster", 
    avatar: "/placeholder.svg",
    rating: 4,
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
                
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-neon-yellow mr-1" />
                    {host.rating} ({host.totalReviews} reviews)
                  </div>
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
            {/* Upcoming Experiences */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Upcoming Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockExperiences.upcoming.map((experience) => (
                  <Card key={experience.id} className="bg-card border-gray-800 hover:border-neon-cyan/50 transition-all group">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
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
                      <CardTitle className="text-lg group-hover:text-neon-cyan transition-colors">
                        <Link to={`/experience/${experience.id}`}>
                          {experience.title}
                        </Link>
                      </CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2 text-neon-cyan" />
                          {experience.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2 text-neon-purple" />
                          {experience.dates}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <Link to={`/experience/${experience.id}`}>
                        <Button 
                          className="w-full bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background transition-all"
                          variant="outline"
                        >
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Past Experiences */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Past Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockExperiences.past.map((experience) => (
                  <Card key={experience.id} className="bg-card border-gray-800">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img 
                        src={experience.image}
                        alt={experience.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={categoryColors[experience.category as keyof typeof categoryColors]}>
                          {experience.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">{experience.title}</CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2 text-neon-cyan" />
                          {experience.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2 text-neon-purple" />
                          {experience.dates}
                        </div>
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 mr-1 text-neon-yellow" />
                          <span className="font-medium">{experience.rating}</span>
                          <span className="text-muted-foreground ml-1">({experience.reviews} reviews)</span>
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
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={review.avatar} alt={review.author} />
                          <AvatarFallback className="bg-neon-purple text-background">
                            {review.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{review.author}</h4>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'text-neon-yellow fill-current' : 'text-gray-600'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">• {review.experience}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground">{review.content}</p>
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
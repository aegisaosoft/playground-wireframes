import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Eye,
  Edit3,
  Settings,
  Filter,
  ChevronRight
} from "lucide-react";

// Mock dashboard data
const mockDashboardData = {
  stats: {
    followers: 2840,
    experiencesHosted: 12,
    applicationsLast30Days: 47,
    averageRating: 4.9
  },
  ratingsBreakdown: {
    5: 78,
    4: 15,
    3: 5,
    2: 1,
    1: 1
  },
  recentFeedbackThemes: [
    { theme: "hands-on learning", count: 42 },
    { theme: "great mentorship", count: 38 },
    { theme: "inspiring environment", count: 35 },
    { theme: "strong community", count: 28 },
    { theme: "practical skills", count: 25 },
    { theme: "excellent networking", count: 22 }
  ],
  aiSummary: "Participants consistently praise TechCorp's hands-on approach to learning and the high-quality mentorship provided. The combination of intensive coding sessions with beautiful locations creates an inspiring environment that enhances both productivity and networking opportunities.",
  experiences: [
    {
      id: "1",
      title: "Hacker House Bali",
      dates: "Mar 15-22, 2024",
      status: "Published",
      visibility: "Public",
      applicants: 23,
      rating: 4.8,
      image: "/src/assets/retreat-bali.jpg"
    },
    {
      id: "2", 
      title: "AI & Machine Learning Bootcamp",
      dates: "Sep 10-17, 2024",
      status: "Draft",
      visibility: "Private", 
      applicants: 0,
      rating: null,
      image: "/src/assets/retreat-portugal.jpg"
    },
    {
      id: "3",
      title: "Blockchain Developer Workshop", 
      dates: "Jan 8-15, 2024",
      status: "Completed",
      visibility: "Public",
      applicants: 45,
      rating: 4.9,
      image: "/src/assets/retreat-costa-rica.jpg"
    }
  ],
  reviews: [
    {
      id: "1",
      reviewer: "Sarah Chen",
      avatar: "/placeholder.svg",
      date: "2024-01-20",
      experience: "Hacker House Bali",
      rating: 5,
      content: "Absolutely incredible experience! The combination of focused coding time and the beautiful Bali setting created the perfect environment for productivity and inspiration.",
      applicationId: "APP-001"
    },
    {
      id: "2",
      reviewer: "Marcus Rodriguez", 
      avatar: "/placeholder.svg",
      date: "2024-01-15",
      experience: "Blockchain Developer Workshop",
      rating: 5,
      content: "TechCorp's approach to hands-on learning is unmatched. Walked away with real skills and a deployed DApp. The mentorship was top-notch.",
      applicationId: "APP-002"
    }
  ],
  followerGrowth: [
    { month: "Jan", count: 2234 },
    { month: "Feb", count: 2387 },
    { month: "Mar", count: 2156 },
    { month: "Apr", count: 2840 }
  ]
};

export default function OrganizerDashboard() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const getRatingPercentage = (rating: number) => {
    const total = Object.values(mockDashboardData.ratingsBreakdown).reduce((a, b) => a + b, 0);
    return (mockDashboardData.ratingsBreakdown[rating as keyof typeof mockDashboardData.ratingsBreakdown] / total) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "bg-neon-green text-background";
      case "Draft": return "bg-neon-orange text-background";
      case "Completed": return "bg-neon-cyan text-background";
      default: return "bg-gray-600 text-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-neon bg-clip-text text-transparent mb-2">
            Organizer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your experiences, track performance, and grow your community
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-neon-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-pink">
                {mockDashboardData.stats.followers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experiences Hosted</CardTitle>
              <Calendar className="h-4 w-4 text-neon-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-cyan">
                {mockDashboardData.stats.experiencesHosted}
              </div>
              <p className="text-xs text-muted-foreground">
                3 active, 9 completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications (30d)</CardTitle>
              <MessageSquare className="h-4 w-4 text-neon-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-purple">
                {mockDashboardData.stats.applicationsLast30Days}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% from previous period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-neon-yellow" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-neon-yellow">
                  {mockDashboardData.stats.averageRating}
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(mockDashboardData.stats.averageRating) ? 'text-neon-yellow fill-current' : 'text-gray-600'}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on 127 reviews
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ratings Breakdown */}
            <Card className="bg-card/50 border-gray-800">
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>
                  Breakdown of ratings across all your experiences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm">{rating}</span>
                      <Star className="h-3 w-3 text-neon-yellow fill-current" />
                    </div>
                    <Progress 
                      value={getRatingPercentage(rating)} 
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-muted-foreground w-8">
                      {mockDashboardData.ratingsBreakdown[rating as keyof typeof mockDashboardData.ratingsBreakdown]}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Experiences Management */}
            <Card className="bg-card/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Experiences</CardTitle>
                    <CardDescription>
                      Manage and track your experience performance
                    </CardDescription>
                  </div>
                  <Button size="sm" className="bg-neon-pink text-background hover:bg-neon-purple">
                    Create New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDashboardData.experiences.map((experience) => (
                    <div key={experience.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                      <img 
                        src={experience.image}
                        alt={experience.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{experience.title}</h4>
                        <p className="text-sm text-muted-foreground">{experience.dates}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(experience.status)}>
                            {experience.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {experience.visibility}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold">{experience.applicants}</div>
                        <div className="text-xs text-muted-foreground">applicants</div>
                      </div>
                      {experience.rating && (
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-neon-yellow fill-current" />
                            <span className="text-sm font-semibold">{experience.rating}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Admin */}
            <Card className="bg-card/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reviews Management</CardTitle>
                    <CardDescription>
                      View and manage all reviews from participants
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDashboardData.reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl border border-gray-800">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.avatar} alt={review.reviewer} />
                          <AvatarFallback>{review.reviewer.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{review.reviewer}</h4>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < review.rating ? 'text-neon-yellow fill-current' : 'text-gray-600'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <span>{review.experience}</span>
                            <span>•</span>
                            <span>{review.date}</span>
                            <span>•</span>
                            <Button variant="link" className="h-auto p-0 text-xs text-neon-cyan">
                              {review.applicationId}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {review.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Feedback Themes */}
            <Card className="bg-card/50 border-gray-800">
              <CardHeader>
                <CardTitle>Recent Feedback Themes</CardTitle>
                <CardDescription>
                  AI-generated insights from participant reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {mockDashboardData.recentFeedbackThemes.map((theme, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-gray-800 text-neon-cyan border-gray-700">
                        {theme.theme}
                      </Badge>
                      <span className="text-sm text-muted-foreground">({theme.count})</span>
                    </div>
                  ))}
                </div>
                <Separator className="bg-gray-800 mb-4" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mockDashboardData.aiSummary}
                </p>
              </CardContent>
            </Card>

            {/* Follow Metrics */}
            <Card className="bg-card/50 border-gray-800">
              <CardHeader>
                <CardTitle>Follower Growth</CardTitle>
                <CardDescription>
                  Your community growth over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDashboardData.followerGrowth.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{item.count.toLocaleString()}</span>
                        <TrendingUp className="h-3 w-3 text-neon-green" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/50 border-gray-800">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-between">
                  Create New Experience
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between">
                  Manage Applications
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between">
                  Update Profile
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between">
                  Analytics & Reports
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
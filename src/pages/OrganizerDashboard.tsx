import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { analyticsService, DashboardAnalytics } from "@/services/analytics.service";
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

export default function OrganizerDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await analyticsService.getDashboardAnalytics();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-dark p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Failed to load dashboard data</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats, ratingsBreakdown, recentFeedbackThemes, aiSummary, experiences } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-dark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
            Organizer Dashboard
          </h1>
          <p className="text-white/60 text-lg">
            Track your experiences, applications, and community growth
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Followers</p>
                  <p className="text-3xl font-bold text-white">{stats.followers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-neon-cyan" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Experiences</p>
                  <p className="text-3xl font-bold text-white">{stats.experiencesHosted}</p>
                </div>
                <Calendar className="w-8 h-8 text-neon-pink" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Applications (30d)</p>
                  <p className="text-3xl font-bold text-white">{stats.applicationsLast30Days}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-neon-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Avg Rating</p>
                  <p className="text-3xl font-bold text-white">{stats.averageRating}</p>
                </div>
                <Star className="w-8 h-8 text-neon-yellow" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="experiences" 
              className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
            >
              Experiences
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* AI Summary */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-cyan" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{aiSummary}</p>
              </CardContent>
            </Card>

            {/* Feedback Themes */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Recent Feedback Themes</CardTitle>
                <CardDescription className="text-muted-foreground">
                  What participants are saying about your experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFeedbackThemes.slice(0, 6).map((theme, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-foreground capitalize">{theme.theme}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(theme.count / Math.max(...recentFeedbackThemes.map(t => t.count))) * 100} 
                          className="w-24 h-2"
                        />
                        <span className="text-muted-foreground text-sm w-8">{theme.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rating Breakdown */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Rating Distribution</CardTitle>
                <CardDescription className="text-muted-foreground">
                  How participants rate your experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <Star className="w-4 h-4 fill-neon-yellow text-neon-yellow" />
                        <span className="text-foreground">{rating}</span>
                      </div>
                      <Progress 
                        value={(ratingsBreakdown[rating] || 0) / Math.max(...Object.values(ratingsBreakdown)) * 100} 
                        className="flex-1 h-2"
                      />
                      <span className="text-muted-foreground text-sm w-8">{ratingsBreakdown[rating] || 0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experiences" className="space-y-6">
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Recent Experiences</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your latest experiences and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {experiences.map((experience) => (
                    <div key={experience.id} className="flex items-center justify-between p-4 bg-white/3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-neon rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-background" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{experience.title}</h3>
                          <p className="text-sm text-muted-foreground">{experience.dates}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Applications</p>
                          <p className="font-semibold text-foreground">{experience.applicants}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Rating</p>
                          <p className="font-semibold text-foreground">
                            {experience.rating ? `${experience.rating}` : 'N/A'}
                          </p>
                        </div>
                        <Badge 
                          variant={experience.status === 'published' ? 'default' : 'secondary'}
                          className={experience.status === 'published' 
                            ? 'bg-neon-green/20 text-neon-green border-neon-green/40'
                            : 'bg-gray-700 text-gray-300'
                          }
                        >
                          {experience.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Analytics</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Detailed analytics and insights coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Advanced analytics features are being developed</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
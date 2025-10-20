import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Globe, Instagram, Twitter, Heart, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SocialLinksDisplay } from "@/components/SocialLinksDisplay";
import { brandsService } from '@/services/brands.service';
import { experiencesService } from '@/services/experiences.service';
import { reviewsService } from '@/services/reviews.service';
import { useToast } from '@/hooks/use-toast';

export default function BrandProfile() {
  const { hostId } = useParams();
  const { toast } = useToast();
  
  const [brandData, setBrandData] = useState<any>(null);
  const [brandExperiences, setBrandExperiences] = useState<any[]>([]);
  const [brandReviews, setBrandReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const loadBrandData = async () => {
      if (!hostId) {
        setError('Brand not found');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('📥 Loading brand profile:', hostId);
        
        // Fetch brand data from API
        const brand = await brandsService.getBrandBySlug(hostId);
        
        if (!brand) {
          setError('Brand not found');
          return;
        }

        console.log('✅ Brand loaded:', brand);
        
        // Fetch experiences by this brand
        const experiences = await experiencesService.getAll();
        const brandExp = experiences.filter(exp => 
          exp.hostId === brand.id || 
          exp.host?.id === brand.id ||
          exp.creatorId === brand.id
        );

        // Fetch reviews for brand experiences
        const allReviews = [];
        for (const exp of brandExp) {
          try {
            const reviews = await reviewsService.getExperienceReviews(exp.id);
            allReviews.push(...reviews);
          } catch (reviewError) {
            console.warn(`Could not fetch reviews for experience ${exp.id}:`, reviewError);
          }
        }

        setBrandData(brand);
        setBrandExperiences(brandExp);
        setBrandReviews(allReviews);
        
        console.log('✅ Brand data loaded:', { brand, experiences: brandExp.length, reviews: allReviews.length });
        
      } catch (err) {
        console.error('❌ Failed to load brand data:', err);
        setError('Failed to load brand profile');
        toast({
          title: "Error",
          description: "Failed to load brand profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBrandData();
  }, [hostId, toast]);

  // Generate AI summary from real reviews
  const generateAISummary = (reviews: any[]) => {
    if (reviews.length === 0) {
      return {
        summary: "No reviews available yet. Be the first to share your experience!",
        keywords: ["new brand", "first reviews", "be the first"]
      };
    }

    const keywords = [];
    const themes = {
      quality: 0,
      community: 0,
      learning: 0,
      experience: 0,
      location: 0,
      organization: 0
    };

    reviews.forEach(review => {
      const comment = (review.comment || '').toLowerCase();
      const title = (review.title || '').toLowerCase();
      const text = `${comment} ${title}`;

      if (text.includes('great') || text.includes('excellent') || text.includes('amazing') || text.includes('wonderful')) {
        themes.quality++;
        if (!keywords.includes('high quality')) keywords.push('high quality');
      }
      if (text.includes('community') || text.includes('people') || text.includes('network')) {
        themes.community++;
        if (!keywords.includes('strong community')) keywords.push('strong community');
      }
      if (text.includes('learn') || text.includes('skill') || text.includes('knowledge')) {
        themes.learning++;
        if (!keywords.includes('great learning')) keywords.push('great learning');
      }
      if (text.includes('experience') || text.includes('memorable') || text.includes('unforgettable')) {
        themes.experience++;
        if (!keywords.includes('memorable experience')) keywords.push('memorable experience');
      }
      if (text.includes('location') || text.includes('beautiful') || text.includes('scenic')) {
        themes.location++;
        if (!keywords.includes('beautiful location')) keywords.push('beautiful location');
      }
      if (text.includes('organized') || text.includes('professional') || text.includes('smooth')) {
        themes.organization++;
        if (!keywords.includes('well organized')) keywords.push('well organized');
      }
    });

    const topThemes = Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme);

    let summary = `Based on ${reviews.length} review${reviews.length === 1 ? '' : 's'}, participants `;
    
    if (topThemes.includes('quality')) {
      summary += "consistently praise the high-quality experience and professional approach. ";
    }
    if (topThemes.includes('community')) {
      summary += "The strong community and networking opportunities are frequently highlighted. ";
    }
    if (topThemes.includes('learning')) {
      summary += "Participants value the learning opportunities and skill development. ";
    }
    if (topThemes.includes('experience')) {
      summary += "The memorable and transformative nature of the experiences stands out. ";
    }
    if (topThemes.includes('location')) {
      summary += "The beautiful locations and inspiring environments enhance the overall experience. ";
    }
    if (topThemes.includes('organization')) {
      summary += "The well-organized structure and professional execution are appreciated. ";
    }

    return {
      summary: summary.trim() || "Reviews highlight positive experiences and valuable learning opportunities.",
      keywords: keywords.slice(0, 6) // Limit to 6 keywords
    };
  };

  const handleToggleFollow = async () => {
    // This would need to be implemented with a follow service
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: `You're ${isFollowing ? 'no longer following' : 'now following'} ${brandData?.name}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-neon-cyan" />
          <p className="text-muted-foreground">Loading brand profile...</p>
        </div>
      </div>
    );
  }

  if (error || !brandData) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Brand Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The requested brand could not be found.'}</p>
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const aiSummary = generateAISummary(brandReviews);
  const averageRating = brandReviews.length > 0 
    ? brandReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / brandReviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Brand Profile Section */}
        <div className="bg-background rounded-2xl shadow-sm border border-border p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={brandData.logoUrl} alt={brandData.name} />
              <AvatarFallback className="text-2xl">
                {brandData.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {brandData.name}
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                {brandData.type === 'company' ? 'Company' : 'Organization'}
              </p>
              <p className="text-foreground leading-relaxed max-w-2xl">
                {brandData.description || brandData.bio || 'Creating meaningful experiences for the community.'}
              </p>
              
              {/* Social Links */}
              <div className="mt-4">
                <SocialLinksDisplay socialAccounts={{
                  linkedinUrl: brandData.linkedinUrl,
                  instagramUrl: brandData.instagramUrl,
                  twitterUrl: brandData.twitterUrl,
                  websiteUrl: brandData.website
                }} />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <Button 
                variant={isFollowing ? "default" : "outline"}
                onClick={handleToggleFollow}
                className={isFollowing ? "bg-coral hover:bg-coral-dark text-white" : "border-coral text-coral hover:bg-coral hover:text-white"}
              >
                {isFollowing ? (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="bg-background rounded-2xl shadow-sm border border-border p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-xl font-semibold">AI-Powered Review Summary</h2>
          </div>
          <p className="text-foreground leading-relaxed mb-4">
            {aiSummary.summary}
          </p>
          <div className="flex flex-wrap gap-2">
            {aiSummary.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-800 text-neon-cyan border-gray-700">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-background border-border">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">
                {brandExperiences.length}
              </div>
              <div className="text-sm text-muted-foreground">Experiences</div>
            </CardContent>
          </Card>
          <Card className="bg-background border-border">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">
                {brandReviews.length}
              </div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </CardContent>
          </Card>
          <Card className="bg-background border-border">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card className="bg-background border-border">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">
                {brandData.memberCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">Members</div>
            </CardContent>
          </Card>
        </div>

        {/* Experiences Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Experiences by {brandData.name} ({brandExperiences.length})
          </h2>
          
          {brandExperiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandExperiences.map((experience) => (
                <Card key={experience.id} className="bg-background border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                      {experience.featuredImageUrl ? (
                        <img 
                          src={experience.featuredImageUrl} 
                          alt={experience.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400">No Image</div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{experience.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{experience.location}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {experience.startDate ? new Date(experience.startDate).toLocaleDateString() : 'TBA'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {experience.basePriceCents ? `$${(experience.basePriceCents / 100).toFixed(0)}` : 'Free'}
                      </span>
                      <Badge variant="outline">{experience.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-background rounded-2xl border border-border">
              <p className="text-muted-foreground text-lg">
                No public experiences available at this time.
              </p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Reviews</h2>
          
          {brandReviews.length > 0 ? (
            <div className="space-y-6">
              {brandReviews.slice(0, 5).map((review) => (
                <Card key={review.id} className="bg-background border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.userProfileImageUrl} alt={review.userName} />
                        <AvatarFallback>{review.userName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{review.userName || 'Anonymous'}</h4>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Heart 
                                key={i} 
                                className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-red-500 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <h5 className="font-medium mb-2">{review.title}</h5>
                        )}
                        <p className="text-foreground text-sm leading-relaxed">
                          {review.comment}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {brandReviews.length > 5 && (
                <div className="text-center">
                  <Button variant="outline">
                    View All {brandReviews.length} Reviews
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-background rounded-2xl border border-border">
              <p className="text-muted-foreground text-lg">
                No reviews available yet. Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
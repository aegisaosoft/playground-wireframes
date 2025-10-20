import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { userService, UserProfile } from '@/services/user.service';
import { experiencesService } from '@/services/experiences.service';
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Shield, 
  User, 
  MapPin, 
  Phone,
  Loader2,
  Home,
  Users,
  TrendingUp
} from 'lucide-react';

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userExperiences, setUserExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserExperiences();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = await userService.getUserProfile(userId);
      setUserProfile(profile);
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      setError(err.message || 'Failed to load user profile');
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserExperiences = async () => {
    if (!userId) return;
    
    setIsLoadingExperiences(true);
    
    try {
      // Get all experiences and filter by creator or host
      const allExperiences = await experiencesService.getAll();
      const userExp = allExperiences.filter((exp: any) => 
        exp.creatorId === userId || exp.hostId === userId
      );
      setUserExperiences(userExp);
    } catch (err: any) {
      console.error('Failed to fetch user experiences:', err);
      // Don't show error toast for experiences, just log it
    } finally {
      setIsLoadingExperiences(false);
    }
  };

  const getRoleBadgeVariant = (role: string | undefined | null) => {
    if (!role || role === null || role === undefined) return 'outline';
    switch (role.toLowerCase()) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      case 'user': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleColor = (role: string | undefined | null) => {
    if (!role || role === null || role === undefined) return 'text-muted-foreground';
    switch (role.toLowerCase()) {
      case 'admin': return 'text-red-400';
      case 'moderator': return 'text-neon-cyan';
      case 'user': return 'text-neon-green';
      default: return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-neon-cyan" />
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The user profile you are looking for does not exist.'}</p>
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            className="border-white/20 text-foreground hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            size="sm"
            className="border-white/20 text-foreground hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userProfile.profileImageUrl} alt={userProfile.name} />
                    <AvatarFallback className="bg-neon-purple/20 text-neon-purple text-2xl">
                      {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-foreground text-xl">{userProfile.name}</CardTitle>
                <div className="flex justify-center">
                  <Badge 
                    variant={getRoleBadgeVariant(userProfile.role)}
                    className={`text-xs ${getRoleColor(userProfile.role)}`}
                  >
                    {userProfile.role || 'User'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{userProfile.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {new Date(userProfile.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {userProfile.lastLoginAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Last active {new Date(userProfile.lastLoginAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {userProfile.isEmailVerified ? 'Email verified' : 'Email not verified'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Experiences</p>
                      <p className="text-2xl font-bold text-foreground">{userExperiences.length}</p>
                    </div>
                    <Home className="w-8 h-8 text-neon-pink" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Published</p>
                      <p className="text-2xl font-bold text-foreground">
                        {userExperiences.filter(exp => exp.status === 'published').length}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-neon-green" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Drafts</p>
                      <p className="text-2xl font-bold text-foreground">
                        {userExperiences.filter(exp => exp.status === 'draft').length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-neon-cyan" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Experiences */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-foreground">Experiences</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingExperiences ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-neon-cyan" />
                    <p className="text-muted-foreground">Loading experiences...</p>
                  </div>
                ) : userExperiences.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No experiences found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userExperiences.map((experience) => (
                      <div
                        key={experience.id}
                        className="flex items-center justify-between p-4 bg-white/3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => navigate(`/experience/${experience.id}`)}
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{experience.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {experience.location} • {new Date(experience.startDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={experience.status === 'published' ? 'default' : 'secondary'}
                              className={experience.status === 'published' 
                                ? 'bg-neon-green/20 text-neon-green border-neon-green/40'
                                : 'bg-gray-700 text-gray-300'}
                            >
                              {experience.status}
                            </Badge>
                            {experience.creatorId === experience.hostId ? (
                              <Badge variant="outline" className="text-xs border-neon-cyan/40 text-neon-cyan">
                                Creator & Host
                              </Badge>
                            ) : experience.creatorId === userId ? (
                              <Badge variant="outline" className="text-xs border-neon-cyan/40 text-neon-cyan">
                                Creator
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs border-neon-purple/40 text-neon-purple">
                                Host
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

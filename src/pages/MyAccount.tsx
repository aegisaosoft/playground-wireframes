import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { VoiceProfileSection } from '@/components/VoiceProfile';
import { 
  User, 
  FileText, 
  Home, 
  Bookmark, 
  Users, 
  Settings, 
  ArrowLeft,
  Upload,
  Calendar,
  MapPin,
  Eye,
  Edit,
  UserPlus,
  UserMinus,
  Star,
  TrendingUp,
  BarChart3,
  Copy,
  Link2,
  Building
} from 'lucide-react';
import { SocialAccountsInput, SocialAccounts } from '@/components/SocialAccountsInput';

// Mock data
const mockUserApplications = [
  {
    id: '1',
    experienceTitle: 'Digital Nomad Bootcamp',
    location: 'Lisbon, Portugal',
    dates: 'March 15-22, 2024',
    status: 'approved',
    image: '/src/assets/retreat-portugal.jpg',
    organizer: 'Remote Work Hub'
  },
  {
    id: '2',
    experienceTitle: 'Mindfulness Retreat',
    location: 'Bali, Indonesia',
    dates: 'April 10-17, 2024',
    status: 'pending',
    image: '/src/assets/retreat-bali.jpg',
    organizer: 'Zen Masters'
  }
];

const mockHostedExperiences = [
  {
    id: '1',
    title: 'Creative Writing Workshop',
    dates: 'May 1-8, 2024',
    status: 'published',
    visibility: 'public',
    applicants: 12,
    rating: 4.8,
    privateSlug: null
  },
  {
    id: '2',
    title: 'Photography Masterclass',
    dates: 'June 15-22, 2024',
    status: 'published',
    visibility: 'private',
    applicants: 3,
    rating: null,
    privateSlug: 'private-1703847362-k9n2m8x4p'
  }
];

const mockSavedExperiences = [
  {
    id: '1',
    title: 'Yoga & Wellness Retreat',
    location: 'Costa Rica',
    dates: 'July 5-12, 2024',
    image: '/src/assets/retreat-costa-rica.jpg',
    organizer: 'Wellness Warriors'
  },
  {
    id: '2',
    title: 'Startup Accelerator',
    location: 'Berlin, Germany',
    dates: 'August 20-27, 2024',
    image: '/src/assets/retreat-switzerland.jpg',
    organizer: 'Tech Innovators'
  }
];

const mockFollowedHosts = [
  {
    id: '1',
    name: 'Remote Work Hub',
    avatar: '/placeholder.svg',
    followers: 1250,
    experiences: 8
  },
  {
    id: '2',
    name: 'Zen Masters',
    avatar: '/placeholder.svg',
    followers: 890,
    experiences: 12
  }
];

type SidebarItem = 'profile' | 'applications' | 'hosting' | 'saved' | 'following' | 'brand' | 'settings';

export default function MyAccount() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<SidebarItem>(() => {
    const tab = searchParams.get('tab');
    return (tab && ['profile', 'applications', 'hosting', 'saved', 'following', 'brand', 'settings'].includes(tab)) 
      ? tab as SidebarItem 
      : 'profile';
  });
  const [user, setUser] = useState<{ name: string; email: string; profile?: any } | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setName(userData.name);
      setSocialAccounts(userData.socialAccounts || {});
    }
  }, []);

  // Update activeTab when URL search params change
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'applications', 'hosting', 'saved', 'following', 'brand', 'settings'].includes(tab)) {
      setActiveTab(tab as SidebarItem);
    }
  }, [searchParams]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, name, socialAccounts };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    window.location.href = '/';
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePic(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyPrivateLink = (privateSlug: string) => {
    const privateUrl = `${window.location.origin}/experience/private/${privateSlug}`;
    navigator.clipboard.writeText(privateUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "Private experience link has been copied to clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  // Check if user has hosted experiences or created brands (mock data for now)
  const hasHostedExperiences = mockHostedExperiences.length > 0;
  const hasCreatedBrands = true; // Mock - would check if user has created any brands
  
  const profileItems = [
    { id: 'profile' as SidebarItem, label: 'Profile', icon: User },
    { id: 'applications' as SidebarItem, label: 'My Applications', icon: FileText },
    { id: 'saved' as SidebarItem, label: 'Saved Experiences', icon: Bookmark },
    { id: 'following' as SidebarItem, label: 'Following Hosts', icon: Users },
    { id: 'settings' as SidebarItem, label: 'Settings', icon: Settings },
  ];

  const hostingItems = [
    { id: 'hosting' as SidebarItem, label: 'Experiences', icon: Home },
    ...(hasCreatedBrands ? [{ id: 'brand' as SidebarItem, label: 'Brand Page', icon: Building }] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            </div>
            
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-foreground">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profilePic || ""} alt="Profile" />
                    <AvatarFallback className="text-xl bg-neon-pink/20 text-neon-pink">
                      {name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-3">
                    <Label htmlFor="profile-pic" className="text-foreground">Profile Picture</Label>
                    <div className="flex items-center space-x-3">
                      <Button variant="outline" size="sm" asChild className="border-white/20 text-foreground hover:bg-white/10">
                        <label htmlFor="profile-pic" className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </label>
                      </Button>
                      <input
                        id="profile-pic"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-white/5 border-white/20 text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-white/5 border-white/20 text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Bio Section (Replace with VoiceProfileSection) */}
                <VoiceProfileSection 
                  profileData={user?.profile}
                  onUpdateProfile={(profileData) => {
                    if (user) {
                      const updatedUser = {
                        ...user,
                        profile: {
                          ...user.profile,
                          ...profileData,
                          onboardingCompleted: true
                        }
                      };
                      localStorage.setItem('user', JSON.stringify(updatedUser));
                      setUser(updatedUser);
                      toast({
                        title: "Profile updated!",
                        description: "Your voice profile has been saved successfully.",
                      });
                    }
                  }}
                />

                {/* Social Accounts */}
                <SocialAccountsInput
                  value={socialAccounts}
                  onChange={setSocialAccounts}
                />

                {/* Brand Info */}
                <Card className="bg-white/3 border-white/10 rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-neon rounded-full flex items-center justify-center font-semibold text-background">
                          {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Your Brand</p>
                          <p className="text-sm text-muted-foreground">2 experiences hosted</p>
                          <p className="text-sm text-muted-foreground">124 followers</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10">
                        Edit Brand Page
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-neon text-background hover:opacity-90 shadow-neon"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'applications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
            </div>

            {/* Approved Applications */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  Approved Applications
                  <Badge variant="secondary" className="bg-neon-green/20 text-neon-green">
                    {mockUserApplications.filter(app => app.status === 'approved').length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockUserApplications.filter(app => app.status === 'approved').map((application) => (
                  <Card key={application.id} className="bg-white/3 border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={application.image}
                            alt={application.experienceTitle}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-foreground">{application.experienceTitle}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {application.location}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {application.dates}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">by {application.organizer}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40">
                            Approved
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-neon-green/40 text-neon-green hover:bg-neon-green/10"
                            onClick={() => window.open(`/experience/portal/${application.id}`, '_blank')}
                          >
                            Open Portal
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Pending Applications */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  Pending Applications
                  <Badge variant="secondary" className="bg-neon-yellow/20 text-neon-yellow">
                    {mockUserApplications.filter(app => app.status === 'pending').length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockUserApplications.filter(app => app.status === 'pending').map((application) => (
                  <Card key={application.id} className="bg-white/3 border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={application.image}
                            alt={application.experienceTitle}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-foreground">{application.experienceTitle}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {application.location}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {application.dates}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">by {application.organizer}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-neon-yellow/20 text-neon-yellow border-neon-yellow/40">
                            Pending
                          </Badge>
                          <Button variant="outline" size="sm" className="border-white/20 text-foreground hover:bg-white/10">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 'hosting':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Experiences</h1>
              <Link to="/organizer/dashboard">
                <Button className="bg-gradient-neon text-background hover:opacity-90 shadow-neon">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Full Analytics
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Followers</p>
                      <p className="text-2xl font-bold text-foreground">124</p>
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
                      <p className="text-2xl font-bold text-foreground">2</p>
                    </div>
                    <Home className="w-8 h-8 text-neon-pink" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Applications</p>
                      <p className="text-2xl font-bold text-foreground">15</p>
                    </div>
                    <FileText className="w-8 h-8 text-neon-green" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Avg Rating</p>
                      <p className="text-2xl font-bold text-foreground">4.8</p>
                    </div>
                    <Star className="w-8 h-8 text-neon-yellow" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hosted Experiences */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-foreground">Your Experiences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
{mockHostedExperiences.map((experience) => (
                  <Card 
                    key={experience.id} 
                    className="bg-white/3 border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/experience/${experience.id}`, { state: { origin: 'hosting' } })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{experience.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{experience.dates}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant={experience.status === 'published' ? 'default' : 'secondary'} 
                                   className={experience.status === 'published' 
                                     ? 'bg-neon-green/20 text-neon-green border-neon-green/40'
                                     : 'bg-gray-700 text-gray-300'}>
                              {experience.status}
                            </Badge>
                            <Badge variant="outline" className="border-white/20 text-muted-foreground">
                              {experience.visibility}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {experience.applicants} applicants
                            </span>
                            {experience.rating && (
                              <span className="text-sm text-neon-yellow flex items-center">
                                <Star className="w-4 h-4 mr-1" />
                                {experience.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-white/20 text-foreground hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/experiences/${experience.id}/edit`);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-neon-pink/40 text-neon-pink hover:bg-neon-pink/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/experiences/${experience.id}/applicants`);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Applicants
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = experience.visibility === 'private' && experience.privateSlug
                                ? `${window.location.origin}/experience/${experience.privateSlug}`
                                : `${window.location.origin}/experience/${experience.id}`;
                              navigator.clipboard.writeText(url).then(() => {
                                toast({
                                  title: "Link copied!",
                                  description: `${experience.visibility === 'private' ? 'Private experience' : 'Experience'} link copied to clipboard.`,
                                });
                              }).catch(() => {
                                toast({
                                  title: "Copy failed",
                                  description: "Could not copy link to clipboard. Please try again.",
                                  variant: "destructive",
                                });
                              });
                            }}
                            title="Copy experience link"
                            aria-label="Copy experience link"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 'saved':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Saved Experiences</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSavedExperiences.map((experience) => (
                <Card key={experience.id} className="bg-white/5 border-white/10 rounded-2xl hover:bg-white/8 transition-colors group">
                  <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                    <img
                      src={experience.image}
                      alt={experience.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">{experience.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {experience.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {experience.dates}
                      </div>
                      <p>by {experience.organizer}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Button variant="outline" size="sm" className="border-white/20 text-foreground hover:bg-white/10">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'following':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Following Hosts</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockFollowedHosts.map((host) => (
                <Card key={host.id} className="bg-white/5 border-white/10 rounded-2xl hover:bg-white/8 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={host.avatar} alt={host.name} />
                          <AvatarFallback className="bg-neon-pink/20 text-neon-pink text-lg">
                            {host.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{host.name}</h3>
                          <p className="text-sm text-muted-foreground">{host.followers} followers</p>
                          <p className="text-sm text-muted-foreground">{host.experiences} experiences</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="border-white/20 text-foreground hover:bg-white/10">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            </div>
            
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-foreground">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-settings" className="text-foreground">Email</Label>
                    <Input
                      id="email-settings"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-white/5 border-white/20 text-muted-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Button variant="outline" className="border-white/20 text-foreground hover:bg-white/10">
                      Change Password
                    </Button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Email notifications</span>
                      <Button variant="outline" size="sm" className="border-white/20 text-foreground hover:bg-white/10">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">Profile visibility</span>
                      <Button variant="outline" size="sm" className="border-white/20 text-foreground hover:bg-white/10">
                        Public
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <Button 
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'brand':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Brand Page</h1>
              <Button 
                variant="outline" 
                className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Brand Page
              </Button>
            </div>
            
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-neon rounded-full flex items-center justify-center font-bold text-2xl text-background">
                    {(user?.name || 'B').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{user?.name || 'Brand Name'}</h3>
                    <p className="text-muted-foreground">Professional Host</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary" className="bg-neon-cyan/20 text-neon-cyan">
                        <Users className="w-3 h-3 mr-1" />
                        124 followers
                      </Badge>
                      <Badge variant="secondary" className="bg-neon-purple/20 text-neon-purple">
                        <Star className="w-3 h-3 mr-1" />
                        4.9 rating
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">About</h4>
                    <p className="text-muted-foreground">
                      We create transformative experiences that combine wellness, adventure, and personal growth. 
                      Our retreats are designed to help you disconnect from the everyday and reconnect with yourself.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Experiences Hosted</h4>
                    <p className="text-muted-foreground">2 experiences • 45 total participants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please Login</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to access your account.</p>
          <Link to="/experiences">
            <Button className="bg-gradient-neon text-background hover:opacity-90 shadow-neon">
              Go to Experiences
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Sticky Header with Navigation */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/experiences" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Experiences
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="lg:flex lg:gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="max-h-[calc(100vh-120px)] overflow-auto">
              <div className="space-y-8">
                {/* Profile Group */}
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Profile</h3>
                  </div>
                  <Card className="bg-white/5 border-white/10 rounded-2xl p-2">
                    <nav className="space-y-1">
                      {profileItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                              isActive 
                                ? 'bg-gradient-neon text-background shadow-neon' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </Card>
                </div>

                {/* Hosting Group */}
                {(hasHostedExperiences || hasCreatedBrands) && (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Hosting</h3>
                    </div>
                    <Card className="bg-white/5 border-white/10 rounded-2xl p-2">
                      <nav className="space-y-1">
                        {hostingItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => setActiveTab(item.id)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                isActive 
                                  ? 'bg-gradient-neon text-background shadow-neon' 
                                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{item.label}</span>
                            </button>
                          );
                        })}
                      </nav>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="lg:hidden mb-6">
            <div className="flex overflow-x-auto pb-2 gap-2">
              {profileItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-gradient-neon text-background shadow-neon' 
                        : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              {(hasHostedExperiences || hasCreatedBrands) && (
                <>
                  <div className="w-px bg-white/20 mx-2" />
                  {hostingItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                          isActive 
                            ? 'bg-gradient-neon text-background shadow-neon' 
                            : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:max-w-none">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
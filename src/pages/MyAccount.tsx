import { API_URL } from '@/config/api';
import { userService } from '@/services/user.service';
import { sessionManager } from '@/lib/session-manager';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { VoiceProfileSection } from '@/components/VoiceProfile';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { experiencesService, Experience } from '@/services/experiences.service';
import { applicationsService, Application } from '@/services/applications.service';
import { bookmarksService, Bookmark } from '@/services/bookmarks.service';
import { followsService, FollowedHost } from '@/services/follows.service';
import { brandsService } from '@/services/brands.service';
import { ticketsService, TicketPurchase } from '@/services/tickets.service';
import { EditBrandPageModal } from '@/components/EditBrandPageModal';
import { AddFindMemberModal } from '@/components/AddFindMemberModal';
import { MembersListModal } from '@/components/MembersListModal';
import { StripeSettings } from '@/components/StripeSettings';
import { 
  User, 
  FileText, 
  Home, 
  Bookmark as BookmarkIcon, 
  Users, 
  Settings, 
  ArrowLeft,
  Upload,
  Calendar,
  RefreshCw,
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
  Building,
  Mic,
  MicOff,
  Ticket
} from 'lucide-react';
import { SocialAccountsInput, SocialAccounts } from '@/components/SocialAccountsInput';

type SidebarItem = 'profile' | 'applications' | 'tickets' | 'hosting' | 'saved' | 'following' | 'brand' | 'settings';

export default function MyAccount() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<SidebarItem>(() => {
    const tab = searchParams.get('tab');
    return (tab && ['profile', 'applications', 'tickets', 'hosting', 'saved', 'following', 'brand', 'settings'].includes(tab)) 
      ? tab as SidebarItem 
      : 'profile';
  });
  const [user, setUser] = useState<{ name: string; email: string; profile?: any } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({});
  const [isLoading, setIsLoading] = useState(false);
  const [myExperiences, setMyExperiences] = useState<Experience[]>([]);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(false);
  const [savedExperiences, setSavedExperiences] = useState<Bookmark[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [applicationFilters, setApplicationFilters] = useState({
    pending: true,
    approved: true,
    rejected: true
  });
  const [userTickets, setUserTickets] = useState<TicketPurchase[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [refundingTickets, setRefundingTickets] = useState<Set<string>>(new Set());
  const [cancellingTickets, setCancellingTickets] = useState<Set<string>>(new Set());
  const [followedHosts, setFollowedHosts] = useState<FollowedHost[]>([]);
  const [isLoadingHosts, setIsLoadingHosts] = useState(false);
  const [userBrands, setUserBrands] = useState<any[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [showEditBrandModal, setShowEditBrandModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMembersListModal, setShowMembersListModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [isCreatingNewBrand, setIsCreatingNewBrand] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Voice recognition for name field
  const {
    isListening: isNameVoiceActive,
    transcript: nameTranscript,
    startListening: startNameVoice,
    stopListening: stopNameVoice,
    resetTranscript: resetNameTranscript,
    isSupported: isNameVoiceSupported,
    error: nameVoiceError
  } = useVoiceRecognition({ continuous: false, interimResults: true });

  // Update name from voice transcript
  useEffect(() => {
    if (nameTranscript) {
      setName(nameTranscript);
    }
  }, [nameTranscript]);

  // Show voice error notifications
  useEffect(() => {
    if (nameVoiceError) {
      toast({
        title: "Voice Recognition Error",
        description: nameVoiceError,
        variant: "destructive",
      });
    }
  }, [nameVoiceError, toast]);

  const handleToggleNameVoice = () => {
    if (isNameVoiceActive) {
      stopNameVoice();
    } else {
      resetNameTranscript();
      startNameVoice();
    }
  };

  useEffect(() => {
    (async () => {
      try {
        // Prefer session-managed user if present
        const sessionUser = sessionManager.getCurrentUser();
        if (sessionUser) {
          setUser({ name: sessionUser.name || '', email: sessionUser.email || '', profile: sessionUser });
          setName(sessionUser.name || '');
          setSocialAccounts((sessionUser as any).socialAccounts || {});
          setProfilePic(sessionUser.profileImageUrl || '/avatars/adventure-avatar.png');
          return;
        }

        // Fallback: fetch from API to validate cookie session
        const me = await userService.getCurrentUser().catch(() => null);
        if (me) {
          setUser({ name: me.name || '', email: me.email || '', profile: me });
          setName(me.name || '');
          setSocialAccounts((me as any).socialAccounts || {});
          setProfilePic(me.profileImageUrl || '/avatars/adventure-avatar.png');
          sessionManager.saveSession({ user: me });
          return;
        }

        // Legacy fallback: localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setName(userData.name);
          setSocialAccounts(userData.socialAccounts || {});
          setProfilePic(userData.profile?.profileImageUrl || '/avatars/adventure-avatar.png');
        }
      } finally {
        setAuthChecking(false);
      }
    })();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      switch (activeTab) {
        case 'hosting':
          setIsLoadingExperiences(true);
          try {
            const experiences = await experiencesService.getMyExperiences();
            
            // Transform data to match UI expectations
            const transformedExperiences = experiences.map((exp: any) => ({
              ...exp,
              date: exp.startDate || exp.date,
              category: exp.status || exp.category, // Use status as category for badge
              visibility: exp.status === 'published' ? 'public' : 'private',
              privateSlug: exp.slug
            }));
            
            setMyExperiences(transformedExperiences);
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to load your experiences",
              variant: "destructive",
            });
          } finally {
            setIsLoadingExperiences(false);
          }
          break;

         case 'brand':
           setIsLoadingBrands(true);
           try {
             const brands = await brandsService.getMyBrands();
             setUserBrands(brands);
          } catch (error) {
            toast({
              title: "Error",
               description: "Failed to load your brands",
              variant: "destructive",
            });
          } finally {
             setIsLoadingBrands(false);
          }
          break;
          
               case 'saved':
                 setIsLoadingSaved(true);
                 try {
                   const bookmarks = await bookmarksService.getMyBookmarks();
                   setSavedExperiences(bookmarks);
                 } catch (error) {
                   toast({
                     title: "Error",
                     description: "Failed to load saved experiences",
                     variant: "destructive",
                   });
                 } finally {
                   setIsLoadingSaved(false);
                 }
                 break;

               case 'applications':
                 setIsLoadingApplications(true);
                 try {
                   // Load applications for experiences where user is the host (for approval)
                   const applications = await applicationsService.getApplicationsForApproval();
                   setUserApplications(applications);
                 } catch (error) {
                   toast({
                     title: "Error",
                     description: "Failed to load applications",
                     variant: "destructive",
                   });
                 } finally {
                   setIsLoadingApplications(false);
                 }
                 break;

               case 'tickets':
                 setIsLoadingTickets(true);
                 try {
                   const tickets = await ticketsService.getMyTickets();
                   setUserTickets(tickets);
                 } catch (error: any) {
                   
                   // If it's a 404 error, the endpoint isn't available yet
                   if (error.message?.includes('404') || error.message?.includes('Not Found')) {
                     setUserTickets([]);
                   } else {
                     toast({
                       title: "Error",
                       description: "Failed to load tickets",
                       variant: "destructive",
                     });
                   }
                 } finally {
                   setIsLoadingTickets(false);
                 }
                 break;

               case 'following':
                 setIsLoadingHosts(true);
                 try {
                   const follows = await followsService.getMyFollows();
                   setFollowedHosts(follows);
                 } catch (error) {
                   toast({
                     title: "Error",
                     description: "Failed to load followed hosts",
                     variant: "destructive",
                   });
                 } finally {
                   setIsLoadingHosts(false);
                 }
                 break;
      }
    };

    fetchData();
  }, [activeTab, toast]);

  // Update activeTab when URL search params change
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'applications', 'tickets', 'hosting', 'saved', 'following', 'brand', 'settings'].includes(tab)) {
      setActiveTab(tab as SidebarItem);
    }
  }, [searchParams]);

  // Load applications when component mounts if on applications tab
  useEffect(() => {
    if (activeTab === 'applications' && userApplications.length === 0 && !isLoadingApplications) {
      const loadApplications = async () => {
        setIsLoadingApplications(true);
        try {
          // Load applications for experiences where user is the host (for approval)
          const applications = await applicationsService.getApplicationsForApproval();
          setUserApplications(applications);
        } catch (error) {
          console.error('Failed to fetch applications:', error);
          toast({
            title: "Error",
            description: "Failed to load applications",
            variant: "destructive",
          });
        } finally {
          setIsLoadingApplications(false);
        }
      };
      loadApplications();
    }
  }, [activeTab, userApplications.length, isLoadingApplications, toast]);

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

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Show preview immediately
  const reader = new FileReader();
  reader.onload = (e) => {
    setProfilePic(e.target?.result as string);
  };
  reader.readAsDataURL(file);

  // Upload to backend using userService
  try {
    setIsLoading(true);
    
    const data = await userService.uploadAvatar(file);
    
    // Update localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (!userData.profile) {
        userData.profile = {};
      }
      userData.profile.profileImageUrl = data.imageUrl;
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    toast({
      title: "Avatar Uploaded",
      description: "Image saved successfully!",
    });
    
  } catch (error) {
    toast({
      title: "Upload Failed",
      description: "Failed to upload avatar. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
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

  const handleEditBrand = (brand: any) => {
    setSelectedBrand(brand);
    setIsCreatingNewBrand(false);
    setShowEditBrandModal(true);
  };

  const handleCreateNewBrand = () => {
    setSelectedBrand(null);
    setIsCreatingNewBrand(true);
    setShowEditBrandModal(true);
  };

  const handleAddMember = (brand: any) => {
    setSelectedBrand(brand);
    setShowAddMemberModal(true);
  };

  const handleViewMembers = (brand: any) => {
    setSelectedBrand(brand);
    setShowMembersListModal(true);
  };

  const handleSaveBrand = async (brandData: any) => {
    try {
      setIsLoading(true);
      
      // The EditBrandPageModal already handles the API call
      // We just need to reload the brands list and show success
      const brands = await brandsService.getMyBrands();
      setUserBrands(brands);
      
      toast({
        title: "Success",
        description: isCreatingNewBrand ? "Brand created successfully!" : "Brand updated successfully!",
      });
      
      setShowEditBrandModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Brand saved but failed to reload the list. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundTicket = async (ticketId: string) => {
    try {
      setRefundingTickets(prev => new Set(prev).add(ticketId));
      
      const refundResult = await ticketsService.refundTicket(ticketId);
      
      toast({
        title: "Refund Successful",
        description: `Your refund of $${refundResult.amount.toFixed(2)} has been processed. Refund ID: ${refundResult.refundId}`,
      });
      
      // Reload tickets to show updated status
      const updatedTickets = await ticketsService.getMyTickets();
      setUserTickets(updatedTickets);
      
    } catch (error: any) {
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefundingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      setCancellingTickets(prev => new Set(prev).add(ticketId));
      
      const cancelResult = await ticketsService.cancelTicket(ticketId);
      
      toast({
        title: "Ticket Cancelled",
        description: "Your pending ticket has been cancelled successfully.",
      });
      
      // Reload tickets to show updated status
      const updatedTickets = await ticketsService.getMyTickets();
      setUserTickets(updatedTickets);
      
    } catch (error: any) {
      toast({
        title: "Cancel Failed",
        description: error.message || "Failed to cancel ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
    }
  };

  // Check if user has hosted experiences or created brands
  const hasHostedExperiences = myExperiences.length > 0;
  const hasCreatedBrands = userBrands.length > 0;
  
  const profileItems = [
    { id: 'profile' as SidebarItem, label: 'Profile', icon: User },
    { id: 'applications' as SidebarItem, label: 'My Applications', icon: FileText },
    { id: 'tickets' as SidebarItem, label: 'My Tickets', icon: Ticket },
    { id: 'saved' as SidebarItem, label: 'Saved Experiences', icon: BookmarkIcon },
    { id: 'following' as SidebarItem, label: 'Following Hosts', icon: Users },
    { id: 'settings' as SidebarItem, label: 'Settings', icon: Settings },
  ];

  const hostingItems = [
    { id: 'hosting' as SidebarItem, label: 'Experiences', icon: Home },
    { id: 'brand' as SidebarItem, label: 'Brand Page', icon: Building },
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="name" className="text-foreground">Name</Label>
                      {isNameVoiceSupported && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleToggleNameVoice}
                          disabled={!isNameVoiceSupported}
                          className={`h-6 px-2 ${
                            isNameVoiceActive 
                              ? 'text-red-500 hover:text-red-400 animate-pulse' 
                              : 'text-neon-cyan hover:text-neon-cyan/80'
                          }`}
                        >
                          {isNameVoiceActive ? (
                            <>
                              <MicOff className="w-3 h-3 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Mic className="w-3 h-3 mr-1" />
                              Voice
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-white/5 border-white/20 text-foreground"
                    />
                    {isNameVoiceActive && (
                      <div className="flex items-center gap-2 text-xs text-red-400">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        <span>Listening... Say your name</span>
                      </div>
                    )}
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
        // Filter applications based on selected checkboxes
        const filteredApplications = userApplications.filter(app => {
          if (app.status === 'pending' && !applicationFilters.pending) return false;
          if (app.status === 'approved' && !applicationFilters.approved) return false;
          if (app.status === 'rejected' && !applicationFilters.rejected) return false;
          return true;
        });

        const getStatusBadge = (status: string) => {
          switch (status) {
            case 'approved':
              return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40">Approved</Badge>;
            case 'pending':
              return <Badge className="bg-neon-yellow/20 text-neon-yellow border-neon-yellow/40">Pending</Badge>;
            case 'rejected':
              return <Badge className="bg-red-500/20 text-red-500 border-red-500/40">Rejected</Badge>;
            default:
              return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/40">{status}</Badge>;
          }
        };

        const getActionButton = (application: Application) => {
          if (application.status === 'approved') {
            return (
              <Button
                variant="outline"
                size="sm"
                className="border-neon-green/40 text-neon-green hover:bg-neon-green/10"
                onClick={() => navigate(`/experience/portal/${application.experienceId}`)}
              >
                Open Portal
              </Button>
            );
          } else {
            return (
              <Button variant="outline" size="sm" className="border-white/20 text-foreground hover:bg-white/10">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            );
          }
        };

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Experience Applications</h1>
              <p className="text-muted-foreground">Applications for your experiences</p>
            </div>

            {/* Filter Checkboxes */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-foreground">Filter Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pending-filter"
                      checked={applicationFilters.pending}
                      onCheckedChange={(checked) => 
                        setApplicationFilters(prev => ({ ...prev, pending: checked as boolean }))
                      }
                    />
                    <Label htmlFor="pending-filter" className="text-foreground">
                        Pending ({userApplications.filter(app => app.status === 'pending').length})
                    </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <Checkbox
                      id="approved-filter"
                      checked={applicationFilters.approved}
                      onCheckedChange={(checked) => 
                        setApplicationFilters(prev => ({ ...prev, approved: checked as boolean }))
                      }
                    />
                    <Label htmlFor="approved-filter" className="text-foreground">
                        Approved ({userApplications.filter(app => app.status === 'approved').length})
                    </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rejected-filter"
                      checked={applicationFilters.rejected}
                      onCheckedChange={(checked) => 
                        setApplicationFilters(prev => ({ ...prev, rejected: checked as boolean }))
                      }
                    />
                    <Label htmlFor="rejected-filter" className="text-foreground">
                        Rejected ({userApplications.filter(app => app.status === 'rejected').length})
                    </Label>
                    </div>
                  </div>
              </CardContent>
            </Card>

            {/* Applications List */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  Applications
                  <Badge variant="secondary">
                    {filteredApplications.length} of {userApplications.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingApplications ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading applications...</p>
                  </div>
                ) : filteredApplications.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                      {userApplications.length === 0 
                        ? "No applications yet." 
                            : "No applications match the selected filters."
                          }
                        </p>
                      </div>
                ) : (
                  filteredApplications.map((application) => (
                    <Card
                      key={application.id}
                      className="bg-white/3 border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={application.image || '/default-retreat-banner.png'}
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
                              <p className="text-sm text-muted-foreground mt-1">Applicant: {application.applicantName}</p>
                              <p className="text-xs text-muted-foreground mt-1">Applied: {application.appliedAt}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(application.status)}
                            {getActionButton(application)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
                            </div>
        );

      case 'tickets':
        const getPaymentStatusBadge = (status: string) => {
          switch (status) {
            case 'succeeded':
              return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40">Paid</Badge>;
            case 'pending':
              return <Badge className="bg-neon-yellow/20 text-neon-yellow border-neon-yellow/40">Pending</Badge>;
            case 'failed':
              return <Badge className="bg-red-500/20 text-red-400 border-red-500/40">Failed</Badge>;
            case 'refunded':
              return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">Refunded</Badge>;
            case 'cancelled':
              return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/40">Cancelled</Badge>;
            default:
              return <Badge variant="secondary">{status}</Badge>;
          }
        };

        const getAttendanceStatusBadge = (status: string) => {
          switch (status) {
            case 'registered':
              return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">Registered</Badge>;
            case 'confirmed':
              return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40">Confirmed</Badge>;
            case 'attended':
              return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40">Attended</Badge>;
            case 'no_show':
              return <Badge className="bg-red-500/20 text-red-400 border-red-500/40">No Show</Badge>;
            case 'cancelled':
              return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/40">Cancelled</Badge>;
            default:
              return <Badge variant="secondary">{status}</Badge>;
          }
        };

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">My Tickets</h1>
              <p className="text-muted-foreground">Your purchased experience tickets</p>
                          </div>

            {/* Tickets List */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  Tickets
                  <Badge variant="secondary">
                    {userTickets.length} tickets
                              </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingTickets ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading tickets...</p>
                  </div>
                ) : userTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tickets purchased yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tickets will appear here after you make a purchase.
                    </p>
                  </div>
                ) : (
                  userTickets.map((ticket) => (
                    <Card key={ticket.id} className="bg-white/3 border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={ticket.experienceImage || '/default-retreat-banner.png'}
                              alt={ticket.experienceTitle}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="font-semibold text-foreground">{ticket.experienceTitle}</h3>
                              {ticket.ticketTierName && (
                                <p className="text-sm text-muted-foreground">Tier: {ticket.ticketTierName}</p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {ticket.experienceLocation}
                                </span>
                                {ticket.experienceDate && (
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(ticket.experienceDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Amount: ${(ticket.amountCents / 100).toFixed(2)} {ticket.currency}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Purchased: {new Date(ticket.purchasedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getPaymentStatusBadge(ticket.paymentStatus)}
                            {getAttendanceStatusBadge(ticket.attendanceStatus)}
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-foreground hover:bg-white/10"
                              onClick={() => navigate(`/experience/${ticket.experienceId}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Experience
                            </Button>
                            {ticket.paymentStatus === 'succeeded' && !ticket.refundedAt && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                onClick={() => handleRefundTicket(ticket.id)}
                                disabled={refundingTickets.has(ticket.id)}
                              >
                                {refundingTickets.has(ticket.id) ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refund
                                  </>
                                )}
                              </Button>
                            )}
                            {ticket.paymentStatus === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                                onClick={() => handleCancelTicket(ticket.id)}
                                disabled={cancellingTickets.has(ticket.id)}
                              >
                                {cancellingTickets.has(ticket.id) ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Experiences</p>
                      <p className="text-2xl font-bold text-foreground">{myExperiences.length}</p>
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
                       <p className="text-2xl font-bold text-foreground">{userApplications.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-neon-green" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hosted Experiences */}
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-foreground">Your Experiences</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Shows experiences you created or are hosting
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingExperiences ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading your experiences...</p>
                  </div>
                ) : myExperiences.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't created any experiences yet.</p>
                    <Link to="/experience-builder">
                      <Button className="bg-gradient-neon text-background hover:opacity-90 shadow-neon">
                        Create Your First Experience
                      </Button>
                    </Link>
                  </div>
                ) : (
                  myExperiences.map((experience) => (
                  <Card 
                    key={experience.id} 
                    className="bg-white/3 border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/experience/${experience.id}`, { state: { origin: 'hosting' } })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{experience.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(experience.date).toLocaleDateString()} • {experience.location}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant={experience.category === 'published' ? 'default' : 'secondary'} 
                                   className={experience.category === 'published' 
                                     ? 'bg-neon-green/20 text-neon-green border-neon-green/40'
                                     : 'bg-gray-700 text-gray-300'}>
                              {experience.category || 'draft'}
                            </Badge>
                            <Badge variant="outline" className="border-white/20 text-muted-foreground">
                              {experience.price ? `$${(experience.price / 100).toFixed(0)}` : 'Free'}
                            </Badge>
                            {/* Show role indicator */}
                            {experience.creatorId && experience.hostId && (
                              <Badge variant="outline" className="text-xs border-neon-cyan/40 text-neon-cyan">
                                {experience.creatorId === experience.hostId ? 'Creator & Host' : 'Creator'}
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              by {experience.hostName}
                            </span>
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
                  ))
                )}
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
              {savedExperiences.map((bookmark) => (
                <Card key={bookmark.id} className="bg-white/5 border-white/10 rounded-2xl hover:bg-white/8 transition-colors group">
                  <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                    <img
                      src={bookmark.image || '/default-retreat-banner.png'}
                      alt={bookmark.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">{bookmark.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {bookmark.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(bookmark.date).toLocaleDateString()}
                      </div>
                      <p>by {bookmark.hostName}</p>
                      <p className="text-xs">Saved: {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Button variant="outline" size="sm" className="border-white/20 text-foreground hover:bg-white/10">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => {
                          bookmarksService.removeBookmark(bookmark.experienceId).then(() => {
                            setSavedExperiences(savedExperiences.filter(b => b.id !== bookmark.id));
                            toast({ title: "Removed from saved", description: "Experience removed from saved experiences" });
                          }).catch(() => {
                            toast({ title: "Error", description: "Failed to remove experience", variant: "destructive" });
                          });
                        }}
                      >
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
              {followedHosts.map((host) => (
                <Card key={host.id} className="bg-white/5 border-white/10 rounded-2xl hover:bg-white/8 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={host.avatar || '/avatars/default-avatar.png'} alt={host.name} />
                          <AvatarFallback className="bg-neon-pink/20 text-neon-pink text-lg">
                            {host.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{host.name}</h3>
                          <p className="text-sm text-muted-foreground">{host.followers} followers</p>
                          <p className="text-sm text-muted-foreground">{host.experiences} experiences</p>
                          <p className="text-xs text-muted-foreground">Following since: {new Date(host.followedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="border-white/20 text-foreground hover:bg-white/10">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          onClick={() => {
                            followsService.unfollowUser(host.followedUserId).then(() => {
                              setFollowedHosts(followedHosts.filter(h => h.id !== host.id));
                              toast({ title: "Unfollowed", description: `Unfollowed ${host.name}` });
                            }).catch(() => {
                              toast({ title: "Error", description: "Failed to unfollow user", variant: "destructive" });
                            });
                          }}
                        >
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

              </CardContent>
            </Card>

            {/* Stripe Integration Section */}
            <StripeSettings />
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
                 onClick={handleCreateNewBrand}
                >
                  <Edit className="w-4 h-4 mr-2" />
                 Add New Brand
                </Button>
            </div>
            
             {isLoadingBrands ? (
                <Card className="bg-white/5 border-white/10 rounded-2xl">
                 <CardContent className="p-8 text-center">
                   <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                     <Building className="w-8 h-8 text-background" />
                   </div>
                   <h2 className="text-2xl font-bold text-foreground mb-2">Loading Brands...</h2>
                   <p className="text-muted-foreground">Please wait while we load your brand information.</p>
                 </CardContent>
               </Card>
             ) : userBrands.length > 0 ? (
               <div className="space-y-4">
                 {userBrands.map((brand, index) => (
                   <Card key={brand.id || index} className="bg-white/5 border-white/10 rounded-2xl">
                  <CardContent className="p-6">
                       <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-6">
                           {brand?.logo ? (
                        <img 
                               src={brand.logo} 
                          alt="Brand logo" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-neon rounded-full flex items-center justify-center font-bold text-2xl text-background">
                               {(brand?.name || user?.name || 'B').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                             <h3 className="text-2xl font-bold text-foreground">{brand?.name || 'Brand Name'}</h3>
                             <p className="text-muted-foreground">{brand?.categoryTitle || 'Professional Host'}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="secondary" className="bg-neon-cyan/20 text-neon-cyan">
                            <Users className="w-3 h-3 mr-1" />
                                 {brand?.followers || 0} followers
                          </Badge>
                          <Badge variant="secondary" className="bg-neon-purple/20 text-neon-purple">
                            <Star className="w-3 h-3 mr-1" />
                                 {brand?.rating || 0} rating
                               </Badge>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                            <Building className="w-3 h-3 mr-1" />
                            {brand?.role || 'Owner'}
                          </Badge>
                        </div>
                      </div>
                         </div>
                         <div className="flex flex-col gap-2">
                           <div className="flex gap-2">
                            <Button 
                               variant="outline" 
                               size="sm" 
                               className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10"
                              onClick={() => handleEditBrand(brand)}
                              disabled={(brand?.role || '').toLowerCase() !== 'owner'}
                             >
                               <Edit className="w-4 h-4 mr-2" />
                               Edit Brand Page
                             </Button>
                            <Button 
                               variant="outline" 
                               size="sm" 
                               className="border-neon-green/40 text-neon-green hover:bg-neon-green/10"
                              onClick={() => handleAddMember(brand)}
                              disabled={(brand?.role || '').toLowerCase() !== 'owner'}
                             >
                               <UserPlus className="w-4 h-4 mr-2" />
                               Add Member
                             </Button>
                           </div>
                          <Button 
                             variant="outline" 
                             size="sm" 
                             className="border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10"
                            onClick={() => handleViewMembers(brand)}
                            disabled={(brand?.role || '').toLowerCase() !== 'owner'}
                           >
                             <Users className="w-4 h-4 mr-2" />
                             Members List
                           </Button>
                         </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">About</h4>
                        <p className="text-muted-foreground">
                             {brand?.description || 'No description available.'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Experiences Hosted</h4>
                           <p className="text-muted-foreground">{brand?.experiencesCount || 0} experiences • {brand?.participantsCount || 0} total participants</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                 ))}
               </div>
             ) : (
              <Card className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-background" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">No Brand Page</h2>
                   <p className="text-muted-foreground mb-6">You don't have a brand page yet.</p>
                  <Button 
                     className="bg-gradient-neon text-background hover:opacity-90 shadow-neon"
                     onClick={handleCreateNewBrand}
                  >
                    Create Brand Page
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-muted-foreground">Checking authentication…</div>
    );
  }

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
              </div>
            </div>
          </div>

          {/* Mobile Navigation Tabs (wrapped, no horizontal scroll) */}
          <div className="lg:hidden mb-6">
            {/* Profile group */}
            <div className="px-1 mb-2 text-xs uppercase tracking-wider text-foreground/70">Profile</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {profileItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all ${
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
            </div>

            {/* Hosting group */}
            <div className="px-1 mb-2 text-xs uppercase tracking-wider text-foreground/70">Hosting</div>
            <div className="grid grid-cols-2 gap-2">
              {hostingItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all ${
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
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:max-w-none">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Edit Brand Modal */}
      {showEditBrandModal && (
        <EditBrandPageModal
          isOpen={showEditBrandModal}
          onClose={() => setShowEditBrandModal(false)}
          onSave={handleSaveBrand}
           initialData={isCreatingNewBrand ? undefined : selectedBrand}
          userName={user?.name}
        />
      )}

      {/* Add/Find Member Modal */}
      {showAddMemberModal && selectedBrand && (
        <AddFindMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          brandId={selectedBrand.id}
          brandName={selectedBrand.name}
          onMemberAdded={() => {
            // Optionally refresh brand data or show success message
          }}
        />
      )}

      {/* Members List Modal */}
      {showMembersListModal && selectedBrand && (
        <MembersListModal
          isOpen={showMembersListModal}
          onClose={() => setShowMembersListModal(false)}
          brandId={selectedBrand.id}
          brandName={selectedBrand.name}
        />
      )}
    </div>
  );
}

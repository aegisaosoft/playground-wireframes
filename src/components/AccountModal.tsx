import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Upload, Calendar, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Retreat } from "@/components/RetreatGrid";
import { ApplicantManagement } from "@/components/ApplicantManagement";
import { UserRetreatDashboard } from "@/components/UserRetreatDashboard";
import { BrandEditor, BrandData } from "@/components/BrandEditor";
import { Applicant, RetreatWithApplicants } from "@/types/applicant";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  onUpdateUser: (user: { name: string; email: string }) => void;
  userRetreats: Retreat[];
  onEditRetreat: (retreat: Retreat) => void;
  savedRetreats: number[];
  followedHosts: string[];
  retreats: Retreat[];
  userBrandData?: BrandData;
  onSaveBrandData?: (brandData: BrandData) => void;
}

export const AccountModal = ({ isOpen, onClose, user, onLogout, onUpdateUser, userRetreats, onEditRetreat, savedRetreats, followedHosts, retreats, userBrandData, onSaveBrandData }: AccountModalProps) => {
  const [name, setName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [selectedRetreatForManagement, setSelectedRetreatForManagement] = useState<RetreatWithApplicants | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'management'>('dashboard');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Generate sample applicant data for demo
  useEffect(() => {
    if (userRetreats.length > 0) {
      const sampleApplicants: Applicant[] = [
        {
          id: '1',
          name: 'Emma Thompson',
          email: 'emma.thompson@email.com',
          retreatId: userRetreats[0].id,
          status: 'pending',
          applicationAnswers: [
            { question: 'Why are you interested in this retreat?', answer: 'I am looking to disconnect from technology and reconnect with nature. This retreat seems perfect for my personal growth journey.' },
            { question: 'What experience do you have with mindfulness?', answer: 'I have been practicing meditation for 2 years and attend weekly yoga classes.' },
            { question: 'Any dietary restrictions?', answer: 'I am vegetarian and prefer organic, locally-sourced food.' }
          ],
          appliedAt: '2024-01-10T10:30:00Z'
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          retreatId: userRetreats[0].id,
          status: 'approved',
          applicationAnswers: [
            { question: 'Why are you interested in this retreat?', answer: 'I need a break from my demanding work schedule and want to learn mindfulness techniques.' },
            { question: 'What experience do you have with mindfulness?', answer: 'Complete beginner, but very eager to learn.' },
            { question: 'Any dietary restrictions?', answer: 'No dietary restrictions.' }
          ],
          appliedAt: '2024-01-08T14:20:00Z',
          processedAt: '2024-01-09T09:15:00Z'
        },
        {
          id: '3',
          name: 'Sarah Williams',
          email: 'sarah.williams@email.com',
          retreatId: userRetreats[0].id,
          status: 'rejected',
          applicationAnswers: [
            { question: 'Why are you interested in this retreat?', answer: 'Just looking for a vacation.' },
            { question: 'What experience do you have with mindfulness?', answer: 'None, not really interested in meditation.' },
            { question: 'Any dietary restrictions?', answer: 'No.' }
          ],
          appliedAt: '2024-01-12T16:45:00Z',
          processedAt: '2024-01-13T11:30:00Z'
        }
      ];
      setApplicants(sampleApplicants);
    }
  }, [userRetreats]);

  // Sample user applications for the dashboard
  const userApplications: Applicant[] = [
    {
      id: '4',
      name: user?.name || 'User',
      email: user?.email || 'user@example.com',
      retreatId: retreats[1]?.id || 2,
      status: 'approved',
      applicationAnswers: [],
      appliedAt: '2024-01-15T10:00:00Z',
      processedAt: '2024-01-16T09:00:00Z'
    },
    {
      id: '5',
      name: user?.name || 'User',
      email: user?.email || 'user@example.com',
      retreatId: retreats[2]?.id || 3,
      status: 'pending',
      applicationAnswers: [],
      appliedAt: '2024-01-18T14:30:00Z'
    }
  ];

  const handleSaveChanges = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      onUpdateUser(updatedUser);
      
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
    onLogout();
    onClose();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
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

  const handleManageApplicants = (retreat: Retreat) => {
    const retreatWithApplicants: RetreatWithApplicants = {
      id: retreat.id,
      title: retreat.title,
      location: retreat.location,
      date: retreat.date,
      image: retreat.image,
      applicants: applicants.filter(a => a.retreatId === retreat.id)
    };
    setSelectedRetreatForManagement(retreatWithApplicants);
    setCurrentView('management');
  };

  const handleUpdateApplicant = (applicantId: string, status: 'approved' | 'rejected') => {
    setApplicants(prev => prev.map(applicant => 
      applicant.id === applicantId 
        ? { ...applicant, status, processedAt: new Date().toISOString() }
        : applicant
    ));
  };

  const handleAddApplicants = (retreatId: number, newApplicants: Omit<Applicant, 'id' | 'retreatId' | 'appliedAt'>[]) => {
    const applicantsWithIds = newApplicants.map((applicant, index) => ({
      ...applicant,
      id: `imported-${Date.now()}-${index}`,
      retreatId,
      appliedAt: new Date().toISOString()
    }));
    setApplicants(prev => [...prev, ...applicantsWithIds]);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedRetreatForManagement(null);
  };

  const handleViewHostRetreats = (hostName: string) => {
    // Create a URL-friendly slug from the host name
    const hostSlug = hostName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    navigate(`/brand/${hostSlug}`);
    onClose(); // Close the modal after navigation
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            My Account
          </DialogTitle>
        </DialogHeader>
        
        {currentView === 'management' && selectedRetreatForManagement ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleBackToDashboard}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-xl font-semibold">Manage Applicants</h2>
            </div>
            <ApplicantManagement
              retreat={selectedRetreatForManagement}
              onUpdateApplicant={handleUpdateApplicant}
              onAddApplicants={handleAddApplicants}
            />
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="retreats">My Retreats</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profilePic || ""} alt="Profile" />
                    <AvatarFallback className="text-lg">
                      {name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="profile-pic">Profile Picture</Label>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="flex-1 bg-coral hover:bg-coral-dark text-white"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="flex-1"
                  >
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Brand Section - only show if user has brand data */}
            {userBrandData && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Brand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-coral text-white rounded-full flex items-center justify-center font-semibold">
                        {userBrandData?.logo ? (
                          <img 
                            src={userBrandData.logo} 
                            alt="Brand logo" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          (user?.email || '').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{userBrandData?.name || "Your Brand"}</p>
                        <p className="text-sm text-muted-foreground">
                          {userRetreats.length} retreat{userRetreats.length !== 1 ? 's' : ''} under this brand
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Followers: 42
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const userId = user?.email?.replace('@', '_').replace('.', '_') || 'user';
                        window.open(`/brand/${userId}`, '_blank');
                      }}
                    >
                      Edit Brand Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="retreats" className="space-y-6">
            {/* Approved Retreats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Approved Retreats
                  <Badge variant="secondary">{userApplications.filter(app => app.status === 'approved').length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userApplications.filter(app => app.status === 'approved').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No approved retreats yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Apply to retreats to see them here once approved.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userApplications.filter(app => app.status === 'approved').map((application) => {
                      const retreat = retreats.find(r => r.id === application.retreatId);
                      if (!retreat) return null;
                      
                      return (
                        <Card key={retreat.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={retreat.image}
                                alt={retreat.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold">{retreat.title}</h3>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {retreat.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {retreat.date}
                                  </span>
                                </div>
                                {retreat.price && (
                                  <p className="text-sm font-medium text-coral mt-1">${retreat.price}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default">Approved</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/retreat/${retreat.id}`, '_blank')}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Retreats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pending Retreats
                  <Badge variant="secondary">{userApplications.filter(app => app.status === 'pending').length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userApplications.filter(app => app.status === 'pending').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending applications.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your retreat applications awaiting approval will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userApplications.filter(app => app.status === 'pending').map((application) => {
                      const retreat = retreats.find(r => r.id === application.retreatId);
                      if (!retreat) return null;
                      
                      return (
                        <Card key={retreat.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={retreat.image}
                                alt={retreat.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold">{retreat.title}</h3>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {retreat.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {retreat.date}
                                  </span>
                                </div>
                                {retreat.price && (
                                  <p className="text-sm font-medium text-coral mt-1">${retreat.price}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">Pending</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/retreat/${retreat.id}`, '_blank')}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hosting Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Hosting
                  <Badge variant="secondary">{userRetreats.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userRetreats.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't created any retreats yet.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={onClose}
                    >
                      Create Your First Retreat
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {userRetreats.map((retreat) => {
                      const retreatApplicants = applicants.filter(a => a.retreatId === retreat.id);
                      const pendingCount = retreatApplicants.filter(a => a.status === 'pending').length;
                      const approvedCount = retreatApplicants.filter(a => a.status === 'approved').length;
                      
                      return (
                        <Card key={retreat.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={retreat.image}
                                alt={retreat.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div>
                                <h3 className="font-semibold">{retreat.title}</h3>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {retreat.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {retreat.date}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {approvedCount} approved
                                  </Badge>
                                  {pendingCount > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {pendingCount} pending
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManageApplicants(retreat)}
                              >
                                <Users className="w-4 h-4 mr-1" />
                                Manage Applicants
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditRetreat(retreat)}
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Retreats ({retreats.filter(r => savedRetreats.includes(r.id)).length})</CardTitle>
              </CardHeader>
              <CardContent>
                {retreats.filter(r => savedRetreats.includes(r.id)).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No saved retreats yet.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={onClose}
                    >
                      Discover Retreats
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {retreats.filter(r => savedRetreats.includes(r.id)).map((retreat) => (
                      <Card key={retreat.id} className="p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={retreat.image}
                            alt={retreat.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{retreat.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {retreat.location}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {retreat.date}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-coral">${retreat.price}</p>
                            <Badge variant="secondary" className="text-xs">Saved</Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Following Hosts ({followedHosts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {followedHosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You're not following any hosts yet.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={onClose}
                    >
                      Discover Hosts
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {followedHosts.map((hostName, index) => {
                      // Find a retreat by this host to get their info
                      const hostRetreat = retreats.find(r => r.organizer?.name === hostName);
                      return (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={hostRetreat?.organizer?.avatar} alt={hostName} />
                                <AvatarFallback>
                                  {hostName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{hostName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {retreats.filter(r => r.organizer?.name === hostName).length} retreat{retreats.filter(r => r.organizer?.name === hostName).length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewHostRetreats(hostName)}
                            >
                              View Retreats
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Calendar, MessageCircle, Bell, Settings, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExperiencePortalData } from '@/types/experiencePortal';
import { PortalOverview } from '@/components/ExperiencePortal/PortalOverview';
import { PortalChat } from '@/components/ExperiencePortal/PortalChat';
import { PortalAttendees } from '@/components/ExperiencePortal/PortalAttendees';
import { PortalSchedule } from '@/components/ExperiencePortal/PortalSchedule';
import { PortalResources } from '@/components/ExperiencePortal/PortalResources';
import { PortalAnnouncements } from '@/components/ExperiencePortal/PortalAnnouncements';
import { PortalLogistics } from '@/components/ExperiencePortal/PortalLogistics';
import { experiencesService } from '@/services/experiences.service';
import { applicationsService } from '@/services/applications.service';
import { useUser } from '@/contexts/UserContext';

export default function ExperiencePortal() {
  const { experienceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: isLoadingUser } = useUser();
  
  const [portalData, setPortalData] = useState<ExperiencePortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadExperienceData = async () => {
    if (!experienceId) {
      navigate('/experiences');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login');
      setError('You must be logged in to access the experience portal');
      setLoading(false);
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📥 Loading experience portal data:', experienceId);
      
      // Fetch experience data from API
      const experience = await experiencesService.getById(experienceId);
      console.log('✅ Experience loaded:', experience);
      
      // Fetch applications/attendees for this experience
      const applications = await applicationsService.getExperienceApplications(experienceId);
      console.log('✅ Applications loaded:', applications);
      
      // Transform API data to portal format
      const portalData: ExperiencePortalData = {
        experienceId,
        title: experience.title || 'Untitled Experience',
        location: experience.location || 'Location TBA',
        dates: experience.startDate && experience.endDate 
          ? `${new Date(experience.startDate).toLocaleDateString()} - ${new Date(experience.endDate).toLocaleDateString()}`
          : 'Dates TBA',
        image: experience.featuredImageUrl || experience.image || '/default-retreat-banner.png',
        description: experience.description || 'No description available',
        highlights: experience.highlights || [],
        
        // Organizer info (host)
        organizer: {
          id: experience.hostId || experience.creatorId || 'unknown',
          name: experience.hostName || experience.host?.name || 'Unknown Host',
          email: experience.host?.email || '',
          avatar: experience.host?.profileImageUrl || '/avatars/default-avatar.png',
          bio: experience.host?.bio || '',
          role: 'organizer'
        },
        
        // Transform applications to attendees
        attendees: [
          // Add organizer first
          {
            id: experience.hostId || experience.creatorId || 'unknown',
            name: experience.hostName || experience.host?.name || 'Unknown Host',
            email: experience.host?.email || '',
            avatar: experience.host?.profileImageUrl || '/avatars/default-avatar.png',
            role: 'organizer'
          },
          // Add approved applications as attendees
          ...applications
            .filter(app => app.status === 'approved')
            .map(app => ({
              id: app.userId || app.user?.id || 'unknown',
              name: app.userName || app.user?.name || 'Unknown User',
              email: app.userEmail || app.user?.email || '',
              avatar: app.userProfileImageUrl || app.user?.profileImageUrl || '/avatars/default-avatar.png',
              role: 'attendee' as const
            }))
        ],
        
        // Schedule from agenda
        schedule: experience.agenda ? experience.agenda.map(day => ({
          date: day.day || 'TBA',
          activities: day.items || []
        })) : [],
        
        // Resources
        resources: experience.resources ? experience.resources.map(resource => ({
          id: resource.id || Math.random().toString(),
          title: resource.title || 'Untitled Resource',
          url: resource.url || '#',
          description: resource.description || '',
          type: resource.type || 'link'
        })) : [],
        
        // Announcements (empty for now - would need announcements API)
        announcements: [],
        
        // Logistics
        logistics: {
          address: experience.location || experience.address || '',
          meetupInstructions: experience.meetupInstructions || '',
          checkInNotes: experience.checkInNotes || '',
          emergencyContactName: experience.emergencyContactName || '',
          emergencyContactPhone: experience.emergencyContactPhone || '',
          additionalInfo: experience.additionalInfo || ''
        },
        
        // Chat messages (empty for now - would need chat API)
        chatMessages: [],
        
        // Experience stats
        stats: {
          totalAttendees: applications.filter(app => app.status === 'approved').length + 1, // +1 for organizer
          totalApplications: applications.length,
          pendingApplications: applications.filter(app => app.status === 'pending').length,
          approvedApplications: applications.filter(app => app.status === 'approved').length,
          rejectedApplications: applications.filter(app => app.status === 'rejected').length
        }
      };

      setPortalData(portalData);
      console.log('✅ Portal data transformed and set:', portalData);
      
    } catch (err) {
      console.error('❌ Failed to load experience portal data:', err);
      setError('Failed to load experience data');
      toast({
        title: "Error",
        description: "Failed to load experience portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for user authentication to load before fetching data
    if (!isLoadingUser) {
      loadExperienceData();
    }
  }, [experienceId, isAuthenticated, isLoadingUser, navigate, toast]);

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/experiences/${experienceId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied",
      description: "Experience invite link copied to clipboard",
    });
  };

  const handleLeaveExperience = () => {
    // This would typically involve an API call to remove the user from the experience
    toast({
      title: "Left Experience",
      description: "You have left this experience",
    });
    navigate('/experiences');
  };

  // Show loading while user authentication is loading or portal data is loading
  if (isLoadingUser || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-neon-cyan" />
          <p className="text-muted-foreground">
            {isLoadingUser ? 'Loading user authentication...' : 'Loading experience portal...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated or other errors
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">You must be logged in to access the experience portal</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Experience not found'}</p>
          <Button onClick={() => navigate('/experiences')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Experiences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-gray-800 bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/experiences')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{portalData.title}</h1>
                <p className="text-muted-foreground">
                  {portalData.location} • {portalData.dates}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCopyInviteLink}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                onClick={handleLeaveExperience}
                variant="destructive"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="announcements">Updates</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PortalOverview data={portalData} />
          </TabsContent>

          <TabsContent value="schedule">
            <PortalSchedule data={portalData} />
          </TabsContent>

          <TabsContent value="attendees">
            <PortalAttendees data={portalData} />
          </TabsContent>

          <TabsContent value="resources">
            <PortalResources data={portalData} />
          </TabsContent>

          <TabsContent value="announcements">
            <PortalAnnouncements data={portalData} />
          </TabsContent>

          <TabsContent value="logistics">
            <PortalLogistics data={portalData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
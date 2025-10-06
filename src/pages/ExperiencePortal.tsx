import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Calendar, MessageCircle, Bell, Settings, LogOut } from 'lucide-react';
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

// Mock data - in real app, this would come from Supabase
const getMockExperienceData = (experienceId: string): ExperiencePortalData => ({
  experienceId,
  title: "Desert Code Camp",
  location: "Joshua Tree, CA",
  dates: "March 15-20, 2024",
  image: "/src/assets/retreat-bali.jpg",
  description: "Build your startup under the stars. Code by day, campfire talks by night.",
  highlights: [
    "Star-gazing sessions",
    "Sunrise yoga", 
    "Technical workshops",
    "1-on-1 mentorship",
    "Desert hiking trails",
    "Community campfire talks"
  ],
  organizer: {
    id: "1",
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "/placeholder.svg",
    bio: "Former Silicon Valley engineer turned desert philosopher.",
    role: "organizer"
  },
  attendees: [
    {
      id: "1",
      name: "Alex Chen",
      email: "alex@example.com", 
      avatar: "/placeholder.svg",
      role: "organizer"
    },
    {
      id: "2", 
      name: "Sarah Martinez",
      email: "sarah@example.com",
      avatar: "/placeholder.svg",
      role: "attendee"
    },
    {
      id: "3",
      name: "Mike Johnson", 
      email: "mike@example.com",
      avatar: "/placeholder.svg",
      role: "co-host"
    }
  ],
  userRole: "attendee", // Mock - would be determined from auth
  isApproved: true,
  agenda: [
    {
      day: "Day 1",
      items: [
        { time: "09:00", activity: "Arrival & Setup", description: "Welcome circle and camp setup" },
        { time: "11:00", activity: "Desert Orientation Walk" },
        { time: "14:00", activity: "Lunch & Project Planning" }
      ]
    }
  ],
  ticketTier: {
    name: "Early Bird",
    price: 899
  },
  visibility: "private",
  logistics: {
    address: "Joshua Tree National Park, 74485 National Park Dr, Twentynine Palms, CA 92277",
    meetupInstructions: "Meet at the visitor center at 9 AM sharp. Look for the Desert Code Camp banner.",
    checkInNotes: "Bring your confirmation email and a valid ID.",
    emergencyContact: {
      name: "Alex Chen",
      phone: "+1 (555) 123-4567"
    }
  }
});

const ExperiencePortal = () => {
  const { experienceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isChatMuted, setIsChatMuted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  if (!experienceId) {
    return <div>Experience not found</div>;
  }

  const experienceData = getMockExperienceData(experienceId);
  const isHost = experienceData.userRole === 'organizer' || experienceData.userRole === 'co-host';

  const handleCopyPrivateLink = () => {
    const privateUrl = `${window.location.origin}/experience/portal/${experienceId}`;
    navigator.clipboard.writeText(privateUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "Private portal link has been copied to clipboard.",
      });
    });
  };

  const handleAddToCalendar = () => {
    toast({
      title: "Calendar event created",
      description: "Experience dates have been added to your calendar.",
    });
  };

  const handleLeaveExperience = () => {
    toast({
      title: "Left experience",
      description: "You have left this experience portal.",
      variant: "destructive"
    });
    navigate('/account');
  };

  if (!experienceData.isApproved && experienceData.userRole === 'pending') {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
          <Button variant="ghost" onClick={() => navigate('/account')} className="mb-6 text-gray-400 hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Account
          </Button>
          
          {/* Pending Banner */}
          <div className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-neon-yellow/20 text-neon-yellow">Pending Approval</Badge>
              <h1 className="text-2xl font-bold text-foreground">{experienceData.title}</h1>
            </div>
            <p className="text-muted-foreground">
              Your application is being reviewed. You'll get access to the full portal once approved.
            </p>
          </div>

          {/* Read-only Overview */}
          <PortalOverview data={experienceData} isReadOnly />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <Button variant="ghost" onClick={() => navigate('/account')} className="mb-6 text-gray-400 hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Account
        </Button>

        {/* Hero Header */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <img 
            src={experienceData.image} 
            alt={experienceData.title}
            className="w-full h-[300px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {experienceData.title}
                </h1>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <span>{experienceData.location}</span>
                  <span>•</span>
                  <span>{experienceData.dates}</span>
                  {experienceData.visibility === 'private' && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="bg-neon-purple/20 text-neon-purple">
                        Private
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleCopyPrivateLink}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button size="sm" variant="secondary" onClick={handleAddToCalendar}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setIsChatMuted(!isChatMuted)}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Bell className="w-4 h-4 mr-2" />
                  {isChatMuted ? 'Unmute' : 'Mute'} Chat
                </Button>
                <Button size="sm" variant="destructive" onClick={handleLeaveExperience}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Three-pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Rail - Tabs */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-card border border-border rounded-xl p-1 mb-6">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="chat" className="flex-1 relative">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-neon-pink text-background text-xs min-w-[20px] h-5">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="attendees" className="flex-1">Attendees</TabsTrigger>
                <TabsTrigger value="schedule" className="flex-1">Schedule</TabsTrigger>
                <TabsTrigger value="resources" className="flex-1">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <PortalOverview data={experienceData} />
              </TabsContent>
              
              <TabsContent value="chat">
                <PortalChat experienceId={experienceId} userRole={experienceData.userRole} />
              </TabsContent>
              
              <TabsContent value="attendees">
                <PortalAttendees 
                  attendees={experienceData.attendees} 
                  userRole={experienceData.userRole}
                />
              </TabsContent>
              
              <TabsContent value="schedule">
                <PortalSchedule agenda={experienceData.agenda} />
              </TabsContent>
              
              <TabsContent value="resources">
                <PortalResources userRole={experienceData.userRole} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Rail */}
          <div className="space-y-6">
            {/* Announcements */}
            <PortalAnnouncements userRole={experienceData.userRole} />
            
            {/* Logistics */}
            <PortalLogistics 
              logistics={experienceData.logistics}
              isApproved={experienceData.isApproved}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExperiencePortal;
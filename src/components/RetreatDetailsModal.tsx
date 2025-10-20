import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, MapPin, Users, Clock, ExternalLink, Heart, UserPlus, UserCheck, ChevronDown } from "lucide-react";
import { RichContentDisplay } from "./RichContentDisplay";
import { ContentBlock } from "./RichContentEditor";
import { ApplicationPreviewModal, TicketTier, ApplicationField } from "./ApplicationPreviewModal";
import { useNotification } from '@/contexts/NotificationContext';

export interface RetreatDetail {
  id: number;
  image: string;
  location: string;
  date: string;
  title: string;
  description?: string;
  capacity?: number;
  spotsRemaining?: number;
  agendaVisibility?: 'public' | 'private';
  agenda?: Array<{
    date: string;
    activities: Array<{
      time: string;
      title: string;
      description?: string;
    }>;
  }>;
  organizer?: {
    name: string;
    avatar?: string;
    profileLink?: string;
  };
  price?: number;
  requiresApplication?: boolean;
  extendedContent?: ContentBlock[];
  ticketTiers?: TicketTier[];
  applicationForm?: ApplicationField[];
}

interface RetreatDetailsModalProps {
  retreat: RetreatDetail | null;
  isOpen: boolean;
  onClose: () => void;
  savedRetreats: number[];
  onToggleSaveRetreat: (retreatId: number) => void;
  followedHosts: string[];
  onToggleFollowHost: (hostName: string) => void;
}

export const RetreatDetailsModal = ({ retreat, isOpen, onClose, savedRetreats, onToggleSaveRetreat, followedHosts, onToggleFollowHost }: RetreatDetailsModalProps) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const navigate = useNavigate();
  const { showInfo } = useNotification();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSaveClick = () => {
    if (!user || !retreat) {
      showInfo('Login Required', 'Please log in to save retreats');
      return;
    }
    onToggleSaveRetreat(retreat.id);
  };

  const handleFollowClick = () => {
    if (!user || !retreat?.organizer) {
      showInfo('Login Required', 'Please log in to follow hosts');
      return;
    }
    onToggleFollowHost(retreat.organizer.name);
  };

  const handleApply = () => {
    if (!user) {
      showInfo('Login Required', 'Please log in to apply');
      return;
    }
    // Show preview modal first
    setIsPreviewModalOpen(true);
  };

  const handleContinueToApply = async () => {
    setIsPreviewModalOpen(false);
    setIsApplying(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsApplying(false);
    // Handle actual application logic here
    console.log('Applied to retreat:', retreat?.title);
  };

  const handleHostClick = () => {
    if (retreat.organizer) {
      const hostId = retreat.organizer.name.toLowerCase().replace(/\s+/g, '-');
      onClose(); // Close modal before navigating
      navigate(`/host/${hostId}`);
    }
  };

  if (!retreat) return null;

  const isSaved = savedRetreats.includes(retreat.id);
  const isFollowing = followedHosts.includes(retreat.organizer?.name || '');

  const formatDate = (dateStr: string) => {
    const [startDate, endDate] = dateStr.split('–');
    return {
      start: startDate.trim(),
      end: endDate?.trim() || startDate.trim()
    };
  };

  const dateRange = formatDate(retreat.date);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={retreat.image}
              alt={retreat.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute top-4 right-4">
              {retreat.spotsRemaining && retreat.spotsRemaining <= 5 && (
                <Badge className="bg-destructive/90 text-white">
                  Only {retreat.spotsRemaining} spots left
                </Badge>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Retreat Overview */}
            {/* Header Block */}
            <div className="space-y-4">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold leading-tight flex items-center justify-between">
                  <span>{retreat.title}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(`/retreat/${retreat.id}`, '_blank')}
                    className="text-muted-foreground hover:text-foreground ml-4"
                    title="Open full page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </DialogTitle>
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{retreat.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{retreat.date}</span>
                  </div>
                  {retreat.capacity && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{retreat.capacity} spots total</span>
                    </div>
                  )}
                </div>
              </DialogHeader>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                  {retreat.price && (
                    <span className="text-2xl font-bold text-primary">
                      ${retreat.price}
                    </span>
                  )}
                  {retreat.spotsRemaining && (
                    <span className="text-sm text-muted-foreground">
                      {retreat.spotsRemaining} spots remaining
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="bg-coral hover:bg-coral-dark text-white px-6 py-2"
                  >
                    {isApplying 
                      ? "Processing..." 
                      : retreat.requiresApplication 
                        ? "Apply Now" 
                        : "Purchase Ticket"
                    }
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleSaveClick}
                    className="border-coral text-coral hover:bg-coral hover:text-white"
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            {retreat.description && (
              <div className="space-y-2">
                <p className="text-foreground leading-relaxed">
                  {retreat.description}
                </p>
              </div>
            )}

            {/* Meet Your Host */}
            {retreat.organizer && (
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-3">Meet Your Host</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="cursor-pointer" onClick={handleHostClick}>
                      <AvatarImage src={retreat.organizer.avatar} alt={retreat.organizer.name} />
                      <AvatarFallback>
                        {retreat.organizer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <button 
                        onClick={handleHostClick}
                        className="font-medium text-coral hover:text-coral-dark transition-colors text-left"
                      >
                        {retreat.organizer.name}
                      </button>
                      <p className="text-sm text-muted-foreground">Retreat Organizer</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={isFollowing ? "default" : "outline"}
                      size="sm"
                      onClick={handleFollowClick}
                      className={isFollowing ? "bg-coral hover:bg-coral-dark text-white" : "border-coral text-coral hover:bg-coral hover:text-white"}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleHostClick}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible Sections */}
            <Accordion type="multiple" className="w-full space-y-4">
              {/* More About the Retreat */}
              <AccordionItem value="more-about" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  More About This Retreat
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <RichContentDisplay 
                    blocks={retreat.extendedContent || []}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Agenda */}
              <AccordionItem value="agenda" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  📅 Agenda
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {retreat.agendaVisibility === 'private' ? (
                    <Card className="border-dashed">
                      <CardContent className="p-4 text-center text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Agenda available to confirmed guests</p>
                      </CardContent>
                    </Card>
                  ) : retreat.agenda && retreat.agenda.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                      {retreat.agenda.map((day, index) => (
                        <AccordionItem key={index} value={`day-${index}`} className="border rounded-lg mb-3">
                          <AccordionTrigger className="px-4 font-semibold text-foreground hover:no-underline">
                            {day.date}
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-3">
                              {day.activities.map((activity, actIndex) => (
                                <div key={actIndex} className="flex gap-3">
                                  <div className="flex-shrink-0">
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {activity.time}
                                    </Badge>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-foreground">
                                      {activity.title}
                                    </h5>
                                    {activity.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {activity.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-4 text-center text-muted-foreground">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Detailed agenda coming soon</p>
                      </CardContent>
                    </Card>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Application Preview Modal */}
      <ApplicationPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onContinueToApply={handleContinueToApply}
        retreatTitle={retreat?.title || ''}
        selectedTicketTier={retreat?.ticketTiers?.[0]} // Use first tier as default, or implement tier selection
        applicationFields={retreat?.applicationForm || []}
        mode="apply" // Users are applying, not previewing
      />
    </Dialog>
  );
};

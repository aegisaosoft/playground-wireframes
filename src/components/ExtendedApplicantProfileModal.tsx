import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Play, Linkedin, Instagram, ExternalLink, MapPin, Briefcase } from 'lucide-react';
import { Applicant } from '@/types/applicant';
import { SocialLinksDisplay } from '@/components/SocialLinksDisplay';
import { XIcon } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';

interface ExtendedApplicantProfileModalProps {
  applicant: Applicant | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateApplicant: (applicantId: string, status: 'approved' | 'rejected') => void;
  onUpdateNotes: (applicantId: string, notes: string) => void;
}

export const ExtendedApplicantProfileModal: React.FC<ExtendedApplicantProfileModalProps> = ({
  applicant,
  isOpen,
  onClose,
  onUpdateApplicant,
  onUpdateNotes
}) => {
  const [notes, setNotes] = useState(applicant?.organizerNotes || '');
  const { toast } = useToast();

  if (!applicant) return null;

  const handleSaveForLater = () => {
    if (notes !== (applicant.organizerNotes || '')) {
      onUpdateNotes(applicant.id, notes);
      toast({
        title: "Notes saved",
        description: "Your private notes have been saved.",
      });
    }
    onClose();
  };

  const handlePlayVoiceIntro = () => {
    if (applicant.profile?.voiceIntro) {
      // This would implement audio playback - placeholder for now
      toast({
        title: "Playing voice intro",
        description: "Voice intro playback would start here.",
      });
    }
  };

  const handleApprove = () => {
    onUpdateApplicant(applicant.id, 'approved');
    toast({
      title: "Applicant approved",
      description: `${applicant.name} has been approved for the retreat.`,
    });
    onClose();
  };

  const handleReject = () => {
    onUpdateApplicant(applicant.id, 'rejected');
    toast({
      title: "Applicant rejected",
      description: `${applicant.name} has been rejected.`,
    });
    onClose();
  };

  const profile = applicant.profile;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Applicant Profile</DialogTitle>
        </DialogHeader>

        {/* Header Section */}
        <div className="flex items-start gap-6 pb-6 border-b border-border">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile?.profilePicture} alt={applicant.name} />
            <AvatarFallback className="text-lg font-semibold">
              {applicant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold text-foreground">{applicant.name}</h2>
            <p className="text-muted-foreground">{applicant.email}</p>
            <Badge variant={
              applicant.status === 'approved' ? 'default' :
              applicant.status === 'rejected' ? 'destructive' : 'secondary'
            }>
              {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
            </Badge>
            {profile?.bio && (
              <p className="text-sm text-foreground leading-relaxed mt-3">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        {(profile?.interests || profile?.skills || profile?.preferredLocations || profile?.experienceTypes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile?.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/30 text-purple-300">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  Skills & Roles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/30 text-blue-300">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile?.preferredLocations && profile.preferredLocations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  Preferred Locations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredLocations.map((location, index) => (
                    <Badge key={index} variant="outline" className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30 text-green-300">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile?.experienceTypes && profile.experienceTypes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></span>
                  Experience Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.experienceTypes.map((type, index) => (
                    <Badge key={index} variant="outline" className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-400/30 text-orange-300">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Social Media & Voice Intro */}
        <div className="flex items-center justify-between">
          {profile?.socialAccounts && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Social Media</h3>
              <SocialLinksDisplay socialAccounts={profile.socialAccounts} size="md" />
            </div>
          )}

          {profile?.voiceIntro && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Voice Intro</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayVoiceIntro}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Listen to Intro ({Math.round(profile.voiceIntro.duration)}s)
              </Button>
            </div>
          )}
        </div>

        {/* Application Answers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Application Answers</h3>
          <div className="space-y-4">
            {applicant.applicationAnswers.map((answer, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="p-4 space-y-2">
                  <Label className="font-medium text-foreground">{answer.question}</Label>
                  <p className="text-sm text-foreground leading-relaxed">{answer.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Private Notes */}
        <div className="space-y-3">
          <Label htmlFor="organizer-notes" className="text-sm font-semibold text-foreground">
            Private Notes (visible only to organizers)
          </Label>
          <Textarea
            id="organizer-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add private notes about this applicant..."
            className="min-h-[80px] bg-muted/30"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <div className="flex gap-3 flex-1">
            {applicant.status === 'pending' && (
              <>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={handleSaveForLater}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Save Notes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
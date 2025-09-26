import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Eye, MapPin, Calendar, Repeat } from 'lucide-react';
import { Applicant } from '@/types/applicant';
import { SocialLinksDisplay } from '@/components/SocialLinksDisplay';

interface EnhancedApplicantCardProps {
  applicant: Applicant;
  showActions?: boolean;
  onViewProfile: (applicant: Applicant) => void;
  onApprove?: (applicantId: string) => void;
  onReject?: (applicantId: string) => void;
}

export const EnhancedApplicantCard: React.FC<EnhancedApplicantCardProps> = ({
  applicant,
  showActions = true,
  onViewProfile,
  onApprove,
  onReject
}) => {
  const profile = applicant.profile;
  const bioPreview = profile?.bio ? 
    profile.bio.length > 100 ? 
      profile.bio.substring(0, 100) + '...' : 
      profile.bio 
    : null;

  const preferredLocation = profile?.preferredLocations?.[0];
  const hasAppliedBefore = profile?.previousApplications && profile.previousApplications > 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-card/50 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Profile Section */}
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="w-12 h-12 ring-2 ring-border/20">
              <AvatarImage src={profile?.profilePicture} alt={applicant.name} />
              <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-secondary/20">
                {applicant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{applicant.name}</h3>
                {hasAppliedBefore && (
                  <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-400/30 text-amber-300">
                    <Repeat className="w-3 h-3 mr-1" />
                    Returning
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{applicant.email}</p>
              
              {bioPreview && (
                <p className="text-sm text-foreground/80 leading-relaxed mb-3">{bioPreview}</p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                {preferredLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {preferredLocation}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Social Media Icons */}
              {profile?.socialAccounts && (
                <div className="mb-3">
                  <SocialLinksDisplay 
                    socialAccounts={profile.socialAccounts} 
                    size="sm" 
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(applicant)}
              className="min-w-[120px] bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Full Profile
            </Button>
            
            {showActions && applicant.status === 'pending' && onApprove && onReject && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApprove(applicant.id)}
                  className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-600/10 border-green-600/30"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(applicant.id)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-600/10 border-red-600/30"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {applicant.status !== 'pending' && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <Badge 
              variant={applicant.status === 'approved' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
              {applicant.processedAt && (
                <span className="ml-2 opacity-70">
                  on {new Date(applicant.processedAt).toLocaleDateString()}
                </span>
              )}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
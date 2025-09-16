import { MapPin, Phone, Info, Copy, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LogisticsInfo } from '@/types/experiencePortal';

interface PortalLogisticsProps {
  logistics?: LogisticsInfo;
  isApproved: boolean;
}

export const PortalLogistics = ({ logistics, isApproved }: PortalLogisticsProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} has been copied to clipboard.`,
      });
    });
  };

  if (!isApproved) {
    return (
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Navigation className="w-5 h-5 text-muted-foreground" />
            Logistics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Logistics details will be available after approval.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!logistics) {
    return (
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Navigation className="w-5 h-5 text-neon-cyan" />
            Logistics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Logistics details will be shared soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Navigation className="w-5 h-5 text-neon-cyan" />
            Logistics
          </CardTitle>
          <Badge className="bg-neon-green/20 text-neon-green">
            Approved Only
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Address */}
        {logistics.address && (
          <div className="p-3 rounded-lg bg-card border border-gray-800">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span className="font-medium text-foreground text-sm">Venue Address</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(logistics.address!, 'Address')}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-gray-300 pl-6">{logistics.address}</p>
          </div>
        )}

        {/* Meetup Instructions */}
        {logistics.meetupInstructions && (
          <div className="p-3 rounded-lg bg-card border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-neon-yellow flex-shrink-0" />
              <span className="font-medium text-foreground text-sm">Meetup Instructions</span>
            </div>
            <p className="text-sm text-gray-300 pl-6">{logistics.meetupInstructions}</p>
          </div>
        )}

        {/* Check-in Notes */}
        {logistics.checkInNotes && (
          <div className="p-3 rounded-lg bg-card border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-neon-purple flex-shrink-0" />
              <span className="font-medium text-foreground text-sm">Check-in Notes</span>
            </div>
            <p className="text-sm text-gray-300 pl-6">{logistics.checkInNotes}</p>
          </div>
        )}

        {/* Emergency Contact */}
        {logistics.emergencyContact && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-destructive flex-shrink-0" />
                <span className="font-medium text-destructive text-sm">Emergency Contact</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(logistics.emergencyContact!.phone, 'Emergency phone')}
                className="h-6 w-6 p-0 text-destructive/80 hover:text-destructive"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <div className="pl-6 space-y-1">
              <p className="text-sm font-medium text-destructive">{logistics.emergencyContact.name}</p>
              <p className="text-sm text-destructive/80">{logistics.emergencyContact.phone}</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {logistics.additionalInfo && (
          <div className="p-3 rounded-lg bg-card border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-neon-green flex-shrink-0" />
              <span className="font-medium text-foreground text-sm">Additional Information</span>
            </div>
            <p className="text-sm text-gray-300 pl-6">{logistics.additionalInfo}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-white/10">
          This information is only visible to approved attendees
        </div>
      </CardContent>
    </Card>
  );
};
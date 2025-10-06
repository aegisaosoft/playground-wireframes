import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, ClipboardCheck, Heart, Eye, EyeOff, Copy } from 'lucide-react';
import { LogisticsInfo } from '@/types/experiencePortal';
import { useToast } from '@/hooks/use-toast';
import { PortalLogistics } from '@/components/ExperiencePortal/PortalLogistics';

interface LogisticsBlockProps {
  data: LogisticsInfo;
  onChange: (data: LogisticsInfo) => void;
}

export const LogisticsBlock: React.FC<LogisticsBlockProps> = ({ data, onChange }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof LogisticsInfo, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleEmergencyContactChange = (field: 'name' | 'phone', value: string) => {
    onChange({
      ...data,
      emergencyContact: {
        ...data.emergencyContact,
        name: data.emergencyContact?.name || '',
        phone: data.emergencyContact?.phone || '',
        [field]: value,
      },
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  if (isPreviewMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-neon-cyan">
            <Eye className="w-4 h-4" />
            <span>Previewing attendee view (visible only to approved guests)</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(false)}
            className="gap-2"
          >
            <EyeOff className="w-4 h-4" />
            Exit Preview
          </Button>
        </div>
        <PortalLogistics logistics={data} isApproved={true} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-neon-pink" />
          Logistics & Info
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPreviewMode(true)}
          className="gap-2 border-neon-purple/30 hover:border-neon-purple hover:bg-neon-purple/10"
        >
          <Eye className="w-4 h-4" />
          Preview Attendee View
        </Button>
      </div>

      {/* Venue Address */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-neon-pink" />
            Venue Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Enter the full venue address (street, city, state, postal code)"
            value={data.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className="min-h-[80px] bg-black/20 border-white/10 focus:border-neon-pink"
          />
          {data.address && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(data.address!, 'Address')}
              className="gap-2 text-muted-foreground hover:text-neon-cyan"
            >
              <Copy className="w-3 h-3" />
              Copy for Attendees
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Meetup Instructions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neon-cyan" />
            Meetup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="E.g., Meet at the main hall entrance at 9AM. Look for the Playground banner."
            value={data.meetupInstructions || ''}
            onChange={(e) => handleChange('meetupInstructions', e.target.value)}
            className="min-h-[100px] bg-black/20 border-white/10 focus:border-neon-cyan"
          />
        </CardContent>
      </Card>

      {/* Check-in Notes */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-neon-purple" />
            Check-in Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="E.g., Bring your ID or confirmation email for verification."
            value={data.checkInNotes || ''}
            onChange={(e) => handleChange('checkInNotes', e.target.value)}
            className="min-h-[80px] bg-black/20 border-white/10 focus:border-neon-purple"
          />
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergency-name" className="text-muted-foreground">
              Name
            </Label>
            <Input
              id="emergency-name"
              placeholder="E.g., Alex Chen"
              value={data.emergencyContact?.name || ''}
              onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
              className="bg-black/20 border-white/10 focus:border-red-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency-phone" className="text-muted-foreground">
              Phone Number
            </Label>
            <Input
              id="emergency-phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={data.emergencyContact?.phone || ''}
              onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
              className="bg-black/20 border-white/10 focus:border-red-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            📝 Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any other important details attendees should know..."
            value={data.additionalInfo || ''}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            className="min-h-[100px] bg-black/20 border-white/10 focus:border-neon-pink"
          />
        </CardContent>
      </Card>
    </div>
  );
};
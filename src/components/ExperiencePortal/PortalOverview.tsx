import { MapPin, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExperiencePortalData } from '@/types/experiencePortal';

interface PortalOverviewProps {
  data: ExperiencePortalData;
  isReadOnly?: boolean;
}

export const PortalOverview = ({ data, isReadOnly = false }: PortalOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">Experience Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 leading-relaxed">{data.description}</p>
          
          {/* Experience Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-gray-800">
              <MapPin className="w-5 h-5 text-neon-cyan" />
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p className="text-sm text-muted-foreground">{data.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-gray-800">
              <div className="w-5 h-5 flex items-center justify-center">
                {data.visibility === 'private' ? (
                  <EyeOff className="w-4 h-4 text-neon-purple" />
                ) : (
                  <Eye className="w-4 h-4 text-neon-green" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">Visibility</p>
                <Badge className={data.visibility === 'private' ? 'bg-neon-purple/20 text-neon-purple' : 'bg-neon-green/20 text-neon-green'}>
                  {data.visibility}
                </Badge>
              </div>
            </div>
          </div>
          
          {data.ticketTier && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-neon-pink/10 to-neon-cyan/10 border border-neon-pink/20">
              <p className="font-medium text-foreground">Your Ticket</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">{data.ticketTier.name}</span>
                <span className="font-bold text-neon-pink">${data.ticketTier.price}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What You'll Do */}
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">What You'll Do</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-gray-800">
                <div className="w-2 h-2 bg-neon-pink rounded-full" />
                <span className="text-gray-300">{highlight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Snippet */}
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">Location Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-neon-cyan mx-auto mb-2" />
              <p className="text-foreground font-medium">{data.location}</p>
              <p className="text-sm text-muted-foreground">Interactive map coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* House Rules */}
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">House Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-neon-yellow rounded-full mt-2" />
              <span>Respect fellow attendees and maintain a positive environment</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-neon-yellow rounded-full mt-2" />
              <span>Be punctual for scheduled activities and sessions</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-neon-yellow rounded-full mt-2" />
              <span>Keep the space clean and follow local guidelines</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-neon-yellow rounded-full mt-2" />
              <span>Participate actively and support the community</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
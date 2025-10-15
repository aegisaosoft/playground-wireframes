import { MapPin, Eye, EyeOff, Navigation, Maximize2, Minimize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExperiencePortalData } from '@/types/experiencePortal';
import { useState, useEffect } from 'react';

interface PortalOverviewProps {
  data: ExperiencePortalData;
  isReadOnly?: boolean;
}

export const PortalOverview = ({ data, isReadOnly = false }: PortalOverviewProps) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Handle ESC key to close expanded map
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMapExpanded) {
        setIsMapExpanded(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMapExpanded]);

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

      {/* Location Preview */}
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Location Preview</CardTitle>
            {data.logistics?.address && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMapExpanded(true)}
                className="text-neon-cyan hover:text-neon-cyan/80 hover:bg-neon-cyan/10"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Expand Map
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data.logistics?.address ? (
            <div className="space-y-3">
              {/* Location Display */}
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-neon-cyan" />
                <div>
                  <p className="text-foreground font-medium">{data.location}</p>
                  <p className="text-xs text-muted-foreground">{data.logistics.address}</p>
                </div>
              </div>
              
              {/* Google Map */}
              <div className="rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                <iframe
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(data.logistics.address)}&zoom=14`}
                  title="Experience Location"
                  className="w-full"
                />
                <div className="bg-gray-900/50 border-t border-gray-700 p-2 flex items-center justify-between">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.logistics.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neon-cyan hover:text-neon-cyan/80 flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    Open in Google Maps
                  </a>
                  <a
                    href={`https://maps.apple.com/?q=${encodeURIComponent(data.logistics.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neon-purple hover:text-neon-purple/80 flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    Open in Apple Maps
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700 shadow-lg">
              <div className="text-center">
                <MapPin className="w-10 h-10 text-neon-cyan mx-auto mb-2" />
                <p className="text-foreground font-medium">{data.location}</p>
                <p className="text-sm text-muted-foreground">Map preview will be available when address is added</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Map Modal */}
      {isMapExpanded && data.logistics?.address && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-white/10 p-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-neon-cyan" />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{data.location}</h2>
                    <p className="text-sm text-muted-foreground">{data.logistics.address}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMapExpanded(false)}
                  className="text-foreground hover:text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <Minimize2 className="w-5 h-5 mr-2" />
                  Close Map
                </Button>
              </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(data.logistics.address)}&zoom=15`}
                title="Experience Location - Full Screen"
                className="w-full h-full"
              />
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-white/10 p-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex gap-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.logistics.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neon-cyan hover:text-neon-cyan/80 flex items-center gap-2 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                  <a
                    href={`https://maps.apple.com/?q=${encodeURIComponent(data.logistics.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neon-purple hover:text-neon-purple/80 flex items-center gap-2 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Open in Apple Maps
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">ESC</kbd> to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
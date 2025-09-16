import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface PortalScheduleProps {
  agenda?: Array<{
    day: string;
    items: Array<{
      time: string;
      activity: string;
      description?: string;
      location?: string;
    }>;
  }>;
}

export const PortalSchedule = ({ agenda }: PortalScheduleProps) => {
  const { toast } = useToast();

  const addToCalendar = (day: string, item: any) => {
    toast({
      title: "Added to calendar",
      description: `${item.activity} has been added to your calendar.`,
    });
  };

  if (!agenda || agenda.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardContent className="p-8 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Schedule coming soon</h3>
          <p className="text-muted-foreground">The organizer hasn't shared the agenda yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Experience Schedule</h2>
        <Button 
          variant="outline" 
          className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10"
          onClick={() => toast({ title: "Full schedule added", description: "Complete experience schedule added to calendar." })}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Add All to Calendar
        </Button>
      </div>

      {agenda.map((day, dayIndex) => (
        <Card key={dayIndex} className="bg-white/5 border-white/10 rounded-2xl">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-neon-cyan text-xl">{day.day}</CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="space-y-0">
              {day.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex} 
                  className="flex items-start gap-4 p-6 border-b border-white/5 last:border-b-0 hover:bg-white/3 transition-colors"
                >
                  {/* Time Badge */}
                  <div className="flex-shrink-0">
                    <Badge 
                      variant="secondary" 
                      className="bg-neon-yellow/20 text-neon-yellow font-mono text-sm px-3 py-1"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {item.time}
                    </Badge>
                  </div>
                  
                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">{item.activity}</h3>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    )}
                    
                    {item.location && (
                      <div className="flex items-center gap-2 text-sm text-neon-cyan">
                        <MapPin className="w-4 h-4" />
                        <span>{item.location}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-neon-cyan hover:text-neon-cyan/80">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Add to Calendar Button */}
                  <div className="flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addToCalendar(day.day, item)}
                      className="border-white/20 text-foreground hover:bg-white/10"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
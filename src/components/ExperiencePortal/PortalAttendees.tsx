import { useState } from 'react';
import { Crown, Users, UserMinus, UserPlus, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ExperiencePortalUser } from '@/types/experiencePortal';

interface PortalAttendeesProps {
  attendees: ExperiencePortalUser[];
  userRole: 'organizer' | 'co-host' | 'attendee' | 'pending';
}

export const PortalAttendees = ({ attendees, userRole }: PortalAttendeesProps) => {
  const [attendeeList, setAttendeeList] = useState(attendees);
  const isHost = userRole === 'organizer' || userRole === 'co-host';
  const isOrganizer = userRole === 'organizer';

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'organizer':
        return <Crown className="w-4 h-4 text-neon-yellow" />;
      case 'co-host':
        return <Users className="w-4 h-4 text-neon-cyan" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'organizer':
        return <Badge className="bg-neon-yellow/20 text-neon-yellow">Host</Badge>;
      case 'co-host':
        return <Badge className="bg-neon-cyan/20 text-neon-cyan">Co-host</Badge>;
      default:
        return <Badge variant="secondary">Attendee</Badge>;
    }
  };

  const promoteToCoHost = (userId: string) => {
    setAttendeeList(prev => prev.map(user => 
      user.id === userId ? { ...user, role: 'co-host' as const } : user
    ));
  };

  const removeAttendee = (userId: string) => {
    setAttendeeList(prev => prev.filter(user => user.id !== userId));
  };

  const organizers = attendeeList.filter(user => user.role === 'organizer');
  const coHosts = attendeeList.filter(user => user.role === 'co-host');
  const regularAttendees = attendeeList.filter(user => user.role === 'attendee');

  if (attendeeList.length <= 1) {
    return (
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardContent className="p-8 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">You're early!</h3>
          <p className="text-muted-foreground">Others will appear here after approval.</p>
        </CardContent>
      </Card>
    );
  }

  const AttendeeCard = ({ user }: { user: ExperiencePortalUser }) => (
    <div className="flex items-center justify-between p-4 bg-card border border-gray-800 rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-neon-pink/20 text-neon-pink">
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {getRoleIcon(user.role)}
            <span className="font-medium text-foreground">{user.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {getRoleBadge(user.role)}
            {user.bio && (
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {user.bio}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Host Actions */}
      {isOrganizer && user.role !== 'organizer' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user.role === 'attendee' && (
              <DropdownMenuItem onClick={() => promoteToCoHost(user.id)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Promote to Co-host
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => removeAttendee(user.id)}
              className="text-destructive hover:text-destructive"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Remove attendee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          Experience Attendees
          <Badge variant="secondary">{attendeeList.length}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Organizer Section */}
        {organizers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-neon-yellow" />
              Host
            </h3>
            <div className="space-y-3">
              {organizers.map((user) => (
                <AttendeeCard key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}

        {/* Co-hosts Section */}
        {coHosts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-neon-cyan" />
              Co-hosts ({coHosts.length})
            </h3>
            <div className="space-y-3">
              {coHosts.map((user) => (
                <AttendeeCard key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Attendees Section */}
        {regularAttendees.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Attendees ({regularAttendees.length})
            </h3>
            <div className="space-y-3">
              {regularAttendees.map((user) => (
                <AttendeeCard key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
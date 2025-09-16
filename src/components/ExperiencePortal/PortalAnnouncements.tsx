import { useState } from 'react';
import { Megaphone, Plus, Pin, PinOff, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Announcement } from '@/types/experiencePortal';

interface PortalAnnouncementsProps {
  userRole: 'organizer' | 'co-host' | 'attendee' | 'pending';
}

// Mock data
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to Desert Code Camp! 🏜️',
    content: 'Excited to have everyone here. Check-in starts at 9 AM tomorrow at the visitor center.',
    authorId: '1',
    authorName: 'Alex Chen',
    createdAt: new Date('2024-03-14T18:00:00'),
    isPinned: true,
    isRead: false
  },
  {
    id: '2',
    title: 'Weather Update',
    content: 'Desert nights can get chilly! Make sure to bring warm layers for evening activities.',
    authorId: '1', 
    authorName: 'Alex Chen',
    createdAt: new Date('2024-03-13T15:30:00'),
    isPinned: false,
    isRead: true
  }
];

export const PortalAnnouncements = ({ userRole }: PortalAnnouncementsProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [isCreating, setIsCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: ''
  });

  const isHost = userRole === 'organizer' || userRole === 'co-host';
  const unreadCount = announcements.filter(a => !a.isRead).length;

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;

    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      authorId: 'current-user',
      authorName: 'You',
      createdAt: new Date(),
      isPinned: false,
      isRead: true
    };

    setAnnouncements(prev => [announcement, ...prev]);
    setNewAnnouncement({ title: '', content: '' });
    setIsCreating(false);
  };

  const togglePin = (id: string) => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === id ? { ...ann, isPinned: !ann.isPinned } : ann
    ));
  };

  const markAsRead = (id: string) => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === id ? { ...ann, isRead: true } : ann
    ));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  // Sort announcements: pinned first, then by date
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-foreground">Announcements</CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-neon-pink text-background text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          {isHost && (
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-neon hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-foreground">New Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="ann-title" className="text-foreground">Title</Label>
                    <Input
                      id="ann-title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Announcement title..."
                      className="bg-white/5 border-white/20 text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ann-content" className="text-foreground">Message</Label>
                    <Textarea
                      id="ann-content"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Your announcement message..."
                      rows={4}
                      className="bg-white/5 border-white/20 text-foreground"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleCreateAnnouncement}
                      disabled={!newAnnouncement.title || !newAnnouncement.content}
                      className="flex-1 bg-gradient-neon hover:opacity-90"
                    >
                      Post Announcement
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreating(false)}
                      className="border-white/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">No announcements yet</h3>
            <p className="text-sm text-muted-foreground">
              {isHost 
                ? "Share important updates with attendees." 
                : "Host announcements will appear here."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAnnouncements.map((announcement) => (
              <div 
                key={announcement.id}
                className={`p-4 rounded-lg border transition-colors ${
                  announcement.isPinned 
                    ? 'bg-neon-yellow/5 border-neon-yellow/20' 
                    : 'bg-card border-gray-800'
                } ${
                  !announcement.isRead 
                    ? 'ring-2 ring-neon-pink/20' 
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {announcement.isPinned && (
                      <Pin className="w-4 h-4 text-neon-yellow" />
                    )}
                    <h4 className="font-semibold text-foreground">{announcement.title}</h4>
                    {!announcement.isRead && (
                      <Badge className="bg-neon-pink/20 text-neon-pink text-xs">New</Badge>
                    )}
                  </div>
                  
                  {isHost && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePin(announcement.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      {announcement.isPinned ? (
                        <PinOff className="w-3 h-3" />
                      ) : (
                        <Pin className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{announcement.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    by {announcement.authorName} • {formatDate(announcement.createdAt)}
                  </div>
                  
                  {!announcement.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(announcement.id)}
                      className="text-xs text-neon-cyan hover:text-neon-cyan/80"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
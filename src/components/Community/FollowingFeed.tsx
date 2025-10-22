import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  ExternalLink,
  Image as ImageIcon,
  MoreHorizontal,
  UserMinus,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import { CommentModal } from './CommentModal';

export interface FeedUpdate {
  id: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
    isFollowing: true;
  };
  timestamp: Date;
  updateType: 'New Experience' | 'Idea' | 'Announcement' | 'Call for Interest' | 'Schedule Update' | 'Photo/Recap';
  content: {
    text: string;
    image?: string;
    experienceLink?: string;
    ideaLink?: string;
  };
  actions: {
    likes: number;
    comments: number;
    isLiked: boolean;
    isSaved: boolean;
  };
  experiencePreview?: {
    title: string;
    location: string;
    dates: string;
    image: string;
    price?: string;
  };
  ideaPreview?: {
    title: string;
    tags: string[];
    interestCount: number;
  };
}

// Mock data
const mockUpdates: FeedUpdate[] = [
  {
    id: '1',
    organizer: {
      id: 'org1',
      name: 'Wellness Collective',
      avatar: '/avatars/default-avatar.png',
      isFollowing: true
    },
    timestamp: new Date('2024-01-15T10:30:00'),
    updateType: 'New Experience',
    content: {
      text: 'Just launched our most requested retreat! 🧘‍♀️ Join us for 7 days of mindfulness and mountain views in the Swiss Alps.',
      image: '/default-retreat-banner.png',
      experienceLink: '/experience/swiss-wellness'
    },
    actions: {
      likes: 42,
      comments: 8,
      isLiked: false,
      isSaved: false
    },
    experiencePreview: {
      title: 'Swiss Alps Wellness Retreat',
      location: 'Zermatt, Switzerland',
      dates: 'Jul 15-22, 2024',
      image: '/default-retreat-banner.png',
      price: '$2,800'
    }
  },
  {
    id: '2',
    organizer: {
      id: 'org2',
      name: 'Tech Nomads',
      avatar: '/avatars/default-avatar.png',
      isFollowing: true
    },
    timestamp: new Date('2024-01-14T16:20:00'),
    updateType: 'Idea',
    content: {
      text: 'Thinking about organizing a co-working retreat in Portugal this summer. Who\'s interested in surf + code?',
      ideaLink: '/idea/portugal-surf-code'
    },
    actions: {
      likes: 28,
      comments: 15,
      isLiked: true,
      isSaved: false
    },
    ideaPreview: {
      title: 'Portugal Surf & Code',
      tags: ['Surfing', 'Coding', 'Remote Work'],
      interestCount: 31
    }
  },
  {
    id: '3',
    organizer: {
      id: 'org3',
      name: 'Adventure Seekers',
      avatar: '/avatars/default-avatar.png',
      isFollowing: true
    },
    timestamp: new Date('2024-01-13T14:15:00'),
    updateType: 'Schedule Update',
    content: {
      text: 'Update for Costa Rica adventurers: We\'ve added an extra day trip to Manuel Antonio National Park! 🌴'
    },
    actions: {
      likes: 15,
      comments: 3,
      isLiked: false,
      isSaved: true
    }
  }
];

// Mock filter options
const filterOptions = ['All', 'Experiences', 'Ideas', 'Announcements'];

interface FollowingFeedProps {
  onNewUpdatesRead?: () => void;
}

export const FollowingFeed = ({ onNewUpdatesRead }: FollowingFeedProps) => {
  const [updates, setUpdates] = useState<FeedUpdate[]>(mockUpdates);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [composerText, setComposerText] = useState('');
  
  // Mock user data
  const isHost = true; // This should come from actual user state
  const hasFollows = updates.length > 0;

  useEffect(() => {
    if (onNewUpdatesRead) {
      onNewUpdatesRead();
    }
  }, [onNewUpdatesRead]);

  const handleLike = (updateId: string) => {
    setUpdates(prev => prev.map(update => 
      update.id === updateId 
        ? { 
            ...update, 
            actions: {
              ...update.actions,
              isLiked: !update.actions.isLiked,
              likes: update.actions.isLiked ? update.actions.likes - 1 : update.actions.likes + 1
            }
          }
        : update
    ));
  };

  const handleSave = (updateId: string) => {
    setUpdates(prev => prev.map(update => 
      update.id === updateId 
        ? { 
            ...update, 
            actions: {
              ...update.actions,
              isSaved: !update.actions.isSaved
            }
          }
        : update
    ));
  };

  const handleShare = (updateId: string) => {
    // Copy link to clipboard or open share modal
    navigator.clipboard.writeText(`${window.location.origin}/community/update/${updateId}`);
  };

  const filteredUpdates = updates.filter(update => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Experiences') return update.updateType === 'New Experience';
    if (selectedFilter === 'Ideas') return update.updateType === 'Idea';
    if (selectedFilter === 'Announcements') return ['Announcement', 'Schedule Update', 'Photo/Recap'].includes(update.updateType);
    return true;
  });

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'New Experience': return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30';
      case 'Idea': return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
      case 'Announcement': return 'bg-neon-pink/20 text-neon-pink border-neon-pink/30';
      case 'Call for Interest': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Schedule Update': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Photo/Recap': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-white/20 text-white border-white/30';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const selectedUpdate = updates.find(update => update.id === selectedUpdateId);

  if (!hasFollows) {
    // Empty state
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No updates yet</h3>
          <p className="text-white/60 mb-6">
            Follow organizers to see their latest experiences, ideas, and announcements in your feed.
          </p>
          <Button 
            variant="outline"
            className="bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background"
          >
            Explore Organizers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Composer (for hosts only) */}
      {isHost && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            {!showComposer ? (
              <Button
                variant="ghost"
                onClick={() => setShowComposer(true)}
                className="w-full h-12 text-left text-white/60 hover:text-white hover:bg-white/10 justify-start"
              >
                Share an update with your followers...
              </Button>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Share an update with your followers..."
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
                />
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-white/60">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowComposer(false);
                        setComposerText('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-neon-cyan text-background hover:bg-neon-cyan/90"
                    >
                      Post Update
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((filter) => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? "default" : "ghost"}
            size="sm" 
            onClick={() => setSelectedFilter(filter)}
            className={`h-8 ${
              selectedFilter === filter 
                ? 'bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredUpdates.map((update) => (
          <Card key={update.id} className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={update.organizer.avatar} />
                    <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan">
                      {update.organizer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white hover:text-neon-cyan cursor-pointer">
                        {update.organizer.name}
                      </span>
                      <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white/60">
                        Following
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-white/60">
                        {formatTimeAgo(update.timestamp)}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getUpdateTypeColor(update.updateType)}`}
                      >
                        {update.updateType}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Content */}
              <p className="text-white/90">{update.content.text}</p>

              {/* Content image */}
              {update.content.image && (
                <img 
                  src={update.content.image} 
                  alt="Update content"
                  className="rounded-lg w-full max-h-64 object-cover"
                />
              )}

              {/* Experience Preview */}
              {update.experiencePreview && (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={update.experiencePreview.image} 
                        alt={update.experiencePreview.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          {update.experiencePreview.title}
                        </h4>
                        <div className="space-y-1 text-sm text-white/70">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>{update.experiencePreview.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{update.experiencePreview.dates}</span>
                          </div>
                          {update.experiencePreview.price && (
                            <div className="text-neon-cyan font-semibold">
                              {update.experiencePreview.price}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className="w-full mt-3 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan hover:text-background"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Experience
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Idea Preview */}
              {update.ideaPreview && (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-2">
                      {update.ideaPreview.title}
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {update.ideaPreview.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="bg-white/10 text-white/80 border-white/20 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">
                        {update.ideaPreview.interestCount} people interested
                      </span>
                      <Button 
                        size="sm"
                        variant="ghost"
                        className="text-neon-purple hover:text-neon-purple hover:bg-neon-purple/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Idea
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(update.id)}
                    className={`h-8 px-3 ${
                      update.actions.isLiked 
                        ? 'text-neon-pink bg-neon-pink/20 hover:bg-neon-pink/30' 
                        : 'text-white/70 hover:text-neon-pink hover:bg-neon-pink/10'
                    }`}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    {update.actions.likes}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUpdateId(update.id)}
                    className="h-8 px-3 text-white/70 hover:text-neon-purple hover:bg-neon-purple/10"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {update.actions.comments}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSave(update.id)}
                    className={`h-8 px-3 ${
                      update.actions.isSaved 
                        ? 'text-neon-cyan bg-neon-cyan/20 hover:bg-neon-cyan/30' 
                        : 'text-white/70 hover:text-neon-cyan hover:bg-neon-cyan/10'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(update.id)}
                    className="h-8 px-3 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comment Modal */}
      {selectedUpdate && (
        <CommentModal
          isOpen={!!selectedUpdate}
          onClose={() => setSelectedUpdateId(null)}
          update={selectedUpdate}
        />
      )}
    </div>
  );
};
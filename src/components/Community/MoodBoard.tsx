import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ThumbsUp, 
  MessageCircle, 
  Bookmark, 
  MapPin, 
  Calendar, 
  Users,
  Flame,
  TrendingUp
} from 'lucide-react';
import { CommentModal } from './CommentModal';
import { communityService } from '@/services/community.service';
import { useToast } from '@/hooks/use-toast';

export interface IdeaCard {
  id: string;
  title: string;
  location?: string;
  tentativeDates?: string;
  desiredPeople?: string;
  tags: string[];
  postedBy: {
    name: string;
    avatar?: string;
    isAnonymous?: boolean;
  };
  interestCount: number;
  commentCount: number;
  isInterested: boolean;
  isSaved: boolean;
  isTrending?: boolean;
  isHot?: boolean;
  createdAt: Date;
}

// Mock data
const mockIdeas: IdeaCard[] = [
  {
    id: '1',
    title: 'Bali Hacker House',
    location: 'Canggu, Bali',
    tentativeDates: 'March-ish',
    desiredPeople: 'Looking for 5 more',
    tags: ['Web3', 'Surfing', 'Co-living'],
    postedBy: { name: 'Alex Dev', avatar: '/placeholder.svg' },
    interestCount: 23,
    commentCount: 8,
    isInterested: false,
    isSaved: false,
    isTrending: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Swiss Alps Wellness Retreat',
    location: 'Zermatt, Switzerland',
    tentativeDates: 'Summer 2024',
    desiredPeople: '8-12 people',
    tags: ['Wellness', 'Yoga', 'Meditation', 'Mountains'],
    postedBy: { name: 'Sarah Wellness', avatar: '/placeholder.svg' },
    interestCount: 45,
    commentCount: 12,
    isInterested: true,
    isSaved: true,
    isHot: true,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'AI Researchers Getaway',
    location: 'Costa Rica',
    tentativeDates: 'April 2024',
    tags: ['AI', 'Research', 'Beach', 'Networking'],
    postedBy: { name: 'Anonymous', isAnonymous: true },
    interestCount: 18,
    commentCount: 5,
    isInterested: false,
    isSaved: false,
    createdAt: new Date('2024-01-12')
  },
  {
    id: '4',
    title: 'Portugal Surf & Code',
    location: 'Ericeira, Portugal',
    tentativeDates: 'May-June',
    desiredPeople: '6-10 developers',
    tags: ['Surfing', 'Coding', 'Remote Work', 'Beach'],
    postedBy: { name: 'Maria Santos', avatar: '/placeholder.svg' },
    interestCount: 31,
    commentCount: 15,
    isInterested: false,
    isSaved: false,
    isTrending: true,
    createdAt: new Date('2024-01-08')
  }
];

interface MoodBoardProps {
  ideas?: IdeaCard[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const MoodBoard = ({ ideas: propIdeas, isLoading = false, onRefresh }: MoodBoardProps) => {
  const [ideas, setIdeas] = useState<IdeaCard[]>(propIdeas || mockIdeas);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const { toast } = useToast();

  // Update local state when prop changes
  useEffect(() => {
    if (propIdeas) {
      setIdeas(propIdeas);
    }
  }, [propIdeas]);

  const handleInterest = async (ideaId: string) => {
    console.log('🔵 Interest button clicked for idea:', ideaId);
    
    try {
      console.log('📤 Calling API to toggle interest...');
      
      // Call API to toggle interest
      const result = await communityService.toggleInterest(ideaId);
      
      console.log('✅ API response:', result);
      
      // Update local state with response from server
      setIdeas(prev => prev.map(idea => 
        idea.id === ideaId 
          ? { 
              ...idea, 
              isInterested: result.isInterested,
              interestCount: result.interestCount
            }
          : idea
      ));
      
      // Show success feedback
      toast({
        title: result.isInterested ? "Interest Added! 👍" : "Interest Removed",
        description: result.message,
      });
      
      console.log('✅ Interest toggled successfully');
    } catch (error: any) {
      console.error('❌ Failed to toggle interest:', error);
      console.error('❌ Error details:', error.response || error.message);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = (ideaId: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId 
        ? { ...idea, isSaved: !idea.isSaved }
        : idea
    ));
  };

  const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);

  return (
    <div className="space-y-6">
      {/* Grid of idea cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <Card 
            key={idea.id} 
            className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-white group-hover:text-neon-cyan transition-colors">
                  {idea.title}
                </h3>
                <div className="flex gap-1">
                  {idea.isTrending && (
                    <Badge variant="outline" className="border-neon-cyan text-neon-cyan bg-neon-cyan/10 text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  {idea.isHot && (
                    <Badge variant="outline" className="border-neon-pink text-neon-pink bg-neon-pink/10 text-xs">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Optional info row */}
              {(idea.location || idea.tentativeDates || idea.desiredPeople) && (
                <div className="space-y-2 text-sm text-white/70">
                  {idea.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{idea.location}</span>
                    </div>
                  )}
                  {idea.tentativeDates && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{idea.tentativeDates}</span>
                    </div>
                  )}
                  {idea.desiredPeople && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{idea.desiredPeople}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {idea.tags && idea.tags.split(',').filter((tag: string) => tag.trim()).map((tag: string) => (
                  <Badge 
                    key={tag.trim()} 
                    variant="secondary"
                    className="bg-white/10 text-white/80 border-white/20 hover:bg-white/20 transition-colors text-xs"
                  >
                    {tag.trim()}
                  </Badge>
                ))}
              </div>

              {/* Posted by */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                {!idea.postedBy.isAnonymous ? (
                  <>
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={idea.postedBy.avatar} />
                      <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xs">
                        {idea.postedBy.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white/60">by {idea.postedBy.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-white/60">Anonymous</span>
                )}
              </div>

              {/* Engagement row */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInterest(idea.id)}
                    className={`h-8 px-3 ${
                      idea.isInterested 
                        ? 'text-neon-cyan bg-neon-cyan/20 hover:bg-neon-cyan/30' 
                        : 'text-white/70 hover:text-neon-cyan hover:bg-neon-cyan/10'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {idea.interestCount}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIdeaId(idea.id)}
                    className="h-8 px-3 text-white/70 hover:text-neon-purple hover:bg-neon-purple/10"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {idea.commentCount}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(idea.id)}
                  className={`h-8 px-3 ${
                    idea.isSaved 
                      ? 'text-neon-pink bg-neon-pink/20 hover:bg-neon-pink/30' 
                      : 'text-white/70 hover:text-neon-pink hover:bg-neon-pink/10'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comment Modal */}
      {selectedIdea && (
        <CommentModal
          isOpen={!!selectedIdea}
          onClose={() => setSelectedIdeaId(null)}
          idea={selectedIdea}
        />
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { communityService, CommunityIdea } from '@/services/community.service';
import { Plus, Bell } from 'lucide-react';
import { MoodBoard } from '@/components/Community/MoodBoard';
import { FollowingFeed } from '@/components/Community/FollowingFeed';
import { SuggestIdeaModal } from '@/components/Community/SuggestIdeaModal';

const Community = () => {
  const [activeTab, setActiveTab] = useState('mood-board');
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [ideas, setIdeas] = useState<CommunityIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewUpdates, setHasNewUpdates] = useState(true); // Mock notification state
  const { toast } = useToast();

  const fetchIdeas = async () => {
    try {
      setIsLoading(true);
      const data = await communityService.getIdeas();
      setIdeas(data);
    } catch (error) {
      console.error('Failed to fetch community ideas:', error);
      toast({
        title: "Error",
        description: "Failed to load community ideas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
            Community
          </h1>
          <p className="text-white/60 text-lg">
            Discover ideas, connect with organizers, and build amazing experiences together
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white/5 border border-white/10 backdrop-blur-sm">
              <TabsTrigger 
                value="mood-board" 
                className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
              >
                Mood Board
              </TabsTrigger>
              <TabsTrigger 
                value="following" 
                className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan relative"
              >
                Following
                {hasNewUpdates && activeTab !== 'following' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-pink rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>

            {/* Action Button */}
            {activeTab === 'mood-board' && (
              <Button
                onClick={() => setIsSuggestModalOpen(true)}
                className="bg-gradient-to-r from-neon-cyan to-neon-purple text-background hover:opacity-90 transition-opacity font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Suggest an Idea
              </Button>
            )}
          </div>

          <TabsContent value="mood-board" className="mt-0">
            <MoodBoard ideas={ideas} isLoading={isLoading} onRefresh={() => window.location.reload()} />
          </TabsContent>

          <TabsContent value="following" className="mt-0">
            <FollowingFeed onNewUpdatesRead={() => setHasNewUpdates(false)} />
          </TabsContent>
        </Tabs>
      </div>

      <SuggestIdeaModal 
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        onSuccess={fetchIdeas}
      />
    </div>
  );
};

export default Community;
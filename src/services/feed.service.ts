import { apiClient } from '@/lib/api-client';

export interface FeedUpdate {
  id: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
    isFollowing: boolean;
  };
  timestamp: Date | string;
  updateType: 'New Experience' | 'Idea' | 'Announcement' | 'Schedule Update';
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

class FeedService {
  /**
   * Get feed updates from followed organizers
   */
  async getFollowingFeed(): Promise<FeedUpdate[]> {
    try {
      console.log('📥 Fetching following feed...');
      const response = await apiClient.get('/Feed/following');
      console.log('📦 Raw response:', response);
      
      // Handle different response structures
      const data = response.data || response || [];
      console.log('✅ Following feed fetched:', Array.isArray(data) ? data.length : 0, 'items');
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching following feed:', error);
      throw error;
    }
  }
}

export const feedService = new FeedService();


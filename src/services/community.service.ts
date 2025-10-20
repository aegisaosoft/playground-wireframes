import { apiClient } from '@/lib/api-client';

export interface CommunityIdea {
  id: string;
  title: string;
  description: string;
  location: string;
  tentativeDates: string;
  desiredPeople: string;
  tags: string;  // ✅ Comma-separated string from database, not an array
  postedBy: {
    name: string;
    avatar: string;
    isAnonymous: boolean;
  };
  interestCount: number;
  commentCount: number;
  isInterested: boolean;
  isSaved: boolean;
  isTrending: boolean;
  isHot: boolean;
  createdAt: string;
}

export interface CreateIdeaRequest {
  title: string;
  description?: string;
  location?: string;
  tentativeDates?: string;
  desiredPeople?: string;
  tags?: string;
  isAnonymous?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export const communityService = {
  async getIdeas(): Promise<CommunityIdea[]> {
    return apiClient.get<CommunityIdea[]>('/Ideas');
  },

  async createIdea(data: CreateIdeaRequest): Promise<CommunityIdea> {
    return apiClient.post<CommunityIdea>('/Ideas', data);
  },

  async getIdeaComments(ideaId: string): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`/Ideas/${ideaId}/comments`);
  },

  async createComment(ideaId: string, data: CreateCommentRequest): Promise<Comment> {
    return apiClient.post<Comment>(`/Ideas/${ideaId}/comments`, data);
  },

  async toggleInterest(ideaId: string): Promise<{ isInterested: boolean; interestCount: number; message: string }> {
    return apiClient.post<{ isInterested: boolean; interestCount: number; message: string }>(`/Ideas/${ideaId}/interest`, {});
  },
};

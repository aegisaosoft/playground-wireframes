import { apiClient } from '@/lib/api-client';

export interface FollowedHost {
  id: string;
  followedUserId: string;
  name: string;
  email: string;
  avatar?: string;
  followers: number;
  experiences: number;
  followedAt: string;
}

export interface CreateFollowRequest {
  followedUserId: string;
}

export const followsService = {
  async getMyFollows(): Promise<FollowedHost[]> {
    return apiClient.get<FollowedHost[]>('/Follows/my');
  },

  async createFollow(data: CreateFollowRequest): Promise<FollowedHost> {
    return apiClient.post<FollowedHost>('/Follows', data);
  },

  async unfollowUser(followedUserId: string): Promise<void> {
    return apiClient.delete<void>(`/Follows/${followedUserId}`);
  },
};

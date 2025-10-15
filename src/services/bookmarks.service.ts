import { apiClient } from '@/lib/api-client';
import { Experience } from './experiences.service';

export interface Bookmark extends Experience {
  bookmarkedAt: string;
}

export interface CreateBookmarkRequest {
  experienceId: string;
}

export const bookmarksService = {
  async getMyBookmarks(): Promise<Bookmark[]> {
    try {
      return await apiClient.get<Bookmark[]>('/Bookmarks/my');
    } catch (error) {
      console.error('Failed to load bookmarks, returning empty list:', error);
      return [];
    }
  },

  async createBookmark(data: CreateBookmarkRequest): Promise<Bookmark> {
    return apiClient.post<Bookmark>('/Bookmarks', data);
  },

  async removeBookmark(experienceId: string): Promise<void> {
    return apiClient.delete<void>(`/Bookmarks/${experienceId}`);
  },
};

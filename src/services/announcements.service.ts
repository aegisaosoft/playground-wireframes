import { apiClient } from '@/lib/api-client';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  isImportant: boolean;
  authorName: string;
  authorId: string;
  createdAt: string;
  daysAgo: number;
}

export interface CreateAnnouncementRequest {
  experienceId: string;
  title: string;
  message: string;
  isImportant?: boolean;
}

export const announcementsService = {
  async getExperienceAnnouncements(experienceId: string): Promise<Announcement[]> {
    return apiClient.get<Announcement[]>(`/Announcements/experience/${experienceId}`);
  },

  async createAnnouncement(data: CreateAnnouncementRequest): Promise<Announcement> {
    return apiClient.post<Announcement>('/Announcements', data);
  },
};


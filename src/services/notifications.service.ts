import { apiClient } from '@/lib/api-client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  experienceId?: string;
  applicationId?: string;
  ideaId?: string;
  commentId?: string;
  senderId?: string;
  sender?: {
    name: string;
    avatar: string;
  };
  experience?: {
    id: string;
    title: string;
    coverImage?: string;
  };
  application?: {
    id: string;
    status: string;
  };
}

export interface UnreadCount {
  unreadCount: number;
  hasNewNotifications: boolean;
}

export const notificationsService = {
  async getMyNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/Notifications/my');
  },

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    return apiClient.put<Notification>(`/Notifications/${notificationId}/read`, {});
  },

  async markAllNotificationsAsRead(): Promise<{ updatedCount: number; message: string }> {
    return apiClient.put<{ updatedCount: number; message: string }>('/Notifications/read-all', {});
  },

  async getUnreadCount(): Promise<UnreadCount> {
    return apiClient.get<UnreadCount>('/Notifications/unread-count');
  },
};

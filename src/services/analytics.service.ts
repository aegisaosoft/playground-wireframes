import { apiClient } from '@/lib/api-client';

export interface DashboardAnalytics {
  stats: {
    followers: number;
    experiencesHosted: number;
    applicationsLast30Days: number;
    averageRating: number;
  };
  ratingsBreakdown: {
    [key: number]: number;
  };
  recentFeedbackThemes: Array<{
    theme: string;
    count: number;
  }>;
  aiSummary: string;
  experiences: Array<{
    id: string;
    title: string;
    dates: string;
    status: string;
    applicants: number;
    rating?: number;
    revenue: number;
    capacity: number;
    spotsTaken: number;
  }>;
}

export interface ExperienceAnalytics {
  experience: {
    id: string;
    title: string;
    status: string;
    totalCapacity: number;
    spotsTaken: number;
  };
  applications: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    recent: Array<{
      id: string;
      applicantName: string;
      applicantEmail: string;
      status: string;
      appliedAt: string;
      message: string;
    }>;
  };
  reviews: {
    total: number;
    averageRating: number;
    ratingBreakdown: {
      [key: number]: number;
    };
    recent: Array<{
      id: string;
      rating: number;
      content: string;
      authorName: string;
      createdAt: string;
    }>;
  };
}

export const analyticsService = {
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    return apiClient.get<DashboardAnalytics>('/Analytics/dashboard');
  },

  async getExperienceAnalytics(experienceId: string): Promise<ExperienceAnalytics> {
    return apiClient.get<ExperienceAnalytics>(`/Analytics/experience/${experienceId}`);
  },
};

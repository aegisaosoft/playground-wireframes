import { apiClient } from '@/lib/api-client';

export interface Review {
  id: string;
  rating: number;
  content: string;
  authorName: string;
  authorAvatar: string;
  experienceTitle: string;
  createdAt: string;
  helpful: number;
  isHelpful: boolean;
}

export interface CreateReviewRequest {
  experienceId: string;
  rating: number;
  content?: string;
}

export interface MarkHelpfulRequest {
  isHelpful: boolean;
}

export const reviewsService = {
  async getExperienceReviews(experienceId: string): Promise<Review[]> {
    return apiClient.get<Review[]>(`/reviews/experience/${experienceId}`);
  },

  async createReview(data: CreateReviewRequest): Promise<Review> {
    return apiClient.post<Review>('/Reviews', data);
  },

  async markReviewHelpful(reviewId: string, data: MarkHelpfulRequest): Promise<Review> {
    return apiClient.put<Review>(`/reviews/${reviewId}/helpful`, data);
  },
};

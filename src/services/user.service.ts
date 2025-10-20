import { apiClient } from '@/lib/api-client';
import { encryptionService } from './encryption.service';
import { maskStripeAccountId } from '@/utils/account-masking';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  profileImageUrl?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  location?: string;
  phone?: string;
  stripeConnectAccountId?: string;
}

export interface UserProfileResponse {
  success?: boolean;
  message?: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export const userService = {
  /**
   * Get current user profile from API
   */
  async getCurrentUser(): Promise<UserProfile> {
    
    try {
      const response = await apiClient.get<UserProfile>('/Auth/me');
      
      // The API client returns the raw response, not wrapped in success/data
      if (!response) {
        throw new Error('Failed to get user profile');
      }
      
      // Transform the response to match our UserProfile interface
      const userProfile: UserProfile = {
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role,
        isEmailVerified: response.isEmailVerified,
        isActive: response.isActive,
        createdAt: response.createdAt,
        lastLoginAt: response.lastLoginAt,
        profileImageUrl: response.profileImageUrl
      };
      
      
      return userProfile;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfileResponse> {
    
    try {
      const response = await apiClient.put<UserProfileResponse>('/Auth/profile', profileData);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(file: File): Promise<{ imageUrl: string }> {
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.post<{ imageUrl: string }>('/Auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response?.imageUrl) {
        throw new Error('Failed to upload avatar');
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save Stripe account ID for the current user
   */
  async saveStripeAccountId(stripeAccountId: string): Promise<{ success: boolean; message: string; data: string }> {
    
    try {
      // Send plain text - backend will handle encryption
      const response = await apiClient.post<{ success: boolean; message: string; data: string }>('/Users/stripe-account', {
        stripeAccountId: stripeAccountId
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current user's Stripe account ID
   */
  async getStripeAccountId(): Promise<string> {
    
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: string }>('/Users/stripe-account');
      
      // Backend already decrypts the data before sending
      return response.data || '';
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete Stripe account ID for the current user
   */
  async deleteStripeAccountId(): Promise<{ success: boolean; message: string }> {
    
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>('/Users/stripe-account');
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserSearchResult[] }>(`/Users/search?query=${encodeURIComponent(query)}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user profile by ID (public profile)
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserProfile; message?: string }>(`/Users/${userId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to get user profile');
    } catch (error) {
      throw error;
    }
  }
};

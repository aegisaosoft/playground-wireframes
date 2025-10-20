import { apiClient } from '@/lib/api-client';

export interface UserPreferences {
  bio?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  location?: string;
  phone?: string;
  interests?: string[];
  onboardingCompleted?: boolean;
  defaultExperienceVisibility?: 'public' | 'private';
  defaultExperienceCategory?: string;
  preferredLocation?: {
    city?: string;
    country?: string;
  };
  notificationPreferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    marketingEmails?: boolean;
  };
}

export interface BrandPreferences {
  name?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface PreferencesResponse {
  success?: boolean;
  message?: string;
}

export const preferencesService = {
  /**
   * Get user preferences from API
   */
  async getUserPreferences(): Promise<UserPreferences> {
    console.log('🔍 Fetching user preferences from API...');
    
    try {
      const response = await apiClient.get<UserPreferences>('/Auth/profile');
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get user preferences');
      }
      
      console.log('✅ User preferences loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user preferences:', error);
      throw error;
    }
  },

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<PreferencesResponse> {
    console.log('📝 Updating user preferences...', preferences);
    
    try {
      const response = await apiClient.put<PreferencesResponse>('/Auth/profile', preferences);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update preferences');
      }
      
      console.log('✅ Preferences updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      throw error;
    }
  },

  /**
   * Get brand preferences (if user has a brand)
   */
  async getBrandPreferences(): Promise<BrandPreferences | null> {
    console.log('🔍 Fetching brand preferences from API...');
    
    try {
      const response = await apiClient.get<BrandPreferences>('/Brands/my-brand');
      
      if (!response.success) {
        // User might not have a brand yet
        return null;
      }
      
      console.log('✅ Brand preferences loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching brand preferences:', error);
      return null;
    }
  },

  /**
   * Update brand preferences
   */
  async updateBrandPreferences(brandData: Partial<BrandPreferences>): Promise<PreferencesResponse> {
    console.log('📝 Updating brand preferences...', brandData);
    
    try {
      const response = await apiClient.post<PreferencesResponse>('/Brands/save', brandData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update brand preferences');
      }
      
      console.log('✅ Brand preferences updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating brand preferences:', error);
      throw error;
    }
  },

  /**
   * Save user onboarding completion
   */
  async completeOnboarding(): Promise<PreferencesResponse> {
    console.log('🎯 Marking onboarding as completed...');
    
    try {
      const response = await this.updateUserPreferences({
        onboardingCompleted: true
      });
      
      console.log('✅ Onboarding completed successfully');
      return response;
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      throw error;
    }
  },

  /**
   * Set default experience preferences
   */
  async setDefaultExperiencePreferences(preferences: {
    visibility?: 'public' | 'private';
    category?: string;
    location?: { city?: string; country?: string };
  }): Promise<PreferencesResponse> {
    console.log('🎯 Setting default experience preferences...', preferences);
    
    try {
      const response = await this.updateUserPreferences({
        defaultExperienceVisibility: preferences.visibility,
        defaultExperienceCategory: preferences.category,
        preferredLocation: preferences.location
      });
      
      console.log('✅ Default experience preferences set successfully');
      return response;
    } catch (error) {
      console.error('❌ Error setting default experience preferences:', error);
      throw error;
    }
  }
};

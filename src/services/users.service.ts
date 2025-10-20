/**
 * Users Service
 * Handles user search and invitation operations
 */

import { apiClient } from '@/lib/api-client';

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UserInvitationRequest {
  userId: string;
  brandId: string;
  message?: string;
}

export interface AddUserToBrandRequest {
  userId: string;
  brandId: string;
  role: string;
}

export interface BrandMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: string;
  createdAt: string;
}

export interface BrandInvitation {
  id: string;
  brandId: string;
  brandName: string;
  invitedByUserId: string;
  invitedByName: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface InvitationResponseRequest {
  accept: boolean;
}

export const usersService = {
  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserSearchResult[] }>(`/Users/search?query=${encodeURIComponent(query)}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    }
  },

  /**
   * Send invitation to user to join brand
   */
  async inviteUser(request: UserInvitationRequest): Promise<void> {
    try {
      await apiClient.post<{ success: boolean }>('/Users/invite', request);
    } catch (error) {
      console.error('Failed to send invitation:', error);
      throw error;
    }
  },

  /**
   * Add user directly to brand team
   */
  async addUserToBrand(request: AddUserToBrandRequest): Promise<void> {
    try {
      await apiClient.post<{ success: boolean }>('/Users/add-to-brand', request);
    } catch (error) {
      console.error('Failed to add user to brand:', error);
      throw error;
    }
  },

  /**
   * Get brand members for a specific brand
   */
  async getBrandMembers(brandId: string): Promise<BrandMember[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: BrandMember[] }>(`/Users/brand/${brandId}/members`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get brand members:', error);
      throw error;
    }
  },

  /**
   * Get pending invitations for current user
   */
  async getMyInvitations(): Promise<BrandInvitation[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: BrandInvitation[] }>('/Users/invitations');
      return response.data || [];
    } catch (error) {
      console.error('Failed to get invitations:', error);
      throw error;
    }
  },

  /**
   * Accept or decline brand invitation
   */
  async respondToInvitation(invitationId: string, request: InvitationResponseRequest): Promise<void> {
    try {
      await apiClient.post<{ success: boolean }>(`/Users/invitations/${invitationId}/respond`, request);
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
      throw error;
    }
  },

  /**
   * Remove user from brand team
   */
  async removeUserFromBrand(brandId: string, userId: string): Promise<void> {
    try {
      await apiClient.delete<{ success: boolean }>(`/Users/brand/${brandId}/members/${userId}`);
    } catch (error) {
      console.error('Failed to remove user from brand:', error);
      throw error;
    }
  }
};

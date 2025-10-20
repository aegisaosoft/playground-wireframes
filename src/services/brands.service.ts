import { apiClient } from '@/lib/api-client';
import { encryptionService } from './encryption.service';
import { maskStripeAccountId } from '@/utils/account-masking';

export interface BrandData {
  id?: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  categoryTitle: string;
  followers: number;
  rating: number;
  experiencesCount: number;
  participantsCount: number;
  // Additional brand fields
  tagline?: string;
  website?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  stripeAccountId?: string;
  isVerified?: boolean;
  role?: string; // Owner, Member, Admin, etc.
}

export interface CreateBrandRequest {
  Name: string;
  Description?: string;
  Tagline?: string;
  Website?: string;
  Email?: string;
  Phone?: string;
  Instagram?: string;
  Twitter?: string;
  LinkedIn?: string;
  Facebook?: string;
  StripeAccountId?: string;
}

export interface BrandDto {
  Id: string;
  OwnerId: string;
  Name: string;
  Slug: string;
  Description?: string;
  Tagline?: string;
  LogoUrl?: string;
  CoverImageUrl?: string;
  Website?: string;
  Email?: string;
  Phone?: string;
  Instagram?: string;
  Twitter?: string;
  LinkedIn?: string;
  Facebook?: string;
  IsVerified: boolean;
  VerifiedAt?: string;
  CreatedAt: string;
  UpdatedAt: string;
  FollowersCount: number;
  AverageRating: number;
  ExperiencesCount: number;
  ParticipantsCount: number;
  OwnerName?: string;
  OwnerEmail?: string;
}

export interface BrandMemberDto {
  Id: string;
  UserId: string;
  UserName: string;
  UserEmail: string;
  UserAvatar?: string;
  Role: string;
  CreatedAt: string;
}

export interface BrandResponse {
  success: boolean;
  message: string;
  data?: BrandDto;
}

class BrandsService {
  /**
   * Debug method to check user's brands
   */
  async debugMyBrands(): Promise<any> {
    try {
      const response = await apiClient.get('/Brands/debug-my-brands');
      return response;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get brands where the current user is an owner or member
   */
  async getMyBrands(): Promise<BrandData[]> {
    try {
      const response = await apiClient.get<any>('/Brands/my-brands');
      
      // Check if response is wrapped in a data property
      let brandsArray = response;
      if (response && response.data && Array.isArray(response.data)) {
        brandsArray = response.data;
      } else if (response && response.success && response.data && Array.isArray(response.data)) {
        brandsArray = response.data;
      }
      
      if (!Array.isArray(brandsArray)) {
        return [];
      }
      
      // Map backend BrandDto array to frontend BrandData array
      const brandDataArray: BrandData[] = brandsArray.map(brandDto => {
        
        return {
        id: brandDto.Id || brandDto.id,
        name: brandDto.Name || brandDto.name || 'Unknown Brand',
        description: brandDto.Description || brandDto.description || '',
        logo: brandDto.LogoUrl || brandDto.logoUrl,
        banner: brandDto.CoverImageUrl || brandDto.coverImageUrl,
        categoryTitle: 'Professional Host', // Default category
        followers: brandDto.FollowersCount || brandDto.followersCount || 0,
        rating: brandDto.AverageRating || brandDto.averageRating || 0,
        experiencesCount: brandDto.ExperiencesCount || brandDto.experiencesCount || 0,
        participantsCount: brandDto.ParticipantsCount || brandDto.participantsCount || 0,
        tagline: brandDto.Tagline || brandDto.tagline,
        website: brandDto.Website || brandDto.website,
        email: brandDto.Email || brandDto.email,
        phone: brandDto.Phone || brandDto.phone,
        instagram: brandDto.Instagram || brandDto.instagram,
        twitter: brandDto.Twitter || brandDto.twitter,
        linkedin: brandDto.LinkedIn || brandDto.linkedin,
        facebook: brandDto.Facebook || brandDto.facebook,
        stripeAccountId: brandDto.StripeAccountId || brandDto.stripeAccountId,
        isVerified: brandDto.IsVerified || brandDto.isVerified || false,
        // Add role information
        role: brandDto.OwnerName || brandDto.ownerName || 'Member'
        };
      });
      
      return brandDataArray;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get brand data for the current user
   */
  async getMyBrand(): Promise<BrandData | null> {
    try {
      const response = await apiClient.get<any>('/Brands/my-brand');
      if (!response.data) return null;
      
      // Map backend BrandDto to frontend BrandData
      
      const brandData: BrandData = {
        id: response.data.Id || response.data.id,
        name: response.data.Name || response.data.name || 'Unknown Brand',
        description: response.data.Description || response.data.description || '',
        logo: response.data.LogoUrl || response.data.logoUrl,
        banner: response.data.CoverImageUrl || response.data.coverImageUrl,
        categoryTitle: 'Professional Host', // Default category
        followers: response.data.FollowersCount || response.data.followersCount || 0,
        rating: response.data.AverageRating || response.data.averageRating || 0,
        experiencesCount: response.data.ExperiencesCount || response.data.experiencesCount || 0,
        participantsCount: response.data.ParticipantsCount || response.data.participantsCount || 0,
        tagline: response.data.Tagline || response.data.tagline,
        website: response.data.Website || response.data.website,
        email: response.data.Email || response.data.email,
        phone: response.data.Phone || response.data.phone,
        instagram: response.data.Instagram || response.data.instagram,
        twitter: response.data.Twitter || response.data.twitter,
        linkedin: response.data.LinkedIn || response.data.linkedin,
        facebook: response.data.Facebook || response.data.facebook,
        isVerified: response.data.IsVerified || response.data.isVerified || false
      };
      
      
      return brandData;
    } catch (error) {
      // 404 is expected when user doesn't have a brand yet
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      return null;
    }
  }

  /**
   * Create a new brand
   */
  async createBrand(brandData: CreateBrandRequest, logoFile?: File, bannerFile?: File): Promise<BrandResponse> {
    try {
      const formData = new FormData();
      
      // Append all text fields individually (as expected by [FromForm])
      formData.append('Name', brandData.Name || '');
      formData.append('Description', brandData.Description || '');
      formData.append('Tagline', brandData.Tagline || '');
      formData.append('Website', brandData.Website || '');
      formData.append('Email', brandData.Email || '');
      formData.append('Phone', brandData.Phone || '');
      formData.append('Instagram', brandData.Instagram || '');
      formData.append('Twitter', brandData.Twitter || '');
      formData.append('LinkedIn', brandData.LinkedIn || '');
      formData.append('Facebook', brandData.Facebook || '');
      formData.append('StripeAccountId', brandData.StripeAccountId || '');
      
      // Append logo file if provided
      if (logoFile) {
        formData.append('Logo', logoFile);
      }
      
      // Append banner file if provided
      if (bannerFile) {
        formData.append('Banner', bannerFile);
      }
      
      
      const response = await apiClient.upload<BrandResponse>('/Brands/create', formData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing brand data
   */
  async saveBrand(brandData: CreateBrandRequest, logoFile?: File, bannerFile?: File, brandId?: string): Promise<BrandResponse> {
    try {
      const formData = new FormData();
      
      // Append BrandId if provided (for editing existing brands)
      if (brandId) {
        formData.append('BrandId', brandId);
      }
      
      // Append all text fields individually (as expected by [FromForm])
      formData.append('Name', brandData.Name || '');
      formData.append('Description', brandData.Description || '');
      formData.append('Tagline', brandData.Tagline || '');
      formData.append('Website', brandData.Website || '');
      formData.append('Email', brandData.Email || '');
      formData.append('Phone', brandData.Phone || '');
      formData.append('Instagram', brandData.Instagram || '');
      formData.append('Twitter', brandData.Twitter || '');
      formData.append('LinkedIn', brandData.LinkedIn || '');
      formData.append('Facebook', brandData.Facebook || '');
      formData.append('StripeAccountId', brandData.StripeAccountId || '');
      
      // Append logo file if provided
      if (logoFile) {
        formData.append('Logo', logoFile);
      }
      
      // Append banner file if provided
      if (bannerFile) {
        formData.append('Banner', bannerFile);
      }
      
      
      const response = await apiClient.upload<BrandResponse>('/Brands/save', formData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload brand logo
   */
  async uploadLogo(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<{ url: string }>('/Brands/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload brand banner
   */
  async uploadBanner(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<{ url: string }>('/Brands/upload-banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get public brand page by slug
   */
  async getBrandBySlug(slug: string): Promise<BrandData | null> {
    try {
      const response = await apiClient.get<BrandResponse>(`/Brands/${slug}`);
      if (!response.data) return null;
      
      return {
        id: response.data.Id,
        name: response.data.Name,
        description: response.data.Description || '',
        logo: response.data.LogoUrl,
        banner: response.data.CoverImageUrl,
        categoryTitle: 'Professional Host',
        followers: response.data.FollowersCount || 0,
        rating: response.data.AverageRating || 0,
        experiencesCount: response.data.ExperiencesCount || 0,
        participantsCount: response.data.ParticipantsCount || 0,
        tagline: response.data.Tagline,
        website: response.data.Website,
        email: response.data.Email,
        phone: response.data.Phone,
        instagram: response.data.Instagram,
        twitter: response.data.Twitter,
        linkedin: response.data.LinkedIn,
        facebook: response.data.Facebook,
        isVerified: response.data.IsVerified || false
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get brand statistics
   */
  async getBrandStats(): Promise<{
    followers: number;
    rating: number;
    experiencesCount: number;
    participantsCount: number;
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          followers: number;
          rating: number;
          experiencesCount: number;
          participantsCount: number;
        };
      }>('/Brands/stats');
      
      return response.data;
    } catch (error) {
      // Return default stats
      return {
        followers: 0,
        rating: 0,
        experiencesCount: 0,
        participantsCount: 0,
      };
    }
  }

  /**
   * Get brand by user ID (for checking if host has payment setup)
   */
  async getBrandByUserId(userId: string): Promise<BrandData | null> {
    try {
      const response = await apiClient.get<BrandResponse>(`/Brands/by-user/${userId}`);
      if (!response.data) return null;
      
      return {
        id: response.data.Id,
        name: response.data.Name,
        description: response.data.Description || '',
        logo: response.data.LogoUrl,
        banner: response.data.CoverImageUrl,
        categoryTitle: 'Professional Host',
        followers: response.data.FollowersCount || 0,
        rating: response.data.AverageRating || 0,
        experiencesCount: response.data.ExperiencesCount || 0,
        participantsCount: response.data.ParticipantsCount || 0,
        tagline: response.data.Tagline,
        website: response.data.Website,
        email: response.data.Email,
        phone: response.data.Phone,
        instagram: response.data.Instagram,
        twitter: response.data.Twitter,
        linkedin: response.data.LinkedIn,
        facebook: response.data.Facebook,
        isVerified: response.data.IsVerified || false
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Save Stripe account ID for a brand
   */
  async saveStripeAccountId(brandId: string, stripeAccountId: string): Promise<{ success: boolean; message: string; data: string }> {
    
    try {
      // Send plain text - backend will handle encryption
      const response = await apiClient.post<{ success: boolean; message: string; data: string }>(`/Brands/${brandId}/stripe-account`, {
        stripeAccountId: stripeAccountId
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get brand's Stripe account ID
   */
  async getCurrentStripeAccountId(brandId: string): Promise<string> {
    
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: string }>(`/Brands/${brandId}/stripe-account`);
      
      // Backend already decrypts the data before sending
      return response.data || '';
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete Stripe account ID for a brand
   */
  async deleteStripeAccountId(brandId: string): Promise<{ success: boolean; message: string }> {
    
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/Brands/${brandId}/stripe-account`);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add member to brand by email
   */
  async addMemberToBrandByEmail(brandId: string, email: string, role: string = 'member'): Promise<void> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/Users/add-to-brand-by-email', {
        brandId,
        email,
        role
      });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Add member to brand (legacy method using userId)
   */
  async addMemberToBrand(brandId: string, userId: string, role: string = 'member'): Promise<void> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/Users/add-to-brand', {
        brandId,
        userId,
        role
      });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get brand members
   */
  async getBrandMembers(brandId: string): Promise<BrandMemberDto[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: BrandMemberDto[] }>(`/Users/brand/${brandId}/members`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Remove member from brand
   */
  async removeMemberFromBrand(brandId: string, userId: string): Promise<void> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/Users/brand/${brandId}/members/${userId}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export const brandsService = new BrandsService();

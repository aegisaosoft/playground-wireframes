/**
 * Experiences Service
 * Handles CRUD operations for experiences/retreats
 */

import { apiClient } from '@/lib/api-client';

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  displayOrder: number;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  location: string;
  city?: string;
  country?: string;
  address?: string;
  date: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  image: string;
  featuredImageUrl?: string;
  videoUrl?: string;
  hostName: string;
  hostId?: string;
  price?: number;
  basePriceCents?: number;
  currency?: string;
  category?: string;
  categorySlug?: string;
  tags?: string[];
  status?: string;
  isFeatured?: boolean;
  totalCapacity?: number;
  spotsAvailable?: number;
  agenda?: Array<{
    day: string;
    items: Array<{
      time: string;
      activity: string;
      description?: string;
    }>;
  }>;
  highlights?: string[];
  ticketTiers?: TicketTier[];
  faq?: FaqItem[];
  resources?: ResourceItem[];
  gallery?: GalleryImage[];  // ✅ Gallery images
  // Logistics
  meetupInstructions?: string;
  checkInNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  additionalInfo?: string;
}

export interface AgendaItem {
  dayNumber: number;
  dayTitle?: string;
  timeSlot: string;
  activity: string;
  description?: string;
  displayOrder: number;
}

export interface TicketTier {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  benefits?: string[];
  isPopular?: boolean;
  displayOrder?: number;
}

export interface FaqItem {
  question: string;
  answer: string;
  displayOrder?: number;
}

export interface ResourceItem {
  title: string;
  url: string;
  description?: string;
  type?: string; // 'link' or 'file'
  displayOrder?: number;
}

export interface CreateExperienceRequest {
  title: string;
  description: string;
  shortDescription?: string;
  location: string;
  country?: string;
  city?: string;
  address?: string;
  startDate: string;
  endDate: string;
  featuredImageUrl?: string;
  basePriceCents?: number;
  currency?: string;
  totalCapacity?: number;
  status?: string;
  isFeatured?: boolean;
  categorySlug?: string;
  timezone?: string;
  agendaItems?: AgendaItem[];
  highlights?: string[];
  ticketTiers?: TicketTier[];
  faqItems?: FaqItem[];
  resources?: ResourceItem[];
  // Logistics information
  meetupInstructions?: string;
  checkInNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  additionalInfo?: string;
}

export const experiencesService = {
  /**
   * Get all experiences
   */
  async getAll(): Promise<Experience[]> {
    return apiClient.get<Experience[]>('/Experiences');
  },

  /**
   * Get experience by ID
   */
  async getById(id: string): Promise<Experience> {
    return apiClient.get<Experience>(`/Experiences/${id}`);
  },

  /**
   * Get current user's experiences
   */
  async getMyExperiences(): Promise<Experience[]> {
    return apiClient.get<Experience[]>('/Experiences/my');
  },

  /**
   * Search experiences
   */
  async search(query: string): Promise<Experience[]> {
    return apiClient.get<Experience[]>(`/Experiences/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Create new experience
   */
  async create(data: CreateExperienceRequest, featuredImage?: File, galleryImages?: File[], galleryAlts?: string[]): Promise<Experience> {
    const formData = new FormData();
    
    // Append all text fields (excluding arrays/objects)
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle arrays and objects as JSON strings
        if (Array.isArray(value)) {
          console.log(`📦 Appending ${key} as JSON array:`, value);
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'object') {
          console.log(`📦 Appending ${key} as JSON object:`, value);
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Append featured image if provided
    if (featuredImage) {
      console.log('📸 Appending featured image:', featuredImage.name);
      formData.append('featuredImage', featuredImage);
    }
    
    // Append gallery images if provided
    if (galleryImages && galleryImages.length > 0) {
      console.log('📸 Appending', galleryImages.length, 'gallery images');
      galleryImages.forEach((file, index) => {
        console.log(`   Gallery image ${index + 1}:`, file.name);
        formData.append('galleryImages', file);
      });
      
      // Append gallery alt texts
      if (galleryAlts && galleryAlts.length > 0) {
        formData.append('galleryAlts', JSON.stringify(galleryAlts));
        console.log('📸 Appending gallery alt texts:', galleryAlts);
      }
    }
    
    // Debug: Log all FormData entries
    console.log('📤 FormData entries being sent:');
    for (let pair of formData.entries()) {
      console.log(`   ${pair[0]}:`, pair[1]);
    }
    
    return apiClient.upload<Experience>('/Experiences', formData);
  },

  /**
   * Update experience
   */
  async update(id: string, data: Partial<CreateExperienceRequest>): Promise<Experience> {
    return apiClient.put<Experience>(`/Experiences/${id}`, data);
  },

  /**
   * Delete experience
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/Experiences/${id}`);
  },

  /**
   * Delete experience image
   */
  async deleteImage(experienceId: string, imageId: string): Promise<void> {
    return apiClient.delete<void>(`/Experiences/${experienceId}/images/${imageId}`);
  },

  /**
   * Upload experience image
   */
  async uploadImage(id: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.upload<{ imageUrl: string }>(`/Experiences/${id}/image`, formData);
  },
};


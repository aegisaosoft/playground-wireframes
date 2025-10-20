import { apiClient } from '@/lib/api-client';

export interface Application {
  id: string;
  experienceId: string;
  experienceTitle: string;
  organizer: string;
  location: string;
  dates: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  image?: string;
  message: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantAvatar?: string;
}

export interface CreateApplicationRequest {
  experienceId: string;
  message?: string;
}

export interface UpdateApplicationStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
}

export const applicationsService = {
  async getMyApplications(): Promise<Application[]> {
    return apiClient.get<Application[]>('/Applications/my');
  },

  async getApplicationsForApproval(): Promise<Application[]> {
    return apiClient.get<Application[]>('/Applications/for-approval');
  },

  async getExperienceApplications(experienceId: string): Promise<Application[]> {
    return apiClient.get<Application[]>(`/Applications/experience/${experienceId}`);
  },

  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    return apiClient.post<Application>('/Applications', data);
  },

  async updateApplicationStatus(applicationId: string, data: UpdateApplicationStatusRequest): Promise<Application> {
    return apiClient.put<Application>(`/Applications/${applicationId}/status`, data);
  },
};

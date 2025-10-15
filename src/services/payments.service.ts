/**
 * Payments Service
 * Handles Stripe Connect and checkout operations
 */

import { apiClient } from '@/lib/api-client';

export interface StripeStatus {
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted?: boolean;
}

export interface CheckoutSessionRequest {
  experienceId: string;
  tierId: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const paymentsService = {
  /**
   * Get Stripe Connect account status
   */
  async getStripeStatus(): Promise<StripeStatus> {
    return apiClient.get<StripeStatus>('/api/connect/status');
  },

  /**
   * Create Stripe Connect account link for onboarding
   */
  async createAccountLink(): Promise<{ onboarding_url: string }> {
    return apiClient.post<{ onboarding_url: string }>('/api/connect/account-link');
  },

  /**
   * Create checkout session for ticket purchase
   */
  async createCheckoutSession(data: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    return apiClient.post<CheckoutSessionResponse>('/api/checkout/session', data);
  },

  /**
   * Verify checkout session after payment
   */
  async verifyCheckoutSession(sessionId: string): Promise<any> {
    return apiClient.get<any>(`/api/checkout/verify/${sessionId}`);
  },
};


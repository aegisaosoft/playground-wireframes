/**
 * Payments Service
 * Handles Stripe Connect and checkout operations
 */

import { apiClient } from '@/lib/api-client';

export interface StripeStatus {
  hasAccount: boolean;
  onboardingCompleted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: string;
  accountId?: string;
}

export interface CheckoutSessionRequest {
  experienceId: string;
  ticketTierId?: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  amount: number;
  currency: string;
  expiresAt: string;
}

export interface VerifyCheckoutResponse {
  success: boolean;
  status: string;
  paymentIntentId?: string;
  ticketPurchaseId?: string;
  message?: string;
}

export const paymentsService = {
  /**
   * Get Stripe Connect account status
   */
  async getStripeStatus(): Promise<StripeStatus> {
    const response = await apiClient.get<{ success: boolean; data: StripeStatus }>('/connect/status');
    return response.data;
  },

  /**
   * Create Stripe Connect account link for onboarding
   */
  async createAccountLink(): Promise<{ onboarding_url: string }> {
    const response = await apiClient.post<{ success: boolean; data: { onboardingUrl: string } }>('/connect/account-link');
    return { onboarding_url: response.data.onboardingUrl };
  },

  /**
   * Create checkout session for ticket purchase
   */
  async createCheckoutSession(data: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const response = await apiClient.post<{ success: boolean; data: CheckoutSessionResponse }>('/Checkout/session', data);
    return response.data;
  },

  /**
   * Verify checkout session after payment
   */
  async verifyCheckoutSession(sessionId: string): Promise<VerifyCheckoutResponse> {
    const response = await apiClient.get<{ success: boolean; data: VerifyCheckoutResponse }>(`/Checkout/verify/${sessionId}`);
    return response.data;
  },
};


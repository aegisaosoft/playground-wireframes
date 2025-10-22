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

export interface PaymentSessionRow {
  id: string;
  sessionId: string;
  userId: string;
  userName?: string;
  experienceId: string;
  experienceTitle?: string;
  hostId?: string;
  ticketTierId?: string;
  ticketTierName?: string;
  amount: number;
  currency: string;
  quantity: number;
  status: string;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
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

  /**
   * Get payment sessions report filtered by optional from/to/hostId/experienceId
   */
  async getPaymentSessions(params: { from?: string; to?: string; hostId?: string; experienceId?: string }): Promise<PaymentSessionRow[]> {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.hostId) query.set('hostId', params.hostId);
    if (params.experienceId) query.set('experienceId', params.experienceId);
    const qs = query.toString();
    const response = await apiClient.get<{ success: boolean; data: PaymentSessionRow[] }>(`/payments/sessions${qs ? `?${qs}` : ''}`);
    return response.data || [];
  }
};


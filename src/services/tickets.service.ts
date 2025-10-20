import { apiClient } from '../lib/api-client';

export interface TicketPurchase {
  id: string;
  userId: string;
  experienceId: string;
  ticketTierId?: string;
  applicationId?: string;
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId: string;
  amountCents: number;
  currency: string;
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
  attendanceStatus: 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';
  purchasedAt: string;
  paymentCompletedAt?: string;
  refundedAt?: string;
  // Related data
  experienceTitle?: string;
  experienceImage?: string;
  experienceLocation?: string;
  experienceDate?: string;
  ticketTierName?: string;
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  currency: string;
  refundedAt: string;
}

class TicketsService {
  async getMyTickets(): Promise<TicketPurchase[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: TicketPurchase[] }>('/Tickets/my-tickets');
      return response.data;
    } catch (error: any) {
      
      // If the endpoint doesn't exist yet (404), return empty array instead of throwing
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        return [];
      }
      
      throw error;
    }
  }

  async refundTicket(ticketId: string): Promise<RefundResponse> {
    try {
      const response = await apiClient.post<{ success: boolean; data: RefundResponse }>(`/Tickets/${ticketId}/refund`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async cancelTicket(ticketId: string): Promise<{ ticketId: string; status: string; cancelledAt: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: { ticketId: string; status: string; cancelledAt: string } }>(`/Tickets/${ticketId}/cancel`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const ticketsService = new TicketsService();

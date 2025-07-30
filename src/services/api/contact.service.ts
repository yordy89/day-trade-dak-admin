import apiClient from '@/lib/api-client';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType: 'general' | 'technical' | 'billing' | 'partnership' | 'media' | 'other';
  message: string;
  status: 'unread' | 'read' | 'archived';
  readAt?: string;
  readBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessagesResponse {
  messages: ContactMessage[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ContactMessageQuery {
  status?: 'unread' | 'read' | 'archived';
  inquiryType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const contactService = {
  async getMessages(query?: ContactMessageQuery): Promise<ContactMessagesResponse> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await apiClient.get(`/admin/contact-messages?${params.toString()}`);
    return response.data;
  },

  async getMessage(id: string): Promise<ContactMessage> {
    const response = await apiClient.get(`/admin/contact-messages/${id}`);
    return response.data;
  },

  async updateMessage(id: string, status: 'unread' | 'read' | 'archived'): Promise<ContactMessage> {
    const response = await apiClient.patch(`/admin/contact-messages/${id}`, { status });
    return response.data;
  },

  async deleteMessage(id: string): Promise<void> {
    await apiClient.delete(`/admin/contact-messages/${id}`);
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get('/admin/contact-messages/unread-count');
    return response.data;
  },
};
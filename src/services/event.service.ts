import apiClient from '@/lib/api-client';

export interface Event {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  type: 'master_course' | 'community_event' | 'workshop' | 'webinar';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  capacity?: number;
  registrations?: number;
  price?: number;
  vipPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  _id: string;
  eventId: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  ticketType: 'regular' | 'vip';
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'completed';
  paymentAmount: number;
  stripePaymentIntentId?: string;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  additionalInfo?: any;
  checkedIn?: boolean;
  // Partial payment fields
  totalAmount?: number;
  totalPaid?: number;
  remainingBalance?: number;
  isFullyPaid?: boolean;
  paymentMode?: 'full' | 'partial';
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

export interface EventRegistrationsResponse {
  registrations: EventRegistration[];
  total: number;
  page: number;
  limit: number;
}

interface GetEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class EventService {
  async getEvents(params: GetEventsParams = {}): Promise<EventsResponse> {
    try {
      // Filter out empty string parameters
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      const response = await apiClient.get('/admin/events', { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return { events: [], total: 0, page: 1, limit: 10 };
    }
  }

  async getEvent(eventId: string): Promise<Event> {
    const response = await apiClient.get(`/admin/events/${eventId}`);
    return response.data;
  }

  async getEventById(eventId: string): Promise<Event> {
    return this.getEvent(eventId);
  }

  async getEventStatistics(eventId: string): Promise<any> {
    const response = await apiClient.get(`/admin/events/${eventId}/statistics`);
    return response.data;
  }

  async getEventRegistrations(
    eventId: string,
    params: { page?: number; limit?: number; search?: string; paymentStatus?: string; status?: string } = {}
  ): Promise<EventRegistrationsResponse> {
    try {
      // Filter out empty string parameters
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      const response = await apiClient.get(`/admin/events/${eventId}/registrations`, { params: cleanParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      return { registrations: [], total: 0, page: 1, limit: 10 };
    }
  }

  async createEvent(data: Partial<Event>): Promise<Event> {
    const response = await apiClient.post('/admin/events', data);
    return response.data;
  }

  async updateEvent(eventId: string, data: Partial<Event>): Promise<Event> {
    const response = await apiClient.patch(`/admin/events/${eventId}`, data);
    return response.data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await apiClient.delete(`/admin/events/${eventId}`);
  }

  async updateRegistrationStatus(
    eventId: string,
    registrationId: string,
    status: string
  ): Promise<EventRegistration> {
    const response = await apiClient.patch(
      `/admin/events/${eventId}/registrations/${registrationId}/status`,
      { status }
    );
    return response.data;
  }

  async exportRegistrations(eventId: string, format: 'csv' | 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    const response = await apiClient.post(`/admin/events/${eventId}/export-registrations`, 
      { format, filters: {} },
      { responseType: 'blob' }
    );
    return response.data;
  }

  async toggleFeaturedStatus(eventId: string): Promise<Event> {
    const response = await apiClient.patch(`/admin/events/${eventId}/toggle-featured`);
    return response.data.event;
  }

  async setAsFeatured(eventId: string): Promise<Event> {
    const response = await apiClient.patch(`/admin/events/${eventId}/set-featured`);
    return response.data.event;
  }

  async getEventParticipants(eventId: string): Promise<any[]> {
    const response = await this.getEventRegistrations(eventId, { limit: 1000 });
    return response.registrations.map((reg) => ({
      userId: reg.user?._id,
      email: reg.email || reg.user?.email,
      firstName: reg.firstName || reg.user?.firstName,
      lastName: reg.lastName || reg.user?.lastName,
      isRegistered: !!reg.user,
    }));
  }
}

export const eventService = new EventService();
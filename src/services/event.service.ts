import { api } from '@/lib/api-client'
import { Event, EventRegistration, EventFilters, EventStatistics } from '@/types/event'

export interface EventsResponse {
  data?: Event[]
  events?: Event[]
  total?: number
  page?: number
  totalPages?: number
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface RegistrationsResponse {
  data: EventRegistration[]
  total: number
  page: number
  totalPages: number
}

export class EventService {
  async getEvents(filters?: EventFilters): Promise<EventsResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.type) params.append('type', filters.type)
      if (filters.status) params.append('status', filters.status)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
    }

    const response = await api.get(`/admin/events?${params.toString()}`)
    return response.data
  }

  async getEvent(id: string): Promise<Event> {
    const response = await api.get(`/admin/events/${id}`)
    return response.data
  }

  async createEvent(data: Partial<Event>): Promise<Event> {
    const response = await api.post('/admin/events', data)
    return response.data
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const response = await api.patch(`/admin/events/${id}`, data)
    return response.data
  }

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/admin/events/${id}`)
  }

  async getEventRegistrations(
    eventId: string,
    filters?: {
      page?: number
      limit?: number
      search?: string
      paymentStatus?: string
    }
  ): Promise<RegistrationsResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
    }

    const response = await api.get(`/admin/events/${eventId}/registrations?${params.toString()}`)
    return response.data
  }

  async getEventStatistics(eventId: string): Promise<EventStatistics> {
    const response = await api.get(`/admin/events/${eventId}/statistics`)
    return response.data
  }

  async exportRegistrations(
    eventId: string,
    format: 'csv' | 'excel' | 'pdf'
  ): Promise<Blob> {
    const response = await api.post(
      `/admin/events/${eventId}/export-registrations`,
      { format },
      { responseType: 'blob' }
    )
    return response.data
  }

  async toggleEventStatus(id: string): Promise<Event> {
    const response = await api.patch(`/admin/events/${id}/toggle-status`)
    return response.data
  }
}

// Export singleton instance
export const eventService = new EventService()

// Export hook for easy use in components
export const useEventService = () => eventService
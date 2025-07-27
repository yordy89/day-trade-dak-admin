export interface Event {
  _id: string
  name: string
  title?: string
  description?: string
  date: string
  startDate?: string
  endDate?: string
  location?: string
  bannerImage?: string
  vipPrice?: number
  price?: number
  isActive: boolean
  type: 'master_course' | 'community_event' | 'general'
  requiresActiveSubscription?: boolean
  capacity?: number
  registrations?: string[] | number
  currentRegistrations?: number
  metadata?: {
    hotel?: string
    hotelAddress?: string
    includesAccommodation?: boolean
    includesMeals?: boolean
    includesSaturdayDinner?: boolean
  }
  included?: string[]
  notIncluded?: string[]
  requirements?: string[]
  contact?: {
    email?: string
    phone?: string
    whatsapp?: string
  }
  coordinates?: {
    lat?: number
    lng?: number
  }
  status?: 'active' | 'draft' | 'completed'
  featuredInCRM?: boolean
  createdAt: string
  updatedAt: string
}

export interface EventRegistration {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  eventId: string | Event
  ticketType: 'vip' | 'general'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: string
  transactionId?: string
  amount: number
  registeredAt: string
  checkedIn?: boolean
  checkedInAt?: string
  additionalInfo?: {
    dietaryRestrictions?: string
    specialRequests?: string
    additionalAttendees?: {
      adults?: number
      children?: number
    }
  }
  createdAt: string
  updatedAt: string
}

export interface EventFilters {
  page?: number
  limit?: number
  search?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface EventStatistics {
  totalRegistrations: number
  vipRegistrations: number
  generalRegistrations: number
  totalRevenue: number
  vipRevenue: number
  generalRevenue: number
  paymentStatusBreakdown: {
    pending: number
    completed: number
    failed: number
    refunded: number
  }
  dailyRegistrations: Array<{
    date: string
    count: number
    revenue: number
  }>
  checkInRate: number
  capacityUtilization: number
}
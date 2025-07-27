export enum PlanInterval {
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  YEARLY = 'yearly',
  ONCE = 'once',
}

export enum PlanType {
  LIVE = 'live',
  COURSE = 'course',
  EVENT = 'event',
  BUNDLE = 'bundle',
}

export interface SubscriptionPlan {
  _id: string
  planId: string
  displayName: {
    en: string
    es: string
  }
  description: {
    en: string
    es: string
  }
  pricing: {
    baseAmount: number
    currency: string
    interval: PlanInterval
    intervalCount: number
  }
  type: PlanType
  features: {
    en: string[]
    es: string[]
  }
  meetingPermissions: {
    canCreateMeetings: boolean
    maxMeetingsPerMonth: number
    maxMeetingDuration: number
    maxParticipantsPerMeeting: number
    canRecordMeetings: boolean
    canScheduleMeetings: boolean
    hasLiveMeetingAccess: boolean
  }
  uiMetadata: {
    color: string
    icon: string
    badge?: string
    popular: boolean
    sortOrder: number
  }
  isActive: boolean
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface UserSubscription {
  _id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  subscription: {
    plan: string
    planDetails?: SubscriptionPlan
    expiresAt?: string
    stripeSubscriptionId?: string
    createdAt?: string
    currentPeriodEnd?: string
    status: 'active' | 'expired' | 'cancelled'
  }
}

export interface SubscriptionFilters {
  page?: number
  limit?: number
  search?: string
  planId?: string
  status?: 'active' | 'expired' | 'cancelled'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SubscriptionsResponse {
  subscriptions: UserSubscription[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SubscriptionStatistics {
  totalSubscriptions: number
  activeSubscriptions: number
  expiredSubscriptions: number
  monthlyRecurringRevenue: number
  totalActiveSubscribers?: number
  revenueByPlan?: Array<{
    planId: string
    displayName: {
      en: string
      es: string
    }
    userCount: number
    revenue: number
  }>
  planBreakdown?: Record<string, number>
  growthRate: number
}
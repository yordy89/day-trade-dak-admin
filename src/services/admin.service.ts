import apiClient from '@/lib/api-client'

export interface UserStats {
  total: number
  active: number
  subscribed: number
  growth: {
    today: number
    thisWeek: number
    thisMonth: number
  }
}

export interface SubscriptionStats {
  byPlan: Array<{
    plan: string
    count: number
    revenue: number
  }>
  expiringSoon: number
  recentCancellations: number
}

export interface AdminLog {
  _id: string
  adminId: string
  adminEmail: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  previousValue?: Record<string, any>
  newValue?: Record<string, any>
  ipAddress: string
  userAgent?: string
  status: 'success' | 'failure'
  errorMessage?: string
  createdAt: Date
}

export interface AdminLogsResponse {
  logs: AdminLog[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ActivitySummary {
  action: string
  resource: string
  count: number
}

interface AdminLogsParams {
  page?: number
  limit?: number
  adminId?: string
  action?: string
  resource?: string
  startDate?: Date
  endDate?: Date
  status?: string
}

class AdminService {
  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get('/admin/users/stats')
    return response.data
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const response = await apiClient.get('/admin/subscriptions/stats')
    return response.data
  }

  async getAdminLogs(params?: AdminLogsParams): Promise<AdminLogsResponse> {
    const response = await apiClient.get('/admin/logs', { params })
    return response.data
  }

  async getAdminActivitySummary(adminId: string, days: number = 30): Promise<ActivitySummary[]> {
    const response = await apiClient.get(`/admin/activity/${adminId}`, { 
      params: { days } 
    })
    return response.data
  }
}

export const adminService = new AdminService()
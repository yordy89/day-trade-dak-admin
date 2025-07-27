import { api } from '@/lib/api-client'
import { 
  SubscriptionFilters, 
  SubscriptionsResponse, 
  SubscriptionStatistics,
  SubscriptionPlan,
  UserSubscription 
} from '@/types/subscription'

export class SubscriptionService {
  async getSubscriptions(filters?: SubscriptionFilters): Promise<SubscriptionsResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.planId) params.append('planId', filters.planId)
      if (filters.status) params.append('status', filters.status)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
    }

    const response = await api.get(`/admin/subscriptions?${params.toString()}`)
    return response.data
  }

  async getSubscriptionStatistics(): Promise<SubscriptionStatistics> {
    const response = await api.get('/admin/subscriptions/stats')
    return response.data
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/admin/subscriptions/plans')
    return response.data
  }

  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    const response = await api.get(`/admin/subscriptions/user/${userId}`)
    return response.data
  }

  async updateSubscription(subscriptionId: string, data: {
    expiresAt?: string
    status?: string
  }): Promise<UserSubscription> {
    const response = await api.put(`/admin/subscriptions/${subscriptionId}`, data)
    return response.data.subscription
  }

  async cancelSubscription(subscriptionId: string): Promise<UserSubscription> {
    const response = await api.post(`/admin/subscriptions/${subscriptionId}/cancel`)
    return response.data.subscription
  }

  async reactivateSubscription(subscriptionId: string): Promise<UserSubscription> {
    const response = await api.post(`/admin/subscriptions/${subscriptionId}/reactivate`)
    return response.data.subscription
  }

  async exportSubscriptions(format: 'csv' | 'excel' | 'pdf', filters?: SubscriptionFilters): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('format', format)
    
    if (filters) {
      if (filters.search) params.append('search', filters.search)
      if (filters.planId) params.append('planId', filters.planId)
      if (filters.status) params.append('status', filters.status)
    }

    const response = await api.get(`/admin/subscriptions/export?${params.toString()}`, {
      responseType: 'blob'
    })
    
    return response.data
  }

  async createSubscriptionPlan(planData: any): Promise<SubscriptionPlan> {
    const response = await api.post('/admin/subscriptions/plans', planData)
    return response.data.plan
  }

  async updateSubscriptionPlan(planId: string, planData: any): Promise<SubscriptionPlan> {
    const response = await api.put(`/admin/subscriptions/plans/${planId}`, planData)
    return response.data.plan
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService()

// Export hook for easy use in components
export const useSubscriptionService = () => subscriptionService
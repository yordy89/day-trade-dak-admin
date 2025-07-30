import apiClient from '@/lib/api-client'

export interface User {
  _id: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  profileImage?: string
  phone?: string
  bio?: string
  city?: string
  country?: string
  allowLiveMeetingAccess?: boolean
  role: string
  status: string
  subscriptions: Array<{
    plan: string
    status: string
    currentPeriodEnd: Date
    stripeSubscriptionId?: string
  }>
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  subscription?: string
  role?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

class UserService {
  async getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
    // Filter out 'all' values and empty strings
    const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value && value !== 'all' && value !== '') {
        acc[key] = value
      }
      return acc
    }, {} as any)

    const response = await apiClient.get('/admin/users', { params: filteredParams })
    return response.data
  }

  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get(`/admin/users/${userId}`)
    return response.data
  }

  async createUser(data: Partial<User>): Promise<User> {
    const response = await apiClient.post('/admin/users', data)
    return response.data
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch(`/admin/users/${userId}`, data)
    return response.data
  }

  async updateUserStatus(userId: string, status: string): Promise<User> {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { status })
    return response.data
  }

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`)
  }

  async exportUsers(params: GetUsersParams = {}): Promise<Blob> {
    const response = await apiClient.get('/admin/users/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  }

  async getAdminHosts(): Promise<User[]> {
    const response = await apiClient.get('/admin/users/hosts')
    return response.data
  }

  // Subscription management methods
  async addUserSubscription(userId: string, subscriptionData: {
    plan: string
    expiresAt?: string
  }): Promise<any> {
    const response = await apiClient.post(`/admin/users/${userId}/subscriptions`, subscriptionData)
    return response.data
  }

  async updateUserSubscription(userId: string, subscriptionId: string, data: {
    plan?: string
    expiresAt?: string
  }): Promise<any> {
    const response = await apiClient.patch(`/admin/users/${userId}/subscriptions/${subscriptionId}`, data)
    return response.data
  }

  async cancelUserSubscription(userId: string, subscriptionId: string): Promise<any> {
    const response = await apiClient.post(`/admin/users/${userId}/subscriptions/${subscriptionId}/cancel`)
    return response.data
  }

  async deleteUserSubscription(userId: string, subscriptionId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}/subscriptions/${subscriptionId}`)
  }
}

export const userService = new UserService()
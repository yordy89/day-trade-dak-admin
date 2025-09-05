import { api } from '@/lib/api-client'

export interface MaintenanceStatus {
  lastCleanupRun: Date | null
  pendingExpiredSubscriptions: number
  failedTransactionsLast24h: number
  currentTime: Date
  nextScheduledCleanup: Date
}

export interface ExpiredSubscriptionPreview {
  expiredSubscriptions: Array<{
    userId: string
    userEmail: string
    userName?: string
    subscription: {
      plan: string
      expiresAt: Date | null
      currentPeriodEnd: Date | null
      daysExpired: number
      stripeSubscriptionId?: string
      status?: string
      createdAt?: Date
    }
  }>
  totalCount: number
  usersAffected?: number
}

export interface CleanupResult {
  success: boolean
  message: string
  stats: {
    usersChecked: number
    usersUpdated: number
    subscriptionsRemoved: number
    executionTime: string
    details?: any[]
  }
}

export interface MaintenanceTaskResult {
  success: boolean
  message: string
  results: {
    [key: string]: any
  }
}

class AdminMaintenanceService {
  private readonly baseUrl = '/admin/maintenance'

  /**
   * Get current maintenance status
   */
  async getMaintenanceStatus(): Promise<MaintenanceStatus> {
    const url = `${this.baseUrl}/status`
    console.log('Fetching maintenance status from:', url)
    try {
      const response = await api.get(url)
      console.log('Maintenance status response:', response.data)
      return response.data.status
    } catch (error) {
      console.error('Error fetching maintenance status:', error)
      throw error
    }
  }

  /**
   * Preview expired subscriptions without removing them
   */
  async getExpiredSubscriptionsPreview(): Promise<ExpiredSubscriptionPreview> {
    const url = `${this.baseUrl}/cleanup/expired-subscriptions/preview`
    console.log('Fetching expired subscriptions preview from:', url)
    try {
      const response = await api.get(url)
      console.log('Preview response:', response.data)
      // Extract the data from the success wrapper
      const result = response.data
      return {
        expiredSubscriptions: result.expiredSubscriptions || [],
        totalCount: result.totalCount || 0,
        usersAffected: result.usersAffected
      }
    } catch (error) {
      console.error('Error fetching preview:', error)
      throw error
    }
  }

  /**
   * Manually cleanup expired subscriptions
   */
  async cleanupExpiredSubscriptions(): Promise<CleanupResult> {
    const url = `${this.baseUrl}/cleanup/expired-subscriptions`
    console.log('Cleaning up expired subscriptions at:', url)
    try {
      const response = await api.post(url)
      console.log('Cleanup response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error during cleanup:', error)
      throw error
    }
  }

  /**
   * Run all maintenance tasks
   */
  async runAllMaintenanceTasks(tasks?: string[]): Promise<MaintenanceTaskResult> {
    const url = `${this.baseUrl}/run-all-tasks`
    console.log('Running maintenance tasks at:', url, 'with tasks:', tasks)
    try {
      const response = await api.post(url, { tasks })
      console.log('Run all tasks response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error running maintenance tasks:', error)
      throw error
    }
  }

  /**
   * Run specific maintenance task
   */
  async runMaintenanceTask(task: string): Promise<any> {
    const url = `${this.baseUrl}/tasks/${task}`
    console.log('Running specific task at:', url)
    try {
      const response = await api.post(url)
      return response.data
    } catch (error) {
      console.error('Error running task:', error)
      throw error
    }
  }

  /**
   * Cleanup single expired subscription
   */
  async cleanupSingleSubscription(userId: string, plan: string): Promise<any> {
    const url = `${this.baseUrl}/cleanup/single-subscription`
    console.log('Cleaning up single subscription:', { userId, plan })
    try {
      const response = await api.post(url, { userId, plan })
      console.log('Single cleanup response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error cleaning up single subscription:', error)
      throw error
    }
  }
}

export const adminMaintenanceService = new AdminMaintenanceService()
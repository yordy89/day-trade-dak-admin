import apiClient from '@/lib/api-client'
import { 
  PaymentStatus, 
  PaymentMethod, 
  TransactionType,
  SubscriptionPlan 
} from '@/types/payment'

export interface DateRange {
  start: Date
  end: Date
}

export interface PaymentStats {
  totalRevenue: number
  revenueChange: number
  averageOrderValue: number
  aovChange: number
  totalTransactions: number
  transactionsChange: number
  activeSubscriptions: number
  subscriptionsChange: number
  recurringRevenue: number
  recurringChange: number
  churnRate: number
  churnChange: number
}

export interface PaymentTransaction {
  _id: string
  transactionId: string
  customerName: string
  customerEmail: string
  customerId: string
  amount: number
  currency: string
  method: string
  status: string
  plan?: SubscriptionPlan
  type?: TransactionType
  description: string
  metadata?: any
  createdAt: Date
  updatedAt: Date
  refundAmount?: number
  stripePaymentIntentId?: string
}

export interface SubscriptionStats {
  totalMRR: number
  mrrGrowth: number
  totalSubscribers: number
  subscriberGrowth: number
  churnRate: number
  churnChange: number
  averageLTV: number
  ltvGrowth: number
  planBreakdown: {
    [key: string]: {
      count: number
      mrr: number
      churn: number
    }
  }
}

export interface FinancialMetrics {
  totalRevenue: number
  totalRevenueChange: number
  activeSubscriptions: number
  activeSubscriptionsChange: number
  monthlyRecurringRevenue: number
  mrrChange: number
  averageTransactionValue: number
  atvChange: number
  period: string
}

export interface RevenueChartData {
  labels: string[]
  datasets: {
    name: string
    data: number[]
  }[]
}

export interface PaymentMethodDistribution {
  method: string // Changed from PaymentMethod to string to match API
  count: number
  amount: number
  percentage: number
}

export interface ReportType {
  type: string
  format: 'pdf' | 'csv' | 'excel'
  dateRange?: DateRange
  includeCharts?: boolean
}

export interface TransactionFilters {
  dateRange?: DateRange
  status?: PaymentStatus[]
  plans?: SubscriptionPlan[]
  paymentMethods?: PaymentMethod[]
  minAmount?: number
  maxAmount?: number
  searchTerm?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

class AnalyticsService {
  async getPaymentStats(params: {
    startDate: Date | null
    endDate: Date | null
    currency: string
  }): Promise<PaymentStats> {
    const requestParams = {
      startDate: params.startDate?.toISOString(),
      endDate: params.endDate?.toISOString(),
      currency: params.currency,
    }
    
    console.log('API Call - getPaymentStats - URL:', '/admin/analytics/payment-stats')
    console.log('API Call - getPaymentStats - Params:', requestParams)
    
    try {
      const response = await apiClient.get('/admin/analytics/payment-stats', {
        params: requestParams,
      })
      console.log('API Response - getPaymentStats - Data:', response.data)
      return response.data
    } catch (error) {
      console.error('API Error - getPaymentStats:', error)
      throw error
    }
  }

  async getPaymentTransactions(params: any): Promise<{
    transactions: PaymentTransaction[]
    total: number
    page: number
    limit: number
  }> {
    const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'startDate' || key === 'endDate') {
          acc[key] = value instanceof Date ? value.toISOString() : value
        } else {
          acc[key] = value
        }
      }
      return acc
    }, {} as any)

    console.log('API Call - getPaymentTransactions - URL:', '/admin/analytics/transactions')
    console.log('API Call - getPaymentTransactions - Params:', filteredParams)
    
    try {
      const response = await apiClient.get('/admin/analytics/transactions', { params: filteredParams })
      console.log('API Response - getPaymentTransactions - Data:', response.data)
      return response.data
    } catch (error) {
      console.error('API Error - getPaymentTransactions:', error)
      throw error
    }
  }

  async getSubscriptionStats(params: {
    startDate: Date | null
    endDate: Date | null
  }): Promise<SubscriptionStats> {
    const requestParams = {
      startDate: params.startDate?.toISOString(),
      endDate: params.endDate?.toISOString(),
    }
    
    console.log('API Call - getSubscriptionStats - URL:', '/admin/analytics/subscription-stats')
    console.log('API Call - getSubscriptionStats - Params:', requestParams)
    
    try {
      const response = await apiClient.get('/admin/analytics/subscription-stats', {
        params: requestParams,
      })
      console.log('API Response - getSubscriptionStats - Data:', response.data)
      return response.data
    } catch (error) {
      console.error('API Error - getSubscriptionStats:', error)
      throw error
    }
  }

  async exportAnalyticsReport(params: {
    type: 'revenue' | 'transactions' | 'subscriptions'
    format: 'csv' | 'pdf'
    startDate: Date
    endDate: Date
  }): Promise<Blob> {
    const response = await apiClient.get('/admin/analytics/export', {
      params: {
        type: params.type,
        format: params.format,
        startDate: params.startDate.toISOString(),
        endDate: params.endDate.toISOString(),
      },
      responseType: 'blob',
    })
    return response.data
  }

  async getFinancialMetrics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<FinancialMetrics> {
    // Calculate date range based on period
    const endDate = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1)
        break
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }
    
    // Get both payment metrics and subscription metrics
    const [paymentMetrics, subscriptionMetrics] = await Promise.all([
      apiClient.get('/payments/reports/metrics', {
        params: { 
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      }),
      apiClient.get('/payments/reports/subscriptions', {
        params: { 
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      })
    ])
    
    // Map backend response to frontend expected format
    const payment = paymentMetrics.data
    const subscription = subscriptionMetrics.data
    
    return {
      totalRevenue: payment.totalRevenue || 0,
      totalRevenueChange: 0, // TODO: Calculate based on previous period
      activeSubscriptions: subscription.activeSubscriptions || 0,
      activeSubscriptionsChange: 0, // TODO: Calculate based on previous period
      monthlyRecurringRevenue: subscription.monthlyRecurringRevenue || 0,
      mrrChange: 0, // TODO: Calculate based on previous period
      averageTransactionValue: payment.averageTransactionValue || 0,
      atvChange: 0, // TODO: Calculate based on previous period
      period: period
    }
  }

  async getRevenueChart(dateRange: DateRange, groupBy: 'day' | 'week' | 'month' = 'day'): Promise<RevenueChartData> {
    const response = await apiClient.get('/payments/reports/daily-revenue', {
      params: {
        startDate: dateRange.start.toISOString().split('T')[0],
        endDate: dateRange.end.toISOString().split('T')[0],
        groupBy
      }
    })
    
    // Handle empty response
    if (!response.data || response.data.length === 0) {
      return {
        labels: [],
        datasets: [
          { name: 'Total Revenue', data: [] },
          { name: 'Subscriptions', data: [] },
          { name: 'One-time Payments', data: [] }
        ]
      }
    }
    
    // Transform data for recharts
    const labels = response.data.map((item: any) => item.date)
    const revenueData = response.data.map((item: any) => item.revenue || 0)
    
    return {
      labels,
      datasets: [
        { name: 'Total Revenue', data: revenueData }
      ]
    }
  }

  async getPaymentMethodDistribution(dateRange?: DateRange): Promise<PaymentMethodDistribution[]> {
    // Default to last 30 days if no date range provided
    const endDate = dateRange?.end || new Date()
    const startDate = dateRange?.start || new Date(new Date().setDate(new Date().getDate() - 30))
    
    const response = await apiClient.get('/payments/reports/payment-methods', {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    })
    
    // Transform API response to match our interface
    // API returns { method, count, revenue, percentage }
    // We need { method, count, amount, percentage }
    return response.data.map((item: any) => ({
      method: item.method,
      count: item.count,
      amount: item.revenue, // Map revenue to amount
      percentage: item.percentage
    }))
  }

  async getRevenueByPlan(dateRange?: DateRange): Promise<any> {
    // Default to last 30 days if no date range provided
    const endDate = dateRange?.end || new Date()
    const startDate = dateRange?.start || new Date(new Date().setDate(new Date().getDate() - 30))
    
    const response = await apiClient.get('/payments/reports/revenue-by-plan', { 
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    })
    
    // Transform the response to match what the component expects
    if (!response.data || response.data.length === 0) {
      return { planBreakdown: {} }
    }
    
    // Map API plan names to our enum values
    const planMapping: Record<string, string> = {
      'LiveWeeklyManual': 'live_weekly_manual',
      'MasterClases': 'masterclases',
      'LiveRecorded': 'liverecorded',
      'Psicotrading': 'psicotrading',
      'Classes': 'classes',
      'PeaceWithMoney': 'peace_with_money',
      'CommunityEvent': 'community_event'
    }
    
    // Convert array response to object format expected by component
    const planBreakdown: any = {}
    response.data.forEach((item: any) => {
      if (item.plan) { // plan contains the plan name
        const mappedPlan = planMapping[item.plan] || item.plan.toLowerCase()
        planBreakdown[mappedPlan] = {
          revenue: item.revenue || 0,
          count: item.transactionCount || 0
        }
      }
    })
    
    return { planBreakdown }
  }

  async getTransactionsWithFilters(filters: TransactionFilters): Promise<{
    transactions: PaymentTransaction[]
    total: number
    page: number
    limit: number
  }> {
    const params: any = {
      page: filters.page || 1,
      limit: filters.limit || 25,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc'
    }

    if (filters.dateRange) {
      params.startDate = filters.dateRange.start.toISOString()
      params.endDate = filters.dateRange.end.toISOString()
    }

    if (filters.status?.length) {
      params.status = filters.status.join(',')
    }

    if (filters.plans?.length) {
      params.plans = filters.plans.join(',')
    }

    if (filters.paymentMethods?.length) {
      params.method = filters.paymentMethods.join(',') // Backend expects 'method' not 'paymentMethods'
    }

    if (filters.minAmount !== undefined) {
      params.minAmount = filters.minAmount
    }

    if (filters.maxAmount !== undefined) {
      params.maxAmount = filters.maxAmount
    }

    if (filters.searchTerm) {
      params.search = filters.searchTerm
    }

    const response = await apiClient.get('/admin/analytics/transactions', { params })
    return response.data
  }

  async exportTransactions(
    format: 'csv' | 'excel' | 'pdf',
    filters: TransactionFilters
  ): Promise<Blob> {
    const params: any = {
      format,
      ...filters
    }

    const response = await apiClient.get('/admin/transactions/export', {
      params,
      responseType: 'blob'
    })

    return response.data
  }

  async generateReport(reportType: ReportType): Promise<Blob> {
    const requestBody = {
      type: reportType.type,
      format: reportType.format,
      dateRange: reportType.dateRange ? {
        start: reportType.dateRange.start.toISOString().split('T')[0],
        end: reportType.dateRange.end.toISOString().split('T')[0],
      } : undefined,
      includeCharts: reportType.includeCharts,
    }

    const response = await apiClient.post('/admin/reports/generate', requestBody, {
      responseType: 'blob',
    })

    return response.data
  }
}

export const analyticsService = new AnalyticsService()
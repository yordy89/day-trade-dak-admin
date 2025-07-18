import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'

interface UsePaymentTransactionsParams {
  page?: number
  limit?: number
  startDate?: Date | null
  endDate?: Date | null
  search?: string
  status?: string
  method?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function usePaymentTransactions(params: UsePaymentTransactionsParams) {
  return useQuery({
    queryKey: ['paymentTransactions', params],
    queryFn: () => analyticsService.getPaymentTransactions(params),
  })
}
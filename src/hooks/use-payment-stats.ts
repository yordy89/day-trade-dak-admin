import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'

interface UsePaymentStatsParams {
  startDate: Date | null
  endDate: Date | null
  currency: string
}

export function usePaymentStats(params: UsePaymentStatsParams) {
  return useQuery({
    queryKey: ['paymentStats', params],
    queryFn: () => analyticsService.getPaymentStats(params),
    enabled: !!params.startDate && !!params.endDate,
  })
}

export function usePaymentTransactions(params: any) {
  return useQuery({
    queryKey: ['paymentTransactions', params],
    queryFn: () => analyticsService.getPaymentTransactions(params),
  })
}

export function useSubscriptionStats(params: any) {
  return useQuery({
    queryKey: ['subscriptionStats', params],
    queryFn: () => analyticsService.getSubscriptionStats(params),
  })
}
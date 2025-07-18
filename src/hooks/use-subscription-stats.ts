import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'

interface UseSubscriptionStatsParams {
  startDate: Date | null
  endDate: Date | null
}

export function useSubscriptionStats(params: UseSubscriptionStatsParams) {
  return useQuery({
    queryKey: ['subscriptionStats', params],
    queryFn: () => analyticsService.getSubscriptionStats(params),
    enabled: !!params.startDate && !!params.endDate,
  })
}
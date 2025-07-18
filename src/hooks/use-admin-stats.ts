import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'

export function useUserStats() {
  return useQuery({
    queryKey: ['admin', 'userStats'],
    queryFn: () => adminService.getUserStats(),
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: ['admin', 'subscriptionStats'],
    queryFn: () => adminService.getSubscriptionStats(),
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useAdminLogs(params?: any) {
  return useQuery({
    queryKey: ['admin', 'logs', params],
    queryFn: () => adminService.getAdminLogs(params),
  })
}

export function useAdminActivity(adminId: string, days: number = 30) {
  return useQuery({
    queryKey: ['admin', 'activity', adminId, days],
    queryFn: () => adminService.getAdminActivitySummary(adminId, days),
    enabled: !!adminId,
  })
}
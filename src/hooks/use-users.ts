import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'

interface UseUsersParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  subscription?: string
  role?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useUsers(params: UseUsersParams = {}) {
  const queryClient = useQueryClient()

  // Create a stable query key
  const queryKey = [
    'users',
    params.page || 1,
    params.limit || 25,
    params.search || '',
    params.status || 'all',
    params.subscription || 'all',
    params.role || 'all',
    params.sortBy || 'createdAt',
    params.sortOrder || 'desc',
  ]

  const query = useQuery({
    queryKey,
    queryFn: () => userService.getUsers(params),
    retry: 1,
    staleTime: 5000, // 5 seconds
    gcTime: 60000, // 1 minute (keep in cache longer)
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: true, // Fetch on mount
    enabled: true, // Always enabled
    networkMode: 'offlineFirst', // Use cache first
  })

  const deleteUserMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      userService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    deleteUser: deleteUserMutation.mutate,
    updateUserStatus: (userId: string, status: string) =>
      updateUserStatusMutation.mutate({ userId, status }),
  }
}

export function useAdminHosts() {
  return useQuery({
    queryKey: ['admin-hosts'],
    queryFn: async () => {
      try {
        const hosts = await userService.getAdminHosts()
        console.log('Fetched admin hosts:', hosts)
        return hosts
      } catch (error) {
        console.error('Error fetching admin hosts:', error)
        throw error
      }
    },
    retry: 1,
    staleTime: 60000, // 1 minute
  })
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      userService.updateUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
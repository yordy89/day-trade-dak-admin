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

  const query = useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
    retry: 1,
    staleTime: 30000, // 30 seconds
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
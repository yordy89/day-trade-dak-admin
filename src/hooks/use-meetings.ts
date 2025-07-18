import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { meetingService } from '@/services/meeting.service'

interface UseMeetingsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  type?: string
  host?: string
  dateRange?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  startDate?: Date
  endDate?: Date
}

export function useMeetings(params: UseMeetingsParams = {}) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['meetings', params],
    queryFn: () => meetingService.getMeetings(params),
    retry: 1,
    staleTime: 30000, // 30 seconds
  })

  const deleteMeetingMutation = useMutation({
    mutationFn: meetingService.deleteMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    deleteMeeting: deleteMeetingMutation.mutateAsync,
  }
}

export function useMeeting(meetingId: string) {
  return useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => meetingService.getMeetingById(meetingId),
    enabled: !!meetingId,
  })
}

export function useCreateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: meetingService.createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      meetingService.updateMeeting(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}

export function useStartMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: meetingService.startMeeting,
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] })
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}

export function useEndMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: meetingService.endMeeting,
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] })
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}
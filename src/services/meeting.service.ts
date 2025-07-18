import apiClient from '@/lib/api-client'

export interface Meeting {
  _id: string
  meetingId: string
  title: string
  description?: string
  scheduledAt: Date
  duration: number
  host: any
  participants: any[]
  roomUrl: string
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  isRecurring: boolean
  recurringType?: 'daily' | 'weekly' | 'monthly'
  recurringDays?: number[]
  recurringEndDate?: Date
  maxParticipants: number
  isPublic: boolean
  requiresApproval: boolean
  enableRecording: boolean
  enableChat: boolean
  enableScreenShare: boolean
  enableWaitingRoom: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MeetingsResponse {
  meetings: Meeting[]
  total: number
  page: number
  limit: number
}

interface GetMeetingsParams {
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

interface CreateMeetingData {
  title: string
  description?: string
  scheduledAt: Date
  duration: number
  participants?: string[]
  isRecurring: boolean
  recurringType?: 'daily' | 'weekly' | 'monthly'
  recurringDays?: number[]
  recurringEndDate?: Date
  recurringTime?: string
  maxParticipants?: number
  isPublic?: boolean
  requiresApproval?: boolean
  enableRecording?: boolean
  enableChat?: boolean
  enableScreenShare?: boolean
  enableWaitingRoom?: boolean
  hostId?: string
}

class MeetingService {
  async getMeetings(params: GetMeetingsParams = {}): Promise<MeetingsResponse> {
    // Filter out 'all' values and empty strings
    const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value && value !== 'all' && value !== '') {
        if (key === 'startDate' || key === 'endDate') {
          acc[key] = (value as Date).toISOString()
        } else {
          acc[key] = value
        }
      }
      return acc
    }, {} as any)

    const response = await apiClient.get('/admin/meetings', { params: filteredParams })
    return response.data
  }

  async getMeetingById(meetingId: string): Promise<Meeting> {
    const response = await apiClient.get(`/admin/meetings/${meetingId}`)
    return response.data
  }

  async createMeeting(data: CreateMeetingData): Promise<Meeting> {
    const response = await apiClient.post('/admin/meetings', data)
    return response.data
  }

  async updateMeeting(meetingId: string, data: Partial<CreateMeetingData>): Promise<Meeting> {
    const response = await apiClient.patch(`/admin/meetings/${meetingId}`, data)
    return response.data
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    await apiClient.delete(`/admin/meetings/${meetingId}`)
  }

  async startMeeting(meetingId: string): Promise<Meeting> {
    const response = await apiClient.post(`/admin/meetings/${meetingId}/start`)
    return response.data
  }

  async endMeeting(meetingId: string): Promise<Meeting> {
    const response = await apiClient.post(`/admin/meetings/${meetingId}/end`)
    return response.data
  }

  async getMeetingStats(): Promise<any> {
    const response = await apiClient.get('/admin/meetings/stats')
    return response.data
  }

  async triggerCleanup(): Promise<any> {
    const response = await apiClient.post('/admin/meetings/cron/trigger-cleanup')
    return response.data
  }
}

export const meetingService = new MeetingService()
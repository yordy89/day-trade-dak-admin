import { api } from '@/lib/api-client'
import {
  Trade,
  CreateFeedbackDto,
  Feedback,
  FilterTradesDto,
  TradeStatistics,
  TradesResponse,
  StudentWithJournal,
  DailyPnl,
} from '../types/trading-journal'

export class TradingJournalService {
  private readonly baseUrl = '/trading-journal'

  /**
   * Get all students who have trading journals
   * @param eventId Optional event ID to filter students by event
   */
  async getStudentsWithJournals(eventId?: string): Promise<StudentWithJournal[]> {
    const params = eventId ? { eventId } : {}
    const response = await api.get(`${this.baseUrl}/admin/students`, { params })
    return response.data
  }

  /**
   * Get trades for a specific student
   */
  async getStudentTrades(
    studentId: string,
    filters: FilterTradesDto = {}
  ): Promise<TradesResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v.toString()))
        } else if (value instanceof Date) {
          params.append(key, value.toISOString())
        } else {
          params.append(key, value.toString())
        }
      }
    })

    const response = await api.get(
      `${this.baseUrl}/admin/student/${studentId}/trades?${params.toString()}`
    )
    return response.data
  }

  /**
   * Get a specific trade by ID
   */
  async getTrade(tradeId: string): Promise<Trade> {
    const response = await api.get(`${this.baseUrl}/trades/${tradeId}`)
    return response.data
  }

  /**
   * Get statistics for a specific student
   */
  async getStudentStatistics(
    studentId: string,
    filters: FilterTradesDto = {}
  ): Promise<TradeStatistics> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    const response = await api.get(
      `${this.baseUrl}/admin/student/${studentId}/statistics?${params.toString()}`
    )
    return response.data
  }

  /**
   * Get daily P&L for a student
   */
  async getStudentDailyPnl(studentId: string, days: number = 30): Promise<DailyPnl[]> {
    const response = await api.get(
      `${this.baseUrl}/admin/student/${studentId}/daily-pnl?days=${days}`
    )
    return response.data
  }

  /**
   * Create feedback for a student's trade
   */
  async createFeedback(data: CreateFeedbackDto): Promise<Feedback> {
    const response = await api.post(`${this.baseUrl}/feedback`, data)
    return response.data
  }

  /**
   * Get feedback for a specific trade
   */
  async getTradeFeedback(tradeId: string): Promise<Feedback[]> {
    const response = await api.get(`${this.baseUrl}/trades/${tradeId}/feedback`)
    return response.data
  }

  /**
   * Get all feedback given by current mentor
   */
  async getMyFeedback(): Promise<Feedback[]> {
    const response = await api.get(`${this.baseUrl}/feedback`)
    return response.data
  }

  /**
   * Mark a trade as reviewed
   */
  async markTradeAsReviewed(tradeId: string): Promise<Trade> {
    const response = await api.patch(`${this.baseUrl}/trades/${tradeId}/review`)
    return response.data
  }

  /**
   * Export student trades
   */
  async exportStudentTrades(
    studentId: string,
    filters: FilterTradesDto = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v.toString()))
        } else {
          params.append(key, value.toString())
        }
      }
    })
    params.append('format', format)

    const response = await api.get(
      `${this.baseUrl}/admin/student/${studentId}/export?${params.toString()}`,
      {
        responseType: 'blob',
      }
    )
    return response.data
  }
}

export const tradingJournalService = new TradingJournalService()

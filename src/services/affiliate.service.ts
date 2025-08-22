import apiClient from '@/lib/api-client'

export interface Affiliate {
  _id: string
  affiliateCode: string
  name: string
  email: string
  phoneNumber?: string
  discountType: 'percentage' | 'fixed'
  discountPercentage?: number
  discountFixedAmount?: number
  commissionType: 'percentage' | 'fixed'
  commissionRate?: number
  commissionFixedAmount?: number
  isActive: boolean
  totalSales: number
  totalCommission: number
  totalRevenue: number
  stripeCouponId?: string
  stripePromotionCodeId?: string
  createdAt: string
  updatedAt: string
}

export interface Commission {
  _id: string
  affiliateId: string
  affiliateCode: string
  customerEmail: string
  customerName?: string
  originalPrice: number
  discountAmount: number
  finalPrice: number
  commissionRate: number
  commissionAmount: number
  stripeSessionId?: string
  stripePaymentIntentId?: string
  status: 'pending' | 'paid' | 'cancelled'
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAffiliateDto {
  affiliateCode: string
  name: string
  email: string
  phoneNumber?: string
  discountType: 'percentage' | 'fixed'
  discountPercentage?: number
  discountFixedAmount?: number
  commissionType: 'percentage' | 'fixed'
  commissionRate?: number
  commissionFixedAmount?: number
}

export interface UpdateAffiliateDto {
  name?: string
  email?: string
  phoneNumber?: string
  discountType?: 'percentage' | 'fixed'
  discountPercentage?: number
  discountFixedAmount?: number
  commissionType?: 'percentage' | 'fixed'
  commissionRate?: number
  commissionFixedAmount?: number
  isActive?: boolean
}

class AffiliateService {
  async getAffiliates() {
    const response = await apiClient.get<Affiliate[]>('/affiliates')
    return response.data
  }

  async getAffiliate(id: string) {
    const response = await apiClient.get<Affiliate>(`/affiliates/${id}`)
    return response.data
  }

  async createAffiliate(data: CreateAffiliateDto) {
    const response = await apiClient.post<Affiliate>('/affiliates', data)
    return response.data
  }

  async updateAffiliate(id: string, data: UpdateAffiliateDto) {
    const response = await apiClient.put<Affiliate>(`/affiliates/${id}`, data)
    return response.data
  }

  async toggleAffiliateStatus(id: string) {
    // First get the affiliate to know current status
    const affiliate = await this.getAffiliate(id)
    // Then update with toggled status
    const response = await apiClient.put<Affiliate>(`/affiliates/${id}`, {
      isActive: !affiliate.isActive
    })
    return response.data
  }

  async deleteAffiliate(id: string) {
    const response = await apiClient.delete(`/affiliates/${id}`)
    return response.data
  }

  async getAffiliateStats(id: string) {
    const response = await apiClient.get<{
      affiliate: Affiliate
      commissions: Commission[]
      stats: {
        totalSales: number
        totalRevenue: number
        totalCommission: number
        averageSaleValue: number
        conversionRate?: number
      }
    }>(`/affiliates/${id}/stats`)
    return response.data
  }

  async getCommissions() {
    const response = await apiClient.get<Commission[]>('/affiliates/commissions')
    return response.data
  }

  async updateCommissionStatus(id: string, data: { status: 'paid' | 'cancelled'; paidAt?: Date }) {
    const response = await apiClient.put<Commission>(`/affiliates/commissions/${id}/status`, data)
    return response.data
  }

  async syncWithStripe(id: string) {
    const response = await apiClient.post<Affiliate>(`/affiliates/${id}/sync-stripe`)
    return response.data
  }

  async validateCode(code: string) {
    const response = await apiClient.post<{
      valid: boolean
      message?: string
      discount?: number
      affiliateId?: string
      commissionRate?: number
    }>('/affiliates/validate', { code, eventType: 'master_course' })
    return response.data
  }
}

export default new AffiliateService()
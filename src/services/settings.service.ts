import apiClient from '@/lib/api-client'
import { ISetting, SettingCategory, BulkUpdateSettingsDto } from '@/types/setting'

class SettingsService {
  async getAllSettings(params?: {
    category?: SettingCategory
    search?: string
    page?: number
    limit?: number
  }) {
    const response = await apiClient.get('/settings', { params })
    return response.data
  }

  async getSettingsByCategory(category: SettingCategory): Promise<ISetting[]> {
    const response = await apiClient.get(`/settings/category/${category}`)
    return response.data
  }

  async getCategories() {
    const response = await apiClient.get('/settings/categories')
    return response.data
  }

  async getSettingByKey(key: string): Promise<ISetting> {
    const response = await apiClient.get(`/settings/${key}`)
    return response.data
  }

  async createSetting(data: Partial<ISetting>): Promise<ISetting> {
    const response = await apiClient.post('/settings', data)
    return response.data
  }

  async updateSetting(key: string, data: Partial<ISetting>): Promise<ISetting> {
    const response = await apiClient.patch(`/settings/${key}`, data)
    return response.data
  }

  async updateSettingValue(key: string, value: any, lastModifiedBy?: string): Promise<ISetting> {
    const response = await apiClient.patch(`/settings/${key}/value`, {
      value,
      lastModifiedBy
    })
    return response.data
  }

  async getValue(key: string): Promise<any> {
    const response = await apiClient.get(`/settings/${key}/value`)
    return response.data
  }

  async bulkUpdateSettings(data: BulkUpdateSettingsDto) {
    const response = await apiClient.post('/settings/bulk-update', data)
    return response.data
  }

  async deleteSetting(key: string) {
    const response = await apiClient.delete(`/settings/${key}`)
    return response.data
  }

  async resetDefaults() {
    const response = await apiClient.post('/settings/reset-defaults')
    return response.data
  }

  async exportSettings() {
    const response = await apiClient.get('/settings/export/all')
    return response.data
  }

  async importSettings(settings: any[]) {
    const response = await apiClient.post('/settings/import', settings)
    return response.data
  }
}

export const settingsService = new SettingsService()
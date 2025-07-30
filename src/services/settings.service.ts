import apiClient from '@/lib/api-client'
import { ISetting, SettingCategory, BulkUpdateSettingsDto } from '@/types/setting'

class SettingsService {
  async getAllSettings(params?: {
    category?: SettingCategory
    search?: string
    page?: number
    limit?: number
  }) {
    const response = await apiClient.get('/admin/settings', { params })
    return response.data
  }

  async getSettingsByCategory(category: SettingCategory): Promise<ISetting[]> {
    const response = await apiClient.get(`/admin/settings/category/${category}`)
    return response.data
  }

  async getCategories() {
    const response = await apiClient.get('/admin/settings/categories')
    return response.data
  }

  async getSettingByKey(key: string): Promise<ISetting> {
    const response = await apiClient.get(`/admin/settings/${key}`)
    return response.data
  }

  async createSetting(data: Partial<ISetting>): Promise<ISetting> {
    const response = await apiClient.post('/admin/settings', data)
    return response.data
  }

  async updateSetting(key: string, data: Partial<ISetting>): Promise<ISetting> {
    const response = await apiClient.patch(`/admin/settings/${key}`, data)
    return response.data
  }

  async bulkUpdateSettings(data: BulkUpdateSettingsDto) {
    const response = await apiClient.post('/admin/settings/bulk-update', data)
    return response.data
  }

  async deleteSetting(key: string) {
    const response = await apiClient.delete(`/admin/settings/${key}`)
    return response.data
  }

  async resetDefaults() {
    const response = await apiClient.post('/admin/settings/reset-defaults')
    return response.data
  }

  async exportSettings() {
    const response = await apiClient.get('/admin/settings/export/all')
    return response.data
  }

  async importSettings(settings: any[]) {
    const response = await apiClient.post('/admin/settings/import', settings)
    return response.data
  }
}

export const settingsService = new SettingsService()
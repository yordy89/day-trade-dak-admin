import { api } from '@/lib/api-client'
import { 
  ModulePermission,
  CreateModulePermissionDto,
  UpdateModulePermissionDto,
  UserWithModuleAccess,
  ModuleType
} from '@/types/module-permission'

export class ModulePermissionService {
  async create(data: CreateModulePermissionDto): Promise<ModulePermission> {
    const response = await api.post('/admin/module-permissions', data)
    return response.data
  }

  async getUserPermissions(userId: string): Promise<ModulePermission[]> {
    const response = await api.get(`/admin/module-permissions/user/${userId}`)
    return response.data
  }

  async getModuleUsers(moduleType: ModuleType): Promise<UserWithModuleAccess[]> {
    const response = await api.get(`/admin/module-permissions/module/${moduleType}`)
    return response.data
  }

  async checkAccess(userId: string, moduleType: ModuleType): Promise<{ hasAccess: boolean }> {
    const response = await api.get(`/admin/module-permissions/check/${userId}/${moduleType}`)
    return response.data
  }

  async update(
    userId: string,
    moduleType: ModuleType,
    data: UpdateModulePermissionDto
  ): Promise<ModulePermission> {
    const response = await api.put(`/admin/module-permissions/${userId}/${moduleType}`, data)
    return response.data
  }

  async revoke(userId: string, moduleType: ModuleType): Promise<void> {
    await api.delete(`/admin/module-permissions/${userId}/${moduleType}`)
  }

  async bulkGrant(data: {
    userIds: string[]
    moduleType: ModuleType
    expiresAt?: string
    reason?: string
  }): Promise<{ granted: number; total: number }> {
    const response = await api.post('/admin/module-permissions/bulk-grant', data)
    return response.data
  }

  async expirePermissions(): Promise<{ message: string; expiredCount: number }> {
    const response = await api.post('/admin/module-permissions/expire')
    return response.data
  }

  async grantEventPermissions(data: {
    participants: Array<{
      userId?: string
      email: string
      firstName: string
      lastName: string
      isRegistered?: boolean
    }>
    moduleTypes: string[]
    expiresAt?: string
    reason?: string
    eventId?: string
    eventName?: string
  }): Promise<{
    permissionsGranted: number
    usersCreated: number
    usersUpdated: number
    totalProcessed: number
    createdUsers: Array<{
      email: string
      firstName: string
      lastName: string
      temporaryPassword: string
      userId: string
    }>
    errors: Array<{
      email: string
      error: string
    }>
  }> {
    const response = await api.post('/admin/module-permissions/grant-event-permissions', data)
    return response.data
  }

  async bulkRevoke(data: {
    userIds: string[]
    moduleTypes: string[]
    reason?: string
  }): Promise<{
    revoked: number
    usersAffected: number
    affectedUsers: Array<{
      userId: string
      email: string
      modulesRevoked: string[]
    }>
    errors: Array<{
      userId: string
      error: string
    }>
  }> {
    const response = await api.post('/admin/module-permissions/bulk-revoke', data)
    return response.data
  }

  async revokeEventPermissions(data: {
    userIds: string[]
    moduleTypes: string[]
    eventId?: string
    reason?: string
  }): Promise<{
    permissionsRevoked: number
    usersAffected: number
    affectedUsers: Array<{
      userId: string
      email: string
      modulesRevoked: string[]
    }>
    errors: Array<{
      userId: string
      error: string
    }>
  }> {
    const response = await api.post('/admin/module-permissions/revoke-event-permissions', data)
    return response.data
  }
}

// Export singleton instance
export const modulePermissionService = new ModulePermissionService()

// Export hook for easy use in components
export const useModulePermissionService = () => modulePermissionService
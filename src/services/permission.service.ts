import { api } from '@/lib/api-client'
import { 
  AdminUserWithPermissions, 
  PermissionSet, 
  UpdatePermissionsRequest 
} from '@/types/permission'

export class PermissionService {
  async getAllAdminPermissions(): Promise<AdminUserWithPermissions[]> {
    const response = await api.get('/admin/permissions')
    return response.data
  }

  async getUserPermissions(userId: string): Promise<{ userId: string; permissions: PermissionSet }> {
    const response = await api.get(`/admin/permissions/${userId}`)
    return response.data
  }

  async updateUserPermissions(
    userId: string, 
    permissions: UpdatePermissionsRequest
  ): Promise<{ message: string; permissions: PermissionSet }> {
    const response = await api.put(`/admin/permissions/${userId}`, permissions)
    return response.data
  }

  async resetUserPermissions(userId: string): Promise<{ message: string; permissions: PermissionSet }> {
    const response = await api.post(`/admin/permissions/${userId}/reset`)
    return response.data
  }
}

// Export singleton instance
export const permissionService = new PermissionService()

// Export hook for easy use in components
export const usePermissionService = () => permissionService
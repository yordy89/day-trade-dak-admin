import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { PermissionSet, SUPER_ADMIN_PERMISSIONS } from '@/types/permission'
import { permissionService } from '@/services/permission.service'

interface PermissionState {
  permissions: PermissionSet | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchPermissions: (userId: string, role: string) => Promise<void>
  hasPermission: (permission: keyof PermissionSet) => boolean
  clearPermissions: () => void
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      permissions: null,
      loading: false,
      error: null,

      fetchPermissions: async (userId: string, role: string) => {
        // Don't fetch if userId is invalid
        if (!userId || userId === 'undefined') {
          console.warn('Invalid userId for fetching permissions')
          set({ loading: false, error: null })
          return
        }

        // Super admin always has all permissions
        if (role === 'super_admin') {
          set({ permissions: SUPER_ADMIN_PERMISSIONS, loading: false, error: null })
          return
        }

        set({ loading: true, error: null })
        
        try {
          const response = await permissionService.getUserPermissions(userId)
          set({ permissions: response.permissions, loading: false })
        } catch (error: any) {
          console.error('Failed to fetch permissions:', error)
          set({ 
            error: error.message || 'Failed to fetch permissions', 
            loading: false 
          })
        }
      },

      hasPermission: (permission: keyof PermissionSet): boolean => {
        const state = get()
        if (!state.permissions) return false
        return state.permissions[permission] === true
      },

      clearPermissions: () => {
        set({ permissions: null, loading: false, error: null })
      },
    }),
    {
      name: 'permission-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ permissions: state.permissions }),
    }
  )
)
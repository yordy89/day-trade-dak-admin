import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '@/lib/axios';
import { enqueueSnackbar } from 'notistack';
import { usePermissionStore } from './permission-store';

interface AdminUser {
  _id?: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: AdminUser | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          const response = await API.post('/auth/login', { email, password });
          const { access_token, user } = response.data;
          const token = access_token;
          
          // Verify user is admin or super_admin
          if (!['admin', 'super_admin'].includes(user.role)) {
            throw new Error('Access denied. Admin privileges required.');
          }

          // Store in localStorage
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminUser', JSON.stringify(user));
          
          // Update state
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Fetch user permissions
          const permissionStore = usePermissionStore.getState();
          const userId = user._id || user.id;
          if (userId) {
            await permissionStore.fetchPermissions(userId, user.role);
          }
          
          enqueueSnackbar('Welcome back!', { variant: 'success' });
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || error.message || 'Login failed';
          enqueueSnackbar(message, { variant: 'error' });
          throw error;
        }
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        // Clear state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        // Clear permissions
        const permissionStore = usePermissionStore.getState();
        permissionStore.clearPermissions();
        
        // Redirect to login
        window.location.href = '/auth/login';
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          
          const token = localStorage.getItem('adminToken');
          const userStr = localStorage.getItem('adminUser');
          
          if (!token || !userStr) {
            throw new Error('No auth data found');
          }
          
          const user = JSON.parse(userStr);
          
          // Verify token is still valid by making an API call
          const response = await API.get('/user/profile');
          
          // Verify user still has admin privileges
          if (!['admin', 'super_admin'].includes(response.data.role)) {
            throw new Error('Admin privileges required');
          }
          
          set({
            user: response.data,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Fetch user permissions
          const permissionStore = usePermissionStore.getState();
          const userId = response.data._id || response.data.id;
          if (userId) {
            await permissionStore.fetchPermissions(userId, response.data.role);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          get().logout();
        }
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { Box, CircularProgress, Alert, AlertTitle } from '@mui/material';
import { PermissionSet } from '@/types/permission';

interface AuthGuardProps {
  children: React.ReactNode;
}

const publicPaths = ['/auth/login', '/auth/forgot-password'];

// Map routes to required permissions
const routePermissions: Record<string, keyof PermissionSet> = {
  '/': 'dashboard',
  '/users': 'users',
  '/subscriptions': 'subscriptions',
  '/payments': 'payments',
  '/meetings': 'meetings',
  '/events': 'events',
  '/content': 'content',
  '/courses': 'courses',
  '/announcements': 'announcements',
  '/analytics': 'analytics',
  '/transactions': 'transactions',
  '/reports': 'reports',
  '/settings': 'settings',
  '/audit-logs': 'auditLogs',
  '/permissions': 'permissions',
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const { hasPermission, loading: permissionsLoading } = usePermissionStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !permissionsLoading) {
      const isPublicPath = publicPaths.includes(pathname);
      
      if (!isAuthenticated && !isPublicPath) {
        router.push('/auth/login');
      } else if (isAuthenticated && isPublicPath) {
        router.push('/');
      } else if (isAuthenticated && !isPublicPath) {
        // Check permissions for the current route
        const requiredPermission = routePermissions[pathname];
        if (requiredPermission && user?.role !== 'super_admin' && !hasPermission(requiredPermission)) {
          // Redirect to dashboard if no permission
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, isLoading, permissionsLoading, pathname, router, hasPermission, user]);

  // Check if current path is public
  const isPublicPath = publicPaths.includes(pathname);

  // Show loading spinner while checking auth (but not on public paths)
  if ((isLoading || (permissionsLoading && isAuthenticated)) && !isPublicPath) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Don't render children if not authenticated and not on public path
  if (!isAuthenticated && !isPublicPath) {
    return null;
  }

  // Check permissions for protected routes
  if (isAuthenticated && !isPublicPath) {
    const requiredPermission = routePermissions[pathname];
    if (requiredPermission && user?.role !== 'super_admin' && !hasPermission(requiredPermission)) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
          p={3}
        >
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <AlertTitle>Acceso Denegado</AlertTitle>
            No tienes permisos para acceder a esta página. Contacta con un administrador si crees que esto es un error.
          </Alert>
        </Box>
      );
    }
  }

  return <>{children}</>;
}
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { features } from '@/config/features'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Stack,
  alpha,
} from '@mui/material'
import {
  Dashboard,
  People,
  CreditCard,
  ContentPaste,
  AttachMoney,
  BarChart,
  Settings,
  Logout,
  VideoCall,
  Campaign,
  School,
  Security,
  Event,
  Email,
  LocalOffer,
  AccountBalance,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionStore } from '@/store/permission-store'
import { Shield } from '@mui/icons-material'

const drawerWidth = 280

interface NavigationItem {
  name: string
  href: string
  icon: any
  permission?: string
  featureFlag?: keyof typeof features
}

const navigation: NavigationItem[] = [
  { name: 'dashboard', href: '/', icon: Dashboard, permission: 'dashboard' },
  { name: 'users', href: '/users', icon: People, permission: 'users' },
  { name: 'subscriptions', href: '/subscriptions', icon: CreditCard, permission: 'subscriptions' },
  { name: 'meetings', href: '/meetings', icon: VideoCall, permission: 'meetings', featureFlag: 'meetings' },
  { name: 'events', href: '/events', icon: Event, permission: 'events' },
  { name: 'financing', href: '/financing', icon: AccountBalance, permission: 'financing' },
  { name: 'affiliates', href: '/affiliates', icon: LocalOffer, permission: 'affiliates' },
  { name: 'contact_messages', href: '/contact-messages', icon: Email, permission: 'messages' },
  { name: 'content', href: '/content', icon: ContentPaste, permission: 'content' },
  { name: 'announcements', href: '/announcements', icon: Campaign, permission: 'announcements' },
  { name: 'analytics', href: '/analytics', icon: BarChart, permission: 'analytics' },
  { name: 'transactions', href: '/transactions', icon: AttachMoney, permission: 'transactions' },
  { name: 'reports', href: '/reports', icon: ContentPaste, permission: 'reports' },
]

const bottomNavigation: NavigationItem[] = [
  { name: 'settings', href: '/settings', icon: Settings, permission: 'settings' },
  // { name: 'audit_logs', href: '/audit-logs', icon: Security, permission: 'auditLogs' }, // Removed - no page
  { name: 'permissions', href: '/permissions', icon: Shield, permission: 'permissions' },
  { name: 'module_permissions', href: '/module-permissions', icon: Security, permission: 'permissions' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { t } = useTranslation('common')
  const { user, logout } = useAuthStore()
  const { hasPermission, permissions } = usePermissionStore()
  
  // Filter navigation items based on permissions and feature flags
  const visibleNavigation = navigation.filter((item) => {
    // Check feature flag first
    if (item.featureFlag) {
      const feature = features[item.featureFlag]
      if (!feature || !feature.enabled) return false
    }
    
    if (!item.permission) return true
    // Super admin sees everything
    if (user?.role === 'super_admin') return true
    // If permissions not loaded yet, hide items that require permissions
    if (!permissions && item.permission) return false
    return hasPermission(item.permission as any)
  })
  
  const visibleBottomNavigation = bottomNavigation.filter((item) => {
    if (!item.permission) return true
    // Super admin sees everything
    if (user?.role === 'super_admin') return true
    // If permissions not loaded yet, hide items that require permissions
    if (!permissions && item.permission) return false
    return hasPermission(item.permission as any)
  })

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="primary.main"
          sx={{ letterSpacing: -0.5 }}
        >
          DayTradeDak Admin
        </Typography>
      </Box>

      {/* User Info */}
      {user && (
        <>
          <Box sx={{ px: 2, pb: 2 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 600,
                }}
              >
                {user.firstName[0]}{user.lastName[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Divider />
        </>
      )}

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {visibleNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    router.push(item.href)
                    if (isMobile) onClose()
                  }}
                  selected={isActive}
                  sx={{
                    borderRadius: 1.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.16),
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon
                      sx={{
                        color: isActive ? 'primary.main' : 'action.active',
                        fontSize: 20,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={t(`navigation.${item.name}`)}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'primary.main' : 'text.primary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>

      {/* Bottom Navigation */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <List>
          {visibleBottomNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    router.push(item.href)
                    if (isMobile) onClose()
                  }}
                  selected={isActive}
                  sx={{
                    borderRadius: 1.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon
                      sx={{
                        color: isActive ? 'primary.main' : 'action.active',
                        fontSize: 20,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={t(`navigation.${item.name}`)}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
          
          {/* Logout */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 1.5,
                color: 'error.main',
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Logout sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText
                primary={t('navigation.logout')}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 0,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  )
}
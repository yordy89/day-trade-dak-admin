'use client'

import { Card, CardContent, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Avatar, Chip, useTheme, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '@/lib/utils'
import { useAdminLogs } from '@/hooks/use-admin-stats'
import { 
  PersonAdd, 
  CreditCard, 
  AttachMoney, 
  Article,
  Edit,
  Delete,
  Visibility,
  Security
} from '@mui/icons-material'
import { useMemo } from 'react'

// Map action/resource combinations to icons and colors
const getActivityIcon = (action: string, resource: string) => {
  if (resource === 'user' && action === 'create') return { icon: PersonAdd, color: 'primary' }
  if (resource === 'subscription' && action === 'create') return { icon: CreditCard, color: 'success' }
  if (resource === 'payment') return { icon: AttachMoney, color: 'warning' }
  if (resource === 'content') return { icon: Article, color: 'info' }
  if (action === 'update') return { icon: Edit, color: 'secondary' }
  if (action === 'delete') return { icon: Delete, color: 'error' }
  if (action === 'view') return { icon: Visibility, color: 'grey' }
  return { icon: Security, color: 'grey' }
}

export function RecentActivity() {
  const { t } = useTranslation('dashboard')
  const theme = useTheme()
  const { data: logsData, isLoading } = useAdminLogs({ limit: 10 })

  const activities = useMemo(() => {
    if (!logsData?.logs) return []

    return logsData.logs.map(log => {
      const { icon: Icon, color } = getActivityIcon(log.action, log.resource)
      return {
        id: log._id,
        icon: Icon,
        color,
        action: log.action,
        resource: log.resource,
        adminEmail: log.adminEmail,
        details: log.details,
        status: log.status,
        timestamp: new Date(log.createdAt),
      }
    })
  }, [logsData])

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            {t('recentActivity.title', 'Recent Activity')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('recentActivity.subtitle', 'Latest admin actions')}
          </Typography>
        </Box>

        {isLoading ? (
          <Typography color="text.secondary">{t('common.loading', 'Loading...')}</Typography>
        ) : activities.length === 0 ? (
          <Typography color="text.secondary">{t('recentActivity.noActivity', 'No recent activity')}</Typography>
        ) : (
          <List disablePadding>
            {activities.map((activity, index) => {
              const Icon = activity.icon
              const isLast = index === activities.length - 1

              return (
                <ListItem 
                  key={activity.id}
                  disableGutters
                  sx={{
                    position: 'relative',
                    pb: isLast ? 0 : 3,
                    '&::before': !isLast ? {
                      content: '""',
                      position: 'absolute',
                      left: 20,
                      top: 44,
                      bottom: 0,
                      width: 2,
                      bgcolor: 'divider',
                    } : {},
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(
                          theme.palette[activity.color as any]?.main || 
                          theme.palette[activity.color as any]?.[500] || 
                          theme.palette.grey[500], 
                          0.1
                        ),
                        color: theme.palette[activity.color as any]?.main || 
                          theme.palette[activity.color as any]?.[500] || 
                          theme.palette.grey[500],
                      }}
                    >
                      <Icon fontSize="small" />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight={500}>
                          {t(`activities.${activity.action}_${activity.resource}`, 
                            `${activity.action} ${activity.resource}`
                          )}
                        </Typography>
                        {activity.status === 'failure' && (
                          <Chip 
                            label={t('common.failed', 'Failed')} 
                            size="small" 
                            color="error"
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        {activity.adminEmail} • {formatDateTime(activity.timestamp)}
                      </>
                    }
                    secondaryTypographyProps={{
                      variant: 'caption',
                      component: 'div'
                    }}
                  />
                </ListItem>
              )
            })}
          </List>
        )}
      </CardContent>
    </Card>
  )
}
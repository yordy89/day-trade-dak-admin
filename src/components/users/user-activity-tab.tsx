'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Chip,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab'
import {
  Login,
  Logout,
  CreditCard,
  Email,
  Edit,
  VpnKey,
  Person,
} from '@mui/icons-material'
import { formatDateTime } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/user.service'

interface UserActivityTabProps {
  userId: string
}

interface Activity {
  id: string
  type: string
  description: string
  timestamp: Date
  metadata?: any
}

// Mock activity data - replace with actual API call
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'login',
    description: 'User logged in',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: '2',
    type: 'subscription',
    description: 'Subscribed to Premium plan',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    metadata: { plan: 'Premium' }
  },
  {
    id: '3',
    type: 'profile_update',
    description: 'Updated profile information',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: '4',
    type: 'password_change',
    description: 'Changed password',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: '5',
    type: 'login',
    description: 'User logged in',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
]

export function UserActivityTab({ userId }: UserActivityTabProps) {
  const { t } = useTranslation('users')
  
  // In a real implementation, fetch actual activity data
  const { data: activities = mockActivities, isLoading, error } = useQuery({
    queryKey: ['userActivity', userId],
    queryFn: async () => {
      // Replace with actual API call
      // return userService.getUserActivity(userId)
      return mockActivities
    },
    enabled: !!userId,
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Login />
      case 'logout':
        return <Logout />
      case 'subscription':
      case 'payment':
        return <CreditCard />
      case 'email':
        return <Email />
      case 'profile_update':
        return <Edit />
      case 'password_change':
        return <VpnKey />
      default:
        return <Person />
    }
  }

  const getActivityColor = (type: string): any => {
    switch (type) {
      case 'login':
      case 'logout':
        return 'primary'
      case 'subscription':
      case 'payment':
        return 'success'
      case 'password_change':
        return 'warning'
      case 'profile_update':
        return 'info'
      default:
        return 'grey'
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('messages.errorLoadingActivity', 'Failed to load activity')}
        </Alert>
      </Box>
    )
  }

  if (activities.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {t('activity.noActivity', 'No activity recorded')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('sections.recentActivity', 'Recent Activity')}
      </Typography>
      
      <Timeline position="alternate">
        {activities.map((activity, index) => (
          <TimelineItem key={activity.id}>
            <TimelineOppositeContent
              sx={{ m: 'auto 0' }}
              align={index % 2 === 0 ? 'right' : 'left'}
              variant="body2"
              color="text.secondary"
            >
              {formatDateTime(activity.timestamp)}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector sx={{ bgcolor: 'grey.300' }} />
              <TimelineDot color={getActivityColor(activity.type)}>
                {getActivityIcon(activity.type)}
              </TimelineDot>
              <TimelineConnector sx={{ bgcolor: 'grey.300' }} />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body1" component="span">
                  {activity.description}
                </Typography>
                {activity.metadata && (
                  <Box mt={1}>
                    {activity.metadata.plan && (
                      <Chip 
                        label={activity.metadata.plan} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  )
}
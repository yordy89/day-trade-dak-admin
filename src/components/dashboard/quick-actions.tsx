'use client'

import { Card, CardContent, Typography, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, useTheme, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { 
  PersonAdd, 
  Article, 
  Analytics, 
  CreditCard,
  Email,
  VideoCall,
  Settings,
  Security
} from '@mui/icons-material'

const actions = [
  {
    name: 'addUser',
    icon: PersonAdd,
    href: '/users/new',
    color: 'primary',
  },
  {
    name: 'createContent',
    icon: Article,
    href: '/content/new',
    color: 'success',
  },
  {
    name: 'viewReports',
    icon: Analytics,
    href: '/analytics',
    color: 'warning',
  },
  {
    name: 'manageSubscriptions',
    icon: CreditCard,
    href: '/subscriptions',
    color: 'info',
  },
  {
    name: 'sendEmail',
    icon: Email,
    href: '/communications/email',
    color: 'secondary',
  },
  {
    name: 'scheduleMeeting',
    icon: VideoCall,
    href: '/meetings/new',
    color: 'error',
  },
  {
    name: 'systemSettings',
    icon: Settings,
    href: '/settings',
    color: 'grey',
  },
  {
    name: 'viewLogs',
    icon: Security,
    href: '/logs',
    color: 'primary',
  },
]

export function QuickActions() {
  const { t } = useTranslation('dashboard')
  const theme = useTheme()
  const router = useRouter()

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
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t('quickActions.title', 'Quick Actions')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('quickActions.subtitle', 'Common administrative tasks')}
        </Typography>

        <List disablePadding>
          {actions.map((action) => {
            const Icon = action.icon
            const color = action.color
            const paletteColor = (theme.palette[color as keyof typeof theme.palette] as any)
            const mainColor = paletteColor?.main || paletteColor?.[500] || theme.palette.grey[500]

            return (
              <ListItem
                key={action.name}
                disablePadding
                sx={{ mb: 1 }}
              >
                <ListItemButton
                  onClick={() => router.push(action.href)}
                  sx={{
                    px: 1,
                    py: 1.5,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: alpha(mainColor, 0.08),
                      '& .action-icon': {
                        transform: 'scale(1.1)',
                      },
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      className="action-icon"
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(mainColor, 0.1),
                        color: mainColor,
                        transition: 'transform 0.2s ease-in-out',
                      }}
                    >
                      <Icon fontSize="small" />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {t(`quickActions.${action.name}`, action.name)}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </CardContent>
    </Card>
  )
}
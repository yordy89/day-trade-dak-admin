'use client'

import { 
  Box, 
  Grid, 
  Typography, 
  Chip, 
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { 
  Email, 
  Phone, 
  CalendarToday, 
  Person,
  AdminPanelSettings,
  CreditCard,
  LocationOn,
} from '@mui/icons-material'
import { formatDateTime } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface UserDetailsTabProps {
  user: any
}

export function UserDetailsTab({ user }: UserDetailsTabProps) {
  const { t } = useTranslation('users')

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
  const displayName = fullName || user.email
  const initials = fullName 
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
    : user.email?.charAt(0)?.toUpperCase() || '?'

  const roleConfig: Record<string, any> = {
    user: { color: 'default', icon: <Person fontSize="small" /> },
    admin: { color: 'warning', icon: <AdminPanelSettings fontSize="small" /> },
    super_admin: { color: 'error', icon: <AdminPanelSettings fontSize="small" /> },
  }

  const config = roleConfig[user.role] || roleConfig.user

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={4}>
        {/* Profile Section */}
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar
              src={user.profileImage}
              alt={displayName}
              sx={{ 
                width: 120, 
                height: 120,
                bgcolor: user.profileImage ? 'transparent' : 'primary.main',
                fontSize: '2rem'
              }}
            >
              {!user.profileImage && initials}
            </Avatar>
            <Typography variant="h5" fontWeight={600}>
              {displayName}
            </Typography>
            <Chip 
              label={t(`roles.${user.role}`, user.role)} 
              color={config.color}
              icon={config.icon}
              variant={user.role === 'user' ? 'outlined' : 'filled'}
            />
            <Chip 
              label={user.status || 'active'} 
              color={user.status === 'active' ? 'success' : 'error'}
              size="small"
            />
          </Box>
        </Grid>

        {/* Information Section */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            {t('sections.personalInfo', 'Personal Information')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {t('fields.email', 'Email')}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body1">
                    {user.email}
                  </Typography>
                }
              />
            </ListItem>

            {user.phone && (
              <ListItem>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {t('fields.phone', 'Phone')}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body1">
                      {user.phone}
                    </Typography>
                  }
                />
              </ListItem>
            )}

            {(user.city || user.country) && (
              <ListItem>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {t('fields.location', 'Location')}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body1">
                      {[user.city, user.country].filter(Boolean).join(', ')}
                    </Typography>
                  }
                />
              </ListItem>
            )}

            {user.createdAt && (
              <ListItem>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {t('fields.joinedDate', 'Joined Date')}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body1">
                      {formatDateTime(new Date(user.createdAt))}
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            {t('sections.accountInfo', 'Account Information')}
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    {t('fields.userId', 'User ID')}
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" fontFamily="monospace">
                    {user._id}
                  </Typography>
                }
              />
            </ListItem>

            {user.stripeCustomerId && (
              <ListItem>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <CreditCard fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {t('fields.stripeCustomerId', 'Stripe Customer ID')}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body1" fontFamily="monospace">
                      {user.stripeCustomerId}
                    </Typography>
                  }
                />
              </ListItem>
            )}

            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    {t('fields.totalSubscriptions', 'Total Subscriptions')}
                  </Typography>
                }
                secondary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1">
                      {user.subscriptions?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({user.subscriptions?.filter((sub: any) => 
                        !sub.expiresAt || new Date(sub.expiresAt) > new Date()
                      ).length || 0} {t('status.active', 'active')})
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </List>

          {user.bio && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                {t('sections.bio', 'Bio')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.bio}
              </Typography>
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
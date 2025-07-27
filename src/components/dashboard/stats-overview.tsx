'use client'

import { useTranslation } from 'react-i18next'
import { Grid, Card, CardContent, Box, Typography, useTheme, alpha, Skeleton } from '@mui/material'
import { 
  People, 
  CreditCard, 
  AttachMoney, 
  TrendingUp,
  TrendingDown 
} from '@mui/icons-material'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { useUserStats, useSubscriptionStats } from '@/hooks/use-admin-stats'
import { useMemo } from 'react'

export function StatsOverview() {
  const { t } = useTranslation('dashboard')
  const theme = useTheme()
  const { data: userStats, isLoading: userStatsLoading } = useUserStats()
  const { data: subscriptionStats, isLoading: subscriptionStatsLoading } = useSubscriptionStats()

  const stats = useMemo(() => {
    if (!userStats || !subscriptionStats) return []

    // Calculate month-over-month changes (mock for now, will implement historical data later)
    const totalUsersChange = userStats.growth.thisMonth > 0 ? '+' + ((userStats.growth.thisMonth / userStats.total) * 100).toFixed(1) + '%' : '0%'
    const subscribedChange = '+12.3%' // Mock, will calculate from historical data
    const revenueChange = '+18.2%' // Mock, will calculate from historical data
    const conversionRate = userStats.total > 0 ? userStats.subscribed / userStats.total : 0
    const conversionChange = '-2.1%' // Mock, will calculate from historical data

    return [
      {
        name: 'totalUsers',
        value: userStats.total,
        change: totalUsersChange,
        changeType: userStats.growth.thisMonth > 0 ? 'positive' : 'neutral',
        icon: People,
        color: 'primary',
      },
      {
        name: 'activeSubscriptions',
        value: userStats.subscribed,
        change: subscribedChange,
        changeType: 'positive',
        icon: CreditCard,
        color: 'success',
      },
      {
        name: 'monthlyRevenue',
        value: subscriptionStats.byPlan.reduce((sum, plan) => sum + plan.revenue, 0),
        change: revenueChange,
        changeType: 'positive',
        icon: AttachMoney,
        color: 'warning',
        isCurrency: true,
      },
      {
        name: 'conversionRate',
        value: conversionRate,
        change: conversionChange,
        changeType: 'negative',
        icon: TrendingUp,
        color: 'info',
        isPercentage: true,
      },
    ]
  }, [userStats, subscriptionStats])

  const isLoading = userStatsLoading || subscriptionStatsLoading

  return (
    <Grid container spacing={3}>
      {isLoading ? (
        // Loading skeleton
        Array.from({ length: 4 }).map((_, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="flex-start">
                  <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 2 }} />
                  <Box flex={1} ml={2}>
                    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={16} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.changeType === 'positive' ? TrendingUp : TrendingDown
          const color = stat.color as 'primary' | 'success' | 'warning' | 'info'
          
          return (
            <Grid item xs={12} sm={6} lg={3} key={stat.name}>
              <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                border: 1,
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                },
                transition: 'box-shadow 0.3s ease-in-out',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="flex-start">
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(
                        theme.palette[color]?.main || 
                        theme.palette.grey[500], 
                        0.1
                      ),
                      color: theme.palette[color]?.main || 
                        theme.palette.grey[500],
                    }}
                  >
                    <Icon sx={{ fontSize: 32 }} />
                  </Box>
                  <Box flex={1} ml={2}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {t(`stats.${stat.name}`, stat.name)}
                    </Typography>
                    <Typography 
                      variant="h5" 
                      fontWeight={700}
                      sx={{ mb: 1 }}
                    >
                      {stat.isCurrency
                        ? formatCurrency(stat.value)
                        : stat.isPercentage
                        ? formatPercentage(stat.value)
                        : formatNumber(stat.value)}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <TrendIcon 
                        sx={{ 
                          fontSize: 16,
                          color: stat.changeType === 'positive' 
                            ? theme.palette.success.main 
                            : theme.palette.error.main 
                        }} 
                      />
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color={stat.changeType === 'positive' ? 'success.main' : 'error.main'}
                      >
                        {stat.change}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('stats.fromLastMonth', 'from last month')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          )
        })
      )}
    </Grid>
  )
}